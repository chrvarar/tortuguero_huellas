# Plan de construcción y validación local de VitaLink

Estado: listo para revisión. El plan cubre la demo local. Los acuerdos funcionales están en el [levantamiento del censo](censo-animal.md), la [especificación de portada](portada.md) y la [memoria](memory.md). Las consultas aplazadas quedan en el [registro para el desarrollo formal](consultas-desarrollo-formal.md). Diseño puede iniciar los bocetos después del paso 1 mientras se prepara el entorno y se construye el backend.

## 1. Cerrar los contratos del prototipo

- La [primera entrega funcional](primera-entrega.md) ya tiene contrato: acceso local con Superusuario y Administrador, registro de un animal en calle, comprobación del censo y descarga y verificación local del QR. El escaneo con celular se realizará tras la publicación.

- **Producto, Arquitectura y QA.** Convertir los acuerdos en una lista de recorridos, permisos por acción y registro, datos de entrada, estados y criterios de aceptación. Incluir los cuatro mantenimientos, el censo y las cinco secciones públicas.
- Confirmar el alcance de lectura por rol, quién vincula y cierra avisos, quién reactiva expedientes y cómo se revisan los reportes públicos. Para avanzar con un diseño revisable, proponer que Administración vincule y resuelva casos manualmente, y que «Quiero adoptar» cree una solicitud separada de la publicación del albergue. Aplicar permisos mínimos mientras se confirman las excepciones. Consultar al usuario antes de implementar cualquier decisión que cambie el alcance de acceso o publicación. El Superusuario ya tiene acceso a todas las opciones, según [Acceso, idiomas y AppShell](acceso-appshell.md).
- Proponer un censo vigente con filtros de distrito, especie y condición, y un estado «Sin registros». Los distritos sin datos no representan cobertura de campo confirmada. La propuesta municipal de seis meses y 500 expedientes validados se presenta por separado.
- **Salida.** Matriz y casos de aceptación listos para diseñar la API y el esquema. Los temas pendientes tienen responsable y momento de decisión.

## 2. Preparar el proyecto y el entorno local

- **Arquitectura y DevOps.** Verificar XAMPP, PHP, extensiones, Composer, Node y el motor de base de datos activo. Usar MySQL si está disponible y MariaDB de XAMPP como alternativa. Documentar el motor y las versiones que realmente se usen.
- Crear `app/backend/` con CodeIgniter 4 y `app/frontend/` con React, Vite, JavaScript y Tailwind. Configurar dependencias, archivos de bloqueo, `.env.example`, base de desarrollo y base de pruebas separadas, UTF-8 y `utf8mb4`. Mantener credenciales y datos reales fuera de Git.
- Documentar cómo instalar, migrar, cargar datos de muestra, levantar la API y el frontend, y reiniciar la demo. Configurar una URL base local para verificar el QR desde la computadora y una URL pública cuando se publique el prototipo.
- **Salida.** Arranque reproducible, consulta de salud de la API y conexión con la base comprobada.

## 3. Construir el esquema y los datos de muestra

- **Backend y Arquitectura.** Crear migraciones para usuarios y roles, catálogo provincia/cantón/distrito, expedientes, fotos, identificadores QR, avisos de hallazgo y extravío, publicaciones y solicitudes de adopción, y seguimiento de avisos por correo. Mantener un identificador interno estable por animal y un identificador público no secuencial para el QR.
- Modelar perro o gato, ubicación, condición de convivencia y estado del expediente. Los cuatro mantenimientos registran provincia, cantón, distrito y dirección exacta según el contexto de cada caso. El tutor es opcional para un animal en calle. Un aviso, una publicación de adopción y un reemplazo de QR pueden referirse al mismo expediente. El vínculo no crea otro animal censado.
- Crear datos reproducibles para las tres condiciones de convivencia, distritos con y sin registros, un archivado, un QR reemplazado y perfiles de adopción. Para la primera entrega, cargar únicamente Superusuario y Administrador con el cargador local de demostración. Usar los perfiles de BIENVET con sus fotos e historias autorizadas, contactos ficticios y un buzón local.
- **Salida.** Migración y carga repetibles en una base vacía, con totales esperados para comparar el reporte.

## 4. Implementar identidad, expedientes y censo

- **Backend y QA.** Implementar registro público de Usuario general, inicio y cierre de sesión, sesión recordada revocable, perfil y foto, autorización en servidor y acceso autenticado «Mi compañero animal», limitado a la ficha propia. Implementar creación de Administradores por el Superusuario e incorporación de Colaboradores por Administración. Aplicar la matriz a consultar, insertar, editar, eliminar y archivar donde corresponda.
- Construir el registro de compañeros y sus validaciones. Generar, mostrar y descargar el QR con la URL completa. Autorizar el reemplazo y la desactivación a Administración y Superusuario. El código anterior muestra «Código fuera de servicio». El archivado conserva su código con una pantalla neutra.
- Implementar el reporte para Administración, Colaboradores y Superusuario. Cada expediente activo cuenta una vez desde que se guarda, sin aprobación previa. Los archivados e inactivos quedan fuera. Verificar los totales por distrito, especie y condición, y mostrar cero cuando corresponda.
- **Salida.** Se puede registrar un perro en calle sin tutor ni collar, comprobar que el censo suma uno y descargar su QR.

## 5. Implementar avisos, correo y adopción

