# Base de datos local de VitaLink

Entorno verificado: PHP 8.5.12 de XAMPP, Composer 2.9.5, CodeIgniter 4.7.6, Node 26.13.0, npm 11.20.0 y MariaDB 10.11.16 en `127.0.0.1:3306`. PHP tiene la extensión `intl` instalada. En esta máquina se habilita para cada comando con `-d extension=intl`.

## Configuración y migraciones

Desde `app/backend/`, instalá las dependencias con Composer y copiá `.env.example` a `.env` si aún no existe. Configurá las credenciales locales y usá una base vacía con `utf8mb4`, por ejemplo `vitalink_demo`. El `.env` local está excluido de Git.

```powershell
php -d extension=intl C:/ProgramData/ComposerSetup/bin/composer.phar install
php -d extension=intl spark migrate
php -d extension=intl spark migrate:status
```

Las migraciones se guardan en `app/backend/app/Database/Migrations/`. CodeIgniter registra las versiones y lotes aplicados. La base inicial tiene migraciones para usuarios, distritos y expedientes. Para un cambio posterior al esquema, agregá una migración con su reversión y conservá las versiones aplicadas.

## Datos de prueba

Para cargar el conjunto ficticio en la base local, usá `CI_ENVIRONMENT = development` y `VITALINK_DEMO_SEED = true` en `.env` y ejecutá:

```powershell
php -d extension=intl spark db:seed DemoSeeder
```

El cargador inserta los registros de muestra que falten y conserva los existentes. Las dos cuentas acordadas tienen sus contraseñas guardadas como hash. Los tres distritos de muestra tienen estos totales activos: **Carmen 2, Catedral 1 y Zapote 0**. Carmen también contiene un expediente archivado y uno inactivo, ambos fuera del conteo.

Para reconstruir todo desde cero, apuntá `.env` a una base desechable vacía y ejecutá `migrate` y `db:seed DemoSeeder`. También podés ensayar la reversión con `php -d extension=intl spark migrate:rollback -b 0` en esa base desechable, que elimina las tablas y sus datos, y volver a migrar y sembrar. No ejecutar la reversión completa sobre la base de trabajo de Rossi.

Se verificó la reversión y reconstrucción en `vitalink_migration_check`, la repetición del cargador sin duplicados y la carga inicial en `vitalink_demo`.

## Arranque de la primera entrega

Con MariaDB activo y la base de demo cargada, abrí dos terminales. En `app/backend/`:

```powershell
php -d extension=intl -d extension=gd -d upload_max_filesize=5M -d post_max_size=8M -S 127.0.0.1:8080 -t public vendor/codeigniter4/framework/system/rewrite.php
```

En `app/frontend/`:

```powershell
npm ci
npm run dev
```

Abrí `http://127.0.0.1:5173` en la computadora e iniciá sesión con la cuenta local de Administración. El QR utiliza el origen de la página. Al publicar se puede configurar `VITE_PUBLIC_ORIGIN` con el origen público de VitaLink y servir la API bajo `/api/` en el mismo origen. El escaneo desde el celular queda para esa etapa.

Desde la pantalla inicial podés abrir los formularios públicos de hallazgo y extravío. La ficha pública por QR también permite reportar un hallazgo vinculado. Para consultar los avisos, iniciá sesión con Administración o Superusuario y usá «Consultar avisos» en la bandeja. El aviso se registra en la base y no altera el censo.

En un aviso de extravío podés adjuntar una foto opcional que solo se ve desde la bandeja autorizada. En la bandeja, seleccioná un expediente activo de la misma especie y usá «Vincular y marcar como extraviado». Abrí el enlace del QR para ver el formulario de hallazgo directamente. «Cerrar extravío» devuelve el enlace a la ficha habitual cuando no quedan avisos de extravío abiertos para ese expediente.

### Probar el buzón local

Como Administrador, abrí el expediente de Luna y guardá un correo privado ficticio para la persona dueña, por ejemplo `tutor@example.test`. Abrí su enlace público, registrá un hallazgo y volvé a «Consultar avisos». En «Correo de demostración» aparece el mensaje capturado para ese destinatario. Usá «Simular rebote» para ver la derivación al Administrador. Los avisos de albergue y sin contacto se derivan directamente. El destinatario de Administración se configura con `VITALINK_DEMO_ADMIN_EMAIL` y por omisión usa `administrador@example.test`.

El buzón captura los mensajes en la base y no entrega correo por SMTP. Si quien reporta deja un correo, la notificación nueva ofrece «Abrir enlace privado de respuesta». Podés abrirlo sin cuenta, escribir una respuesta y consultar el mensaje capturado en la bandeja. El enlace dura siete días y admite una respuesta. Un rebote simulado invalida el enlace original y genera uno nuevo para Administración. Sin correo de contacto, el aviso se guarda sin enlace de respuesta.

Los mensajes capturados antes de esta funcionalidad conservan su contenido original. Para probar el recorrido, creá un aviso nuevo. `VITALINK_PUBLIC_ORIGIN` configura el origen público de los enlaces del buzón. La integración con un proveedor de correo queda pendiente.

### Probar adopción

Abrí `http://127.0.0.1:5173/adopciones`, elegí «Quiero adoptar» en el perfil ficticio de Mora y enviá una solicitud de muestra. Iniciá sesión con Administración o Superusuario y abrí «Gestión de adopciones» para consultar la solicitud. Desde ahí se pueden publicar y retirar perfiles de expedientes activos de albergue. Retirar un perfil impide nuevas solicitudes y conserva las anteriores. Los datos de contacto se consultan en la bandeja privada.

