# QualityTrack — Matriz de Casos de Prueba QA

**Proyecto:** QualityTrack — MVP  
**Documento:** Matriz de Casos de Prueba  
**Versión:** 1.0  
**Estado:** En diseño  
**Responsable QA:** María Chiribao  
**Referencia:** Cronograma de desarrollo definido por PM  
**Base funcional:** PRD V2 + Backlog V2 + Esquema de Base de Datos V2 + Análisis Funcional QA

---

# 1. Objetivo

Diseñar y organizar los casos de prueba del MVP QualityTrack de acuerdo con las fases definidas en el cronograma de desarrollo.

La matriz permite mantener trazabilidad entre:

**Épica → User Story → Criterio de aceptación → Caso de prueba → Ejecución → Evidencia → Defecto**

La ejecución de los casos queda condicionada a la disponibilidad real de la funcionalidad y al cierre de cada fase del cronograma.

Un caso diseñado no implica que haya sido ejecutado.

---

# 2. Criterio de ejecución QA

QA trabaja sobre el principio:

**Detectar → Analizar → Documentar → Comunicar → Validar**

La planificación de casos se realiza previamente, pero la ejecución depende de que la funcionalidad correspondiente se encuentre disponible y en condiciones de ser validada.

Estados posibles:

- `NOT RUN` — Caso diseñado pero todavía no ejecutado.
- `BLOCKED` — No puede ejecutarse por una dependencia o bloqueo.
- `PASS` — Ejecución satisfactoria.
- `FAIL` — Ejecución con resultado no esperado.

---

# 3. Cronograma QA — Fase A

## A — Circuito comercial

**Período:** Semana 1 → Semana 2

### Criterio de cierre de la fase

La fase A cierra cuando una solicitud llega a:

**OT generada**

de punta a punta contra backend real.

El recorrido esperado para QA es:

**Solicitud registrada completa → Cotización → Cotización enviada → Aprobación del Vendedor → OT generada automáticamente → Primera fase en cola del Operario correcto**

---

# 4. Alcance de la matriz — Fase A

| Épica | User Story | Funcionalidad | Semana | Prioridad |
|---|---|---|---|---|
| Épica 1 — Vendedor | HU-1.1 | Levantar pedido | S1 → S2 | Crítica |
| Épica 5 — Gerente | HU-5.1 | Configuración de fases | S1 → S2 | Alta |
| Épica 2 — Jefe de Producción | HU-2.1 | Armar cotización | S1 → S2 | Crítica |
| Épica 1 — Vendedor | HU-1.3 | Cotizaciones derivadas | S1 → S2 | Crítica |

---

# 5. HU-1.1 — Levantar pedido

**Épica:** Épica 1 — Vendedor  
**Semana:** S1 → S2  
**Objetivo:** Registrar correctamente la solicitud que inicia el circuito comercial.

## Casos de prueba

