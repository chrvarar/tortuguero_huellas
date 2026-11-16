#requires -Version 7.4
[CmdletBinding()]
param(
    [string]$MariaDbClient = 'C:/xampp/mysql/bin/mysql.exe',
    [int]$HttpPort = 18081
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$backend = Split-Path -Parent $PSScriptRoot
$schema = 'vitalink_qa_' + [guid]::NewGuid().ToString('N')
$databaseArgs = @('--protocol=tcp', '-h', '127.0.0.1', '-P', '3306', '-u', 'root')
$baseUrl = "http://127.0.0.1:$HttpPort/api"
$browser = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$server = $null
$schemaCreated = $false
$created = $null
$photo = Join-Path ([IO.Path]::GetTempPath()) "$schema.png"

function Assert-Equal($actual, $expected, [string]$label) {
    if ($actual -ne $expected) { throw "$label. Esperado: $expected. Recibido: $actual." }
}

function Spark {
    & php -d extension=intl -d auto_prepend_file=tests/qa-environment.php spark @args --no-header
}

function Api([string]$path, [hashtable]$options = @{}) {
    Invoke-WebRequest "$baseUrl/$path" -TimeoutSec 5 -SkipHttpErrorCheck @options
}

function Post([string]$path, [hashtable]$options = @{}) {
    $token = (Api 'sesion' @{ WebSession = $browser }).Content | ConvertFrom-Json
    $options.Method = 'Post'
    $options.WebSession = $browser
    $options.Headers = @{ 'X-CSRF-TOKEN' = $token.csrf; 'X-Requested-With' = 'XMLHttpRequest' }
    Api $path $options
}

function District([string]$name) {
    $census = Api 'censo' @{ WebSession = $browser }
    Assert-Equal $census.StatusCode 200 'Lectura del censo'
    ($census.Content | ConvertFrom-Json).districts | Where-Object name -eq $name
}

Push-Location $backend
try {
    $env:NO_COLOR = '1'
    $env:CI_ENVIRONMENT = 'development'
    $env:VITALINK_DEMO_SEED = 'true'
    $env:VITALINK_QA_SCHEMA = $schema
    & $MariaDbClient @databaseArgs -e "CREATE DATABASE $schema CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci"
    $schemaCreated = $true

    $configuration = Spark config:check Database | Out-String
    if ($configuration -notmatch "(?m)'database' => string \(\d+\) `"$schema`"") {
        throw 'CodeIgniter no está apuntando al esquema descartable. Se canceló antes de migrar.'
    }
    Spark migrate
    Spark migrate:rollback -b 0
    Spark migrate
    Spark db:seed DemoSeeder
    Spark db:seed DemoSeeder
    $counts = & $MariaDbClient @databaseArgs -N $schema -e 'SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM animals;'
    Assert-Equal ($counts -join ',') '2,14' 'Recarga sin duplicados'
    & $MariaDbClient @databaseArgs $schema -e "UPDATE districts SET name = '$schema' WHERE name = 'Desamparados'"

    & php -d extension=gd -r 'imagepng(imagecreatetruecolor(64, 64), $argv[1]);' $photo
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $HttpPort)
    $listener.Start()
    $listener.Stop()
    $server = Start-Process php -ArgumentList '-d','extension=intl','-d','extension=gd','-d','auto_prepend_file=tests/qa-environment.php','-S',"127.0.0.1:$HttpPort",'-t','public','vendor/codeigniter4/framework/system/rewrite.php' -WindowStyle Hidden -PassThru
    $ready = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if ($server.HasExited) { throw 'PHP terminó antes de iniciar la API de prueba.' }
        try { $ready = (Api 'sesion').StatusCode -eq 200 } catch { Start-Sleep -Milliseconds 250 }
        if ($ready) { break }
    }
    Assert-Equal $ready $true 'Arranque de la API'
    Assert-Equal (Api 'censo').StatusCode 401 'Censo sin sesión'

    $login = Post 'sesion' @{ ContentType = 'application/json'; Body = '{"username":"administrador","password":"administrador"}' }
    Assert-Equal $login.StatusCode 200 'Inicio de sesión'
    Assert-Equal ($login.Content | ConvertFrom-Json).user.role 'administrador' 'Rol de la sesión'
    $carmen = District 'Carmen'
    Assert-Equal $carmen.total 5 'Censo inicial en Carmen'
    $isolatedDistrict = District $schema
    Assert-Equal $isolatedDistrict.name $schema 'La API usa el esquema descartable'
    Assert-Equal $isolatedDistrict.total 0 'Distrito sin registros'

    $form = @{
        name = 'Firulais QA'; species = 'perro'; district_id = [string]$carmen.id
        address = 'Dirección privada QA'; observations = 'Observación privada QA'; photo = Get-Item -LiteralPath $photo
    }
    $result = Post 'animales' @{ Form = $form }
    Assert-Equal $result.StatusCode 201 'Alta con foto y sin tutor ni collar'
    $created = $result.Content | ConvertFrom-Json
    Assert-Equal (District 'Carmen').total 6 'Censo después del registro'
    $registry = (Api 'animales' @{ WebSession = $browser }).Content | ConvertFrom-Json
    Assert-Equal ($created.code -in $registry.animals.code) $true 'Código recuperable desde el expediente'
    $householdAnimal = $registry.animals | Where-Object name -eq 'Luna'
    $shelter = $registry.animals | Where-Object name -eq 'Mora'
    $adoption = @{ name = 'Persona QA'; email = 'adopcion@example.test'; message = 'Quiero conocer a Mora.' }
    Assert-Equal (Api 'gestion/adopciones').StatusCode 401 'Gestión de adopciones privada'
    $gallery = (Api 'adopciones').Content | ConvertFrom-Json
    Assert-Equal $gallery.profiles.Count 10 'Los perfiles de muestra se cargan una sola vez'
    Assert-Equal ($shelter.code -in $gallery.profiles.code) $true 'La galería muestra a Mora'
    $adminSession = $browser
    $browser = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Assert-Equal (Post "adopciones/$($shelter.code)/solicitudes" @{ Form = $adoption }).StatusCode 201 'Solicitud pública de adopción'
    Assert-Equal (Post "gestion/adopciones/$($shelter.id)/retirar").StatusCode 401 'Una sesión pública no puede retirar perfiles'
    $browser = $adminSession
    $management = (Api 'gestion/adopciones' @{ WebSession = $browser }).Content | ConvertFrom-Json
    Assert-Equal $management.requests[0].animal_name 'Mora' 'Solicitud vinculada a la mascota seleccionada'
    Assert-Equal (Post "gestion/adopciones/$($shelter.id)/retirar").StatusCode 204 'Retirar perfil'
    Assert-Equal ((Api 'adopciones').Content | ConvertFrom-Json).profiles.Count 9 'El perfil retirado sale de la galería'
    Assert-Equal (Post "adopciones/$($shelter.code)/solicitudes" @{ Form = $adoption }).StatusCode 404 'El perfil retirado no recibe nuevas solicitudes'
    $publication = @{ shelter_name = 'Albergue QA'; age_label = '2 años'; story = 'Historia ficticia QA.' }
    Assert-Equal (Post "gestion/adopciones/$($shelter.id)/publicar" @{ Form = $publication }).StatusCode 204 'Volver a publicar un perfil'
    Assert-Equal ((Api 'gestion/adopciones' @{ WebSession = $browser }).Content | ConvertFrom-Json).requests.Count 1 'Retirar y publicar conserva las solicitudes anteriores'
    Assert-Equal (District 'Carmen').total 6 'La adopción no altera el censo'
    $shelterQr = Post "animales/$($shelter.id)/qr/reemplazar"
    Assert-Equal $shelterQr.StatusCode 200 'Reemplazar QR de un animal en adopción'
    Assert-Equal ($shelter.code -in ((Api 'adopciones').Content | ConvertFrom-Json).profiles.code) $true 'El enlace de adopción conserva su identificador'
    Assert-Equal (Post "animales/$($householdAnimal.id)/correo" @{ Form = @{ owner_email = 'tutor@example.test' } }).StatusCode 204 'Correo privado de la persona dueña'

    $profile = Api "ficha/$($created.code)"
    Assert-Equal $profile.StatusCode 200 'Ficha pública sin sesión'
    $public = $profile.Content | ConvertFrom-Json -AsHashtable
    Assert-Equal (($public.Keys | Sort-Object) -join ',') 'district,lost,name,photo,species' 'Campos públicos permitidos'
    Assert-Equal $public.lost $false 'Ficha sin extravío vinculado'
    Assert-Equal $public.name $form.name 'Identidad del animal'
    Assert-Equal (Api "ficha/$($created.code)/foto").StatusCode 200 'Foto pública'
    Assert-Equal (District 'Carmen').total 6 'La consulta pública conserva el conteo'

    $adminSession = $browser
    $browser = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Assert-Equal (Api 'avisos').StatusCode 401 'Bandeja privada'
    $notice = @{ species = 'perro'; district_id = [string]$carmen.id; address = 'Lugar privado QA'; description = 'Aviso ficticio' }
    Assert-Equal (Post 'avisos/hallazgo' @{ Form = $notice }).StatusCode 201 'Hallazgo sin QR ni cuenta'
    Assert-Equal (Post "ficha/$($created.code)/hallazgo" @{ Form = $notice }).StatusCode 201 'Hallazgo vinculado por QR'
    $ownerNotice = $notice + @{ contact_email = 'contacto-privado@example.test' }
    Assert-Equal (Post "ficha/$($householdAnimal.code)/hallazgo" @{ Form = $ownerNotice }).StatusCode 201 'Hallazgo de un animal con hogar'
    $newShelterCode = ($shelterQr.Content | ConvertFrom-Json).code
    Assert-Equal (Post "ficha/$newShelterCode/hallazgo" @{ Form = $notice }).StatusCode 201 'Hallazgo de un animal de albergue'
    $lost = $notice + @{ animal_name = 'Luna QA'; contact_name = 'Persona QA' }
    Assert-Equal (Post 'avisos/extravio' @{ Form = $lost }).StatusCode 422 'Extravío sin medio de contacto'
    $lost.contact_email = 'qa@example.test'
    $lost.photo = Get-Item -LiteralPath $photo
    Assert-Equal (Post 'avisos/extravio' @{ Form = $lost }).StatusCode 201 'Extravío sin cuenta'
    $browser = $adminSession
    $inbox = ((Api 'avisos' @{ WebSession = $browser }).Content | ConvertFrom-Json).reports
    Assert-Equal $inbox.Count 5 'Avisos registrados'
    Assert-Equal @($inbox | Where-Object animal_id -eq $created.id).Count 1 'Solo el aviso QR vincula el animal'
    $ownerReport = $inbox | Where-Object animal_id -eq $householdAnimal.id
    $ownerMail = $ownerReport.notifications[0]
    Assert-Equal $ownerMail.recipient_email 'tutor@example.test' 'Destinatario de un animal con hogar'
    Assert-Equal ($ownerMail.body -like '*contacto-privado@example.test*') $false 'El correo respeta el consentimiento'
    Assert-Equal ($null -eq $ownerMail.reply_token_hash) $true 'El hash del enlace se mantiene en servidor'
    $ownerToken = ([uri]$ownerMail.reply_url).Segments[-1]
    Assert-Equal (Api "respuestas/$ownerToken").StatusCode 204 'El enlace de respuesta abre sin cuenta'
    $shelterReport = $inbox | Where-Object animal_id -eq $shelter.id
    Assert-Equal $shelterReport.notifications[0].recipient_type 'admin' 'El albergue se deriva al Administrador'
    $streetReport = $inbox | Where-Object animal_id -eq $created.id
    Assert-Equal $streetReport.notifications[0].reason 'no_contact' 'El aviso sin contacto se deriva al Administrador'
    Assert-Equal ($null -eq $streetReport.notifications[0].reply_url) $true 'Sin correo de contacto no se crea enlace'
    Assert-Equal (Post "notificaciones/$($ownerMail.id)/rebote").StatusCode 204 'Simular rebote'
    Assert-Equal (Post "notificaciones/$($ownerMail.id)/rebote").StatusCode 409 'Repetir el rebote no duplica la derivación'
    $afterBounce = ((Api 'avisos' @{ WebSession = $browser }).Content | ConvertFrom-Json).reports | Where-Object id -eq $ownerReport.id
    Assert-Equal $afterBounce.notifications.Count 2 'Una sola derivación por rebote'
    Assert-Equal $afterBounce.notifications[1].reason 'bounce' 'Motivo de derivación'
    Assert-Equal (Api "respuestas/$ownerToken").StatusCode 404 'El enlace previo al rebote queda fuera de servicio'
    $adminToken = ([uri]$afterBounce.notifications[1].reply_url).Segments[-1]
    $browser = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Assert-Equal (Post "respuestas/$adminToken" @{ Form = @{ message = 'Podemos coordinar la entrega mañana.' } }).StatusCode 201 'Respuesta privada sin cuenta'
    Assert-Equal (Post "respuestas/$adminToken" @{ Form = @{ message = 'Respuesta duplicada.' } }).StatusCode 404 'El enlace solo se puede usar una vez'
    $browser = $adminSession
    $withReply = ((Api 'avisos' @{ WebSession = $browser }).Content | ConvertFrom-Json).reports | Where-Object id -eq $ownerReport.id
    Assert-Equal $withReply.notifications[1].reply_body 'Podemos coordinar la entrega mañana.' 'Respuesta capturada en bandeja privada'
    $lostReport = $inbox | Where-Object kind -eq 'extravio'
    $expiredToken = ([uri]$lostReport.notifications[0].reply_url).Segments[-1]
    $notificationId = [int]$lostReport.notifications[0].id
    & $MariaDbClient @databaseArgs $schema -e "UPDATE report_notifications SET reply_expires_at = '2000-01-01 00:00:00' WHERE id = $notificationId"
    Assert-Equal (Api "respuestas/$expiredToken").StatusCode 404 'El enlace vencido queda fuera de servicio'
    Assert-Equal (Api "avisos/$($lostReport.id)/foto").StatusCode 401 'Foto del aviso requiere sesión'
    Assert-Equal (Api "avisos/$($lostReport.id)/foto" @{ WebSession = $browser }).StatusCode 200 'Foto del aviso visible en bandeja'
    Assert-Equal (Post "avisos/$($lostReport.id)/vincular" @{ Form = @{ animal_id = [string]$created.id } }).StatusCode 204 'Vincular el extravío'
    Assert-Equal ((Api "ficha/$($created.code)").Content | ConvertFrom-Json).lost $true 'QR indica extravío activo'
    Assert-Equal (Post "avisos/$($lostReport.id)/cerrar").StatusCode 204 'Cerrar el extravío'
    Assert-Equal ((Api "ficha/$($created.code)").Content | ConvertFrom-Json).lost $false 'QR vuelve a ficha normal'
    Assert-Equal (District 'Carmen').total 6 'Los avisos no alteran el conteo'

    $filter = (Api "censo?district_id=$($carmen.id)&species=perro&condition=calle" @{ WebSession = $browser }).Content | ConvertFrom-Json
    Assert-Equal $filter.districts.Count 1 'Filtro por distrito'
    Assert-Equal $filter.districts[0].total 2 'Filtros de especie y condición'
    $filterEmpty = (Api "censo?district_id=$($isolatedDistrict.id)&species=perro&condition=calle" @{ WebSession = $browser }).Content | ConvertFrom-Json
    Assert-Equal $filterEmpty.districts[0].total 0 'El filtro conserva el distrito sin registros activos'
    Assert-Equal (Api 'censo?species=gato' @{ WebSession = $browser }).StatusCode 422 'Especie gato deshabilitada'
    Assert-Equal (Api 'censo?species=conejo' @{ WebSession = $browser }).StatusCode 422 'Filtro no válido'
    $rotated = Post "animales/$($created.id)/qr/reemplazar"
    Assert-Equal $rotated.StatusCode 200 'Reemplazo de QR'
    $replacementCode = ($rotated.Content | ConvertFrom-Json).code
    Assert-Equal (Api "ficha/$($created.code)").StatusCode 410 'El QR anterior quedó fuera de servicio'
    Assert-Equal (Api "ficha/$replacementCode").StatusCode 200 'El QR nuevo abre la misma ficha'
    Assert-Equal (Api "ficha/$replacementCode/foto").StatusCode 200 'El QR nuevo conserva la foto'
    Assert-Equal (Post "ficha/$($created.code)/hallazgo" @{ Form = $notice }).StatusCode 404 'El QR anterior no admite hallazgos'
    Assert-Equal (Post "animales/$($created.id)/qr/desactivar").StatusCode 200 'Desactivar QR'
    Assert-Equal (Api "ficha/$replacementCode").StatusCode 410 'El QR desactivado queda fuera de servicio'
    $newCode = ((Post "animales/$($created.id)/qr/reemplazar").Content | ConvertFrom-Json).code
    Assert-Equal (Api "ficha/$newCode").StatusCode 200 'Emitir QR después de desactivar'
    Assert-Equal (District 'Carmen').total 6 'Cambiar el QR conserva el conteo'
    Assert-Equal (Api "animales/$($created.id)").StatusCode 401 'El detalle privado requiere sesión'
    $edit = @{ name = 'Firulais actualizado'; species = 'perro'; living_condition = 'calle'; district_id = [string]$carmen.id; address = 'Dirección nueva QA'; observations = 'Edición QA' }
    Assert-Equal (Post "animales/$($created.id)/editar" @{ Form = $edit }).StatusCode 204 'Editar expediente'
    $edited = (Api "animales/$($created.id)" @{ WebSession = $browser }).Content | ConvertFrom-Json
    Assert-Equal $edited.address $edit.address 'Cambios visibles en detalle privado'
    Assert-Equal ((Api "ficha/$newCode").Content | ConvertFrom-Json).name $edit.name 'El QR mantiene el enlace al expediente editado'
    Assert-Equal (Post "animales/$($created.id)/eliminar").StatusCode 409 'Proteger expediente con historial'

    Assert-Equal (Post "animales/$($created.id)/archivar").StatusCode 204 'Archivo del expediente'
    Assert-Equal (District 'Carmen').total 5 'Censo después de archivar'
    Assert-Equal (Api "ficha/$newCode").StatusCode 404 'Ficha archivada fuera de la vista pública'
    Assert-Equal (Api "ficha/$newCode/foto").StatusCode 404 'Foto archivada fuera de la vista pública'
    $disposableForm = $form.Clone()
    $disposableForm.name = 'Sin historial QA'
    $disposableResult = Post 'animales' @{ Form = $disposableForm }
    Assert-Equal $disposableResult.StatusCode 201 'Registrar un expediente sin historial'
    $disposableAnimal = $disposableResult.Content | ConvertFrom-Json
    Assert-Equal (District 'Carmen').total 6 'El expediente sin historial entra al censo'
    $photoEdit = $edit.Clone()
    $photoEdit.name = $disposableForm.name
    $photoEdit.photo = Get-Item -LiteralPath $photo
    Assert-Equal (Post "animales/$($disposableAnimal.id)/editar" @{ Form = $photoEdit }).StatusCode 204 'Reemplazar la foto al editar'
    Assert-Equal (Api "ficha/$($disposableAnimal.code)/foto").StatusCode 200 'El QR sirve la foto reemplazada'
    Assert-Equal (Test-Path (Join-Path $backend "writable/uploads/animals/$($disposableAnimal.code).webp")) $false 'La foto anterior se retira'
    Assert-Equal (Post "animales/$($disposableAnimal.id)/eliminar").StatusCode 204 'Eliminar un expediente sin historial'
    Assert-Equal (Api "animales/$($disposableAnimal.id)" @{ WebSession = $browser }).StatusCode 404 'El expediente eliminado ya no existe'
    Assert-Equal (Api "ficha/$($disposableAnimal.code)").StatusCode 410 'Eliminar deja el QR fuera de servicio'
    Assert-Equal (District 'Carmen').total 5 'Eliminar ajusta el censo'
    Assert-Equal (Post 'salir').StatusCode 204 'Cierre de sesión'
    Assert-Equal (Api 'censo' @{ WebSession = $browser }).StatusCode 401 'Sesión cerrada'

    $newAccount = @{ ContentType = 'application/json'; Body = '{"display_name":"Persona QA","email":"general-qa@example.test","username":"general-qa","password":"clave-demo","password_confirmation":"clave-demo","role":"superusuario"}' }
    $registration = Post 'registro' $newAccount
    Assert-Equal $registration.StatusCode 201 'Registro público'
    Assert-Equal ($registration.Content | ConvertFrom-Json).user.role 'general' 'El registro público siempre asigna Usuario general'
    Assert-Equal (Api 'censo' @{ WebSession = $browser }).StatusCode 403 'Usuario general sin acceso al censo'
    Assert-Equal (Api "animales/$($created.id)" @{ WebSession = $browser }).StatusCode 404 'Usuario general sin acceso a ficha ajena'
    Assert-Equal ((Api 'animales' @{ WebSession = $browser }).Content | ConvertFrom-Json).animals.Count 0 'Lista personal sin expedientes ajenos'
    $ownAnimalForm = $form.Clone()
    $ownAnimalForm.name = 'Compañero propio QA'
    $ownAnimalForm.living_condition = 'calle'
    $ownResult = Post 'animales' @{ Form = $ownAnimalForm }
    Assert-Equal $ownResult.StatusCode 201 'Usuario general registra un compañero propio'
    $own = $ownResult.Content | ConvertFrom-Json
    Assert-Equal ((Api "animales/$($own.id)" @{ WebSession = $browser }).Content | ConvertFrom-Json).living_condition 'hogar' 'El alta personal queda vinculada al hogar'
    Assert-Equal ((Api 'animales' @{ WebSession = $browser }).Content | ConvertFrom-Json).animals.Count 1 'Lista personal muestra el nuevo expediente'
    Assert-Equal (Post "animales/$($own.id)/eliminar").StatusCode 403 'Usuario general no puede eliminar'
    Assert-Equal (Post 'registro' $newAccount).StatusCode 409 'El usuario duplicado se rechaza'
    $profileUpdate = Post 'perfil' @{ Form = @{ display_name = 'María QA'; avatar = Get-Item -LiteralPath $photo; role = 'superusuario'; id = '1' } }
    Assert-Equal $profileUpdate.StatusCode 200 'Actualizar perfil propio'
    $ownProfile = ($profileUpdate.Content | ConvertFrom-Json).user
    Assert-Equal $ownProfile.display_name 'María QA' 'Conservar el nombre UTF-8'
    Assert-Equal $ownProfile.role 'general' 'El perfil no permite elevar permisos'
    $avatarEndpoint = $ownProfile.avatar.Substring(5)
    Assert-Equal (Api $avatarEndpoint).StatusCode 401 'La foto requiere sesión'
    Assert-Equal (Api $avatarEndpoint @{ WebSession = $browser }).StatusCode 200 'La foto está disponible en la cuenta propia'
    $personalSession = $browser
    $browser = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Assert-Equal (Post 'sesion' @{ ContentType = 'application/json'; Body = '{"username":"administrador","password":"administrador"}' }).StatusCode 200 'Abrir otra cuenta'
    Assert-Equal (Api $avatarEndpoint @{ WebSession = $browser }).StatusCode 404 'Otra cuenta no puede consultar la foto'
    $browser = $personalSession
    Assert-Equal (Post 'salir').StatusCode 204 'Cerrar la sesión del perfil'
    $reopened = Post 'sesion' @{ ContentType = 'application/json'; Body = '{"username":"general-qa","password":"clave-demo"}' }
    Assert-Equal ($reopened.Content | ConvertFrom-Json).user.avatar $ownProfile.avatar 'La foto persiste al volver a iniciar sesión'
    $removed = Post 'perfil' @{ Form = @{ display_name = 'María QA'; remove_avatar = '1' } }
    Assert-Equal ($null -eq ($removed.Content | ConvertFrom-Json).user.avatar) $true 'Quitar la foto'
    Assert-Equal (Api $avatarEndpoint @{ WebSession = $browser }).StatusCode 404 'La foto retirada no está disponible'

    Write-Host 'Recorrido verificado: migraciones, acceso, foto, avisos sin cuenta, bandeja privada y censo 2 → 3 → 2.'
} finally {
    if ($server -and !$server.HasExited) { Stop-Process -Id $server.Id }
    if ($created -and $created.code -match '^[a-f0-9]{32}$') {
        Remove-Item -LiteralPath (Join-Path $backend "writable/uploads/animals/$($created.code).webp") -ErrorAction SilentlyContinue
    }
    Remove-Item -LiteralPath $photo -ErrorAction SilentlyContinue
    Pop-Location
    if ($schemaCreated) {
        $hasAvatars = & $MariaDbClient @databaseArgs -N $schema -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_path'"
        if ($hasAvatars -eq '1') {
            $avatarFiles = & $MariaDbClient @databaseArgs -N $schema -e 'SELECT avatar_path FROM users WHERE avatar_path IS NOT NULL'
            foreach ($file in $avatarFiles) {
                if ($file -match '^[a-f0-9]{32}\.webp$') {
                    Remove-Item -LiteralPath (Join-Path $backend "writable/uploads/avatars/$file") -ErrorAction SilentlyContinue
                }
            }
        }
        $hasAnimals = & $MariaDbClient @databaseArgs -N $schema -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'animals'"
        if ($hasAnimals -eq '1') {
            $animalFiles = & $MariaDbClient @databaseArgs -N $schema -e 'SELECT photo_path FROM animals WHERE photo_path IS NOT NULL'
            foreach ($file in $animalFiles) {
                if ($file -match '^[a-f0-9]{32}\.webp$') {
                    Remove-Item -LiteralPath (Join-Path $backend "writable/uploads/animals/$file") -ErrorAction SilentlyContinue
                }
            }
        }
        $hasReportPhotos = & $MariaDbClient @databaseArgs -N $schema -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'animal_reports' AND COLUMN_NAME = 'photo_path'"
        if ($hasReportPhotos -eq '1') {
            $files = & $MariaDbClient @databaseArgs -N $schema -e 'SELECT photo_path FROM animal_reports WHERE photo_path IS NOT NULL'
            foreach ($file in $files) {
                if ($file -match '^[a-f0-9]{32}\.webp$') {
                    Remove-Item -LiteralPath (Join-Path $backend "writable/uploads/reports/$file") -ErrorAction SilentlyContinue
                }
            }
        }
        & $MariaDbClient @databaseArgs -e "DROP DATABASE $schema"
    }
}
