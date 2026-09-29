# QualityTrack — QA Testing — Fase A

**Proyecto:** QualityTrack — MVP
**Documento:** Casos de Prueba — Fase A
**Versión:** 1.0
**Estado:** EJECUTADO
**Responsable QA:** María Chiribao
**Referencia:** Cronograma de desarrollo definido por PM
**Base funcional:** PRD V2 + Backlog V2 + Esquema de Base de Datos V2 + Análisis Funcional QA + Decisiones del 25/09 (D-1 a D-6, `docs/funcional/QualityTrack-Cambios-PRD-Backlog.md`)

---

# 1. Objetivo

Documentar los casos de prueba correspondientes a la **Fase A — Circuito comercial** del MVP QualityTrack.

Esta fase comprende el recorrido:

**Solicitud → Cotización → Cotización enviada → Aprobación del Vendedor → OT generada → Primera fase en cola del Operario correcto**

Los casos se encuentran inicialmente en estado:

`NOT RUN`

La ejecución se realizará cuando las funcionalidades correspondientes se encuentren disponibles y en condiciones de ser validadas contra backend real.

> Un caso diseñado no implica que haya sido ejecutado.

---

# 2. Criterio de ejecución QA

QA trabaja sobre el principio:

**Detectar → Analizar → Documentar → Comunicar → Validar**

Estados posibles:

| Estado    | Descripción                                                 |
| --------- | ----------------------------------------------------------- |
| `NOT RUN` | Caso diseñado pero todavía no ejecutado.                    |
| `BLOCKED` | No puede ejecutarse por una dependencia o bloqueo concreto. |
| `PASS`    | Ejecución satisfactoria.                                    |
| `FAIL`    | Ejecución con resultado no esperado.                        |

La condición `NOT RUN` representa el estado inicial de todos los casos de esta documentación.

---

# 3. Cronograma QA — Fase A

## A — Circuito comercial

**Período:** Semana 1 → Semana 2

### Criterio de cierre de la fase

La Fase A cierra cuando una solicitud llega a:

**OT generada**

de punta a punta contra backend real.

El recorrido esperado para QA es:

**Solicitud registrada completa → Cotización → Cotización enviada → Aprobación del Vendedor → OT generada automáticamente → Primera fase en cola del Operario correcto**

---

# 4. Alcance de la Fase A

| Épica                        | User Story | Funcionalidad           | Semana  | Prioridad |
| ---------------------------- | ---------- | ----------------------- | ------- | --------- |
| Épica 1 — Vendedor           | HU-1.1     | Levantar pedido         | S1 → S2 | Crítica   |
| Épica 5 — Gerente            | HU-5.1     | Configuración de fases  | S1 → S2 | Alta      |
| Épica 2 — Jefe de Producción | HU-2.1     | Recepción de cotización | S1 → S2 | Crítica   |
| Épica 1 — Vendedor           | HU-1.3     | Cotizaciones derivadas  | S1 → S2 | Crítica   |

---

# 5. HU-1.1 — Levantar pedido

**Épica:** Épica 1 — Vendedor
**Semana:** S1 → S2
**Objetivo:** Registrar correctamente la solicitud que inicia el circuito comercial.

## Casos de prueba

