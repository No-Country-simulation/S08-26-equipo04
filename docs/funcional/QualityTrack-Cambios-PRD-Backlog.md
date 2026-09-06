# QualityTrack — Cambios requeridos en el PRD y el Backlog

Hallazgos surgidos al construir el esquema de base de datos · versión 2 · 03/09/2026

| Documentos afectados | Origen | Estado |
|---|---|---|
| `spec/QualityTrack-PRD.md` · `spec/QualityTrack-Backlog-v1.md` | Consolidación de los dos esquemas de BD propuestos | Definiciones tomadas — para aplicar |

---

## 00. Por qué existe este documento

El orden en que veníamos trabajando fue este:

**1. Flujo unificado** *(reunión del 01/09)* — El equipo completo cerró en conjunto cómo se mueve un trabajo desde la solicitud hasta la entrega, y la decisión de fondo de María de no modelar una industria particular sino una industria de mecanizado genérica.

**2. Especificación Funcional (PRD)** — El flujo se bajó a documento: roles, dashboards por rol, catálogo de fases, checklist de calidad, reglas clave y qué queda fuera de alcance.

**3. Backlog** — El PRD se tradujo a 18 historias de usuario con criterios de aceptación en Gherkin, más una propuesta de Release Plan por dependencias.

**4. Esquema de base de datos** — Y acá es donde aparece lo interesante.

Cuando se modela la base de datos, cada afirmación del PRD tiene que convertirse en algo concreto: una columna, un tipo de dato, una restricción. Y ahí es donde las ambigüedades que un documento en prosa puede tolerar dejan de ser tolerables. "El operario ve el tiempo de vencimiento de la tarea" se lee perfecto en el PRD; al momento de escribir la tabla hay que responder *vencimiento contado desde cuándo*, y esa respuesta no estaba en ningún lado.

**Eso no es un fallo del PRD ni del backlog.** Es exactamente para lo que sirve modelar los datos: es la primera actividad del proceso que obliga a ser literal. Un documento funcional puede decir "el sistema registra la respuesta del cliente" y todos entendemos; una base de datos tiene que decidir si eso es una fila nueva o una fila modificada, y esas dos opciones dan productos distintos.

Este documento lista lo que el trabajo de esquema devuelve hacia atrás. **Ninguno de los 15 puntos cambia el flujo acordado — todos lo precisan.** 14 de ellos requieren tocar el PRD o el Backlog; uno (C-4) es una nota técnica sin impacto en esos documentos. Todas las definiciones ya fueron tomadas; lo que queda es aplicarlas a los documentos.

---

## 01. Cambios que modifican el alcance

### CA-1 · El Gerente ya no da de alta operarios · **elimina HU-5.2**

**Dónde impacta:** PRD sección 07 (Gerente, "Configuración global") · HU-5.2 completa · Release Plan semana 1

**Decisión tomada:** los usuarios los carga el equipo de desarrollo directamente en la base, con su email y contraseña. El Gerente **consulta** los operarios existentes y les asigna qué fases pueden ejecutar, pero no crea usuarios nuevos.

**Por qué:** HU-5.2 pedía dar de alta un operario con nombre y tipo de tarea nada más. Eso obliga a decidir cómo se autentica ese operario después — inventarle credenciales, generar un PIN, o que entre desde una tablet compartida. Cargar los usuarios nosotros saca esa complejidad del MVP sin afectar la demo, donde los usuarios ya van a estar creados.

**Qué cambia en los documentos:**

- **PRD sección 07 (Gerente):** eliminar *"También puede dar de alta operarios directamente (nombre + tipo de tarea) — flexibilidad pensada para industrias chicas sin área de RRHH propia"*. Reemplazar por: consulta el listado de operarios y les asigna las fases que pueden ejecutar.
- **Backlog:** eliminar HU-5.2, o reescribirla como *"Como Gerente, quiero ver los operarios cargados y asignarles qué fases pueden ejecutar"* — que es prácticamente el segundo criterio de HU-5.1. Si se reescribe, conviene fusionarla con HU-5.1 y quedarse con 17 historias.
- **Release Plan:** la semana 1 pierde HU-5.2. Queda con HU-5.1 y HU-1.1, más liviana.

