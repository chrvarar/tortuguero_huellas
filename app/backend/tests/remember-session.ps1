#requires -Version 7.4
[CmdletBinding()]
param([int]$HttpPort = 18082)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$backend = Split-Path -Parent $PSScriptRoot
$schema = 'vitalink_qa_' + [guid]::NewGuid().ToString('N')
$mysql = 'C:/xampp/mysql/bin/mysql.exe'
$dbArgs = @('--protocol=tcp', '-h', '127.0.0.1', '-P', '3306', '-u', 'root')
$baseUrl = "http://127.0.0.1:$HttpPort/api"
$server = $null

function Spark { & php -d extension=intl -d auto_prepend_file=tests/qa-environment.php spark @args --no-header }
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
function Check($condition, $message) { if (-not $condition) { throw $message } }

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

    $normal = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
    $login = Api 'sesion' $normal 'Post' '{"username":"administrador","password":"administrador","remember":false}'
    Check ($login.StatusCode -eq 200) 'Fallo el acceso normal'
    Check (-not ($normal.Cookies.GetCookies($baseUrl) | Where-Object Name -eq 'vitalink_remember')) 'Acceso normal creó cookie recordada'

    $original = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
    $login = Api 'sesion' $original 'Post' '{"username":"administrador","password":"administrador","remember":true}'
    Check ($login.StatusCode -eq 200) 'Fallo el acceso recordado'
    $cookie = $original.Cookies.GetCookies($baseUrl) | Where-Object Name -eq 'vitalink_remember' | Select-Object -First 1
    Check ($null -ne $cookie) 'Falta cookie recordada'
    $header = @($login.Headers['Set-Cookie']) -join ';'
    Check ($header -match 'vitalink_remember=.*HttpOnly' -and $header -match 'SameSite=Lax') 'Faltan protecciones de cookie'

    $fresh = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
    $fresh.Cookies.Add([Uri]$baseUrl, [Net.Cookie]::new($cookie.Name, $cookie.Value, '/'))
    $restored = (Api 'sesion' $fresh).Content | ConvertFrom-Json
    Check ($restored.user.role -eq 'administrador') 'No restauró la sesión sin ci_session'
    $logout = Api 'salir' $fresh 'Post'
    Check ($logout.StatusCode -eq 204) 'Fallo cerrar sesión'

    $replay = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
    $replay.Cookies.Add([Uri]$baseUrl, [Net.Cookie]::new($cookie.Name, $cookie.Value, '/'))
    $after = (Api 'sesion' $replay).Content | ConvertFrom-Json
    Check ($null -eq $after.user) 'Token revocado todavía restaura sesión'
    Write-Output 'Sesión recordada: opción desactivada, cookie protegida, restauración y revocación correctas.'
} finally {
    if ($server) { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue }
    if ($env:VITALINK_QA_SCHEMA -eq $schema) { & $mysql @dbArgs -e "DROP DATABASE IF EXISTS $schema" }
    Pop-Location
    Remove-Item Env:VITALINK_QA_SCHEMA -ErrorAction SilentlyContinue
    Remove-Item Env:VITALINK_DEMO_SEED -ErrorAction SilentlyContinue
}
