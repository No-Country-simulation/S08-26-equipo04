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

Diseñar y organizar los casos de prueba del MVP QualityTrack de acuerdo con
las fases definidas en el cronograma de desarrollo.

La matriz permite mantener trazabilidad entre:

**Épica → User Story → Criterio de aceptación → Caso de prueba → Ejecución → Evidencia → Defecto**

La ejecución de los casos queda condicionada a la disponibilidad real de la
funcionalidad y al cierre de cada fase del cronograma.

Un caso diseñado no implica que haya sido ejecutado.

---

# 2. Criterio de ejecución QA

QA trabaja sobre el principio:

**Detectar → Analizar → Documentar → Comunicar → Validar**

La planificación de casos se realiza previamente, pero la ejecución depende de
que la funcionalidad correspondiente se encuentre disponible y en condiciones
de ser validada.

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

**Solicitud registrada completa**
→ **Cotización**
→ **Cotización enviada**
→ **Aprobación del Vendedor**
→ **OT generada automáticamente**
→ **Primera fase en cola del Operario correcto**

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
**Objetivo:** Registrar correctamente la solicitud que inicia el circuito
comercial.

## Casos de prueba

| ID | Escenario | Tipo | Prioridad | Estado |
|---|---|---|---|---|
| TC-A-1.1-01 | Registrar una solicitud con todos los datos obligatorios válidos | Funcional | Crítica | NOT RUN |
| TC-A-1.1-02 | Registrar solicitud sin nombre del cliente | Negativo | Alta | NOT RUN |
| TC-A-1.1-03 | Registrar solicitud sin dirección del cliente | Negativo | Alta | NOT RUN |
| TC-A-1.1-04 | Registrar solicitud sin teléfono del cliente | Negativo | Alta | NOT RUN |
| TC-A-1.1-05 | Registrar solicitud sin descripción de pieza/trabajo | Negativo | Crítica | NOT RUN |
| TC-A-1.1-06 | Registrar solicitud sin cantidad | Negativo | Crítica | NOT RUN |
| TC-A-1.1-07 | Registrar solicitud con cantidad igual a 0 | Negativo | Alta | NOT RUN |
| TC-A-1.1-08 | Registrar solicitud con cantidad negativa | Negativo | Alta | NOT RUN |
| TC-A-1.1-09 | Registrar solicitud con cantidad válida mayor que 0 | Funcional | Alta | NOT RUN |
| TC-A-1.1-10 | Verificar que la solicitud quede registrada con estado `PENDIENTE_COTIZACION` | Funcional | Crítica | NOT RUN |
| TC-A-1.1-11 | Verificar persistencia de los datos registrados | Integración | Alta | NOT RUN |

### Validación principal

QA debe comprobar que la solicitud quede registrada completa y disponible
para continuar el circuito hacia la cotización.

---

# 6. HU-5.1 — Configuración de fases

**Épica:** Épica 5 — Gerente  
**Semana:** S1 → S2  
**Objetivo:** Disponer del catálogo de fases y de la configuración necesaria
para que posteriormente una OT pueda asignar correctamente la primera fase.

## Casos de prueba

| ID | Escenario | Tipo | Prioridad | Estado |
|---|---|---|---|---|
| TC-A-5.1-01 | Gerente consulta el catálogo de fases | Funcional | Alta | NOT RUN |
| TC-A-5.1-02 | Configurar una fase del catálogo | Funcional | Alta | NOT RUN |
| TC-A-5.1-03 | Configurar el/los operarios habilitados para una fase | Funcional | Crítica | NOT RUN |
| TC-A-5.1-04 | Verificar que un operario habilitado pueda ser seleccionado para la fase | Integración | Crítica | NOT RUN |
| TC-A-5.1-05 | Verificar que un operario no habilitado no pueda ejecutar esa fase | Negativo | Alta | NOT RUN |
| TC-A-5.1-06 | Jefe consulta el catálogo de fases disponible para armar una cotización | Integración | Crítica | NOT RUN |