**Efectos laterales positivos:** queda resuelto que **el operario sí se loguea** (con las credenciales que cargamos nosotros), y el esquema se simplifica: `email` y `password_hash` pasan a obligatorios para todos los roles, sin restricciones condicionales.

**A documentar como fase 2:** en una venta real el dueño va a querer dar de alta gente sin depender del proveedor. Restituir HU-5.2 es un paso natural de la siguiente iteración.

---

### CA-2 · Una OT lleva varias unidades del mismo tipo de pieza

**Dónde impacta:** PRD sección 07 (Vendedor) y sección 08 punto 4 · HU-1.1

**Decisión tomada:** el Vendedor carga la cantidad de piezas. Todas del mismo tipo — una OT sigue siendo un solo tipo de elemento.

**Por qué:** es lo que le da sentido al punto 4 del checklist (*"lo producido coincide con la cantidad indicada en la cotización"*). Sin cantidad, ese punto no tiene contra qué contrastar.

**Qué cambia:** agregar el campo cantidad al PRD sección 07 (Vendedor, "Levantar pedido") y un criterio de aceptación en HU-1.1.

---

### CA-3 · Falta la descripción de la pieza

**Dónde impacta:** PRD sección 07 (Vendedor, "Levantar pedido") · HU-1.1

**Decisión tomada:** el Vendedor carga una descripción de qué pieza o trabajo se solicita.

**Por qué:** el PRD lista documentación, notas, datos de contacto y fecha esperada — pero en ningún lado dice qué se está pidiendo. Sin eso, el Jefe tiene que abrir cada plano en PDF para saber de qué se trata una solicitud, y el expediente de HU-1.2 no tiene un título.

**Qué cambia:** agregarlo como dato obligatorio de la solicitud en el PRD y en HU-1.1.

---

## 02. Definiciones que faltaban

### DF-1 · El vencimiento se cuenta hacia adelante

**Dónde impacta:** PRD sección 07 (Operario, "Vencimiento") · HU-3.3

**Decisión tomada:** el vencimiento se fija cuando la fase entra en la cola del operario. Si entra a las 10:00 y dura 180 minutos, vence a las 13:00.

**Por qué importaba definirlo:** el Jefe carga una duración (180 minutos), no una fecha. Sin un punto de anclaje, no hay forma de mostrar un vencimiento. La alternativa era calcularlo hacia atrás desde la fecha de entrega del cliente, que es lo que hace un planificador de producción real pero implica bastante más lógica de la que entra en 5 semanas.

**Qué cambia:** HU-3.3 necesita un criterio de aceptación que diga desde cuándo se cuenta. Hoy dice *"cuando el Operario la abre, entonces ve ese vencimiento"* sin definir cómo se calculó.

---

### DF-2 · La habilitación operario↔fase es individual

**Dónde impacta:** HU-5.1

Esta duda ya estaba anotada en el propio backlog: el criterio de HU-5.1 dice *"solo esos operarios pueden recibir tareas de esa fase"* y al lado quedó el comentario *"esto es por tipo verdad?"*.

**Decisión tomada:** por operario individual. El Gerente marca "Lucas puede hacer Corte y Plegado, Jorge puede hacer Soldadura y Ensamble".

**Por qué:** es lo que dice literalmente HU-5.1 (*"qué operario(s) pueden ejecutar una fase"*), y en una planta de 5 a 15 operarios la carga de configuración es trivial. La alternativa —habilitar por `tipo_tarea`— ahorra configuración pero pierde granularidad.

**Qué cambia:** resolver el comentario abierto en HU-5.1 y dejar el criterio sin ambigüedad.

---

### DF-3 · No hay recotización en el MVP