| ID | Escenario | Datos | Pasos | Resultado esperado | Tipo | Prioridad | Estado |
|---|---|---|---|---|---|---|---|
| TC-A-1.1-01 | Registrar una solicitud con todos los datos obligatorios válidos | Nombre, dirección y teléfono válidos; descripción de pieza/trabajo válida; cantidad = 1 | 1. Ingresar los datos del cliente. 2. Ingresar descripción. 3. Informar cantidad. 4. Guardar solicitud. | La solicitud se registra correctamente con los datos obligatorios informados. | Funcional | Crítica | NOT RUN |
| TC-A-1.1-02 | Registrar solicitud sin nombre del cliente | Dirección y teléfono válidos; descripción válida; cantidad = 1; nombre vacío | 1. Completar los campos restantes. 2. Dejar nombre vacío. 3. Intentar guardar. | La solicitud no debe registrarse porque el nombre del cliente es obligatorio. | Negativo | Alta | NOT RUN |
| TC-A-1.1-03 | Registrar solicitud sin dirección del cliente | Nombre y teléfono válidos; descripción válida; cantidad = 1; dirección vacía | 1. Completar los campos restantes. 2. Dejar dirección vacía. 3. Intentar guardar. | La solicitud no debe registrarse porque la dirección del cliente es obligatoria. | Negativo | Alta | NOT RUN |
| TC-A-1.1-04 | Registrar solicitud sin teléfono del cliente | Nombre y dirección válidos; descripción válida; cantidad = 1; teléfono vacío | 1. Completar los campos restantes. 2. Dejar teléfono vacío. 3. Intentar guardar. | La solicitud no debe registrarse porque el teléfono del cliente es obligatorio. | Negativo | Alta | NOT RUN |
| TC-A-1.1-05 | Registrar solicitud sin descripción de pieza/trabajo | Datos del cliente válidos; descripción vacía; cantidad = 1 | 1. Completar los datos del cliente. 2. Dejar descripción vacía. 3. Informar cantidad. 4. Intentar guardar. | La solicitud no debe registrarse porque la descripción de pieza/trabajo es obligatoria. | Negativo | Crítica | NOT RUN |
| TC-A-1.1-06 | Registrar solicitud sin cantidad | Datos del cliente válidos; descripción válida; cantidad no informada | 1. Completar los datos obligatorios del cliente. 2. Informar descripción. 3. No informar cantidad. 4. Intentar guardar. | La solicitud no debe registrarse porque la cantidad es obligatoria. | Negativo | Crítica | NOT RUN |
| TC-A-1.1-07 | Registrar solicitud con cantidad igual a 0 | Datos del cliente válidos; descripción válida; cantidad = 0 | 1. Completar los datos obligatorios. 2. Informar cantidad = 0. 3. Intentar guardar. | La solicitud no debe registrarse porque la cantidad debe ser mayor que 0. | Negativo | Alta | NOT RUN |
| TC-A-1.1-08 | Registrar solicitud con cantidad negativa | Datos del cliente válidos; descripción válida; cantidad < 0 | 1. Completar los datos obligatorios. 2. Informar una cantidad negativa. 3. Intentar guardar. | La solicitud no debe registrarse porque la cantidad debe ser mayor que 0. | Negativo | Alta | NOT RUN |
| TC-A-1.1-09 | Registrar solicitud con cantidad válida mayor que 0 | Datos del cliente válidos; descripción válida; cantidad > 0 | 1. Completar los datos obligatorios. 2. Informar una cantidad mayor que 0. 3. Guardar. | La solicitud se registra correctamente con la cantidad informada. | Funcional | Alta | NOT RUN |
| TC-A-1.1-10 | Verificar estado inicial de la solicitud | Solicitud creada con todos los datos obligatorios válidos | 1. Registrar la solicitud. 2. Consultar su estado. | La solicitud queda registrada con estado `PENDIENTE_COTIZACION`. | Funcional | Crítica | NOT RUN |
| TC-A-1.1-11 | Verificar persistencia de los datos registrados | Solicitud válida con datos completos | 1. Registrar solicitud. 2. Consultar posteriormente la solicitud. 3. Comparar los datos registrados. | Los datos registrados permanecen disponibles y consistentes después de la creación. | Integración | Alta | NOT RUN |

### Validación principal

QA debe comprobar que la solicitud quede registrada completa y disponible para continuar el circuito hacia la cotización.

---

# 6. HU-5.1 — Configuración de fases

**Épica:** Épica 5 — Gerente  
**Semana:** S1 → S2  
**Objetivo:** Disponer del catálogo de fases y de la configuración necesaria para que posteriormente una OT pueda asignar correctamente la primera fase.

## Casos de prueba

