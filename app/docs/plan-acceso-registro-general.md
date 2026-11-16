# Plan: acceso y registro de Usuario general

## Objetivo

Al pulsar «Registrar a mi compañero animal» en la portada, mostrar primero un modal de **ingreso**. Quien ya tenga cuenta introduce usuario y contraseña y pulsa **Ingresar**. Debajo aparece «¿No tiene cuenta? **Registrarse**». Este enlace cambia el contenido del mismo modal a **Crear cuenta**. El botón «Iniciar sesión» del encabezado abre ese mismo ingreso. La intención de registrar un animal se conserva durante ambos recorridos.

## Datos mínimos para crear la cuenta

| Campo visible | Base de datos / tratamiento |
| --- | --- |
| Nombre completo | `users.display_name`, ya existe; exigirlo al registro público. |
| Correo electrónico | Añadir `users.email` mediante una migración nueva; usarlo para contacto futuro. |
| Nombre de usuario | `users.username`, ya existe y es único; se usa para ingresar. |
| Contraseña | Guardar solamente `users.password_hash`, como ya se hace. |
| Confirmar contraseña | Solo valida el formulario; nunca se guarda. |

El `id` lo asigna la base de datos y el rol se fija en `general` desde el servidor. No pedir ID, rol, teléfono ni dirección para crear la cuenta. Los datos de la persona responsable y ubicación del animal corresponden al formulario posterior de registro del compañero animal.

## Pasos de implementación

1. **Separar los dos estados del modal.** Ingreso: título «Ingresar a VitaLink», usuario, contraseña, botón «Ingresar» y texto «¿No tiene cuenta? Registrarse». Registro: título «Crear cuenta», los cinco campos de la tabla, botón «Crear cuenta» y texto «¿Ya tiene cuenta? Ingresar». Mantener cierre, retorno de foco, Escape y navegación por teclado. Presentar los textos en español, inglés y alemán.
2. **Conservar la intención de la acción.** Si se abre desde «Registrar a mi compañero animal», tras un ingreso válido o la creación de la cuenta llevar al área autenticada y abrir el formulario para registrar un animal. Si se abre desde «Iniciar sesión», llevar a la vista inicial del rol. En ambos casos, el cambio entre «Ingresar» y «Registrarse» permanece dentro del modal.
3. **Ampliar la base sin reescribir migraciones anteriores.** Crear una migración reversible para `email`. Permitir `NULL` en cuentas existentes, pues las cuentas de demostración no tienen correo. Asegurar unicidad de correos nuevos con normalización consistente; revisar colisiones antes de imponer el índice. Mantener intactos los datos existentes y actualizar las semillas solo si alguna crea cuentas generales.
4. **Ampliar el registro público en la API.** Validar en servidor nombre, correo, usuario, contraseña y confirmación. Recortar espacios de nombre, correo y usuario; normalizar el correo en minúsculas. Verificar formato y longitud, usuario y correo disponibles, y coincidencia de contraseñas. Mantener `role = general`, hash de contraseña, limitación de intentos y sesión creada tras un registro correcto. No marcar el correo como verificado ni prometer envío de mensajes en esta demo.
5. **Mantener el ingreso simple.** Validar usuario y contraseña contra la cuenta existente. Conservar el mensaje genérico para credenciales incorrectas y la opción actual de mantener la sesión. No revelar contraseñas ni guardarlas en almacenamiento local. Etiquetar bien los campos y habilitar autocompletado: `username`, `current-password`, `name`, `email` y `new-password` según corresponda; permitir pegar y usar gestores de contraseñas.
6. **Alinear la política de contraseñas.** Hoy el registro admite 8 a 72 bytes y el ingreso rechaza más de 72. Antes de cambiar la regla, actualizar ambos extremos juntos y verificar la compatibilidad con el hash usado. Para cuentas nuevas fuera del modo de demostración, adoptar la recomendación vigente de NIST para contraseña como único factor: mínimo 15 caracteres, sin exigir mezclas arbitrarias de símbolos, y admitir al menos 64 caracteres. Mantener las cuentas sencillas de demostración ya acordadas sin bloquear su ingreso.
7. **Verificar el recorrido con pruebas focalizadas.** Cuenta existente → Ingresar → formulario de animal; cuenta nueva → Registrarse → datos válidos → formulario de animal; usuario o correo duplicado; contraseña incorrecta; contraseñas que no coinciden; campos vacíos; cambio de vista y cierre del modal; teclado, foco, móvil e idiomas. Comprobar que las cuentas antiguas de Superusuario y Administrador siguen ingresando.

## Criterios de aceptación

- Nunca aparece «Crear cuenta y entrar» en el formulario de ingreso.
- El formulario de registro explica claramente qué datos crea y ofrece una vuelta a «Ingresar».
- Un usuario registrado no tiene que volver a registrarse para agregar un animal.
- Una cuenta pública nueva siempre queda como Usuario general, con nombre y correo almacenados y contraseña cifrada mediante hash.
- El recorrido iniciado en la tarjeta de registro termina en el formulario del compañero animal, sin perder la intención al cambiar de vista.
- Los errores se explican junto al campo correspondiente sin borrar los datos válidos ni exponer si una cuenta existe en el ingreso.

## Referencias de diseño y seguridad

- [W3C, autenticación accesible](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html): autocompletado, gestores y pegado de contraseñas.
- [OWASP, autenticación](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): respuestas genéricas en el ingreso y control de intentos.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): longitud de contraseñas para autenticación con un único factor.

**Estado:** implementado en la portada, el acceso, la API y la migración. La política de contraseña de 15 caracteres queda para el desarrollo formal; la demostración conserva el mínimo de 8 y las cuentas sencillas acordadas.

**Verificación local:** build de Vite y sintaxis PHP correctos; migración aplicada en `vitalink_demo`; API comprobada con registro de Usuario general (201), duplicado (409), contraseñas distintas (422) e ingreso de Administrador existente (200). La cuenta temporal de prueba se eliminó. Queda pendiente recorrer visualmente el modal en el navegador; el test de portada se actualizó para el flujo nuevo, pero esta sesión no contaba con el módulo Playwright configurado para ejecutarlo.