**Dónde impacta:** PRD sección 04 (flujo, rama "cliente no aprueba") · HU-1.3

**Decisión tomada:** una sola cotización por solicitud, que se aprueba o se rechaza. Si hay que recotizar, se carga una solicitud nueva.

**Por qué:** versionar cotizaciones obliga a agregar una acción "recotizar" en el dashboard del Vendedor y a definir en cada consulta cuál es la versión vigente. Es complejidad que no está en ninguna pantalla del PRD.

**Qué cambia:** HU-1.3 necesita un criterio explícito. Hoy dice *"la cotización vuelve al Jefe de producción"* sin aclarar si se versiona o se reescribe.

**A documentar como fase 2:** recotización con historial de versiones. Es información comercial que a un dueño le interesa ("cotizamos 500k, dijeron que no, cerramos en 420k").

---

### DF-4 · Se registra el historial de reasignaciones

**Dónde impacta:** PRD sección 07 (Jefe, "Gestión de planta") · HU-2.2

Hay dos situaciones que el PRD trata como una sola:

- **Retrabajo por no conformidad:** la fase se rehace, posiblemente con otro operario. Esto queda registrado siempre, porque son dos ejecuciones distintas de la misma fase.
- **Balanceo de carga:** el Jefe ve al operario 1 saturado y le pasa la tarea al operario 2 antes de que empiece. Es la misma tarea que cambia de dueño.

**Decisión tomada:** el balanceo de carga también deja registro.

**Por qué:** suma al expediente completo de HU-1.2, que promete *"el historial de operaciones por fase: operario, momento, notas"*. Sin registro, ese historial tiene un agujero.

**Qué cambia:** HU-2.2 necesita un criterio de aceptación sobre el historial. Hoy solo pide que la reasignación funcione.

---

### DF-5 · Cómo se cuenta un retrabajo que toca varias fases

**Dónde impacta:** PRD sección 07 (Gerente, "Vista global de Calidad") · HU-2.3, HU-5.4

HU-2.3 permite explícitamente que el Jefe mande a rehacer **varias fases** de una misma no conformidad. Si un rechazo deriva en rehacer corte y soldadura: ¿el indicador cuenta 1 no conformidad repartida en 2 fases, o cuenta 2?

**Propuesta:** contar retrabajos (2 en el ejemplo). Es lo natural y lo que sale directo del dato.

**Consecuencia a tener presente:** el total del gráfico por fase va a ser mayor que la cantidad de OTs rechazadas. Además, una OT rechazada que todavía espera la decisión del Jefe no suma en ningún lado, así que el porcentaje de conformes y el conteo por fase no cuadran en tiempo real. Las dos cosas son correctas, pero conviene que el Gerente lo sepa.

---

## 03. Correcciones

### C-1 · La respuesta del cliente vive en un solo lugar

**Dónde impacta:** PRD sección 07 (Vendedor, "Cotizaciones derivadas")

El PRD describe que el Vendedor *"marca si ya la envió al cliente y registra la respuesta"*. Al modelar, la tentación es guardar ese resultado en dos lugares: en la solicitud y en la cotización.

**El flujo no cambia en nada.** Lo que cambia es dónde vive el dato. Con dos lugares, funciona bien hasta el día que el backend escribe uno y falla el otro — una transacción cortada, un endpoint nuevo, un bug. A partir de ahí la pantalla del Vendedor dice "aprobada" y la del Jefe dice "rechazada", y no hay forma de saber cuál tiene razón. Es un bug que no se detecta en la demo y aparece en producción.

**Corrección:** el estado comercial (enviada / aprobada / no aprobada) pertenece a la cotización. La solicitud solo guarda si ya fue cotizada o no.

---

### C-2 · El tiempo en Calidad se cuenta desde que el operario termina

**Dónde impacta:** PRD sección 07 (Gerente) · HU-5.4, HU-3.1

HU-5.4 pide *"el tiempo promedio que pasan las OTs en Calidad"*. Para medirlo hacen falta dos marcas: cuándo entró y cuándo salió.