| ID | Escenario | Datos | Pasos | Resultado esperado | Tipo | Prioridad | Estado |
|---|---|---|---|---|---|---|---|
| TC-A-5.1-01 | Gerente consulta el catálogo de fases | Usuario con rol Gerente; catálogo disponible | 1. Ingresar como Gerente. 2. Acceder al catálogo de fases. | El Gerente puede consultar el catálogo de fases disponible. | Funcional | Alta | NOT RUN |
| TC-A-5.1-02 | Configurar una fase del catálogo | Usuario Gerente; fase disponible para configurar | 1. Acceder al catálogo. 2. Seleccionar una fase. 3. Configurar los datos correspondientes. 4. Guardar. | La configuración de la fase queda registrada correctamente. | Funcional | Alta | NOT RUN |
| TC-A-5.1-03 | Configurar los operarios habilitados para una fase | Fase configurada; operarios disponibles | 1. Seleccionar una fase. 2. Consultar los operarios disponibles. 3. Configurar los operarios habilitados. 4. Guardar. | La fase queda asociada a los operarios habilitados definidos. | Funcional | Crítica | NOT RUN |
| TC-A-5.1-04 | Verificar que un operario habilitado pueda ser seleccionado para la fase | Fase configurada; Operario habilitado | 1. Seleccionar la fase. 2. Consultar operarios habilitados. 3. Seleccionar el operario habilitado. | El operario habilitado aparece como elegible para ejecutar la fase. | Integración | Crítica | NOT RUN |
| TC-A-5.1-05 | Verificar que un operario no habilitado no pueda ejecutar esa fase | Fase configurada; operario no habilitado | 1. Consultar la configuración de la fase. 2. Identificar un operario no habilitado. 3. Verificar su disponibilidad para la ejecución de la fase. | Un operario no habilitado no debe quedar disponible como ejecutor válido de esa fase. | Negativo | Alta | NOT RUN |
| TC-A-5.1-06 | Jefe consulta el catálogo de fases disponible para armar una cotización | Usuario Jefe de Producción; catálogo configurado | 1. Ingresar como Jefe. 2. Acceder a la consulta del catálogo. | El Jefe puede consultar el catálogo de fases necesario para armar una cotización. | Integración | Crítica | NOT RUN |

### Validación principal

QA debe comprobar que exista una configuración de fases suficiente para que el Jefe pueda armar la cotización y que, posteriormente, la primera fase de la OT pueda quedar asociada al operario correspondiente.

### Dependencia identificada

Según el cronograma de PM:

- Backend: catálogo de fases `#37` cargado.
- Backend: listado de operarios `#39` cargado.
- Existe un `GET /api/usuarios` genérico.
- Queda pendiente el filtrado específico de operarios.

Por lo tanto, los casos que dependan de esa diferenciación deben permanecer `NOT RUN` o pasar a `BLOCKED` según el estado real de la implementación al momento de ejecutar.

---

# 7. HU-2.1 — Armar cotización

**Épica:** Épica 2 — Jefe de Producción  
**Semana:** S1 → S2  
**Objetivo:** El Jefe recibe la solicitud y configura la cotización con las fases necesarias para la futura OT.

## Casos de prueba

| ID | Escenario | Datos | Pasos | Resultado esperado | Tipo | Prioridad | Estado |
|---|---|---|---|---|---|---|---|
| TC-A-2.1-01 | Jefe consulta una solicitud disponible para cotizar | Solicitud en estado `PENDIENTE_COTIZACION` | 1. Ingresar como Jefe. 2. Consultar solicitudes disponibles. 3. Seleccionar la solicitud. | La solicitud disponible para cotizar puede ser consultada por el Jefe. | Funcional | Crítica | NOT RUN |
| TC-A-2.1-02 | Jefe selecciona fases del catálogo | Solicitud disponible; catálogo de fases configurado | 1. Abrir la solicitud. 2. Consultar catálogo. 3. Seleccionar las fases necesarias. | Las fases seleccionadas quedan incorporadas a la cotización. | Funcional | Crítica | NOT RUN |
| TC-A-2.1-03 | Jefe define el orden de las fases | Solicitud con varias fases seleccionadas | 1. Seleccionar varias fases. 2. Definir el orden de ejecución. 3. Guardar la cotización. | Las fases quedan registradas en el orden definido por el Jefe. | Funcional | Alta | NOT RUN |
| TC-A-2.1-04 | Jefe utiliza una fase repetida cuando corresponde | Catálogo con una fase disponible para repetición | 1. Seleccionar una fase. 2. Incorporar nuevamente la misma fase cuando corresponda. 3. Definir el orden. | La cotización permite que una misma fase aparezca más de una vez cuando corresponde. | Regla de negocio | Alta | NOT RUN |
| TC-A-2.1-05 | Jefe informa el tiempo estimado de las fases | Fases seleccionadas; tiempos estimados definidos | 1. Seleccionar las fases. 2. Informar el tiempo estimado de cada fase. 3. Guardar. | Cada fase queda asociada al tiempo estimado informado. | Funcional | Alta | NOT RUN |
| TC-A-2.1-06 | Verificar que la cotización mantenga un único precio final | Cotización con una o varias fases | 1. Configurar las fases. 2. Informar el precio final. 3. Guardar la cotización. | La cotización mantiene un único precio final y no un precio individual por fase. | Regla de negocio | Alta | NOT RUN |
| TC-A-2.1-07 | Generar y enviar la cotización asociada a la solicitud | Solicitud válida; cotización configurada | 1. Completar la cotización. 2. Guardar/generar la cotización. 3. Enviar la cotización al circuito correspondiente. | La cotización queda asociada a la solicitud y disponible para el Vendedor. | Integración | Crítica | NOT RUN |
| TC-A-2.1-08 | Verificar cambio de estado de la solicitud/cotización según el flujo definido | Solicitud cotizada y cotización generada | 1. Generar la cotización. 2. Consultar los estados correspondientes. | La solicitud y la cotización reflejan los estados definidos para el flujo comercial. | Integración | Crítica | NOT RUN |

