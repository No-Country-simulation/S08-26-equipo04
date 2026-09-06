# QualityTrack — Backlog: Épicas, Historias de Usuario y Release Plan

Versión 2 · 04/09/2026 · Derivado de la Especificación Funcional v2 (`docs/funcional/QualityTrack-PRD-v2.md`)

*Esta versión aplica las 15 definiciones y correcciones documentadas en `docs/funcional/QualityTrack-Cambios-PRD-Backlog.md`, validadas con el equipo completo el 04/09/2026. Los cambios de criterios de aceptación están marcados con **(v2)**. HU-5.2 se elimina — ver CA-1 en el documento de cambios.*

## Cómo leer esto

Cada historia sigue el formato **Como \<rol>, quiero \<acción>, para \<beneficio>**, con criterios de aceptación en Gherkin (Given/When/Then). La lógica de sistema que se dispara automáticamente a partir de una acción de usuario (por ejemplo, generar la OT o derivar a la fase siguiente) se documenta como criterio de aceptación de la historia que la dispara — no como historia aparte — para que cada historia represente valor de punta a punta y no una tarea técnica suelta.

Cada Épica corresponde a uno de los 5 dashboards ya cerrados con el equipo. El Release Plan al final es una propuesta de secuenciación por dependencias del flujo, validada con backend (Lisandro y Felipe) por factibilidad técnica el 04/09/2026, en conjunto con el resto de las definiciones de esta versión.

---

## Épica 1 — Vendedor

### HU-1.1 Levantar pedido (Solicitud)

Como Vendedor, quiero cargar la solicitud de un cliente con su documentación y datos de contacto, para iniciar el proceso de cotización.

**Criterios de aceptación**

- Dado que el Vendedor completa los datos del cliente (nombre, dirección, teléfono) y adjunta la documentación (plano, notas), cuando guarda la solicitud, entonces el sistema la registra como cotización pendiente.
- Dado que el Vendedor no completó todos los datos obligatorios del cliente, cuando intenta guardar, entonces el sistema no permite continuar y señala los campos faltantes.
- Dado que la solicitud se guardó correctamente, cuando el Vendedor la revisa, entonces puede ver la fecha esperada de entrega que indicó el cliente. Esta fecha es informativa: no dispara alertas ni condiciona la planificación de fases. **(v2 — AR-2)**
- Dado que el Vendedor carga una solicitud, cuando completa el formulario, entonces debe indicar una descripción de la pieza o trabajo solicitado. **(v2 — CA-3)**
- Dado que el Vendedor carga una solicitud, cuando completa el formulario, entonces debe indicar la cantidad de unidades solicitadas (todas del mismo tipo de pieza; por defecto 1). **(v2 — CA-2)**

### HU-1.2 Buscar órdenes (expediente completo)

Como Vendedor, quiero buscar una OT y ver su expediente completo, para responder cualquier consulta del cliente sin buscar en otro lado.

**Criterios de aceptación**

- Dado que existe una OT con ese número o cliente, cuando el Vendedor la busca, entonces el sistema muestra datos de la solicitud, cotización, historial de operaciones por fase, resultado de Calidad y estado de entrega, todo en una sola pantalla.
- Dado que la OT todavía no pasó por todas las etapas, cuando el Vendedor abre el expediente, entonces las secciones futuras se muestran vacías o marcadas como "pendiente", nunca con datos inventados.
- Dado que una fase de la OT fue reasignada de un operario a otro, o fue rehecha por una no conformidad, cuando el Vendedor abre el expediente, entonces ve ese historial completo (quién la tuvo, cuándo, y en qué intento), no solo el estado final. **(v2 — DF-4)**

### HU-1.3 Cotizaciones derivadas

Como Vendedor, quiero ver las cotizaciones que arma el Jefe de producción y registrar la respuesta del cliente, para poder disparar la generación de la OT.

**Criterios de aceptación**