| ID          | Escenario                                                        | Datos                                                                                                                                            | Pasos                                                                                                                                 | Resultado esperado                                                                                                           | Tipo        | Prioridad | Estado    | Evidencia | Defecto |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- | --------- | --------- | --------- | ------- |
| TC-A-1.1-01 | Registrar una solicitud con todos los datos obligatorios válidos | Cliente nuevo con razón social, CUIT, nombre de contacto, dirección, teléfono y email válidos; descripción de pieza/trabajo válida; cantidad = 1 | 1. Ingresar los datos del cliente.<br>2. Ingresar descripción.<br>3. Informar cantidad.<br>4. Guardar solicitud.                      | La solicitud se registra correctamente con los datos obligatorios informados.                                                | Funcional   | Crítica   | `PASS` | [Evidencia TC-A-1.1-01](../../testing/evidence/img/Fase-a/TC-A-1.1-01.png) | —       |
| TC-A-1.1-02 | Registrar solicitud sin razón social                             | Dirección y teléfono válidos; descripción válida; cantidad = 1; razón social vacía                                                               | 1. Completar los campos restantes.<br>2. Dejar razón social vacía.<br>3. Intentar guardar.                                            | La solicitud no debe registrarse porque la razón social es obligatoria.                                                      | Negativo    | Alta      | `PASS` | [Evidencia TC-A-1.1-02](../../testing/evidence/img/Fase-a/TC-A-1.1-02.png)  | —       |
| TC-A-1.1-03 | Registrar cliente nuevo sin dirección                            | Razón social, CUIT, contacto, teléfono y email válidos; descripción válida; cantidad = 1; dirección vacía                                        | 1. Completar los campos restantes.<br>2. Dejar dirección vacía.<br>3. Intentar guardar.                                               | La solicitud no se registra y el sistema señala que falta la dirección, que es obligatoria.                                  | Negativo    | Media     | `PASS` | [Evidencia TC-A-1.1-03](../../testing/evidence/img/Fase-a/TC-A-1.1-03.png) | —       |
| TC-A-1.1-04 | Registrar cliente nuevo sin teléfono                             | Razón social, CUIT, contacto, dirección y email válidos; descripción válida; cantidad = 1; teléfono vacío                                        | 1. Completar los campos restantes.<br>2. Dejar teléfono vacío.<br>3. Intentar guardar.                                                | La solicitud no se registra y el sistema señala que falta el teléfono, que es obligatorio.                                   | Negativo    | Media     | `PASS` | [Evidencia TC-A-1.1-04](../../testing/evidence/img/Fase-a/TC-A-1.1-04.png) | —       |
| TC-A-1.1-05 | Registrar solicitud sin descripción de pieza/trabajo             | Datos del cliente válidos; descripción vacía; cantidad = 1                                                                                       | 1. Completar los datos del cliente.<br>2. Dejar descripción vacía.<br>3. Informar cantidad.<br>4. Intentar guardar.                   | La solicitud no debe registrarse porque la descripción de pieza/trabajo es obligatoria.                                      | Negativo    | Crítica   | `PASS` | [Evidencia TC-A-1.1-05](../../testing/evidence/img/Fase-a/TC-A-1.1-05.png) | —       |
| TC-A-1.1-06 | Registrar solicitud sin cantidad                                 | Datos del cliente válidos; descripción válida; cantidad no informada                                                                             | 1. Completar los datos obligatorios del cliente.<br>2. Informar descripción.<br>3. No informar cantidad.<br>4. Intentar guardar.      | La solicitud no debe registrarse porque la cantidad es obligatoria.                                                          | Negativo    | Crítica   | `PASS` | [Evidencia TC-A-1.1-06](../../testing/evidence/img/Fase-a/TC-A-1.1-06.png) | —       |
| TC-A-1.1-07 | Registrar solicitud con cantidad igual a 0                       | Datos del cliente válidos; descripción válida; cantidad = 0                                                                                      | 1. Completar los datos obligatorios.<br>2. Informar cantidad = 0.<br>3. Intentar guardar.                                             | La solicitud no debe registrarse porque la cantidad debe ser mayor que 0.                                                    | Negativo    | Alta      | `PASS` | [Evidencia TC-A-1.1-07](../../testing/evidence/img/Fase-a/TC-A-1.1-07.png) | —       |
| TC-A-1.1-08 | Registrar solicitud con cantidad negativa                        | Datos del cliente válidos; descripción válida; cantidad < 0                                                                                      | 1. Completar los datos obligatorios.<br>2. Informar una cantidad negativa.<br>3. Intentar guardar.                                    | La solicitud no debe registrarse porque la cantidad debe ser mayor que 0.                                                    | Negativo    | Alta      | `PASS` | [Evidencia TC-A-1.1-08](../../testing/evidence/img/Fase-a/TC-A-1.1-08.png) | —       |
| TC-A-1.1-09 | Registrar solicitud con cantidad válida mayor que 0              | Datos del cliente válidos; descripción válida; cantidad > 0                                                                                      | 1. Completar los datos obligatorios.<br>2. Informar una cantidad mayor que 0.<br>3. Guardar.                                          | La solicitud se registra correctamente con la cantidad informada.                                                            | Funcional   | Alta      | `PASS` | [Evidencia TC-A-1.1-09](../../testing/evidence/img/Fase-a/TC-A-1.1-09.png) | —       |
| TC-A-1.1-10 | Verificar estado inicial de la solicitud                         | Solicitud creada con todos los datos obligatorios válidos                                                                                        | 1. Registrar la solicitud.<br>2. Consultar su estado.                                                                                 | La solicitud queda registrada con estado `PENDIENTE_COTIZACION`.                                                             | Funcional   | Crítica   | `PASS` | [Evidencia TC-A-1.1-10](../../testing/evidence/img/Fase-a/TC-A-1.1-10.png) | —       |
| TC-A-1.1-11 | Verificar persistencia de los datos registrados                  | Solicitud válida con datos completos                                                                                                             | 1. Registrar solicitud.<br>2. Consultar posteriormente la solicitud.<br>3. Comparar los datos registrados.                            | Los datos registrados permanecen disponibles y consistentes después de la creación.                                          | Integración | Alta      | `PASS` | [Evidencia TC-A-1.1-11](../../testing/evidence/img/Fase-a/TC-A-1.1-11.png) | —       |
| TC-A-1.1-12 | Registrar solicitud con cliente ya registrado                    | `cliente_id` válido correspondiente a un cliente existente; descripción válida; cantidad = 1                                                     | 1. Seleccionar un cliente ya registrado.<br>2. Verificar que se utilice su `cliente_id`.<br>3. Completar la solicitud.<br>4. Guardar. | La solicitud se registra correctamente asociada al cliente existente mediante su `cliente_id`.                               | Integración | Crítica   | `PASS` | [Evidencia TC-A-1.1-12](../../testing/evidence/img/Fase-a/TC-A-1.1-12.png) | —       |
| TC-A-1.1-13 | Registrar solicitud con `cliente_id` inexistente                 | `cliente_id` inexistente; descripción válida; cantidad = 1                                                                                       | 1. Informar un `cliente_id` inexistente.<br>2. Completar los datos restantes.<br>3. Intentar guardar.                                 | La solicitud no debe registrarse y el sistema debe rechazar la referencia a un cliente inexistente.                          | Negativo    | Alta      | `PASS` | [Evidencia TC-A-1.1-13](../../testing/evidence/img/Fase-a/TC-A-1.1-13.png)  | —       |
| TC-A-1.1-14 | Adjuntar documentación válida a la solicitud                     | Archivo de hasta 10 MB, por ejemplo un plano                                                                                                     | 1. Completar la solicitud.<br>2. Adjuntar el plano.<br>3. Guardar.<br>4. Recargar la solicitud.<br>5. Abrir el documento.             | La documentación se adjunta correctamente, sigue disponible al recargar y se puede abrir desde el navegador sin descargarla. | Funcional   | Alta      | `FAIL` | [Evidencia TC-A-1.1-14](../../testing/evidence/img/Fase-a/TC-A-1.1-14.png) | —       |
| TC-A-1.1-15 | Intentar adjuntar un archivo de más de 10 MB                     | Archivo de más de 10 MB                                                                                                                          | 1. Completar la solicitud.<br>2. Intentar adjuntar el archivo.                                                                        | El sistema rechaza el archivo por superar el tamaño máximo y no lo incorpora a la solicitud.                                 | Negativo    | Alta      | `PASS` |  [Evidencia TC-A-1.1-15](../../testing/evidence/img/Fase-a/TC-A-1.1-15.png) | —       |
| TC-A-1.1-16 | Registrar solicitud sin archivo de documentación                 | Solicitud válida; sin archivo adjunto                                                                                                            | 1. Completar la solicitud.<br>2. No adjuntar ningún archivo.<br>3. Guardar.                                                           | La solicitud se registra sin archivo cuando la documentación no es obligatoria en el diseño actual.                          | Funcional   | Media     | `PASS` |  [Evidencia TC-A-1.1-16](../../testing/evidence/img/Fase-a/TC-A-1.1-16.png) | —       |
| TC-A-1.1-17 | Registrar cliente nuevo con un CUIT que ya existe                | CUIT de un cliente ya registrado; resto de los datos válidos                                                                                     | 1. Cargar un cliente nuevo con ese CUIT.<br>2. Completar la solicitud.<br>3. Intentar guardar.                                        | El sistema no registra el cliente e informa que el CUIT ya está registrado.                                                  | Negativo    | Alta      | `PASS` |  [Evidencia TC-A-1.1-17](../../testing/evidence/img/Fase-a/TC-A-1.1-17.png) | —       |
| TC-A-1.1-18 | Registrar cliente nuevo sin email                                | Razón social, CUIT, contacto, dirección y teléfono válidos; email vacío                                                                          | 1. Completar los campos restantes.<br>2. Dejar email vacío.<br>3. Intentar guardar.                                                   | La solicitud no se registra y el sistema señala que falta el email, que es obligatorio.                                      | Negativo    | Alta      | `PASS` |  [Evidencia TC-A-1.1-18](../../testing/evidence/img/Fase-a/TC-A-1.1-18.png) | —       |

