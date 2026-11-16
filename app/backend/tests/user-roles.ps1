#requires -Version 7.4
[CmdletBinding()]
param([int]$HttpPort = 18083)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$backend = Split-Path -Parent $PSScriptRoot
$schema = 'vitalink_qa_' + [guid]::NewGuid().ToString('N')
$mysql = 'C:/xampp/mysql/bin/mysql.exe'
$dbArgs = @('--protocol=tcp', '-h', '127.0.0.1', '-P', '3306', '-u', 'root')
$baseUrl = "http://127.0.0.1:$HttpPort/api"
$server = $null

function Spark { & php -d extension=intl -d auto_prepend_file=tests/qa-environment.php spark @args --no-header }
function Check($condition, $message) { if (-not $condition) { throw $message } }
function Api($path, $session, $method = 'Get', $body = $null) {
    $headers = @{}
    if ($method -eq 'Post') {
        $csrf = (Invoke-WebRequest "$baseUrl/sesion" -WebSession $session -TimeoutSec 5).Content | ConvertFrom-Json
        $headers['X-CSRF-TOKEN'] = $csrf.csrf
        $headers['X-Requested-With'] = 'XMLHttpRequest'
    }
    $params = @{ Uri = "$baseUrl/$path"; WebSession = $session; Method = $method; Headers = $headers; TimeoutSec = 5; SkipHttpErrorCheck = $true }
    if ($null -ne $body) { $params.Body = $body; $params.ContentType = 'application/json' }
    Invoke-WebRequest @params
}

Push-Location $backend
try {
    $env:NO_COLOR = '1'
    $env:CI_ENVIRONMENT = 'development'
    $env:VITALINK_DEMO_SEED = 'true'
    $env:VITALINK_QA_SCHEMA = $schema
    & $mysql @dbArgs -e "CREATE DATABASE $schema CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"
    $config = Spark config:check Database | Out-String
    Check ($config -match "(?m)'database' => string \(\d+\) `"$schema`"") 'Base de pruebas inesperada'
    Spark migrate
    Spark db:seed DemoSeeder
    $server = Start-Process php -ArgumentList '-d','extension=intl','-d','auto_prepend_file=tests/qa-environment.php','-S',"127.0.0.1:$HttpPort",'-t','public','vendor/codeigniter4/framework/system/rewrite.php' -WindowStyle Hidden -PassThru
    for ($i = 0; $i -lt 20; $i++) {
        if ($server.HasExited) { throw 'Servidor de pruebas terminó' }
        try { $null = Invoke-WebRequest "$baseUrl/sesion" -TimeoutSec 2; break } catch { Start-Sleep -Milliseconds 300 }
    }

    $super = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
    $admin = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
    $general = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
    Check ((Api 'sesion' $super 'Post' '{"username":"superusuario","password":"superusuario"}').StatusCode -eq 200) 'Acceso Superusuario'
    Check ((Api 'usuarios' $super 'Post' '{"username":"admin2","password":"clave1234","role":"administrador"}').StatusCode -eq 201) 'Superusuario crea Administración'
    Check ((Api 'usuarios' $super 'Post' '{"username":"otro_super","password":"clave1234","role":"superusuario"}').StatusCode -eq 403) 'Superusuario no debe duplicar su rol'
    Check ((Api 'sesion' $admin 'Post' '{"username":"administrador","password":"administrador"}').StatusCode -eq 200) 'Acceso Administración'
    Check ((Api 'usuarios' $admin 'Post' '{"username":"colab2","password":"clave1234","role":"colaborador"}').StatusCode -eq 201) 'Administración crea Colaborador'
    Check ((Api 'usuarios' $admin 'Post' '{"username":"admin3","password":"clave1234","role":"administrador"}').StatusCode -eq 403) 'Administración no debe crear Administración'
    Check ((Api 'usuarios' $admin 'Post' '{"username":"colab2","password":"clave1234","role":"colaborador"}').StatusCode -eq 409) 'Duplicado debe rechazarse'
    $adminUsers = (Api 'usuarios' $admin).Content | ConvertFrom-Json
    Check (($adminUsers.users.Count -eq 1) -and ($adminUsers.users[0].role -eq 'colaborador')) 'Listado de Administración debe mostrar solo Colaboradores'
    $superUsers = (Api 'usuarios' $super).Content | ConvertFrom-Json
    Check (($superUsers.users.Count -eq 3) -and -not ($superUsers.users | Where-Object role -eq 'superusuario')) 'Listado de Superusuario expone rol reservado'
    Check ((Api 'registro' $general 'Post' '{"display_name":"Persona Dos","email":"persona2@example.test","username":"persona2","password":"clave1234","password_confirmation":"clave1234","role":"administrador"}').StatusCode -eq 201) 'Registro público'
    Check ((Api 'usuarios' $general).StatusCode -eq 403) 'Usuario general consulta usuarios'
    $english = Invoke-WebRequest "$baseUrl/usuarios" -WebSession $general -Headers @{ 'Accept-Language' = 'en' } -SkipHttpErrorCheck -TimeoutSec 5
    Check ($english.StatusCode -eq 403) 'Estado de error en inglés'
    Check (($english.Content | ConvertFrom-Json).message -eq 'You cannot access user management.') 'Mensaje de API en inglés'
    $german = Invoke-WebRequest "$baseUrl/usuarios" -WebSession $general -Headers @{ 'Accept-Language' = 'de' } -SkipHttpErrorCheck -TimeoutSec 5
    Check ($german.StatusCode -eq 403) 'Estado de error en alemán'
    Check (($german.Content | ConvertFrom-Json).message -eq 'Du hast keinen Zugriff auf die Benutzerverwaltung.') 'Mensaje de API en alemán'
    $spanish = (Invoke-WebRequest "$baseUrl/usuarios" -WebSession $general -Headers @{ 'Accept-Language' = 'es-CR' } -SkipHttpErrorCheck -TimeoutSec 5).Content | ConvertFrom-Json
    Check ($spanish.message -eq 'No tenés acceso a la gestión de usuarios.') "Mensaje de API en español: $($spanish.message)"
    Check ((Api 'usuarios' $general 'Post' '{"username":"colab3","password":"clave1234","role":"colaborador"}').StatusCode -eq 403) 'Usuario general crea usuarios'
    $account = & $mysql @dbArgs -N $schema -e "SELECT role FROM users WHERE username = 'persona2'"
    Check ($account -eq 'general') 'Registro público asignó rol elevado'
    Write-Output 'Roles de usuarios: altas, límites, duplicados y privacidad verificados.'
} finally {
    if ($server) { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue }
    if ($env:VITALINK_QA_SCHEMA -eq $schema) { & $mysql @dbArgs -e "DROP DATABASE IF EXISTS $schema" }
    Pop-Location
    Remove-Item Env:VITALINK_QA_SCHEMA -ErrorAction SilentlyContinue
    Remove-Item Env:VITALINK_DEMO_SEED -ErrorAction SilentlyContinue
}
