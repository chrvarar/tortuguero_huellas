# Portada pública de VitaLink

## Primera sección

- Encabezado público con el logo arriba a la izquierda y el botón «Iniciar sesión» arriba a la derecha.
- Imagen de fondo centrada con `pets1.jpeg`. En escritorio, ubicar el bloque de texto a la derecha y ajustar el encuadre para mantener visibles a los animales. En móvil, apilar el contenido y mantener visibles las acciones. El video queda fuera de la portada por decisión posterior del usuario.
- Texto en tres líneas: «VitaLink» —«Vita» en blanco y «Link» en el naranja del logo—, «Identificación y bienestar animal en Costa Rica» y «Una identidad para cada compañero animal». La última línea alude a la identificación mediante QR.
- Tres acciones principales en tarjetas sobre el borde inferior de la imagen: «Registrar a mi compañero animal», «Encontré a un compañero animal» y «Mi compañero animal se extravió». Las tres abren formularios modales sobre la portada.
- Cada tarjeta muestra su ilustración con fondo transparente de `app/frontend/src/assets/` (`registro.png`, `encontrado.png` y `perdido.png`, respectivamente, junto con sus versiones a color de interacción `registro-hover.png`, `encontrado-hover.png` y `perdido-hover.png`) completa en la zona superior y el texto de la acción en la franja inferior sin recortar el dibujo.
- Dirección visual: azul marino como base, un azul más vivo para la acción principal y una capa sobre la imagen que asegure contraste. En reposo, los tres botones tienen un fondo radial celeste luminoso con la ilustración en azul navy; al interactuar (`:hover` / `:focus-visible`), destacan con borde azul luminoso, fondo en degradado de azul navy a blanco, el perrito pasa a líneas blancas y el símbolo de cada acción cobra vida a color (la hoja de registro con fondo blanco, borde y líneas negras y casillas en rojo, verde y azul; el puntero de hallazgo en rojo mapa con centro amarillo; y la lupa de extravío con aro gris metálico y mango café madera), mientras la franja inferior pasa a azul marino con texto blanco de alto contraste. Usar [Petfinder](https://www.petfinder.com/) como referencia visual de la disposición de tarjetas.
- Cuatro huellitas individuales quedan ancladas a las secciones informativas de la página principal y se mueven con ellas al desplazarla, con ciclos escalonados de 3.4, 4.6, 5.2 y 4.0 segundos respectivamente. Al terminar cada ciclo, se posicionan de forma aleatoria en cualquier punto de las secciones (incluyendo sobre textos, imágenes o tarjetas con opacidad sutil de 0.25 y `z-index: 6` para garantizar visibilidad tanto en móvil como en escritorio sin afectar la lectura), priorizando las secciones visibles en pantalla y evitando amontonarse entre sí. JavaScript elige las posiciones y ángulos, mientras CSS anima la aparición y el desvanecimiento. Son decorativas, no interceptan clics (`pointer-events: none`) y siguen activas con la preferencia de movimiento reducido por solicitud explícita del usuario.
- El encabezado no contiene enlaces a secciones. Un único combo desplegable muestra la bandera y el idioma seleccionado: 🇨🇷 Español, 🇺🇸 English o 🇩🇪 Deutsch. «Iniciar sesión» abre un modal.

## Segunda sección: guía rápida de hallazgo y extravío

Mostrar dos tarjetas bajo el título «¿Tiene un QR?». En escritorio, ubicarlas lado a lado; en móvil, apilarlas. La primera explica el hallazgo y el QR, y la segunda el extravío. Cada una muestra completa la foto de los cachorros con collar sobre fondo transparente (`pets2-cutout.png` y `pets1-cutout.png`), pasos numerados con insignias, un botón estilizado que abre su formulario en un modal sobre la portada y un efecto `:hover` / `:focus-within` con elevación, borde azul vivo y fondo degradado de azul navy a celeste en el escenario de la imagen.

### Encontré a un animal: ¿cómo uso el QR?

El QR es el código que lleva el collar. Abre la ficha de VitaLink asociada a ese compañero animal.

1. Abra la cámara del celular y apunte al código del collar.
2. Toque el enlace que aparece. Si el animal está reportado como extraviado, se abre el formulario de hallazgo. Si no, se abre la ficha pública con su nombre, fotos y el nombre de pila de la persona dueña o el nombre de la institución responsable.
3. Si se abrió la ficha, toque «Encontré a este compañero». Indique dónde lo encontró y elija si desea dejar un medio de contacto. VitaLink le envía el aviso a quien corresponda.

Debajo de los pasos, mostrar «¿No tiene placa o el QR no se puede leer?» con el enlace «Reportar un hallazgo sin QR» al formulario general.

### Se extravió mi compañero animal

1. Toque «Reportar extravío» para abrir el formulario.
2. Escriba cómo se llama su compañero, agregue fotos que ayuden a reconocerlo e indique dónde se extravió.
3. Complete su nombre y un medio de contacto para dar seguimiento al aviso. Revise la información y envíe el reporte.

En el prototipo, ambos formularios se pueden enviar sin cuenta. Los campos obligatorios y las reglas de publicación del reporte de extravío se detallarán al definir el formulario.

## Tercera sección de la portada — Compañeros animales en adopción

- Mostrar una selección de perfiles activos de perros disponibles para adopción. Propuesta para el prototipo: un carrusel horizontal de una fila, con varias tarjetas visibles en escritorio y una tarjeta principal en celular.
- Avanzar automáticamente cada cuatro segundos. Permitir arrastrar o deslizar y ofrecer botones para avanzar, retroceder y pausar. Detener el avance mientras la persona lee una historia o interactúa con el carrusel. Con la preferencia de movimiento reducido, usar navegación manual y mostrar el reverso sin animación.
- **Frente de la tarjeta.** Dar protagonismo a la foto con insignia de especie, el nombre, edad y temperamento, el albergue responsable y la ubicación en provincia, cantón y distrito. Al pasar el cursor o enfocar, la tarjeta se eleva, enciende su borde azul vivo y hace zoom suave en la foto. Reservar la dirección exacta para el detalle cuando sea pública y el albergue autorice mostrarla.
- **Conozca su historia.** Usar un botón explícito en la franja inferior para girar la tarjeta 180° en 3D hacia la derecha. El reverso presenta un fondo en degradado de azul navy a azul real con texto blanco de alto contraste, miniatura circular del animalito, el relato conmovedor sobre su rescate y un botón directo para solicitar adopción. Incluir un control para volver al frente y permitir usar ambos controles con teclado.
- **Quiero adoptar.** Mostrar este botón en el frente (y su acción equivalente en el reverso). Abre el formulario de adopción en un modal con el animal ya seleccionado.
- La demo puede usar los perfiles, fotos e historias autorizados de Finding Home Project by BIENVET. Seleccionar los casos concretos cuando se prepare el contenido del carrusel.
- El juego de datos local incluye diez perfiles ilustrativos de perros distribuidos en el cantón central de San José (3 en Carmen: Zorro, Pirata, Barón; 3 en Zapote: Lucas, Miel, Pecas; y 4 en Catedral: Mora, Oso, Bruno, Roco), tanto en `DemoAdoptionsSeeder` como en respaldo local del frontend (`DEMO_ADOPTION_PROFILES`) para que el carrusel muestre siempre los diez casos con sus fotos (`dog1.jpeg`–`dog10.jpeg`) e historias de rescate incluso si la base local aún no ha sido sembrada o está sin conexión.

## Cuarta sección — VitaLink en su comunidad

Presenta fondo blanco (`#ffffff`) para mantener un escalonamiento ordenado y limpio de fondos en la página (sección 1 con imagen, sección 2 blanca, sección 3 celeste, sección 4 blanca y sección 5 celeste).
Mostrar el bloque introductorio con la fotografía interactiva del equipo (`colaboradores4.jpeg`) con borde azul celeste, sombra profunda, pie de foto tipo insignia y efecto de elevación/zoom al pasar el cursor, junto con la etiqueta con punto luminoso «San José · Cantón central · Piloto de demostración» y el correo de ejemplo `info@Vitalink.com` (sin habilitar). Debajo, desplegar una vitrina simétrica de tres columnas centradas con íconos vectoriales de trazo fino, títulos de dos niveles en mayúsculas, descripción breve y botón tipo píldora:

1. **Piloto en San José / Censo y registro activo** — Ícono de casa con huella protegida, resumen del censo barrial y botón «Regístrese en VitaLink» (abre el modal de creación de cuenta).
2. **Salud y bienestar / Red veterinaria y cuido** — Ícono de corazón con cruz veterinaria, resumen de coordinación veterinaria y botón «Ver compañeros en adopción» (desplaza a `#adopcion`).
3. **¿Encontró un animal? / Aviso con o sin QR** — Ícono de perros con collar QR, resumen de reporte ciudadano y botón «Reportar un hallazgo sin QR» (abre el modal de hallazgo).

Al pasar el cursor o enfocar cada columna, la tarjeta se eleva con borde azul eléctrico, el medallón del ícono pasa a degradado azul navy/eléctrico con trazo blanco y el botón píldora se ilumina en degradado azul.

### Texto propuesto para la demo

**San José · Cantón central**

> Cada reporte nos ayuda a conocer mejor a los compañeros animales de la comunidad. En este piloto, el equipo de VitaLink organiza los registros de perros del cantón central de San José. Esa información puede ayudar a orientar futuras campañas de cuido y adopción.

**¿Encontró a un animal?**

> Si tiene un collar con QR, abra la cámara del celular, escanee el código y siga los pasos para avisar del hallazgo. Si no tiene placa o el QR no se puede leer, use «Reportar un hallazgo sin QR».

> Correo de ejemplo para la demo: `info@Vitalink.com` (sin habilitar).

**Lo que queremos impulsar**

> VitaLink busca facilitar la coordinación con profesionales veterinarios y organizaciones de la comunidad para impulsar jornadas de vacunación y esterilización, así como atención veterinaria, hospitalización y cirugías cuando un animal lo necesite.

La acción principal es «Reportar un hallazgo sin QR», con una invitación secundaria a registrarse en VitaLink. Ambos reportes públicos siguen disponibles sin cuenta. Mostrar el correo de ejemplo como texto, sin enlace de envío. Si se aprueba el desarrollo definitivo, definir el buzón que recibirá los reportes y cómo se les dará seguimiento. Presentar las iniciativas veterinarias como planes futuros del programa.

## Quinta sección — Para municipalidades y organizaciones

### Texto propuesto para la demo

**Datos del territorio para decidir dónde actuar**

> VitaLink reúne el censo de compañeros animales, la identificación por QR y el seguimiento de reportes en un solo lugar. Así, las municipalidades y las organizaciones pueden conocer mejor a los animales registrados en su zona y coordinar qué hacer cuando un caso requiere atención.

- **Municipalidades.** Consulte cuántos perros registrados tienen hogar, viven en situación de calle o están en un albergue. El desglose por territorio ayuda a priorizar visitas y planificar campañas de vacunación y esterilización.
- **Hoteles, restaurantes y comercios.** Reporte un animal que necesite ayuda cerca de un hospedaje, un restaurante o un sitio turístico. Compartir dónde está y qué se observó facilita el seguimiento y apoya una convivencia más segura para animales, residentes y visitantes.
- **Veterinarias, refugios y organizaciones de rescate.** VitaLink busca facilitar la coordinación de valoraciones, vacunación, desparasitación y esterilización. Ante un hallazgo, el equipo puede consultar si un refugio tiene espacio y coordinar el traslado cuando haya capacidad.

Mostrar «Conocer el programa» como acción prevista. En la demo, acompañarla con «Información del programa próximamente» y mantenerla sin destino externo hasta que el sponsor confirme el material.

### Diseño y alcance

- Usar un mosaico interactivo en movimiento con `colaboradores/colaboradores5.jpeg` como imagen principal de trabajo en campo y `colaboradores/colaboradores1.jpeg` como tarjeta superpuesta de apoyo quirúrgico y clínico, ambas con bordes azul celeste, animación de flotación suave (`@keyframes vl-float-main` y `vl-float-sub`), pies de foto tipo píldora y halo azul eléctrico con zoom al pasar el cursor.
- Acompañar el texto con tres chips de capacidades clave («Censo territorial activo», «Trazabilidad con QR», «Coordinación de emergencias») y una tarjeta destacada para «Conocer el programa» con insignia «Próximamente».
- Presentar los tres bloques por audiencia («Municipalidades», «Comercios y turismo», «Veterinarias y refugios») como tarjetas interactivas con ícono vectorial en medallón, numeración (`01`, `02`, `03`), etiqueta de sector, descripción completa y pie de acción. Al pasar el cursor o enfocar, cada tarjeta se eleva con borde azul eléctrico, invierte su fondo a un degradado azul navy profundo (`#0d2240` a `#1e5cb8`) y resalta sus textos e ícono.
- El censo de la demo cuenta expedientes activos de perros registrados en el cantón central de San José. Las posibles ampliaciones del reporte y el acceso institucional por suscripción quedan en las [consultas para el desarrollo formal](consultas-desarrollo-formal.md).

## Recursos visuales para la demo

Los archivos de origen están en `documentacion/img/`. Usarlos como referencia y copiar a `app/` los recursos seleccionados cuando se implemente la interfaz.

| Archivo | Uso previsto |
| --- | --- |
| `logo.jpeg` | Logo de VitaLink para el encabezado. |
| `pets_bg.mp4` | Recurso de origen conservado para posibles usos posteriores; no se carga en la portada. |
| `pets1.jpeg` y `pets2.jpeg` | Fotos de perros con collar QR. La guía de escaneo es un lugar propuesto para usarlas. |
| `animales/dog1.jpeg` a `animales/dog10.jpeg` | Diez fotos reales de perros con collar QR utilizadas en el carrusel de adopciones y el juego de datos de demostración. |
| `colaboradores/colaboradores1.jpeg` a `colaboradores/colaboradores6.jpeg` | Referencias del equipo de VitaLink en sus labores, para una posible sección sobre el equipo o su trabajo. |

## Portada y área autenticada

- La portada es pública y tiene desplazamiento normal de página para recorrer sus secciones. Puede compartir el proyecto React con el área autenticada y usar su propio layout.
- «Iniciar sesión» abre un modal de usuario y contraseña para Superusuario, Administrador, Colaborador y Usuario general registrado. Tras autenticarse, el AppShell muestra las opciones según los permisos del rol. «Registrar a mi compañero animal» abre ese mismo modal con «Ingresar» y «¿No tiene cuenta? Registrarse». El registro público solicita nombre completo, correo, usuario y contraseña confirmada. Al ingresar o crear cuenta desde esa tarjeta, se abre el formulario del animal en el AppShell.
- En la portada y el acceso hay un selector de Español (Costa Rica), English y Deutsch. «Iniciar sesión» incluye usuario, contraseña, registro y la opción de mantener la sesión. La navegación y los componentes autenticados se detallan en [Acceso, idiomas y AppShell](acceso-appshell.md).
- «Mi compañero animal» es el acceso autenticado a la ficha propia en el prototipo.
- El acceso público a una ficha por QR y su aviso de hallazgo siguen el flujo del [levantamiento del censo](censo-animal.md#identificación-con-qr-y-hallazgos).
- En el prototipo, «Encontré un animal» y «Reportar extravío» abren sus formularios modales desde la portada y permiten enviarlos sin registro ni inicio de sesión. El hallazgo desde un QR también sigue disponible sin cuenta. Tras enviar o cerrar los modales de avisos y adopción, la persona permanece en la portada.

## Pendientes de la primera sección

- Revisar el encuadre de la imagen y la paleta con los recursos disponibles.
- Si se aprueba el desarrollo definitivo, consultar con Rossy y el sponsor si «Reportar extravío» debe exigir una cuenta. La propuesta inicial es mantener «Encontré a un animal» abierto sin cuenta y pedir registro para reportar un extravío.