### Validación principal

QA debe comprobar que el Jefe pueda construir la cotización utilizando el catálogo de fases y que la información quede disponible para el circuito del Vendedor.

---

# 8. HU-1.3 — Cotizaciones derivadas

**Épica:** Épica 1 — Vendedor  
**Semana:** S1 → S2  
**Objetivo:** Permitir que el Vendedor consulte la cotización derivada de la solicitud y registre la decisión del cliente.

## Casos de prueba

| ID | Escenario | Datos | Pasos | Resultado esperado | Tipo | Prioridad | Estado |
|---|---|---|---|---|---|---|---|
| TC-A-1.3-01 | Vendedor consulta una cotización derivada de una solicitud | Solicitud con cotización disponible | 1. Ingresar como Vendedor. 2. Consultar cotizaciones disponibles. 3. Seleccionar una cotización. | El Vendedor puede consultar la cotización derivada de la solicitud. | Funcional | Crítica | NOT RUN |
| TC-A-1.3-02 | Vendedor visualiza correctamente los datos de la cotización | Cotización con datos completos | 1. Abrir la cotización. 2. Revisar cliente, solicitud, fases, tiempos y precio final. | La información de la cotización se muestra de forma consistente con los datos registrados. | Funcional | Alta | NOT RUN |
| TC-A-1.3-03 | Vendedor registra aprobación de una cotización válida | Cotización válida disponible para decisión | 1. Abrir la cotización. 2. Seleccionar aprobación. 3. Confirmar la acción. | La aprobación queda registrada correctamente. | Funcional | Crítica | NOT RUN |
| TC-A-1.3-04 | Verificar cambio a estado `APROBADA` | Cotización aprobada | 1. Registrar aprobación. 2. Consultar el estado de la cotización. | La cotización queda en estado `APROBADA`. | Integración | Crítica | NOT RUN |
| TC-A-1.3-05 | Verificar generación automática de OT después de la aprobación | Cotización en estado `APROBADA` | 1. Aprobar la cotización. 2. Consultar las órdenes de trabajo generadas. | Se genera automáticamente una OT asociada a la cotización aprobada. | E2E | Crítica | NOT RUN |
| TC-A-1.3-06 | Verificar que la OT quede asociada a la cotización aprobada | Cotización aprobada; OT generada | 1. Aprobar la cotización. 2. Consultar la OT. 3. Verificar su relación con la cotización. | La OT queda correctamente asociada a la cotización aprobada. | Integración | Crítica | NOT RUN |
| TC-A-1.3-07 | Verificar que la primera fase de la OT quede en `EN_COLA` | OT generada con fases configuradas | 1. Aprobar la cotización. 2. Consultar las fases de la OT. | La primera fase queda en estado `EN_COLA`. | E2E | Crítica | NOT RUN |
| TC-A-1.3-08 | Verificar que la primera fase quede asociada al operario correcto | OT generada; fase con operario habilitado | 1. Aprobar la cotización. 2. Consultar la primera fase. 3. Verificar el operario asociado. | La primera fase queda visible/asociada al operario habilitado correspondiente. | E2E | Crítica | NOT RUN |
| TC-A-1.3-09 | Vendedor registra cotización no aprobada | Cotización disponible para decisión | 1. Abrir la cotización. 2. Seleccionar no aprobación. 3. Confirmar la acción. | La decisión de no aprobación queda registrada. | Funcional | Alta | NOT RUN |
| TC-A-1.3-10 | Verificar estado `NO_APROBADA` | Cotización no aprobada | 1. Registrar la no aprobación. 2. Consultar el estado. | La cotización queda en estado `NO_APROBADA`. | Integración | Alta | NOT RUN |
| TC-A-1.3-11 | Verificar que una cotización no aprobada no genere OT | Cotización en estado `NO_APROBADA` | 1. Registrar la no aprobación. 2. Consultar las OT asociadas. | No debe generarse una OT a partir de una cotización no aprobada. | Negativo | Crítica | NOT RUN |
| TC-A-1.3-12 | Intentar procesar nuevamente una cotización ya aprobada | Cotización en estado `APROBADA`; OT ya generada | 1. Consultar una cotización ya aprobada. 2. Intentar procesarla nuevamente. | El sistema no debe permitir una segunda transición no válida ni generar una OT duplicada. | Negativo | Alta | NOT RUN |