- **Backend, Seguridad y QA.** Implementar hallazgo sin QR, hallazgo desde QR y extravío desde portada sin cuenta. El QR de un animal extraviado abre directamente el formulario. En los demás casos abre su ficha pública, con tres a cinco fotos, nombre del animal y nombre de pila de la persona dueña o nombre de la institución.
- Validar ubicación, imágenes y datos en servidor. Permitir dejar un correo privado para responder mediante un enlace de VitaLink, compartir datos de forma voluntaria o enviar el aviso sin opción de respuesta. Separar lugar del hallazgo y lugar de resguardo cuando difieran.
- Enviar el aviso a la persona dueña cuando corresponda y derivar a Administración los casos de albergue, sin contacto o con rebote. Usar un buzón local y simular el rebote. El correo de muestra de la portada permanece como texto.
- Integrar la galería con publicaciones activas y abrir «Quiero adoptar» con el animal seleccionado. Aplicar los permisos de publicación y solicitud acordados en el paso 1.
- **Salida.** Recorridos completos con datos de muestra, confirmación de envío y seguimiento visible para los roles autorizados.

## 6. Diseñar el sistema visual y construir la portada

- **UX, UI y Marca.** Prototipar primero en móvil y escritorio. Definir tonos azul marino y azul vivo, tipografía, espaciado, contraste, estados de interacción, tarjetas y botones. Usar fotos de perros, gatos, collares QR y colaboradores de los recursos locales autorizados.
- Incorporar los catálogos de Español (Costa Rica), English y Deutsch y el selector persistente desde la portada y el acceso hasta los formularios y el AppShell.
- Construir las cinco secciones: apertura con video, logo y dos acciones; guía de hallazgo y extravío; carrusel de adopción; «VitaLink en tu comunidad»; y «Para municipalidades y organizaciones». Mantener «Conocer el programa» con su mensaje provisional. En adopción, integrar avance cada cuatro segundos, controles manuales, pausa durante la lectura, reverso «Conocé su historia» y acceso al formulario.
- Usar video silenciado con póster y pausa. Reservar las huellitas de CSS para secciones secundarias, con aparición escalonada y desvanecimiento detrás de la huella delantera. Mantenerlas fuera del video y del área de lectura. Dar controles de teclado, foco visible y una alternativa con movimiento reducido.
- **Salida.** Las acciones principales se ven y se entienden en celular y escritorio. Carrusel, formularios y enlaces funcionan con teclado, tacto y puntero.

## 7. Construir el AppShell y pulir los estados de interacción

- **Frontend y UX.** Implementar el [AppShell por rol](acceso-appshell.md) con encabezado y pie visibles, selector de idioma, tema Claro/Oscuro, avatar con perfil, menú izquierdo contraíble y desplazamiento central. Conectar los cuatro mantenimientos, el censo y las tarjetas de los animales propios con el expediente médico ficticio. Diseñar estados vacíos, de carga, éxito y error en los tres idiomas.
- Buscar el splash anterior en los recursos o el historial del proyecto. Si no aparece, recrear con CSS unas patitas que caminan en círculo. Mostrarlo mientras el inicio de sesión o una carga lo requiera, sin añadir espera artificial. Mostrar un estado de carga comprensible, una versión estática con movimiento reducido y una salida clara si hay error.
- Revisar contraste sobre video, tamaño de botones, peso de fotos y video, fluidez en celular, tableta y escritorio, y comportamiento al perder conexión o repetir un envío. Preparar título, descripción e imagen de la portada para una futura vista previa al compartir el enlace público.
- **Salida.** Navegación completa y coherente entre la portada, los formularios públicos y el área autenticada.

## 8. Probar, corregir y cerrar la demo local

- **Durante cada cambio.** Ejecutar las pruebas unitarias pertinentes y las verificaciones focalizadas según `app/AGENTS.md`. Registrar qué se probó, corregir los hallazgos y repetir la verificación afectada.
- **Ensayo de aceptación local.** Levantar desde una base limpia y recorrer el guion con datos de muestra. Comprobar el inicio de sesión con las cuentas del alcance de cada entrega, hallazgo y extravío sin cuenta, registro en calle, censo antes y después, descarga y verificación del QR en computadora, reemplazo y archivo, privacidad, derivación por rebote y solicitud de adopción. Revisar los cinco bloques de portada y el AppShell en distintos tamaños de pantalla.
- Validar el alta inicial del Superusuario y la creación de cuentas por rol, la persistencia de idioma y tema, perfil y foto, cierre de sesión recordada, navegación visible por rol y protección de rutas y acciones en la API.
- **Cuando el usuario solicite commit y sincronización.** Coordinar con QA, Testing y Auditoría la validación robusta, incluidos arneses y guardrails aplicables. Cubrir autorización directa a la API, acceso a ficha ajena, validación de archivos y entradas, códigos inválidos, duplicados, reintentos, conteos, regresión y compilación. Resolver fallas requeridas antes de publicar y verificar la coincidencia entre rama local y remota.
- **Cierre.** Dejar el instructivo de arranque, datos de muestra, guion, evidencia y pendientes. Cerrar la entrega local cuando los recorridos acordados pasen, el censo cuadre y la URL del QR abra la ficha correcta en la computadora. Después, publicar en un alojamiento gratuito compatible y comprobar el escaneo con celular usando la URL pública.

## Guion breve para Rossi

1. Abrir la portada y mostrar la guía de QR, la galería y el bloque para municipalidades.
2. Enviar un hallazgo sin QR y mostrar que el aviso aún no suma al censo.
3. Registrar al animal en calle, sin tutor ni collar. Mostrar el censo por distrito antes y después, y descargar el QR del expediente.
4. Abrir la URL del QR en la computadora y mostrar la ficha pública y el aviso. Mostrar la variante de extravío, la entrega al buzón local y la derivación al Administrador ante rebote. Repetir el acceso escaneando desde el celular después de publicar.
5. Entrar al AppShell con un perfil autorizado, consultar el reporte y mostrar el acceso a una ficha propia con el usuario correspondiente. Cerrar con una historia de adopción y una solicitud para ese animal.