La salida es clara: el veredicto. La entrada **no estaba definida en ningún documento**, y la respuesta correcta está en HU-3.1: *"Dado que no quedan fases siguientes... la OT pasa a Calidad"*. El reloj arranca cuando el operario de la última fase aprieta "terminar", no cuando el auditor abre la OT.

Si se midiera desde que el auditor la abre, el indicador daría siempre cerca de cero: justamente lo que le interesa al Gerente es cuánto tiempo la pieza estuvo esperando en la cola de Calidad.

**Corrección:** dejarlo escrito en HU-5.4. En el esquema se resuelve con una marca de tiempo en la OT, que además sirve para ordenar la cola del panel de Calidad (HU-4.1).

---

### C-3 · El checklist necesita "no aplica"

**Dónde impacta:** PRD sección 08 punto 6 · HU-4.2

El punto 6 del checklist dice *"Prueba funcional **(si aplica al producto)**"*. El equipo ya previó que hay ítems que a veces no corresponden — una plancha cortada no tiene prueba de hermeticidad.

Pero el checklist no define con qué valores se responde cada punto. Si solo hay "cumple / no cumple", el auditor va a marcar "cumple" en algo que ni siquiera revisó, y el indicador de calidad del Gerente queda contaminado.

**Corrección:** cada uno de los 7 puntos admite **cumple / no cumple / no aplica**, y queda sin responder mientras el auditor no lo contestó. Los tres valores son respuestas explícitas; el vacío significa "todavía no". Agregar el criterio en HU-4.2.

---

### C-4 · Sin FKs redundantes en la OT *(técnico, no afecta documentos)*

Se deja constancia porque salió en la discusión, pero no requiere cambios en PRD ni backlog: la OT se vincula únicamente a la cotización. Cliente, vendedor y solicitud se alcanzan navegando desde ahí, en vez de guardarse repetidos. Si se guardaran repetidos, nada impediría que la OT apunte a una solicitud que no es la de su cotización, y el expediente de HU-1.2 mostraría datos cruzados.

---

## 04. Ajustes de redacción

### AR-1 · "No conformidades por fase" → "Retrabajos por fase"

**Dónde impacta:** PRD sección 07 (Gerente, "Vista global de Calidad") · HU-5.4

El equipo definió — bien — que **Calidad no atribuye la falla a una fase**: ve el defecto sobre la pieza terminada y puede no saber de qué etapa vino. Pedirle un diagnóstico que no está en condiciones de dar ensuciaría el dato: si tiene que elegir algo sí o sí, va a elegir cualquier cosa. El diagnóstico es criterio del Jefe, que sí conoce el proceso.

La consecuencia es que el indicador no mide "dónde detectó Calidad el problema" — ese dato no existe y no debe existir — sino "qué fases mandó a rehacer el Jefe". Que es un dato mejor.

**Ajuste:** renombrar el indicador para que diga lo que mide, y evitar que se lea como "Calidad detectó el problema acá".

---

### AR-2 · La fecha esperada de entrega es informativa

**Dónde impacta:** PRD sección 07 (Vendedor) · HU-1.1

El Vendedor carga la fecha que pide el cliente y ahí termina: no dispara alertas, no condiciona la planificación, no aparece como semáforo en ningún dashboard. Es consistente con el alcance, pero conviene decirlo, porque al leer el PRD es fácil asumir que el sistema hace algo con ese dato.

**Ajuste:** aclarar que es un dato de referencia. Si más adelante se quiere un indicador de atraso, ya están los dos datos necesarios (la fecha del cliente y la suma de tiempos estimados).

---

### AR-3 · Solo Calidad y el Jefe generan notas

**Dónde impacta:** PRD sección 07 (Operario, "Notas") · HU-3.4

HU-3.4 define dos orígenes: Calidad y Jefe de producción. Al modelar aparece la tentación de agregar más (vendedor, operario) por las dudas. No corresponde: el dashboard del Operario es explícitamente de solo lectura — *"interfaz mínima a propósito"* — y el Vendedor no interviene en planta.

