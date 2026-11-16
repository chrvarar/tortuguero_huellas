# Levantamiento inicial del censo animal

## Objetivo

Contar compañeros animales por región o ciudad de Costa Rica. Distinguir los animales con hogar o persona responsable, los que están en situación de calle y los que están bajo cuido en un albergue. La información servirá para campañas de cuido responsable, prevención de extravíos, adopción y atención de animales vulnerables.

## Alcance del piloto

- La demostración abarca la provincia de San José, cantón central de San José, con distritos que pueden tener o no registros de animales.
- El prototipo incluye únicamente perros y gatos. Para un eventual desarrollo definitivo queda abierta la pregunta de qué otras especies incorporar.

## Mantenimientos y reporte

| Función | Alcance descrito |
| --- | --- |
| Registro de compañeros | Mantener el expediente del animal. Archivar conserva el expediente y lo deja inactivo, por ejemplo, cuando el animal fallece. Las demás causales y la reactivación quedan por definir. |
| Encontré a un compañero animal | Reportar el lugar donde se encontró al animal y, si está bajo resguardo en otro sitio, indicar dónde se encuentra ahora. El contacto se maneja según las preferencias de quien reporta. |
| Compañero animal extraviado | Reportar la pérdida de un animal y facilitar el contacto con quien lo busca. Nombre, teléfono y correo se mencionaron como ejemplos de contacto. La ubicación corresponde al lugar del extravío. |
| Quiero adoptar un compañero animal | Mostrar tarjetas de animales disponibles en refugios, con foto, nombre asignado y edad. Habitualmente el personal colaborador, por ejemplo veterinarios, registra la información. |
| Reporte de censo | Contar por territorio y situación del animal los expedientes activos en VitaLink. En el prototipo, un expediente nuevo entra al conteo al guardarse como activo, sin aprobación previa. Excluir los expedientes archivados o inactivos y la población sin registrar. Quedan por definir la fecha de corte y los filtros. |

Los cuatro mantenimientos requieren provincia, cantón, distrito y dirección exacta. Según el caso, se registra dónde se ubica el animal, dónde se encontró, dónde se extravió o dónde está bajo cuido para adopción. El formulario de hallazgo pide la ubicación del animal y, cuando corresponda, un campo de texto para describir dónde está ahora bajo resguardo.

## Identificación con QR y hallazgos

- Al crear el expediente, VitaLink genera y muestra una imagen QR y ofrece el botón «Descargar QR». El código contiene la URL completa de VitaLink con el identificador público del animal. Al escanearlo, VitaLink identifica el expediente y abre la ficha pública o el formulario de hallazgo según el estado del animal, sin pedir una cuenta. La Administradora puede usar el archivo descargado para coordinar la impresión con un proveedor externo.
- El expediente de un animal con hogar guarda nombre, correo, teléfono y dirección completa de la persona dueña (provincia, cantón, distrito y dirección exacta). La persona dueña registrada puede consultar la ficha de su animal al iniciar sesión.
- Si el animal figura como extraviado, el QR abre directamente el formulario de hallazgo. En los demás casos, abre la ficha pública con el botón «Encontré a este compañero». El formulario funciona sin cuenta en ambos casos. La ficha pública muestra el nombre del animal, de tres a cinco fotos y solo el nombre de pila de la persona dueña o el nombre de la institución. Los correos, teléfonos y direcciones personales se mantienen privados.
- Quien reporta puede dejar un correo para recibir respuesta. El nombre y el teléfono son opcionales. Puede autorizar que se compartan los datos que elija o mantenerlos privados y recibir una respuesta a través de VitaLink mediante un enlace privado, sin revelar su correo a la otra parte. Si prefiere enviar el aviso sin dejar correo, se registra como aviso sin opción de respuesta. El lugar del hallazgo y, cuando corresponda, el del resguardo se comparten de forma privada con quien atienda el caso.
- VitaLink envía el aviso por correo en ambos flujos. Si el animal tiene hogar y un contacto disponible, lo recibe la persona dueña registrada. Si está en un albergue, no tiene dueño, falta un contacto o el correo rebota, se deriva automáticamente al Administrador, que puede asignar el seguimiento a un Colaborador.
- Administrador y Superusuario pueden desactivar o reemplazar el collar. El reemplazo genera un QR nuevo para el mismo expediente e invalida el código anterior, que muestra «Código fuera de servicio» en una pantalla neutra.
- Archivar el expediente conserva el código asignado y muestra una pantalla neutra sin datos del expediente. El prototipo conserva los expedientes archivados. La retención y la eliminación se definirán si se aprueba el desarrollo definitivo.
- El QR usa un identificador público no secuencial separado del ID interno. Cada aviso por QR se vincula al expediente existente para mantener un solo animal en el conteo.