---

# 9. Caso E2E principal de la Fase A

Este es el caso más importante de esta etapa porque representa exactamente el criterio de cierre establecido por la PM.

## E2E-A-01 — Solicitud → OT generada

**Prioridad:** Crítica  
**Tipo:** E2E / Integración  
**Semana:** S2

### Precondiciones

- Backend real disponible.
- Usuario Vendedor disponible.
- Usuario Jefe de Producción disponible.
- Usuario Gerente disponible.
- Catálogo de fases configurado.
- Operario habilitado para la primera fase.
- Datos de prueba disponibles.

### Datos de prueba

- Cliente válido.
- Dirección válida.
- Teléfono válido.
- Descripción de pieza/trabajo válida.
- Cantidad mayor que 0.
- Fases existentes en el catálogo.
- Operario habilitado para ejecutar la primera fase.
- Tiempo estimado definido para las fases.
- Precio final de cotización definido.

### Flujo

1. Vendedor registra una solicitud completa.
2. QA verifica la persistencia de la solicitud.
3. Jefe de Producción consulta la solicitud.
4. Jefe selecciona las fases correspondientes.
5. Jefe define el orden de las fases.
6. Jefe informa los tiempos estimados.
7. Jefe genera/envía la cotización.
8. Vendedor consulta la cotización derivada.
9. Vendedor registra la aprobación.
10. QA verifica que la cotización pase a `APROBADA`.
11. QA verifica que se genere automáticamente la OT.
12. QA verifica que la OT quede asociada a la cotización.
13. QA verifica las fases configuradas en la OT.
14. QA verifica que la primera fase quede en `EN_COLA`.
15. QA verifica que la primera fase quede visible para el operario correcto.

### Resultado esperado

La solicitud completa debe recorrer el circuito comercial y finalizar con:

**Solicitud → Cotización → Aprobación → OT generada → Primera fase en cola del operario correcto.**

La OT debe generarse automáticamente como consecuencia de la aprobación válida de la cotización.

---

# 10. Casos E2E negativos de la Fase A

| ID | Escenario | Datos | Pasos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| E2E-A-NEG-01 | Solicitud incompleta intenta ingresar al circuito | Solicitud con al menos un dato obligatorio faltante | 1. Intentar registrar la solicitud. 2. Intentar continuar el circuito. | La solicitud incompleta no debe continuar hacia una cotización válida. | Crítica | NOT RUN |
| E2E-A-NEG-02 | Cotización no aprobada | Cotización válida en estado `NO_APROBADA` | 1. Registrar la no aprobación. 2. Consultar las OT. | No debe generarse una OT. | Crítica | NOT RUN |
| E2E-A-NEG-03 | Intentar aprobar una cotización ya procesada | Cotización ya aprobada y OT generada | 1. Consultar la cotización. 2. Intentar aprobarla nuevamente. | El sistema debe impedir una segunda transición no válida. | Alta | NOT RUN |
| E2E-A-NEG-04 | Primera fase sin operario habilitado/correspondiente | Fase sin operario habilitado para su ejecución | 1. Configurar la fase sin un ejecutor habilitado. 2. Intentar completar el circuito hasta la generación de OT. | El sistema no debe asignar incorrectamente la fase a un operario no habilitado. | Crítica | NOT RUN |
| E2E-A-NEG-05 | Verificar posible duplicación de OT después de una aprobación | Cotización válida aprobada | 1. Registrar una aprobación válida. 2. Consultar las OT generadas. 3. Verificar que no exista una segunda OT para la misma aprobación. | Una aprobación válida debe generar una única OT. | Crítica | NOT RUN |