- Dado que el Jefe de producción aceptó una cotización, cuando el Vendedor la revisa, entonces ve las fases, los tiempos y el precio final.
- Dado que el Vendedor marca la cotización como enviada al cliente, cuando el cliente responde, entonces el Vendedor puede registrar "aprobada" o "no aprobada". Este estado se guarda únicamente en la cotización — la solicitud no duplica este dato. **(v2 — C-1)**
- Dado que el Vendedor confirma la aprobación del cliente, cuando guarda esa confirmación, entonces el sistema genera automáticamente la OT y la deriva a la cola del operario de la primera fase según el orden definido.
- Dado que el cliente no aprobó, cuando el Vendedor lo registra, entonces la cotización queda cerrada como no aprobada y no se genera ninguna OT. Si hace falta recotizar, se carga una solicitud nueva — este MVP no versiona cotizaciones rechazadas. **(v2 — DF-3, reemplaza el criterio original de "vuelve al Jefe de producción")**

### HU-1.4 Despacho / Entrega

Como Vendedor, quiero marcar una OT como entregada indicando a quién se la entregué, para dejar registro del cierre del trabajo.

**Criterios de aceptación**

- Dado que una OT está en estado Despacho, cuando el Vendedor la marca como entregada e indica el nombre del receptor, entonces la OT pasa a estado "entregada" con ese dato guardado.
- Dado que una OT no llegó a Despacho (por ejemplo, sigue en Calidad), cuando el Vendedor intenta marcarla como entregada, entonces el sistema no lo permite.

---

## Épica 2 — Jefe de producción

### HU-2.1 Recepción de cotización

Como Jefe de producción, quiero armar la cotización de una solicitud eligiendo fases, tiempos y precio final, para que el Vendedor se la pueda enviar al cliente.

**Criterios de aceptación**

- Dado que llega una solicitud nueva, cuando el Jefe de producción la abre, entonces puede ver el plano y la documentación adjunta, la descripción de la pieza y la cantidad solicitada. **(v2 — referencia a CA-2/CA-3)**
- Dado que elige las fases del catálogo global y las ordena, cuando les carga un tiempo estimado a cada una, entonces el sistema guarda ese orden y esos tiempos asociados a la cotización. Una misma fase puede elegirse más de una vez en la secuencia si el proceso lo requiere (ej. Mecanizado → Soldadura → Mecanizado). **(v2 — D6 del esquema)**
- Dado que definió un precio final único para toda la cotización, cuando presiona "aceptar", entonces la cotización vuelve al Vendedor lista para enviar.

### HU-2.2 Gestión de planta

Como Jefe de producción, quiero ver la carga de trabajo de mis operarios y poder reasignar OTs, para balancear el trabajo en planta.

**Criterios de aceptación**

- Dado que tiene operarios a cargo, cuando abre la gestión de planta, entonces ve, por operario, las OTs asignadas y la cantidad pendiente.
- Dado que quiere mover una OT de un operario a otro, cuando hace la reasignación, entonces el operario original deja de verla y el nuevo operario la ve en su cola.
- Dado que se realiza una reasignación por balanceo de carga, cuando se confirma el cambio, entonces el sistema registra quién tenía la fase, quién la recibe, quién hizo el cambio y cuándo — para que quede disponible en el expediente del Vendedor (HU-1.2). **(v2 — DF-4)**

### HU-2.3 No conformidades

Como Jefe de producción, quiero decidir qué fase o fases hay que rehacer cuando Calidad rechaza una OT, para corregir solo lo necesario sin repetir todo el trabajo.

**Criterios de aceptación**

