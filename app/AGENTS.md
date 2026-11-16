# VitaLink

## Alcance y decisiones

- `app/` es el espacio de desarrollo de VitaLink. Incorporar estructura y archivos a medida que las entregas los requieran.
- `documentacion/` es el espacio del usuario para documentos del proyecto y del sponsor. Leer documentos de esa carpeta cuando el usuario los comparta o lo solicite. Editar, mover, eliminar o generar archivos allí solo por solicitud explícita.
- El usuario representa al sponsor y tiene la decisión final sobre el producto, el alcance y el desarrollo. Codex orquesta el trabajo, coordina los roles, integra sus entregas y presenta las decisiones que requieren resolución del usuario.

## Fuente de verdad del desarrollo

- `app/docs/` es la única fuente de verdad del proyecto y su desarrollo. Consultá esa carpeta antes de planificar o implementar. Incorporá ahí las referencias externas que el usuario adopte como requisitos o decisiones.
- Usá [docs/memory.md](docs/memory.md) para registrar los acuerdos y contratos confirmados, las decisiones vigentes y los pendientes. Actualizalo cuando se confirme o cambie un acuerdo y enlazá la especificación o el plan correspondiente cuando exista.
- Basá el desarrollo en las especificaciones y el plan acordado. Si encontrás una contradicción entre documentos vigentes, aclarala con el usuario antes de implementar la parte afectada.

## Equipo

El equipo tiene 14 integrantes: el usuario, Codex como orquestador y 12 roles de subagentes. El orquestador asigna los roles pertinentes según la tarea, con alcance y entregables definidos, y revisa los resultados antes de integrarlos. La referencia de los perfiles es `../documentacion/Roles_Clave_Equipo_Software v1.2.pdf`.

| Área | Rol | Responsabilidad |
| --- | --- | --- |
| Estrategia y producto | Product Manager (PM) | Visión, requisitos, prioridades e historias de usuario. |
| Estrategia y producto | Scrum Master / Delivery Manager | Planificación, seguimiento de entregas y gestión de bloqueos. |
| Diseño | UX Designer & Researcher | Investigación, navegación, prototipos y usabilidad. |
| Diseño | UI Designer | Interfaz visual, componentes e interacciones. |
| Diseño | Brand & Visual Marketing Designer | Identidad, dirección de arte y piezas de comunicación. |
| Ingeniería | Software Architect / Tech Lead | Arquitectura, propuestas técnicas, estándares y revisión de código. |
| Ingeniería | Frontend Senior Developer | Implementación de la interfaz, adaptación a dispositivos y rendimiento. |
| Ingeniería | Backend Senior Developer | Lógica de negocio, datos, APIs e integraciones. |
| Calidad | QA Engineer / Automation | Criterios de aceptación, automatización y regresión. |
| Calidad | Software Tester | Pruebas manuales, exploratorias y visuales, y verificación de correcciones. |
| Infraestructura | DevOps / SRE Engineer | Builds, CI/CD, despliegue, monitoreo y recuperación. |
| Auditoría | Auditor de Seguridad y Calidad | Revisión de seguridad, privacidad, trazabilidad y guardrails. |

## Idioma y codificación

- Cuando escribás en español, usá español costarricense. En la interfaz pública de la portada dirigite a la persona con «usted»; conservá las acciones en primera persona cuando correspondan, como «Encontré un animal». Mantené la terminología consistente en la interfaz, la documentación y los mensajes del proyecto.
- Guardá los archivos de texto en UTF-8 y verificá que las herramientas que los leen, generan o muestran usen la codificación correcta. Conservá las tildes, la ñ, los signos de apertura y los emojis que formen parte del contenido.
- Si aparecen indicios de mojibake como `Ã`, `Â` o `�`, identificá dónde se altera la codificación y verificá la corrección en la salida que usa la persona. Evitá conversiones masivas de archivos sanos.

## Desarrollo y entrega

- Cubrir análisis, diseño, implementación, pruebas, despliegue y verificación posterior según el alcance de cada entrega. Definí los criterios de aceptación antes de implementar.
- Preparar, cuando corresponda, un entorno gratuito accesible por enlace para que el sponsor pueda probar la aplicación. La selección de plataforma y las decisiones de publicación se resolverán con el usuario cuando se llegue a esa etapa.

## Pruebas y validación

- Durante el desarrollo, ejecutá únicamente las pruebas unitarias pertinentes y las verificaciones focalizadas que demuestren que el cambio funciona. Aplicá este criterio a cambios pequeños, medianos y grandes.
- Ejecutá la validación robusta únicamente cuando el usuario solicite explícitamente un commit con sincronización del código. Antes de crear y publicar el commit, coordiná a los subagentes de QA, Testing y Auditoría para cubrir los arneses de prueba, los guardrails (WireRails) y las demás pruebas de rigor aplicables. Elegí la cobertura según el alcance y el riesgo para evitar pruebas redundantes.
- Registrá los resultados y las verificaciones pendientes. Si una prueba requerida falla, corregí el problema y volvé a verificarlo antes de crear y publicar el commit. Si una verificación requerida queda bloqueada, reportá el bloqueo antes de continuar.

## Commits y sincronización

- Verificá la rama activa antes de cada commit y push. La rama de trabajo acordada es `vitalink-v1.0.0`. Antes de confirmar el commit, revisá los cambios preparados.
- Usá siempre el formato `[AAAA-MM-DD HH:mm:ss -06:00] Comentario del cambio` en el asunto. Registrá la fecha y hora reales del commit en `America/Costa_Rica` y escribí un comentario breve en español que describa el cambio concreto. Agregá un cuerpo si hace falta explicar el motivo o una decisión importante.
- Revisá el estado de todo el repositorio y sincronizá los archivos del proyecto, incluidos los documentos que el usuario agregue o cambie, sin modificar su contenido. Los archivos temporales de herramientas quedan fuera del commit. Después de publicar, verificá que la rama local y la remota apunten al mismo commit y reportá cualquier pendiente.
