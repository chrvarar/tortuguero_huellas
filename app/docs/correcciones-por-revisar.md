# Correcciones por revisar con el usuario

Estado: correcciones de la portada implementadas y verificadas en Chrome con respuestas de prueba a 1366 y 390 píxeles. La integración con MariaDB ya se verificó mediante los arneses de entrega. Esta lista conserva el historial de las indicaciones; la especificación vigente está en [portada.md](portada.md).

## 1. Tratamiento del español en la interfaz

- El usuario observa frases en voseo y quiere que la interfaz se dirija a la persona con «usted».
- Distinguir las instrucciones dirigidas a la persona de las etiquetas de acciones en primera persona, como «Encontré un animal». Revisar el texto concreto de cada pantalla al preparar el plan.
- Alcance confirmado para esta implementación: página principal pública. El área autenticada y los demás materiales quedan fuera de esta corrección.

## 2. Video de la portada

- Usar el archivo `documentacion/img/pets_bg.mp4` como fondo visible de la sección inicial en lugar de mostrar la foto del perro y el gato como imagen principal.
- Iniciar la reproducción automáticamente al abrir la portada y quitar el botón «Reproducir video».
- La copia de `app/frontend/src/assets/pets_bg.mp4` se sustituyó por el archivo indicado, con contenido idéntico al original en `documentacion/`.

## 3. Accesos a secciones en la portada

- **Corrección del usuario a la interpretación anterior:** las tres tarjetas o botones principales sobre el borde inferior del video son «Registrar a mi compañero animal», «Encontré un animal» y «Reportar extravío», según el esquema de la asesora. La imagen de Petfinder sirve como referencia de presentación visual, no de las etiquetas ni de los destinos.
- «Registrar a mi compañero animal» debe estar disponible como acceso principal para el usuario general y conducir al flujo autorizado de registro. Definir la transición concreta para quien todavía no tiene cuenta al preparar el plan, sin quitar los permisos del backend.
- «Encontré un animal» abre el reporte de hallazgo. «Reportar extravío» abre el reporte de extravío.
- «Cómo funciona», «Adopción» y «Comunidad» siguen siendo secciones de la portada, pero no reemplazan estos tres botones principales. Revisar su ubicación en la navegación al preparar el plan. Mantener adaptación a celular y navegación con teclado.

## 4. Reconstrucción de la segunda sección

- **Aclaración posterior del usuario:** conservar las dos tarjetas de la segunda sección. Una trata el hallazgo de un compañero animal y la otra el extravío del propio compañero animal. La instrucción anterior de retirar la tarjeta de extravío queda reemplazada.
- En la tarjeta de hallazgo, seguir el esquema de la asesora: «¿Tiene un QR?», explicación corta de cómo escanear el código del collar con la cámara del celular y qué ficha o formulario abre VitaLink después, sin exponer datos privados.
- Debajo de esa explicación, incluir una acción «Reportar un hallazgo sin QR» para cuando el animal no tiene identificación o el QR es ilegible. Esa acción abre el formulario en un modal sobre la portada; no navega a otra página.
- La tarjeta de extravío mantiene una guía clara para reportar la pérdida y una acción que abre su formulario en un modal sobre la portada. Diseñar ambas tarjetas como un conjunto coherente.

## 5. Hallazgo sin QR desde la cuarta sección

- Mantener el contenido visual actual de la cuarta sección como punto de partida; la fotografía del perro está bien por ahora.
- El botón «Reportar un hallazgo sin QR» de esa sección debe abrir el formulario de hallazgo en una ventana modal sobre la portada, sin navegar a otra página.
- Al enviar el formulario, mostrar el resultado de forma clara y devolver a la persona a la misma portada, conservando su contexto. Al cerrar el modal sin enviar, también debe permanecer en la portada.
- Al planificar, incluir foco, teclado, cierre y adaptación móvil para que el modal sea cómodo para quien entra por primera vez.

## 6. Registro de Usuario general desde la portada

- El enlace «Registrate en VitaLink» de la portada también debe abrir un formulario modal, sin enviar a la persona a otra página mientras lo completa.
- Si cierra el modal antes de enviar, permanece en la portada.
- **Propuesta recomendada para el plan:** al guardar correctamente la cuenta, iniciar su sesión de forma automática y abrir el área autenticada «Mi compañero animal». El backend actual ya inicia la sesión después del registro, así se evita pedir de nuevo usuario y contraseña.
- Mostrar confirmación clara de la cuenta creada y del acceso. Conservar la opción de cerrar sesión y regresar a la portada. No conceder roles elevados mediante este formulario.

## 7. Solicitud de adopción y regla de formularios

- En la tercera sección, el botón «Quiero adoptar» de cada compañero animal debe abrir el formulario de solicitud en un modal sobre la galería, asociado al animal elegido. No enviar a la persona a una página vacía con solo el formulario y el logo.
- Tras enviar o cerrar el modal, la persona debe conservar el contexto de la página en la que estaba.
- **Regla general indicada por el usuario:** cuando una acción requiera llenar un formulario, presentarlo en una ventana modal para que la persona no se pierda entre páginas. Auditar los formularios y enlaces actuales durante el plan, incluidos portada, adopción y área autenticada. Resolver allí cualquier contradicción con la especificación anterior del AppShell que proponía formularios en el área central.
- En la portada, ningún botón o acción de formularios debe sacar a la persona a otra página. Después de enviar o cerrar el modal, vuelve al contexto de inicio. El texto «enlace» del esquema original describe el acceso a la acción, no una navegación a otra página.
- Diseñar estados de confirmación, error, carga, cierre, foco y teclado en todos los modales; evitar ventanas o páginas que muestren únicamente un formulario aislado.

## 8. Calidad visual de las imágenes en la segunda sección

- La captura del usuario muestra que la foto del perro y el gato con collares QR está recortada: no se ven completas las cabezas y orejas. Ajustar encuadre y proporción para que ambos animales se vean bien; verificar el resultado visual en escritorio y celular.
- La tarjeta de extravío permanece y también debe tener una imagen; el usuario propone usar la otra imagen `pets`. Dar a las dos tarjetas un tratamiento visual equilibrado.
- Involucrar Diseño UI/UX y QA en la revisión visual real de las imágenes; el orquestador es responsable de integrar y verificar el resultado.

## 9. Encabezado y selector de idioma

- Quitar del encabezado los enlaces «Cómo funciona», «Adopción» y «Comunidad». Los tres botones principales de la sección inicial siguen siendo «Registrar a mi compañero animal», «Encontré un animal» y «Reportar extravío», según el punto 3.
- Rediseñar el selector de idioma del encabezado para que sea visualmente atractivo y muestre de forma clara la bandera junto con el nombre del idioma: Costa Rica - Español, Estados Unidos - English y Alemania - Deutsch.
- El selector actual se percibe como un combo simple, seco y poco visible, aunque sus opciones incluyen banderas. Diseño debe proponer un control más colorido y verificar su aspecto real en escritorio y celular, con navegación de teclado y estado seleccionado claro.