### Validación principal

QA debe comprobar que la solicitud quede registrada completa y disponible para continuar el circuito hacia la cotización.

> **Nota PM — D-4:** todos los datos del cliente nuevo son obligatorios: razón social, CUIT, nombre de contacto, dirección, teléfono y email. El CUIT no se repite.

---

# 6. HU-5.1 — Configuración de fases

**Épica:** Épica 5 — Gerente
**Semana:** S1 → S2
**Objetivo:** Disponer del catálogo de fases y de la configuración necesaria para que posteriormente una OT pueda asignar correctamente la primera fase.

## Casos de prueba

| ID          | Escenario                                                                   | Datos                                                                                                        | Pasos                                                                                                                                                                                     | Resultado esperado                                                                                                     | Tipo        | Prioridad | Estado    | Evidencia | Defecto |
| ----------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- | --------- | --------- | --------- | ------- |
| TC-A-5.1-01 | Gerente consulta el catálogo de fases                                       | Usuario con rol Gerente; catálogo disponible                                                                 | 1. Ingresar como Gerente.<br>2. Acceder al catálogo de fases.                                                                                                                             | El Gerente puede consultar el catálogo de fases disponible.                                                            | Funcional   | Alta      | `PASS` | [Evidencia TC-A-5.1-01](../../testing/evidence/img/Fase-a/TC-A-5.1-01.png) | —       |
| TC-A-5.1-02 | Crear una fase con al menos un operario habilitado                          | Usuario Gerente; operarios disponibles                                                                       | 1. Acceder al catálogo.<br>2. Crear una fase.<br>3. Elegir al menos un operario habilitado.<br>4. Guardar.<br>5. Repetir sin elegir ningún operario.                                      | La fase queda registrada con sus operarios. Sin al menos un operario habilitado, el sistema no permite crear la fase.  | Funcional   | Alta      | `PASS` | [Evidencia TC-A-5.1-02](../../testing/evidence/img/Fase-a/TC-A-5.1-02.png) | —       |
| TC-A-5.1-03 | Configurar los operarios habilitados para una fase                          | Fase configurada; operarios disponibles                                                                      | 1. Seleccionar una fase.<br>2. Consultar los operarios disponibles.<br>3. Configurar los operarios habilitados.<br>4. Guardar.<br>5. Intentar deshabilitar al último operario habilitado. | La fase queda asociada a los operarios habilitados definidos. No se puede deshabilitar al último operario de una fase. | Funcional   | Crítica   | `PASS` | [Evidencia TC-A-5.1-03](../../testing/evidence/img/Fase-a/TC-A-5.1-03.png) | —       |
| TC-A-5.1-04 | Verificar que un operario habilitado pueda ser seleccionado para la fase    | Fase configurada; operario habilitado                                                                        | 1. Seleccionar la fase.<br>2. Consultar operarios habilitados.<br>3. Seleccionar el operario habilitado.                                                                                  | El operario habilitado aparece como elegible para ejecutar la fase.                                                    | Integración | Crítica   | `PASS` | [Evidencia TC-A-5.1-04](../../testing/evidence/img/Fase-a/TC-A-5.1-04.png)  | —       |
| TC-A-5.1-05 | Verificar que un operario no habilitado no pueda ejecutar esa fase          | Fase configurada; operario no habilitado                                                                     | 1. Consultar la configuración de la fase.<br>2. Identificar un operario no habilitado.<br>3. Verificar su disponibilidad para la ejecución de la fase.                                    | Un operario no habilitado no debe quedar disponible como ejecutor válido de esa fase.                                  | Negativo    | Alta      | `FAIL` | [Evidencia TC-A-5.1-05](../../testing/evidence/img/Fase-a/TC-A-5.1-05.png) | —       |
| TC-A-5.1-06 | Jefe consulta el catálogo de fases disponible para gestionar una cotización | Usuario Jefe de Producción; catálogo con fases activas con operarios, y alguna fase inactiva o sin operarios | 1. Ingresar como Jefe.<br>2. Acceder a la consulta del catálogo.                                                                                                                          | El Jefe ve solo las fases activas que tienen al menos un operario habilitado; las demás no aparecen.                   | Integración | Crítica   | `PASS` | [Evidencia TC-A-5.1-06](../../testing/evidence/img/Fase-a/TC-A-5.1-06.png) | —       |