### Validación principal

QA debe comprobar que exista una configuración de fases suficiente para que
el Jefe pueda armar la cotización y que, posteriormente, la primera fase de la
OT pueda quedar asociada al operario correspondiente.

### Dependencia identificada

La PM indica:

- Backend: catálogo de fases `#37` cargada.
- Backend: listado de operarios `#39` cargada.
- Existe un `GET /api/usuarios` genérico.
- Queda pendiente el filtrado específico de operarios.

Por lo tanto, los casos que dependan de esa diferenciación deben permanecer
`NOT RUN` o pasar a `BLOCKED` según el estado real de la implementación al
momento de ejecutar.

---

# 7. HU-2.1 — Arma cotización

**Épica:** Épica 2 — Jefe de Producción  
**Semana:** S1 → S2  
**Objetivo:** El Jefe recibe la solicitud y configura la cotización con las
fases necesarias para la futura OT.

## Casos de prueba

| ID | Escenario | Tipo | Prioridad | Estado |
|---|---|---|---|---|
| TC-A-2.1-01 | Jefe consulta una solicitud disponible para cotizar | Funcional | Crítica | NOT RUN |
| TC-A-2.1-02 | Jefe selecciona fases del catálogo | Funcional | Crítica | NOT RUN |
| TC-A-2.1-03 | Jefe define el orden de las fases | Funcional | Alta | NOT RUN |
| TC-A-2.1-04 | Jefe utiliza una fase repetida cuando corresponde | Regla de negocio | Alta | NOT RUN |
| TC-A-2.1-05 | Jefe informa el tiempo estimado de las fases | Funcional | Alta | NOT RUN |
| TC-A-2.1-06 | Verificar que la cotización mantenga un único precio final | Regla de negocio | Alta | NOT RUN |
| TC-A-2.1-07 | Generar/enviar la cotización asociada a la solicitud | Integración | Crítica | NOT RUN |
| TC-A-2.1-08 | Verificar cambio de estado de la solicitud/cotización según el flujo definido | Integración | Crítica | NOT RUN |

### Validación principal

QA debe comprobar que el Jefe pueda construir la cotización utilizando el
catálogo de fases y que la información quede disponible para el circuito del
Vendedor.

---

# 8. HU-1.3 — Cotizaciones derivadas

**Épica:** Épica 1 — Vendedor  
**Semana:** S1 → S2  
**Objetivo:** Permitir que el Vendedor consulte la cotización derivada de la
solicitud y registre la decisión del cliente.

## Casos de prueba

| ID | Escenario | Tipo | Prioridad | Estado |
|---|---|---|---|---|
| TC-A-1.3-01 | Vendedor consulta una cotización derivada de una solicitud | Funcional | Crítica | NOT RUN |
| TC-A-1.3-02 | Vendedor visualiza correctamente los datos de la cotización | Funcional | Alta | NOT RUN |
| TC-A-1.3-03 | Vendedor registra aprobación de una cotización válida | Funcional | Crítica | NOT RUN |
| TC-A-1.3-04 | Verificar cambio a estado `APROBADA` | Integración | Crítica | NOT RUN |
| TC-A-1.3-05 | Verificar generación automática de OT después de la aprobación | E2E | Crítica | NOT RUN |
| TC-A-1.3-06 | Verificar que la OT quede asociada a la cotización aprobada | Integración | Crítica | NOT RUN |
| TC-A-1.3-07 | Verificar que la primera fase de la OT quede en `EN_COLA` | E2E | Crítica | NOT RUN |
| TC-A-1.3-08 | Verificar que la primera fase quede asociada al operario correcto | E2E | Crítica | NOT RUN |
| TC-A-1.3-09 | Vendedor registra cotización no aprobada | Funcional | Alta | NOT RUN |
| TC-A-1.3-10 | Verificar estado `NO_APROBADA` | Integración | Alta | NOT RUN |
| TC-A-1.3-11 | Verificar que una cotización no aprobada no genere OT | Negativo | Crítica | NOT RUN |
| TC-A-1.3-12 | Intentar procesar nuevamente una cotización ya aprobada | Negativo | Alta | NOT RUN |