- Dado que Calidad marcó una OT como no conforme, cuando el Jefe de producción la revisa, entonces ve las observaciones generales cargadas por Calidad sobre el defecto encontrado — Calidad no indica de qué fase provino, esa determinación es del Jefe. **(v2 — aclaración D4)**
- Dado que decide qué fase(s) puntuales rehacer, cuando las selecciona y asigna operario(s) y tiempo a cada una, entonces el sistema deriva la OT a esos operarios con las notas correspondientes y registra cada fase rehecha como un nuevo intento, conservando la ejecución anterior en el historial. **(v2 — refuerza R8 del esquema)**
- Dado que una OT tiene varias fases, cuando el Jefe de producción rehace solo algunas, entonces las fases no seleccionadas mantienen su estado "terminado" sin cambios.
- Dado que el Jefe manda a rehacer más de una fase por la misma no conformidad, cuando se registra, entonces cada fase rehecha cuenta como un retrabajo independiente para el indicador del Gerente (HU-5.4). **(v2 — DF-5)**

---

## Épica 3 — Operario

### HU-3.1 Tareas en ejecución y pendientes

Como Operario, quiero ver mis tareas pendientes y en ejecución, y marcar cuándo empiezo y termino cada una, para que el sistema sepa el avance real de la OT.

**Criterios de aceptación**

- Dado que tiene una tarea en cola, cuando presiona "comenzar", entonces la tarea pasa a estado "en ejecución".
- Dado que tiene una tarea en ejecución, cuando presiona "terminar", entonces la tarea pasa a "terminado" y el sistema verifica si existe una fase siguiente para esa OT.
- Dado que existe una fase siguiente, cuando se completa esa verificación, entonces la OT se deriva al operario de esa fase.
- Dado que no quedan fases siguientes, cuando se completa esa verificación, entonces la OT pasa a Calidad y el sistema registra ese momento como inicio de la espera en Calidad, para medir el indicador de tiempo promedio del Gerente (HU-5.4). **(v2 — C-2)**

### HU-3.2 Adjuntos

Como Operario, quiero ver los adjuntos de mi tarea (planos u otra documentación), para ejecutar la fase con la información técnica correcta.

**Criterios de aceptación**

- Dado que la OT tiene documentación adjunta, cuando el Operario abre su tarea, entonces puede ver o descargar esos adjuntos.

### HU-3.3 Vencimiento

Como Operario, quiero ver el tiempo de vencimiento de mi tarea, para priorizar mi trabajo en el día.

**Criterios de aceptación**

- Dado que una tarea tiene un tiempo estimado cargado por el Jefe de producción, cuando la tarea entra en la cola del Operario, entonces el sistema calcula el vencimiento sumando ese tiempo estimado al momento de ingreso a la cola. **(v2 — DF-1, reemplaza el criterio original)**
- Dado que la tarea tiene un vencimiento calculado, cuando el Operario la abre, entonces ve ese vencimiento junto con la tarea.

### HU-3.4 Notas discriminadas por origen

Como Operario, quiero ver las notas de mi tarea identificadas según si vienen de Calidad o del Jefe de producción, para saber exactamente qué corregir y por qué.

**Criterios de aceptación**

- Dado que una tarea tiene notas de ambos orígenes, cuando el Operario las ve, entonces están claramente separadas y etiquetadas por origen, nunca mezcladas en un mismo bloque de texto.
- El sistema no admite otros orígenes de nota además de Calidad y Jefe de producción — el Operario no puede crear notas propias. **(v2 — AR-3)**

---

## Épica 4 — Calidad

### HU-4.1 Órdenes terminadas

Como responsable de Calidad, quiero ver las OTs que terminaron todas sus fases, para poder auditarlas antes del despacho.

**Criterios de aceptación**

- Dado que una OT completó todas sus fases, cuando Calidad abre su panel, entonces la OT aparece en la lista de pendientes de control, ordenada por antigüedad desde que el operario de la última fase marcó "terminar". **(v2 — refuerza C-2)**

### HU-4.2 Auditoría (checklist)

Como responsable de Calidad, quiero correr el checklist de 8 puntos sobre una OT terminada, para decidir si cumple los estándares antes de despacharla.

**Criterios de aceptación**