### Validación principal

QA debe comprobar que exista una configuración de fases suficiente para que el Jefe pueda recibir y gestionar la cotización y que, posteriormente, la primera fase de la OT pueda quedar asociada al operario correspondiente.

---

# 7. HU-2.1 — Recepción de cotización

**Épica:** Épica 2 — Jefe de Producción
**Semana:** S1 → S2
**Objetivo:** El Jefe recibe la solicitud y configura la cotización con las fases necesarias para la futura OT.

## Casos de prueba

| ID          | Escenario                                                           | Datos                                                                     | Pasos                                                                                                                                                                                                            | Resultado esperado                                                                                                                                              | Tipo             | Prioridad | Estado    | Evidencia | Defecto |
| ----------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------- | --------- | --------- | ------- |
| TC-A-2.1-01 | Jefe consulta una solicitud disponible para cotizar                 | Solicitud en estado `PENDIENTE_COTIZACION`                                | 1. Ingresar como Jefe.<br>2. Consultar solicitudes disponibles.<br>3. Seleccionar la solicitud.                                                                                                                  | La solicitud disponible para cotizar puede ser consultada por el Jefe.                                                                                          | Funcional        | Crítica   | `PASS` | [Evidencia TC-A-2.1-01](../../testing/evidence/img/Fase-a/TC-A-2.1-01.png) | —       |
| TC-A-2.1-02 | Jefe selecciona fases del catálogo                                  | Solicitud disponible; catálogo con fases que tienen operarios habilitados | 1. Abrir la solicitud.<br>2. Consultar catálogo.<br>3. Seleccionar las fases necesarias.                                                                                                                         | Solo se ofrecen fases con operarios habilitados, y las seleccionadas quedan incorporadas a la cotización.                                                       | Funcional        | Crítica   | `PASS` | [Evidencia TC-A-2.1-02](../../testing/evidence/img/Fase-a/TC-A-2.1-02.png) | —       |
| TC-A-2.1-03 | Jefe define el orden de las fases                                   | Solicitud con varias fases seleccionadas                                  | 1. Seleccionar varias fases.<br>2. Definir el orden de ejecución.<br>3. Guardar la cotización.                                                                                                                   | Las fases quedan registradas en el orden definido por el Jefe.                                                                                                  | Funcional        | Alta      | `PASS` | [Evidencia TC-A-2.1-03](../../testing/evidence/img/Fase-a/TC-A-2.1-03.png)  | —       |
| TC-A-2.1-04 | Jefe utiliza una fase repetida cuando corresponde                   | Catálogo con una fase disponible para repetición                          | 1. Seleccionar una fase.<br>2. Incorporar nuevamente la misma fase cuando corresponda.<br>3. Definir el orden.                                                                                                   | La cotización permite que una misma fase aparezca más de una vez cuando corresponde.                                                                            | Regla de negocio | Alta      | `PASS` | [Evidencia TC-A-2.1-04](../../testing/evidence/img/Fase-a/TC-A-2.1-04.png) | —       |
| TC-A-2.1-05 | Jefe informa el tiempo estimado de las fases                        | Fases seleccionadas; tiempos estimados definidos                          | 1. Seleccionar las fases.<br>2. Informar el tiempo estimado de cada fase.<br>3. Guardar.                                                                                                                         | Cada fase queda asociada al tiempo estimado informado.                                                                                                          | Funcional        | Alta      | `PASS` | [Evidencia TC-A-2.1-05](../../testing/evidence/img/Fase-a/TC-A-2.1-05.png) | —       |
| TC-A-2.1-06 | Verificar que la cotización mantenga un único precio final          | Cotización con una o varias fases                                         | 1. Configurar las fases.<br>2. Informar el precio final.<br>3. Guardar la cotización.                                                                                                                            | La cotización mantiene un único precio final y no un precio individual por fase.                                                                                | Regla de negocio | Alta      | `PASS` | [Evidencia TC-A-2.1-06](../../testing/evidence/img/Fase-a/TC-A-2.1-06.png) | —       |
| TC-A-2.1-07 | Generar y enviar la cotización asociada a la solicitud              | Solicitud válida; cotización configurada                                  | 1. Completar la cotización.<br>2. Guardar/generar la cotización.<br>3. Enviar la cotización al circuito correspondiente.                                                                                         | La cotización queda asociada a la solicitud y disponible para el Vendedor.                                                                                      | Integración      | Crítica   | `PASS` | [Evidencia TC-A-2.1-07](../../testing/evidence/img/Fase-a/TC-A-2.1-07.png) | —       |
| TC-A-2.1-08 | Verificar que la solicitud pasa a `COTIZADA` al crear su cotización | Solicitud en estado `PENDIENTE_COTIZACION`, sin cotización                | 1. Ingresar como Jefe.<br>2. Crear la cotización de esa solicitud.<br>3. Consultar `GET /api/solicitudes` como Jefe.<br>4. Consultar `GET /api/solicitudes` como Vendedor.<br>5. Consultar la cotización creada. | La solicitud queda en `COTIZADA`. No figura en el listado del Jefe; sí figura, como "Cotizada", en el del Vendedor. La cotización queda en `LISTA_PARA_ENVIAR`. | Integración      | Crítica   | `PASS` | [Evidencia TC-A-2.1-08](../../testing/evidence/img/Fase-a/TC-A-2.1-08.png) | —       |