**Ajuste:** dejar escrito que los orígenes son exactamente dos, para que no se agreguen orígenes que nadie puede generar.

---

## 05. Qué NO cambia

El trabajo de esquema también confirmó, sin necesidad de tocar nada:

- El catálogo global de fases sin orden de fábrica, con la secuencia armada pedido por pedido, se modela sin fricción. La decisión de María de pensar en "industria general" funciona a nivel de datos.
- El precio único por cotización simplifica el modelo de forma notable: hay una sola columna monetaria en todo el sistema.
- El retrabajo selectivo (rehacer solo algunas fases) se resuelve limpio y conserva el historial completo.
- La separación del checklist en 7 puntos verificables + 1 veredicto es la estructura correcta. Las dos propuestas de esquema llegaron a ella por separado.
- Las 4 reglas clave del PRD se traducen todas a restricciones concretas de la base.
- El Release Plan por dependencias resiste: el orden de construcción de las tablas coincide con el orden de las semanas.
- Los 5 puntos de la sección 10 (fuera de la consigna) siguen fuera, sin que ninguno se haya colado por la ventana al modelar.

---

## 06. Extensiones para una fase 2

Surgieron en la discusión y el modelo queda preparado para recibirlas sin rediseño. Conviene dejarlas escritas para que no se pierdan:

| Extensión | Qué implica |
|---|---|
| **Alta de operarios por el Gerente** | Restituir HU-5.2 con una solución de credenciales |
| **Recotización con historial** | Versionado de cotizaciones + acción "recotizar" en el dashboard del Vendedor |
| **Entregas parciales** | Entregar 30 de 50 piezas hoy y el resto después. Se modela como varias entregas de una misma OT — **no** como varias OTs — así que no entra en conflicto con la regla de una OT por cotización |
| **Automatización del precio por variables** | Ya previsto como no-P0 en la sección 09 del PRD |

---

## 07. Resumen para la reunión

| # | Punto | Tipo | Documento a tocar |
|---|---|---|---|
| CA-1 | El Gerente no crea operarios — **elimina HU-5.2** | Alcance | PRD 07 · HU-5.2 · Release Plan |
| CA-2 | Cantidad de unidades por OT | Alcance | PRD 07 y 08 · HU-1.1 |
| CA-3 | Descripción de la pieza | Alcance | PRD 07 · HU-1.1 |
| DF-1 | Vencimiento hacia adelante | Definición | HU-3.3 |
| DF-2 | Habilitación por operario individual | Definición | HU-5.1 |
| DF-3 | Sin recotización en el MVP | Definición | PRD 04 · HU-1.3 |
| DF-4 | Historial de reasignaciones | Definición | HU-2.2 |
| DF-5 | Conteo de retrabajos multi-fase | Definición | HU-5.4 |
| C-1 | Estado comercial en un solo lugar | Corrección | PRD 07 |
| C-2 | Inicio del tiempo en Calidad | Corrección | HU-5.4 |
| C-3 | "No aplica" en el checklist | Corrección | PRD 08 · HU-4.2 |
| C-4 | Sin FKs redundantes | Corrección | — (solo esquema) |
| AR-1 | "Retrabajos por fase" | Redacción | PRD 07 · HU-5.4 |
| AR-2 | Fecha de entrega informativa | Redacción | PRD 07 · HU-1.1 |
| AR-3 | Dos orígenes de notas | Redacción | PRD 07 · HU-3.4 |

**El único punto que cambia el alcance de forma visible es CA-1**, porque saca una historia del backlog. El resto son precisiones que no mueven el flujo ni el Release Plan.

---

*QualityTrack · NO-Country 2026. Derivado de la consolidación del esquema de base de datos (`docs/datos/QualityTrack-Esquema-Base-Datos-v2.md`) contra la Especificación Funcional v1 y el Backlog v1.*