- Dado que Calidad abre una OT terminada, cuando corre la auditoría, entonces el sistema le presenta los 8 puntos del checklist (conformidad dimensional, fases completas, terminación/acabado, cantidad, identificación, prueba funcional, documentación de respaldo, resultado final).
- Dado que responde cualquiera de los primeros 7 puntos, cuando lo hace, entonces puede marcarlo como Cumple, No cumple, o No aplica — este último para puntos que no corresponden al producto evaluado (por ejemplo, prueba funcional en una pieza que no la requiere). **(v2 — C-3, reemplaza el criterio binario original)**
- Dado que completa los primeros 7 puntos, cuando llega al punto 8, entonces debe indicar Conforme o No conforme.
- Dado que marca "No conforme", cuando intenta guardar el veredicto, entonces el sistema exige que cargue observaciones antes de confirmar.

### HU-4.3 Veredicto

Como responsable de Calidad, quiero derivar la OT a Despacho o de vuelta al Jefe de producción según el resultado del checklist, para cerrar el ciclo de control.

**Criterios de aceptación**

- Dado que el veredicto es "Conforme", cuando Calidad lo confirma, entonces la OT pasa a estado Despacho.
- Dado que el veredicto es "No conforme", cuando Calidad lo confirma con sus observaciones, entonces la OT y esas notas se derivan al Jefe de producción. El veredicto describe el defecto observado, no atribuye una fase — esa determinación queda del lado del Jefe. **(v2 — aclaración D4)**

---

## Épica 5 — Gerente

### HU-5.1 Configuración global de fases

Como Gerente, quiero crear y nombrar las fases del catálogo global y definir qué operarios pueden ejecutar cada una, para que el sistema se adapte a cualquier industria de mecanizado sin tocar código.

**Criterios de aceptación**

- Dado que el Gerente crea una fase nueva con un nombre, cuando la guarda, entonces queda disponible en el catálogo global para que el Jefe de producción la use en cualquier cotización.
- Dado que asigna qué operario(s) pueden ejecutar una fase, cuando guarda esa asignación, entonces solo esos operarios pueden recibir tareas de esa fase. La habilitación es **individual, por operario** — no por tipo de tarea general. **(v2 — DF-2, resuelve la duda abierta en v1)**
- Dado que el Gerente quiere asignar fases, cuando abre esta pantalla, entonces ve el listado de operarios ya cargados en el sistema — el alta de operarios nuevos no se hace desde acá en este MVP (ver HU-5.2 eliminada). **(v2 — CA-1)**

### ~~HU-5.2 Alta de operarios~~ — Eliminada en v2

*Eliminada. En este MVP, los usuarios del sistema —incluidos los operarios— se cargan directamente en la base de datos por el equipo de desarrollo durante la implementación, no desde una pantalla del Gerente. El segundo criterio de HU-5.1 cubre lo que sí hace el Gerente con los operarios: consultarlos y asignarles fases. Queda documentada como extensión de fase 2 en el PRD (sección 09). Ver CA-1 en `docs/funcional/QualityTrack-Cambios-PRD-Backlog.md` para el detalle completo de la decisión.*

### HU-5.3 Vista global de planta

Como Gerente, quiero ver cuántas OTs hay pendientes/activas, qué fases existen, y dónde se acumulan (cuellos de botella), para detectar problemas de producción sin mirar el desempeño individual de cada operario.

**Criterios de aceptación**

- Dado que hay OTs en distintos estados, cuando el Gerente abre esta vista, entonces ve la cantidad total de OTs pendientes/activas.
- Dado que hay OTs distribuidas entre las fases del catálogo, cuando el Gerente abre esta vista, entonces ve cuántas OTs hay acumuladas en cada fase.
- Esta vista no debe mostrar métricas de desempeño por operario individual bajo ninguna circunstancia — eso es del Jefe de producción.

### HU-5.4 Vista global de Calidad

Como Gerente, quiero ver indicadores generales de Calidad, para entender el nivel de conformidad de la planta sin revisar OT por OT.