---

# 9. Caso E2E principal de la Fase A

Este es el caso más importante de esta etapa porque representa exactamente el
criterio de cierre establecido por la PM.

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

**Solicitud → Cotización → Aprobación → OT generada → Primera fase en cola del
operario correcto.**

---

# 10. Casos E2E negativos de la Fase A

| ID | Escenario | Prioridad | Resultado esperado |
|---|---|---|---|
| E2E-A-NEG-01 | Solicitud incompleta intenta ingresar al circuito | Crítica | No debe continuar hacia una cotización válida. |
| E2E-A-NEG-02 | Cotización no aprobada | Crítica | No debe generarse una OT. |
| E2E-A-NEG-03 | Intentar aprobar una cotización ya procesada | Alta | El sistema debe impedir una segunda transición no válida. |
| E2E-A-NEG-04 | Primera fase sin operario habilitado/correspondiente | Crítica | El sistema no debe asignar incorrectamente la fase a un operario no habilitado. |
| E2E-A-NEG-05 | Verificar posible duplicación de OT después de una aprobación | Crítica | Una aprobación válida debe generar una única OT. |

---

# 11. Matriz de trazabilidad — Fase A

| HU | Casos relacionados | E2E | Punto de cierre |
|---|---|---|---|
| HU-1.1 | TC-A-1.1-01 a TC-A-1.1-11 | E2E-A-01 | Solicitud completa registrada |
| HU-5.1 | TC-A-5.1-01 a TC-A-5.1-06 | E2E-A-01 | Fases y operario correctamente configurados |
| HU-2.1 | TC-A-2.1-01 a TC-A-2.1-08 | E2E-A-01 | Cotización armada y disponible |
| HU-1.3 | TC-A-1.3-01 a TC-A-1.3-12 | E2E-A-01 | Aprobación → OT generada |

---

# 12. Estado de ejecución de la Fase A

Los casos se diseñan durante S1/S2.

La ejecución se realizará cuando las funcionalidades estén disponibles y la
fase se encuentre en condiciones de validación contra backend real.

| Condición | QA |
|---|---|
| Caso diseñado | `NOT RUN` |
| Funcionalidad no disponible | `NOT RUN` / `BLOCKED` según dependencia |
| Funcionalidad disponible | Ejecutar |
| Resultado correcto | `PASS` |
| Resultado incorrecto | `FAIL` |
| Defecto que impide continuar | `BLOCKED` |

---

# 13. Criterio de cierre QA — Fase A

QA podrá considerar validado el circuito comercial cuando se pueda demostrar
con evidencia que:

- La solicitud se registra completa.
- La solicitud puede continuar al circuito de cotización.
- El Jefe puede armar la cotización.
- La cotización puede llegar al Vendedor.
- El Vendedor puede registrar la aprobación.
- La aprobación cambia al estado correspondiente.
- La aprobación genera automáticamente una OT.
- La OT queda asociada correctamente.
- Las fases configuradas están presentes en la OT.
- La primera fase queda en cola.
- La primera fase queda asociada al operario correcto.
- No se genera una OT cuando la cotización no es aprobada.

El cierre se valida sobre el flujo completo contra backend real, no únicamente
sobre la existencia individual de las pantallas o endpoints.

---

# 14. Observaciones QA

La matriz debe actualizarse durante la ejecución sin modificar el diseño
original de los casos por el solo hecho de que una implementación todavía no
esté disponible.

Las diferencias entre lo definido y lo implementado deberán registrarse como:

- Defecto.
- Bloqueo.
- Riesgo de integración.
- Decisión pendiente.
- Observación QA.

La clasificación se realizará según el caso concreto y sin definir desde QA
la solución técnica correspondiente.

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

El criterio de cierre será entonces la ejecución de todas las fases de la OT
hasta finalización, incluyendo la reasignación.
