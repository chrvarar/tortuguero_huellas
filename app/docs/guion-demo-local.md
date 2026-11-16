# Guion de demostración local para Rossi

## Preparación

1. Iniciá MariaDB de XAMPP, la API y Vite según [base local](base-local.md#arranque-de-la-primera-entrega). Abrí `http://127.0.0.1:5173` en la computadora.
2. Confirmá que la portada, las fotos y el video cargan. Usá el selector para mostrar español, inglés y alemán, y volvé a español antes de continuar.
3. Tené una foto JPEG, PNG o WebP de menos de 5 MB para registrar un animal nuevo. La cuenta local de demostración es `administrador` con contraseña `administrador`. Estas credenciales pertenecen solo al entorno local.
4. Consultá el censo antes de registrar. El conjunto de muestra, sin registros nuevos, muestra Carmen **2**, Catedral **1** y Zapote **0**. Si ya hubo ensayos sobre esta base, anotá el total actual y compará el cambio relativo.

## Recorrido sugerido

1. **Portada.** Mostrá el acceso, la guía del collar QR, la galería de adopciones, el trabajo en la comunidad y el bloque para municipalidades. Indicá que las historias y cifras de muestra son demostrativas.
2. **Hallazgo sin QR.** Abrí «Encontré a un animal». Explicá los campos de ubicación, el contacto opcional y la posibilidad de no compartirlo. Un aviso por sí solo no añade un animal al censo.
3. **Acceso.** Iniciá sesión como Administración. Mostrá el censo por distrito y los filtros por especie y condición.
4. **Registro.** Creá un perro o gato en calle, sin tutor ni collar físico, con la foto, distrito, dirección y observaciones de muestra. Confirmá que el expediente se guarda y que el distrito elegido suma **exactamente uno** al censo vigente.
5. **QR.** Abrí el expediente, mostrá la imagen del QR y descargala. El enlace «Abrir ficha pública» debe llevar al mismo animal sin mostrar correo privado ni otros datos del contacto. En local se comprueba desde la computadora; el escaneo real con celular se hará cuando exista una URL pública.
6. **Extravío y avisos.** Desde la portada, mostrá el formulario sin cuenta. En Administración, consultá la bandeja de avisos y explicá el buzón local simulado y la derivación al Administrador cuando se simula un rebote. No presentés los correos de muestra como enviados a una bandeja real.
7. **Adopción.** Abrí la galería y la historia de Mora. Es un perfil ficticio de demostración. Mostrá «Quiero adoptar» y la gestión privada de solicitudes sin exponer datos personales al público.
8. **Cierre.** Mostrá el menú por rol, el perfil, los idiomas y el tema claro/oscuro. Si el registro nuevo fue de ensayo, archivar su expediente debe reducir el censo en uno y conservar la ficha interna.

## Resultado esperado

- El nuevo expediente activo cuenta una sola vez; el aviso público no altera el censo.
- El QR contiene una URL completa y la ficha pública corresponde al animal seleccionado.
- Los datos privados quedan en las vistas autorizadas.
- Las pantallas recorridas funcionan a tamaño móvil y de escritorio, con los controles visibles y sin desbordamiento horizontal.

El recorrido automatizado de lectura en navegador está en `app/frontend/tests/local-smoke.mjs`. El ensayo de registro, archivo y avisos sobre una base descartable está en `app/backend/tests/first-delivery.ps1`. Al publicar, repetí el paso del QR con el celular y una URL pública.
