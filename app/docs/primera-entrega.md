# Contrato de la primera entrega funcional

## Acceso y datos de demostración

- Habilitar dos cuentas para el ensayo local: `superusuario` y `administrador`. En ambos casos, la contraseña de demostración coincide con el nombre de usuario. Mantener un solo Superusuario, reservado para mantenimiento. El Administrador es la cuenta que usa Rossi para el recorrido.
- Cargar las cuentas mediante datos de prueba exclusivos del entorno local. Validar el inicio de sesión en el backend y guardar las contraseñas mediante hash. El cargador local admite estas claves simples. Para publicar, omitir ese cargador y preparar credenciales distintas para las cuentas de presentación.
- Preparar registros ficticios reproducibles de perros y gatos en el cantón central de San José, con un total conocido en el distrito elegido y al menos un expediente archivado. La Administradora puede cargar una foto y completar los datos del nuevo animal durante la demo.
- Colaborador y Usuario general conservan su lugar en el plan general. La primera entrega se prueba con las dos cuentas indicadas.

## Recorrido y aceptación

1. Entrar como Administrador y consultar el total inicial del censo para un distrito.
2. Registrar un perro o gato en situación de calle con foto, ubicación y observaciones, sin tutor ni collar físico. Guardar el expediente como activo, sin aprobación previa.
3. Volver al reporte y comprobar que el total correspondiente aumenta exactamente en uno. Abrir la ficha pública conserva el conteo. Archivar el expediente lo excluye del censo vigente.
4. Ver la imagen QR en el expediente y descargarla. Comprobar en local que se puede decodificar y que contiene la URL completa configurada con el identificador público. Abrir esa URL desde la computadora y verificar la ficha correspondiente sin iniciar sesión y sin mostrar datos privados.
5. Una vez publicado el prototipo en un alojamiento gratuito compatible, generar o descargar de nuevo el QR con la URL pública. Escanearlo con el teléfono y comprobar que abre el expediente correcto. Esta prueba corresponde al cierre posterior a la publicación. Para la entrega local se usa la computadora, sin túneles ni servidores temporales.

## Orden de implementación

Verificar el entorno local, crear el backend y el frontend, preparar migraciones y datos de prueba, implementar acceso y permisos, y construir el recorrido de expediente, censo y QR. Ejecutar pruebas unitarias y focalizadas por cambio. La validación robusta se activa con la solicitud explícita de commit y sincronización.
