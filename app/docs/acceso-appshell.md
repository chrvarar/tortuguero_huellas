# Acceso, idiomas y AppShell

## Acceso y registro

- «Iniciar sesión» abre el formulario de usuario y contraseña con el botón «Ingresar» y la opción «¿No tiene cuenta? Registrarse». El registro público solicita nombre completo, correo electrónico, usuario y contraseña confirmada; crea únicamente una cuenta de Usuario general. Los perfiles elevados se asignan en el área autorizada. La tarjeta «Registrar a mi compañero animal» abre el ingreso y conserva la intención hasta mostrar el formulario del animal tras autenticarse o crear la cuenta.
- Para la demo, «Mantener mi sesión iniciada» prolonga la sesión mediante un mecanismo revocable. El navegador puede ofrecer autocompletado. VitaLink nunca guarda contraseñas en el almacenamiento del navegador. Cerrar sesión invalida la sesión recordada y lleva directamente a la portada pública.
- La preparación inicial crea únicamente la cuenta reservada de Superusuario. Desde esa cuenta se crean los Administradores de la demo. Administración incorpora Colaboradores y el Usuario general puede registrarse por su cuenta. Para efectos de la demostración local y en la plataforma pública AlwaysData (`https://vitalink.alwaysdata.net`), las cuentas `superusuario` (clave `superusuario`) y `administrador` (clave `administrador`) están habilitadas con contraseñas básicas sin alertas del gestor de contraseñas del navegador (`autoComplete="off"`) y con longitud mínima de 4 caracteres.
- El Superusuario usa el mismo acceso. Su rol y su cuenta se mantienen fuera del registro público, los listados y los selectores de otros roles. Tiene acceso a todas las opciones disponibles del prototipo, incluidos mantenimientos, QR, censo y gestión de usuarios. Los permisos se verifican en servidor.
- Existe una sola cuenta de Superusuario, reservada para el responsable de VitaLink. Se usa para mantenimiento interno, revisión de incidencias y correcciones. Su existencia se comunica únicamente a los Administradores cuando corresponda. El diagrama y los materiales de presentación muestran los tres perfiles operativos: Administrador, Colaborador y Usuario general. Las bitácoras de auditoría quedan para el desarrollo formal.
- **Rutas de la SPA y escaneo QR móvil sobre Portada:** El enrutamiento de la aplicación (`Root` en `main.jsx` y `LandingDialog` en `landing.jsx`) unifica el escaneo de códigos QR (`/ficha/{codigo}` y `/ficha/{codigo}/hallazgo`) para abrir siempre la página de inicio (Landing page) de fondo y desplegar en primer plano una ventana modal interactiva con la tarjeta del compañero animal. El modal presenta la fotografía, nombre, especie, distrito y estado del animal, protegiendo con rigurosidad los datos privados (solo nombre de pila de la persona dueña o institución). Ofrece el botón «Encontré a este compañero» con transición fluida al formulario de reporte en el mismo diálogo, o detección directa de alerta si el animal está reportado como extraviado. Al cerrar el modal (tecla Escape, botón de cierre o clic fuera), la URL se limpia a `/` sin recargar la página, permitiendo a la persona seguir interactuando con la portada.

## Idiomas

- Ofrecer Español (Costa Rica), English y Deutsch en la portada, el acceso y el AppShell. Mostrar 🇨🇷, 🇺🇸 y 🇩🇪 como apoyo visual junto a sus nombres. Usar español costarricense de forma predeterminada y conservar la selección al navegar e iniciar sesión.
- Preparar desde el inicio catálogos para navegación, portada, formularios, mensajes, estados y reporte. Localizar fechas y números. El contenido que escriben las personas se conserva en su idioma original. Para los perfiles de adopción de la demo, usar traducciones revisadas si están disponibles.

## Estructura autenticada (Diseño inspirado en Sneat)

- **Encabezado fijo.** Botón de menú y logo de VitaLink a la izquierda junto con la miga de pan de la vista activa; a la derecha, insignia del cantón piloto, selector de idioma con banderas (`FlagLanguageSelect`), control Claro/Oscuro y avatar circular con indicador en línea. El menú desplegable del avatar muestra el nombre, el rol, «Editar perfil» (datos y foto) y «Cerrar sesión» (que invalida la sesión y regresa a la portada `/`). Mostrar iniciales cuando no haya foto y conservar la preferencia de tema.
- **Navegación izquierda fija.** Menú vertical expandible y contraíble en azul navy profundo con íconos vectoriales, contadores y separadores de sección: primero «Dashboard», seguido de «Gestiones de compañeros» («Crear registro», «Gestión de compañeros animales» / «Mi compañero animal», «Encontré un compañero», «Se me extravió mi compañero», «Adopciones»), «Reportes» («Reporte de censo» con barras de progreso por distrito) y «Administración» («Usuarios», visible únicamente cuando el rol pueda gestionarlos).
- **Área protagonista central.** Única zona de desplazamiento (`overflow-y: auto`) dentro de un marco de `100dvh` con encabezado y pie inmóviles. Cada opción del menú lateral carga su vista dedicada en el área protagonista, mientras el Dashboard inicial presenta una tarjeta de bienvenida personalizada por rol, tarjetas de indicadores (KPIs) con medallones de color y acceso directo a los módulos principales.
- **Pie fijo.** Delgado, fijo en la parte inferior y centrado. Mostrar «© 2026 VitaLink · En asociación con Finding Home Project by BIENVET».

## Inicio por rol

| Rol | Vista inicial |
| --- | --- |
| Usuario general | «Mi compañero animal». Tarjetas de sus animales con foto y acceso a su propia ficha. Si todavía no tiene registros, mostrar un estado vacío con la opción de registrar uno. |
| Colaborador | Accesos a los mantenimientos autorizados, reportes pendientes de atención y censo. |
| Administrador | Resumen de avisos y accesos a mantenimientos, censo y gestión de colaboradores. |
| Superusuario | Accesos operativos y administrativos completos, incluida la creación de Administradores. |

En la ficha propia, mostrar un acordeón de **expediente médico de ejemplo** con datos ficticios identificados como tales. Puede incluir un resumen con foto, edad, peso y características, vacunas con fechas y cirugías. Usar un ejemplo sin cirugías y otro con una intervención ficticia. El ejemplo es de lectura y queda fuera del censo y del historial sanitario operativo.

La navegación de gestión incluye Registro de compañeros, Encontré a un compañero animal, Compañero animal extraviado y Quiero adoptar un compañero animal. Los botones disponibles siguen la [matriz de permisos](censo-animal.md#permisos-de-la-matriz-inicial). El reporte de censo está disponible para Administrador, Colaborador y Superusuario.