### Recorrido de la demo — Animal en calle sin tutor ni collar

1. Desde la portada se puede reportar un hallazgo sin QR. El aviso por sí solo queda en el flujo de hallazgos.
2. Se registra al animal en condición de calle con foto, ubicación y observaciones, aunque no tenga tutor ni collar físico. Al guardar el expediente activo, el censo suma un animal.
3. El expediente muestra el QR y permite descargarlo aunque el collar todavía no se haya fabricado. Si después se coloca un collar, se usa el QR del mismo expediente y el conteo sigue siendo uno.

Para un eventual desarrollo definitivo, definir si VitaLink ofrecerá un teléfono institucional, quién lo atenderá y en qué horario. Definir también el plazo de retención, el proceso de eliminación y qué datos conservar para el censo histórico.

## Permisos de la matriz inicial

| Función | Administrador | Colaborador | Usuario general |
| --- | --- | --- | --- |
| Registro de compañeros | Consultar, insertar, editar, eliminar, archivar | Consultar, insertar, editar | Consultar, insertar |
| Encontré a un compañero animal | Consultar, insertar, editar, eliminar, archivar | Consultar, insertar, editar, archivar | Consultar, insertar |
| Compañero animal extraviado | Consultar, insertar, editar, eliminar, archivar | Consultar, insertar, editar, archivar | Consultar, insertar |
| Quiero adoptar un compañero animal | Consultar, insertar, editar, eliminar, archivar | Consultar, insertar, editar | Consultar, insertar |
| Reporte de censo | Generar | Generar | Sin permiso marcado |

El Superusuario (rol 0) está reservado para el responsable de VitaLink y puede ejecutar todas las acciones de la matriz y crear Administradores.

## Preguntas para el sponsor antes del plan

1. ¿Cuáles de los cuatro mantenimientos necesita la primera entrega?
2. Si el mismo animal aparece en un hallazgo, un extravío o una tarjeta de adopción, ¿quién vincula esos registros o confirma que corresponden al mismo animal? ¿Quién registra animales en situación de calle?
3. ¿El censo muestra el estado actual o debe reproducir el conteo a una fecha de corte? ¿Qué filtros y formato de salida necesita el sponsor? Cuando un animal pasa de calle a albergue o de albergue a hogar, ¿se necesita consultar ese historial?
4. En adopción, ¿«Insertar» para Usuario general significa enviar una solicitud o publicar una ficha? En el prototipo, los reportes de hallazgo y extravío se pueden enviar desde la portada sin cuenta. ¿Requieren revisión antes de publicarse? ¿Puede una persona corregir o pedir que se cierre su propio reporte?
5. ¿Qué puede consultar cada rol sobre cuáles registros o territorios? Fuera de la ficha pública por QR, ¿quién puede ver la dirección exacta y los datos de contacto en cada módulo?
6. ¿Cómo se cierra un hallazgo, un extravío o una adopción cuando se resuelve? ¿Quién puede reactivar un expediente archivado?

## Consultas para un eventual desarrollo definitivo

- Consultar con Rossy y el sponsor si reportar un extravío debe requerir una cuenta. Mantener como propuesta el hallazgo sin cuenta.
- El sponsor consultará con los albergues y con Rossy, administradora de VitaLink, si los expedientes deben aprobarse antes de entrar al censo. Confirmar si la aprobación correspondería solo a Administración, si podría delegarse a Colaboradores o si se mantendría el registro sin aprobación previa.