---

# 11. Matriz de trazabilidad — Fase A

| HU | Casos relacionados | E2E | Punto de cierre |
|---|---|---|---|
| HU-1.1 | TC-A-1.1-01 a TC-A-1.1-11 | E2E-A-01 | Solicitud completa registrada |
| HU-5.1 | TC-A-5.1-01 a TC-A-5.1-06 | E2E-A-01 | Fases y operario correctamente configurados |
| HU-2.1 | TC-A-2.1-01 a TC-A-2.1-08 | E2E-A-01 | Cotización armada y disponible |
| HU-1.3 | TC-A-1.3-01 a TC-A-1.3-12 | E2E-A-01 | Aprobación → OT generada |

### Cobertura de casos

| Área | Casos |
|---|---:|
| HU-1.1 | 11 |
| HU-5.1 | 6 |
| HU-2.1 | 8 |
| HU-1.3 | 12 |
| **Total casos por HU** | **37** |
| E2E principal | 1 |
| E2E negativos | 5 |

---

# 12. Estado de ejecución de la Fase A

Los casos se diseñan durante S1/S2.

La ejecución se realizará cuando las funcionalidades estén disponibles y la fase se encuentre en condiciones de validación contra backend real.

| Condición QA | Estado |
|---|---|
| Caso diseñado | `NOT RUN` |
| Funcionalidad no disponible | `NOT RUN` / `BLOCKED` según dependencia |
| Funcionalidad disponible | Ejecutar |
| Resultado correcto | `PASS` |
| Resultado incorrecto | `FAIL` |
| Defecto que impide continuar | `BLOCKED` |

La condición `NOT RUN` representa un caso diseñado que todavía no fue ejecutado.

La condición `BLOCKED` se utilizará cuando exista una dependencia concreta que impida realizar la ejecución.

---

# 13. Criterio de cierre QA — Fase A

QA podrá considerar validado el circuito comercial cuando se pueda demostrar con evidencia que:

- La solicitud se registra completa.
- Los datos obligatorios de la solicitud son validados.
- La cantidad debe ser mayor que 0.
- La solicitud queda registrada con estado `PENDIENTE_COTIZACION`.
- La solicitud puede continuar al circuito de cotización.
- El Jefe puede consultar la solicitud.
- El Jefe puede armar la cotización utilizando el catálogo de fases.
- El Jefe puede definir el orden de las fases.
- Las fases pueden repetirse cuando corresponda.
- Se informa el tiempo estimado de las fases.
- La cotización mantiene un único precio final.
- La cotización puede llegar al Vendedor.
- El Vendedor puede registrar la aprobación.
- La aprobación cambia la cotización al estado `APROBADA`.
- La aprobación genera automáticamente una OT.
- La OT queda asociada correctamente a la cotización aprobada.
- Las fases configuradas están presentes en la OT.
- La primera fase queda en `EN_COLA`.
- La primera fase queda asociada/visible para el operario correcto.
- Una cotización `NO_APROBADA` no genera una OT.
- No se genera una segunda OT a partir de una misma aprobación válida.

El cierre se valida sobre el flujo completo contra backend real, no únicamente sobre la existencia individual de las pantallas o endpoints.

---

# 14. Observaciones QA

La matriz debe actualizarse durante la ejecución sin modificar el diseño original de los casos por el solo hecho de que una implementación todavía no esté disponible.

Las diferencias entre lo definido y lo implementado deberán registrarse como:

- Defecto.
- Bloqueo.
- Riesgo de integración.
- Decisión pendiente.
- Observación QA.

La clasificación se realizará según el caso concreto y sin definir desde QA la solución técnica correspondiente.

La ejecución deberá conservar la trazabilidad entre:

**Caso de prueba → resultado → evidencia → defecto/bloqueo, cuando corresponda.**

---

# 15. Próxima etapa

Una vez cerrado el circuito A:

**Solicitud → Cotización → Aprobación → OT → primera fase en cola**

la matriz continuará con la siguiente fase del cronograma:

**B — Circuito de Producción**

correspondiente a las HU:

- HU-3.1
- HU-3.2
- HU-3.3
- HU-3.4
- HU-2.2

El criterio de cierre será entonces la ejecución de todas las fases de la OT hasta finalización, incluyendo la reasignación.