### Validación principal

QA debe comprobar que el Jefe pueda construir la cotización utilizando el catálogo de fases y que la información quede disponible para el circuito del Vendedor.

---

# 8. HU-1.3 — Cotizaciones derivadas

**Épica:** Épica 1 — Vendedor
**Semana:** S1 → S2
**Objetivo:** Permitir que el Vendedor consulte la cotización derivada de la solicitud y registre la decisión del cliente.

## Casos de prueba

| ID          | Escenario                                                         | Datos                                                                  | Pasos                                                                                                            | Resultado esperado                                                                                         | Tipo        | Prioridad | Estado    | Evidencia | Defecto |
| ----------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | --------- | --------- | --------- | ------- |
| TC-A-1.3-01 | Vendedor consulta una cotización derivada de una solicitud        | Solicitud con cotización disponible                                    | 1. Ingresar como Vendedor.<br>2. Consultar cotizaciones disponibles.<br>3. Seleccionar una cotización.           | El Vendedor puede consultar la cotización derivada de la solicitud.                                        | Funcional   | Crítica   | `PASS` | [Evidencia TC-A-1.3-01](../../testing/evidence/img/Fase-a/TC-A-1.3-01.png) | —       |
| TC-A-1.3-02 | Vendedor visualiza correctamente los datos de la cotización       | Cotización con datos completos                                         | 1. Abrir la cotización.<br>2. Revisar cliente, solicitud, fases, tiempos y precio final.                         | La información de la cotización se muestra de forma consistente con los datos registrados.                 | Funcional   | Alta      | `PASS` | [Evidencia TC-A-1.3-02](../../testing/evidence/img/Fase-a/TC-A-1.3-02.png) | —       |
| TC-A-1.3-03 | Vendedor registra aprobación de una cotización válida             | Cotización válida disponible para decisión                             | 1. Abrir la cotización.<br>2. Seleccionar aprobación.<br>3. Confirmar la acción.                                 | La aprobación queda registrada correctamente.                                                              | Funcional   | Crítica   | `PASS` | [Evidencia TC-A-1.3-03](../../testing/evidence/img/Fase-a/TC-A-1.3-03.png) | —       |
| TC-A-1.3-04 | Verificar cambio a estado `APROBADA`                              | Cotización aprobada                                                    | 1. Registrar aprobación.<br>2. Consultar el estado de la cotización.                                             | La cotización queda en estado `APROBADA`.                                                                  | Integración | Crítica   | `PASS` | [Evidencia TC-A-1.3-04](../../testing/evidence/img/Fase-a/TC-A-1.3-04.png) | —       |
| TC-A-1.3-05 | Verificar generación automática de OT después de la aprobación    | Cotización en estado `APROBADA`                                        | 1. Aprobar la cotización.<br>2. Consultar las órdenes de trabajo generadas.                                      | Se genera automáticamente una OT asociada a la cotización aprobada.                                        | E2E         | Crítica   | `PASS` | [Evidencia TC-A-1.3-05](../../testing/evidence/img/Fase-a/TC-A-1.3-05.png) | —       |
| TC-A-1.3-06 | Verificar que la OT quede asociada a la cotización aprobada       | Cotización aprobada; OT generada                                       | 1. Aprobar la cotización.<br>2. Consultar la OT.<br>3. Verificar su relación con la cotización.                  | La OT queda correctamente asociada a la cotización aprobada.                                               | Integración | Crítica   | `PASS` | [Evidencia TC-A-1.3-06](../../testing/evidence/img/Fase-a/TC-A-1.3-06.png) | —       |
| TC-A-1.3-07 | Verificar que la primera fase de la OT quede en `EN_COLA`         | OT generada con fases configuradas                                     | 1. Aprobar la cotización.<br>2. Consultar las fases de la OT.                                                    | La primera fase queda en estado `EN_COLA`.                                                                 | E2E         | Crítica   | `PASS` | [Evidencia TC-A-1.3-07](../../testing/evidence/img/Fase-a/TC-A-1.3-07.png) | —       |
| TC-A-1.3-08 | Verificar que la primera fase quede asociada al operario correcto | OT generada; fase con operario habilitado                              | 1. Aprobar la cotización.<br>2. Consultar la primera fase.<br>3. Verificar el operario asociado.                 | La primera fase queda visible/asociada al operario habilitado correspondiente.                             | E2E         | Crítica   | `PASS` | [Evidencia TC-A-1.3-08](../../testing/evidence/img/Fase-a/TC-A-1.3-08.png) | —       |
| TC-A-1.3-09 | Vendedor registra cotización no aprobada                          | Cotización disponible para decisión                                    | 1. Abrir la cotización.<br>2. Seleccionar no aprobación.<br>3. Confirmar la acción.                              | La decisión de no aprobación queda registrada.                                                             | Funcional   | Alta      | `PASS` | [Evidencia TC-A-1.3-09](../../testing/evidence/img/Fase-a/TC-A-1.3-09.png) | —       |
| TC-A-1.3-10 | Verificar estado `NO_APROBADA`                                    | Cotización no aprobada                                                 | 1. Registrar la no aprobación.<br>2. Consultar el estado.                                                        | La cotización queda en estado `NO_APROBADA`.                                                               | Integración | Alta      | `PASS` | [Evidencia TC-A-1.3-10](../../testing/evidence/img/Fase-a/TC-A-1.3-10.png) | —       |
| TC-A-1.3-11 | Verificar que una cotización no aprobada no genere OT             | Cotización en estado `NO_APROBADA`                                     | 1. Registrar la no aprobación.<br>2. Consultar las OT asociadas.                                                 | No debe generarse una OT a partir de una cotización no aprobada.                                           | Negativo    | Crítica   | `PASS` | [Evidencia TC-A-1.3-11](../../testing/evidence/img/Fase-a/TC-A-1.3-11.png) | —       |
| TC-A-1.3-12 | Intentar procesar nuevamente una cotización ya aprobada           | Cotización en estado `APROBADA`; OT ya generada                        | 1. Consultar una cotización ya aprobada.<br>2. Intentar procesarla nuevamente.                                   | El sistema no debe permitir una segunda transición no válida ni generar una OT duplicada.                  | Negativo    | Alta      | `PASS` | [Evidencia TC-A-1.3-12](../../testing/evidence/img/Fase-a/TC-A-1.3-12.png) | —       |
| TC-A-1.3-13 | Vendedor marca la cotización como enviada al cliente              | Cotización generada y disponible para el Vendedor                      | 1. Abrir la cotización.<br>2. Marcarla como enviada al cliente.<br>3. Confirmar la acción.                       | La cotización queda en estado `ENVIADA_A_CLIENTE`.                                                         | Funcional   | Crítica   | `PASS` | [Evidencia TC-A-1.3-13](../../testing/evidence/img/Fase-a/TC-A-1.3-13.png) | —       |
| TC-A-1.3-14 | Registrar una decisión antes de `ENVIADA_A_CLIENTE`               | Cotización generada que todavía no fue marcada como enviada al cliente | 1. Abrir una cotización que no está en `ENVIADA_A_CLIENTE`.<br>2. Intentar registrar aprobación o no aprobación. | La UI y el flujo no permiten registrar una decisión antes de que la cotización pase a `ENVIADA_A_CLIENTE`. | Negativo    | Alta      | `PASS` | [Evidencia TC-A-1.3-14](../../testing/evidence/img/Fase-a/TC-A-1.3-14.png) | —       |