**Criterios de aceptación**

- Dado que hay OTs auditadas por Calidad, cuando el Gerente abre esta vista, entonces ve el % de conformes vs. no conformes.
- Dado que hay fases que el Jefe de producción mandó a rehacer, cuando el Gerente abre esta vista, entonces ve cuántos **retrabajos por fase** hubo — este indicador cuenta las fases rehechas, no las no conformidades detectadas por Calidad (que no distingue fase de origen). Si un rechazo deriva en rehacer dos fases, cuenta como dos retrabajos. **(v2 — AR-1 y DF-5, reemplaza "no conformidades por fase")**
- Dado que hay auditorías recientes, cuando el Gerente abre esta vista, entonces ve un listado de las últimas con su resultado, y el tiempo promedio que pasan las OTs en Calidad — medido desde que el operario de la última fase marca "terminar" hasta el veredicto de Calidad, no desde que el auditor abre la OT. **(v2 — C-2)**

---

## Release Plan (Roadmap de 5 semanas)

Propuesta de PM, ordenada por dependencias del flujo (no se puede cotizar sin catálogo de fases, no se puede ejecutar sin OT generada, no se puede auditar sin OT terminada, etc.). Validada con backend (Lisandro y Felipe) el 04/09/2026 junto con el resto de las definiciones de esta versión.

| Semana       | Contenido       |          Por qué va ahí |
|--------------|-----------------|-------------------------|
| 1 (en curso) | Definición de flujo, backlog y esquema de datos (ya hecho) + HU-5.1 (catálogo de fases y asignación de operarios) + HU-1.1 (Levantar pedido) + carga inicial de usuarios en base por el equipo de desarrollo (reemplaza HU-5.2, eliminada) | Todo lo demás depende de que exista el catálogo de fases y de que se pueda cargar una solicitud. La carga de usuarios ya no requiere una pantalla propia, así que esta semana queda más liviana. **(v2)** |
| 2      | HU-2.1 (Recepción de cotización) + HU-1.3 (Cotizaciones derivadas, incluye generación automática de la OT) | Cierra el circuito comercial completo: de la solicitud a la OT generada. |
| 3 | HU-3.1 a HU-3.4 (dashboard completo del Operario) + HU-2.2 (Gestión de planta) | Con la OT ya generándose, se puede probar el circuito de ejecución en planta de punta a punta, y recién ahí tiene sentido que el Jefe de producción vea carga de trabajo real para reasignar. |
| 4 | HU-4.1 a HU-4.3 (Calidad) + HU-2.3 (No conformidades) + HU-1.4 (Despacho / Entrega) | Cierra el ciclo completo: control de calidad, retrabajo si corresponde, y entrega final. |
| 5 | HU-1.2 (Expediente completo del Vendedor) + HU-5.3, HU-5.4 (vistas globales del Gerente) + testing y preparación de demo | Estas vistas agregan datos de todas las etapas anteriores, así que tiene sentido cerrarlas al final, cuando ya hay datos reales de todo el flujo para mostrar en la demo. |

---

*Convertido a partir de la Especificación Funcional v2 de QualityTrack (04/09/2026). Formato pensado para copiar cada historia directamente como un Issue de GitHub, dentro del Project ya armado por Alicia.*

*Validado contra la Especificación Funcional v2 el 04/09/2026: 17 historias de usuario activas (18 originales, HU-5.2 eliminada — ver CA-1) cubren los puntos funcionales de las 5 secciones de dashboards, las 4 reglas clave quedaron como criterios de aceptación, y ninguno de los ítems fuera de alcance se coló como historia. Se aplicaron 15 definiciones y correcciones surgidas de construir el esquema de base de datos, detalladas en `docs/funcional/QualityTrack-Cambios-PRD-Backlog.md`. Corrección heredada de v1: HU-2.2 había quedado afuera del Release Plan — ya está sumada a la Semana 3.*