El perfil de Mora usa una foto ilustrativa de los recursos locales. Para agregar los seis perfiles ficticios nuevos a una base de demo ya migrada, ejecutá `php -d extension=intl -d extension=gd spark db:seed DemoAdoptionsSeeder` desde `app/backend/`. GD convierte las fotos a WebP. El cargador deja intactos los perfiles existentes, incluso si fueron retirados, y prepara las fotos de los nuevos animales. Con Mora, la galería y el carrusel de la portada muestran siete ejemplos. La carga local del 7 de noviembre de 2026 dejó siete perfiles publicados.

### Reemplazar un QR y filtrar el censo

En un expediente activo, Administración o Superusuario puede usar «Reemplazar QR» para emitir un código nuevo o «Desactivar QR» para retirar el código sin emitir otro. El enlace retirado muestra «Código fuera de servicio». El código nuevo abre el mismo expediente y conserva su foto. Los enlaces de adopción son independientes del QR.

En «Censo vigente», combiná distrito, especie y condición. Solo se cuentan expedientes activos. Los distritos sin coincidencias se muestran con cero y la etiqueta «Sin registros».

### Editar o eliminar un expediente

Seleccioná un expediente en «Expedientes registrados». Administración y Superusuario pueden editar nombre, especie, condición, distrito, dirección, observaciones y, de forma opcional, reemplazar la foto. El QR se conserva. «Eliminar expediente» pide confirmación, retira su QR y actualiza el censo. Si tiene avisos vinculados o un perfil de adopción, usá «Archivar expediente» para conservar el historial.

### AppShell, idiomas y registro de cuentas

Desde la portada, elegí el idioma y abrí «Iniciar sesión». El selector conserva español costarricense, inglés o alemán al navegar. La portada, el acceso, la navegación, el censo, los avisos, las adopciones, los expedientes y los controles de QR tienen textos localizados. La interfaz envía el idioma elegido en `Accept-Language` y la API traduce sus mensajes de validación y acceso conocidos sin cambiar el estado HTTP. Los nombres, historias y descripciones escritos por personas conservan su idioma original.

Dentro del AppShell, abrí el menú para ir a las opciones disponibles según tu rol. El encabezado y el pie permanecen visibles mientras se desplaza el contenido central. El control Claro/Oscuro conserva tu preferencia. Desde el avatar, «Editar perfil» permite cambiar el nombre visible y cargar, reemplazar o quitar la foto. Se admiten JPEG, PNG y WebP de hasta 2 MB y 2048 × 2048 píxeles. La foto solo se sirve a su propia cuenta. Si no hay foto, el avatar muestra iniciales.

«Registrate» crea un Usuario general y abre «Mi compañero animal». La cuenta puede registrar animales propios con hogar y consultar sus fichas y el acordeón médico ficticio. Las cuentas locales de Administración y Superusuario conservan el acceso al censo y a las bandejas privadas. Al iniciar sesión, «Mantener mi sesión iniciada» conserva el acceso durante 14 días mediante una cookie protegida y revocable; cerrar sesión la invalida. En «Usuarios», Superusuario puede crear cuentas de Administración y Administración puede crear cuentas de Colaborador. Las contraseñas se comparten fuera de la aplicación por un canal privado; los listados no muestran contraseñas ni la cuenta de Superusuario.

## Pruebas focalizadas del primer recorrido

Desde la raíz del repositorio, con MariaDB de XAMPP activo y PowerShell 7.4 o posterior:

```powershell
pwsh -NoProfile -File app/backend/tests/first-delivery.ps1
```

El arnés usa el cliente local de XAMPP y su cuenta `root` local. Crea un esquema descartable con nombre único, comprueba que CodeIgniter apunta a ese esquema antes de migrar y confirma que la API lo usa antes de registrar un animal. Al terminar, cierra su proceso PHP y elimina el esquema de prueba. Verifica reversión, recarga sin duplicados, acceso, registro con foto, privacidad pública, conteo y archivo.

Desde `app/frontend/`, `npm test` genera el PNG con el mismo código de la interfaz y lo decodifica para comprobar la URL. Estas pruebas cubren el primer recorrido. La validación robusta de publicación sigue el procedimiento de `app/AGENTS.md`.

## Ensayo de interfaz local

Con la API en `127.0.0.1:8080`, Vite en `127.0.0.1:5173` y la base de demo cargada, `app/frontend/tests/local-smoke.mjs` recorre la portada, el cambio de idioma, el acceso de Administración, el censo, el QR de Toby y su ficha pública anónima, el tema oscuro, los formularios de hallazgo y extravío, y la adopción. Usa Chrome en 1366 y 390 píxeles, decodifica la imagen QR, comprueba errores de JavaScript y desbordamiento horizontal. Requiere las variables `VITALINK_PLAYWRIGHT_PATH` y `VITALINK_CHROME_PATH` con rutas locales al módulo Playwright y al ejecutable de Chrome; luego se ejecuta con `node app/frontend/tests/local-smoke.mjs` desde la raíz. El ensayo consulta datos de la demo y no envía formularios que los modifiquen. El recorrido humano está en el [guion para Rossi](guion-demo-local.md).