---

# 9. Caso E2E principal de la Fase A

## E2E-A-01 — Solicitud → OT generada

**Prioridad:** Crítica
**Tipo:** E2E / Integración
**Semana:** S2
**Estado:** `PASS`

Este caso representa el criterio principal de cierre definido para la Fase A.

### Precondiciones

* Backend real disponible.
* Usuario Vendedor disponible.
* Usuario Jefe de Producción disponible.
* Usuario Gerente disponible.
* Catálogo de fases configurado.
* Al menos un operario habilitado en cada fase correspondiente.
* Operario habilitado para la primera fase.
* Datos de prueba disponibles.

### Datos de prueba

* Razón Social válida.
* CUIT válido y no registrado previamente.
* Nombre de contacto válido.
* Dirección válida.
* Teléfono válido.
* Email válido.
* Descripción de pieza/trabajo válida.
* Cantidad mayor que 0.
* Fases existentes en el catálogo.
* Operario habilitado para ejecutar la primera fase.
* Tiempo estimado definido para las fases.
* Precio final de cotización definido.

### Flujo

1. Vendedor registra una solicitud completa.
2. QA verifica la persistencia de la solicitud.
3. Jefe de Producción consulta la solicitud.
4. Jefe selecciona las fases correspondientes.
5. Jefe define el orden de las fases.
6. Jefe informa los tiempos estimados.
7. Jefe genera la cotización.
8. Vendedor marca la cotización como enviada al cliente.
9. Vendedor consulta la cotización derivada.
10. Vendedor registra la aprobación.
11. QA verifica que la cotización pase a `APROBADA`.
12. QA verifica que se genere automáticamente la OT.
13. QA verifica que la OT quede asociada a la cotización.
14. QA verifica las fases configuradas en la OT.
15. QA verifica que la primera fase quede en `EN_COLA`.
16. QA verifica que la primera fase quede visible para el operario correcto.

### Resultado esperado

La solicitud completa debe recorrer el circuito comercial y finalizar con:

**Solicitud → Cotización → `ENVIADA_A_CLIENTE` → `APROBADA` → OT generada → Primera fase en cola del operario correcto.**

La OT debe generarse automáticamente como consecuencia de la aprobación válida de la cotización.

---

# 10. Casos E2E negativos de la Fase A

| ID           | Escenario                                                     | Datos                                               | Pasos                                                                                                                                        | Resultado esperado                                                     | Tipo | Prioridad | Estado    | Evidencia | Defecto |
| ------------ | ------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---- | --------- | --------- | --------- | ------- |
| E2E-A-NEG-01 | Solicitud incompleta intenta ingresar al circuito             | Solicitud con al menos un dato obligatorio faltante | 1. Intentar registrar la solicitud.<br>2. Intentar continuar el circuito.                                                                    | La solicitud incompleta no debe continuar hacia una cotización válida. | E2E  | Crítica   | `PASS` | —         | —       |
| E2E-A-NEG-02 | Cotización no aprobada                                        | Cotización válida en estado `NO_APROBADA`           | 1. Registrar la no aprobación.<br>2. Consultar las OT.                                                                                       | No debe generarse una OT.                                              | E2E  | Crítica   | `PASS` | —         | —       |
| E2E-A-NEG-03 | Intentar aprobar una cotización ya procesada                  | Cotización ya aprobada y OT generada                | 1. Consultar la cotización.<br>2. Intentar aprobarla nuevamente.                                                                             | El sistema debe impedir una segunda transición no válida.              | E2E  | Alta      | `PASS` | —         | —       |
| E2E-A-NEG-05 | Verificar posible duplicación de OT después de una aprobación | Cotización válida aprobada                          | 1. Registrar una aprobación válida.<br>2. Consultar las OT generadas.<br>3. Verificar que no exista una segunda OT para la misma aprobación. | Una aprobación válida debe generar una única OT.                       | E2E  | Crítica   | `PASS` | —         | —       |

> **E2E-A-NEG-04 eliminado — D-5:** el escenario "primera fase sin operario habilitado" ya no es posible, porque una fase no se puede crear sin operarios ni quedarse sin el último. La validación queda cubierta por la variante negativa de `TC-A-5.1-02` y por `TC-A-5.1-03`. El ID no se reutiliza.

---

# 11. Matriz de trazabilidad — Fase A

| HU     | Casos relacionados        | E2E      | Punto de cierre                             |
| ------ | ------------------------- | -------- | ------------------------------------------- |
| HU-1.1 | TC-A-1.1-01 a TC-A-1.1-18 | E2E-A-01 | Solicitud completa registrada               |
| HU-5.1 | TC-A-5.1-01 a TC-A-5.1-06 | E2E-A-01 | Fases y operario correctamente configurados |
| HU-2.1 | TC-A-2.1-01 a TC-A-2.1-08 | E2E-A-01 | Cotización armada y disponible              |
| HU-1.3 | TC-A-1.3-01 a TC-A-1.3-14 | E2E-A-01 | Aprobación → OT generada                    |

## Cobertura

| Área                   |  Casos |
| ---------------------- | -----: |
| HU-1.1                 |     18 |
| HU-5.1                 |      6 |
| HU-2.1                 |      8 |
| HU-1.3                 |     14 |
| **Total casos por HU** | **46** |
| E2E principal          |      1 |
| E2E negativos          |      4 |
| **Total Fase A**       | **51** |

---

# 12. Estado inicial de ejecución

Todos los casos de esta documentación se encuentran inicialmente en:

**`NOT RUN`**

| Condición QA                             | Estado    |
| ---------------------------------------- | --------- |
| Caso diseñado                            | `NOT RUN` |
| Funcionalidad no disponible              | `NOT RUN` |
| Dependencia concreta que impide ejecutar | `BLOCKED` |
| Resultado correcto                       | `PASS`    |
| Resultado incorrecto                     | `FAIL`    |

La ejecución deberá realizarse sobre la funcionalidad realmente disponible.

Los resultados no deben anticiparse ni completarse por planificación.

---

# 13. Criterio de cierre QA — Fase A

QA podrá considerar validado el circuito comercial cuando se pueda demostrar con evidencia que:

* La solicitud se registra completa.
* Los datos obligatorios de la solicitud son validados.
* Los datos del cliente nuevo son todos obligatorios.
* El CUIT no se repite.
* Los adjuntos de hasta 10 MB quedan guardados y se pueden abrir.
* Los archivos de más de 10 MB son rechazados.
* La cantidad debe ser mayor que 0.
* La solicitud queda registrada con estado `PENDIENTE_COTIZACION`.
* La solicitud puede continuar al circuito de cotización.
* El Jefe puede consultar la solicitud.
* El Jefe puede gestionar la cotización utilizando el catálogo de fases.
* El Jefe solo puede seleccionar fases con operarios habilitados.
* El Jefe puede definir el orden de las fases.
* Las fases pueden repetirse cuando corresponda.
* Se informa el tiempo estimado de las fases.
* La cotización mantiene un único precio final.
* La cotización llega al Vendedor.
* El Vendedor puede marcar la cotización como `ENVIADA_A_CLIENTE`.
* El Vendedor puede registrar la aprobación.
* La aprobación cambia la cotización al estado `APROBADA`.
* La aprobación genera automáticamente una OT.
* La OT queda asociada correctamente a la cotización aprobada.
* Las fases configuradas están presentes en la OT.
* La primera fase queda en `EN_COLA`.
* La primera fase queda asociada/visible para el operario correspondiente.
* Una cotización `NO_APROBADA` no genera una OT.
* No se genera una segunda OT a partir de una misma aprobación válida.

El cierre se valida sobre el flujo completo contra backend real, no únicamente sobre la existencia individual de las pantallas o endpoints.

---

# 14. Observaciones QA

La matriz deberá actualizarse durante la ejecución sin modificar el diseño original de los casos por el solo hecho de que una implementación todavía no esté disponible.

Las diferencias entre lo definido y lo implementado deberán registrarse como:

* Defecto.
* Bloqueo.
* Riesgo de integración.
* Decisión pendiente.
* Observación QA.

La clasificación se realizará según el caso concreto y sin definir desde QA la solución técnica correspondiente.

La ejecución deberá conservar la trazabilidad:

**Caso de prueba → Resultado → Evidencia → Defecto/Bloqueo → Issue/PR, cuando corresponda.**

---

# 15. Próxima etapa

Una vez cerrado el circuito A:

**Solicitud → Cotización → Aprobación → OT → Primera fase en cola**

la matriz continuará con:

**B — Circuito de Producción**

correspondiente a:

* HU-3.1
* HU-3.2
* HU-3.3
* HU-3.4
* HU-2.2

El criterio de cierre de la siguiente etapa será definido conforme al cronograma y a la disponibilidad real de las funcionalidades.

---

# 16. Historial de correcciones de la matriz

## 16.1 Correcciones PM incorporadas — versión anterior

Las siguientes modificaciones corresponden a una versión anterior de la matriz y se conservan como antecedente histórico:

1. **TC-A-1.1-02:** se reemplazó "sin nombre del cliente" por **"sin razón social"**, diferenciando ambos campos.
2. **TC-A-1.1-03 y TC-A-1.1-04:** una versión anterior consideraba dirección y teléfono como opcionales.
3. **HU-1.3:** se incorporaron los casos relacionados con `ENVIADA_A_CLIENTE`.
4. **HU-1.1:** se incorporaron los casos relacionados con cliente existente mediante `cliente_id` válido e inexistente.
5. **HU-1.1:** se incorporaron los casos relacionados con documentación.
6. **HU-2.1:** se actualizó el nombre de sección a **"Recepción de cotización"**.
7. **HU-5.1:** se eliminó una nota anterior relacionada con el filtrado de operarios.

> La consideración anterior de dirección y teléfono como opcionales queda **reemplazada por la decisión D-4 del 25/09/26**, que establece como obligatorios los datos del cliente nuevo.

---

## 16.2 Correcciones PM incorporadas — 25/09/26

Las decisiones D-4, D-5 y D-6 modifican el comportamiento esperado de algunos casos de la Fase A. D-1, D-2 y D-3 impactan principalmente en las Fases B y C.

| Caso         | Acción     | Cambio                                                                             | Referencia |
| ------------ | ---------- | ---------------------------------------------------------------------------------- | ---------- |
| TC-A-1.1-01  | Modificado | Los datos del cliente nuevo incluyen CUIT, contacto y email, todos obligatorios.   | D-4        |
| TC-A-1.1-03  | Modificado | Sin dirección, la solicitud no se registra.                                        | D-4        |
| TC-A-1.1-04  | Modificado | Sin teléfono, la solicitud no se registra.                                         | D-4        |
| TC-A-1.1-14  | Modificado | El adjunto sigue disponible al recargar y se abre desde el navegador.              | D-6        |
| TC-A-1.1-15  | Modificado | El criterio pasa a ser archivo de más de 10 MB.                                    | D-6        |
| TC-A-1.1-17  | Nuevo      | Cliente nuevo con un CUIT que ya existe.                                           | D-4        |
| TC-A-1.1-18  | Nuevo      | Cliente nuevo sin email.                                                           | D-4        |
| TC-A-5.1-02  | Modificado | Una fase requiere al menos un operario habilitado; se incluye variante negativa.   | D-5        |
| TC-A-5.1-03  | Modificado | No se puede deshabilitar al último operario de una fase.                           | D-5        |
| TC-A-5.1-06  | Modificado | El Jefe ve solo fases activas con operarios habilitados.                           | D-5        |
| TC-A-2.1-02  | Modificado | Solo se ofrecen fases con operarios habilitados.                                   | D-5        |
| E2E-A-NEG-04 | Eliminado  | El escenario dejó de ser posible.                                                  | D-5        |
| TC-A-2.1-08  | Modificado | Se verifica la transición de la solicitud a `COTIZADA` y su visibilidad según rol. | #156       |

### Cobertura resultante

**51 casos en Fase A:**

* 46 casos por HU.
* 1 E2E principal.
* 4 E2E negativos.

**E2E-A-NEG-04 no se reutiliza.**

---

# 17. Trazabilidad documental

La ejecución y las actualizaciones de esta fase deberán mantener relación con:

* PRD V2.
* Backlog V2.
* Esquema de Base de Datos V2.
* Análisis Funcional QA.
* Decisiones D-1 a D-6.
* Issues de defectos correspondientes.
* Pull Requests relacionados con modificaciones funcionales o correcciones.
* Evidencias almacenadas en `qa-analyst/testing/evidence/img/fase-a/`.

La matriz debe permitir reconstruir la evolución de cada caso desde su diseño hasta su ejecución y, cuando corresponda, su relación con defectos, decisiones y Pull Requests.
