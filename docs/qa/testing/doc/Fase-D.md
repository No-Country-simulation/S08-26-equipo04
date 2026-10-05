# QualityTrack — QA Testing — Fase D

**Versión:** 1.0
**Estado:**Ejecutado — `PASS`
**Responsable QA:** María Chiribao
**Proyecto:** QualityTrack — S08-26-equipo04
**Rama de trabajo:** `doc/qa/testing/Fase-D`
**Base funcional:** PRD v2 + Backlog v2 + Análisis Funcional QA + decisiones D-1 a D-6
**Evidencia:** `docs/qa/testing/evidence/img/Fase-d/`

---

## 1. Objetivo

Diseñar y documentar los casos de prueba correspondientes a la **Fase D del MVP**, orientados a validar las funcionalidades de visibilidad global y consulta de información para los roles definidos en el sistema.

La ejecución de esta fase se realizará sobre la implementación disponible en `develop`.

Los casos se mantienen inicialmente en estado:

`NOT RUN`

La ejecución real deberá registrar:

* resultado;
* evidencia;
* defecto asociado, cuando corresponda;
* PR relacionado, cuando corresponda;
* observaciones funcionales.

---

# 2. Alcance de la Fase D

La Fase D contempla:

* **HU-1.2 — Buscar órdenes / expediente completo**
* **HU-5.3 — Vista global de planta**
* **HU-5.4 — Vista global de Calidad**
* Validación E2E de las funcionalidades de consulta y visibilidad global.
* Validación de consistencia entre la información registrada durante producción y la información presentada en las vistas globales.

---

# 3. Criterios funcionales considerados

## 3.1 HU-1.2 — Buscar órdenes / expediente completo

El usuario autorizado debe poder buscar órdenes y consultar el expediente correspondiente.

La información presentada debe permitir reconstruir el estado de la orden y consultar la información registrada durante su recorrido.

La consulta debe mantener coherencia con los datos registrados previamente en:

* Solicitud;
* Cliente;
* Cotización;
* Orden de Trabajo;
* Fases;
* Operarios;
* Producción;
* Calidad;
* Despacho;
* Entrega;
* Observaciones;
* Notas;
* Adjuntos;
* Estados.

---

## 3.2 HU-5.3 — Vista global de planta

La vista global de planta debe permitir consultar el estado general de las órdenes/fases de producción.

Según el alcance definido para el MVP, esta vista **no debe utilizarse como indicador de rendimiento individual de operadores**.

La información debe reflejar el estado real de producción.

---

## 3.3 HU-5.4 — Vista global de Calidad

La vista global de Calidad debe permitir consultar información consolidada relacionada con:

* porcentaje de órdenes conformes;
* porcentaje de órdenes no conformes;
* reprocesos por fase;
* auditorías recientes;
* tiempo promedio de Calidad.

El tiempo promedio de Calidad se considera desde la finalización de la última fase de producción hasta el veredicto de Calidad.

---

# 4. Estados de ejecución

| Estado    | Significado                                       |
| --------- | ------------------------------------------------- |
| `NOT RUN` | Caso diseñado pero todavía no ejecutado           |
| `PASS`    | Resultado esperado verificado                     |
| `FAIL`    | Resultado observado diferente al esperado         |
| `BLOCKED` | No puede ejecutarse por una dependencia o bloqueo |

**Estado inicial de todos los casos:** `NOT RUN`.

---

# 5. HU-1.2 — Buscar órdenes / expediente completo

## TC-D-1.2-01 — Acceso a búsqueda de órdenes

**Estado:** `PASS`

### Precondiciones

* Usuario autenticado con permisos para consultar órdenes.
* Existencia de al menos una orden registrada.

### Pasos

1. Ingresar al sistema.
2. Acceder a la funcionalidad de búsqueda de órdenes.
3. Visualizar la pantalla correspondiente.

### Resultado esperado

La funcionalidad de búsqueda se encuentra disponible para el usuario autorizado.

**Evidencia:** [Evidencia TC-D-1.2-01](../../testing/evidence/img/Fase-d/TC-D-1.2-01.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-1.2-02 — Buscar orden existente

**Estado:** `PASS`

### Precondiciones

* Existe una OT conocida.

### Pasos

1. Ingresar un dato válido de búsqueda.
2. Ejecutar la búsqueda.
3. Seleccionar la orden encontrada.

### Resultado esperado

El sistema encuentra la orden correspondiente y permite acceder a su información.

**Evidencia:** [Evidencia TC-D-1.2-02](../../testing/evidence/img/Fase-d/TC-D-1.2-02.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-1.2-03 — Buscar orden inexistente

**Estado:** `PASS`

### Pasos

1. Ingresar un identificador que no corresponda a ninguna orden.
2. Ejecutar la búsqueda.

### Resultado esperado

El sistema informa que no existen resultados para el criterio utilizado y no muestra información correspondiente a otra orden.

**Evidencia:** [Evidencia TC-D-1.2-03](../../testing/evidence/img/Fase-d/TC-D-1.2-03.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-1.2-04 — Visualizar expediente completo

**Estado:** `PASS`

### Precondiciones

* Existe una orden con información registrada en diferentes etapas.

### Pasos

1. Buscar la orden.
2. Abrir el expediente.
3. Revisar la información disponible.

### Resultado esperado

El expediente permite consultar la información correspondiente a la orden y mantiene relación con los datos registrados durante su ciclo.

**Evidencia:** [Evidencia TC-D-1.2-04](../../testing/evidence/img/Fase-d/TC-D-1.2-04.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-1.2-05 — Consistencia de estados del expediente

**Estado:** `PASS`

### Precondiciones

* Existe una OT cuyo estado actual es conocido.

### Pasos

1. Consultar la OT desde el flujo operativo.
2. Abrir el expediente mediante HU-1.2.
3. Comparar el estado mostrado.

### Resultado esperado

El estado informado en el expediente coincide con el estado registrado para la orden.

**Evidencia:** [Evidencia TC-D-1.2-05](../../testing/evidence/img/Fase-d/TC-D-1.2-05.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-1.2-06 — Visualización de fases y trazabilidad

**Estado:** `PASS`

### Precondiciones

* Existe una OT con más de una fase.
* Las fases poseen estados registrados.

### Pasos

1. Abrir el expediente.
2. Consultar las fases de producción.
3. Revisar sus estados.

### Resultado esperado

Las fases correspondientes a la orden pueden identificarse y sus estados coinciden con los registrados en producción.

**Evidencia:** [Evidencia TC-D-1.2-06](../../testing/evidence/img/Fase-d/TC-D-1.2-06.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-1.2-07 — Visualización de información de Calidad

**Estado:** `PASS`

### Precondiciones

* Existe una OT que haya llegado a Calidad.

### Pasos

1. Abrir el expediente.
2. Consultar la información de Calidad.
3. Revisar checklist, veredicto y observaciones disponibles.

### Resultado esperado

La información de Calidad asociada a la OT puede consultarse y corresponde a la orden seleccionada.

**Evidencia:** [Evidencia TC-D-1.2-07](../../testing/evidence/img/Fase-d/TC-D-1.2-07.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-1.2-08 — Visualización de adjuntos del expediente

**Estado:** `PASS`

### Precondiciones

* Existe una orden con un adjunto registrado.

### Pasos

1. Abrir el expediente.
2. Ubicar el adjunto.
3. Abrirlo desde el expediente.

### Resultado esperado

El adjunto corresponde a la orden consultada y puede visualizarse según las reglas definidas para adjuntos.

**Evidencia:** [Evidencia TC-D-1.2-08](../../testing/evidence/img/Fase-d/TC-D-1.2-08.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

# 6. HU-5.3 — Vista global de planta

## TC-D-5.3-01 — Acceso a vista global de planta

**Estado:** `PASS`

### Precondiciones

* Usuario con permisos correspondientes.
* Existencia de actividad productiva.

### Pasos

1. Ingresar al sistema.
2. Acceder a la vista global de planta.

### Resultado esperado

La vista se encuentra disponible y presenta información de producción.

**Evidencia:** [Evidencia TC-D-5.3-01](../../testing/evidence/img/Fase-d/TC-D-5.3-01.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.3-02 — Visualización de órdenes en producción

**Estado:** `PASS`

### Precondiciones

* Existen órdenes con fases en producción.

### Pasos

1. Acceder a la vista global de planta.
2. Revisar las órdenes mostradas.

### Resultado esperado

La vista presenta las órdenes/fases que corresponden al estado productivo actual.

**Evidencia:** [Evidencia TC-D-5.3-02](../../testing/evidence/img/Fase-d/TC-D-5.3-02.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.3-03 — Visualización de fases en cola

**Estado:** `PASS`

### Precondiciones

* Existe al menos una fase en estado `EN_COLA`.

### Pasos

1. Acceder a la vista global de planta.
2. Identificar la fase en cola.

### Resultado esperado

La fase aparece con el estado correspondiente y puede diferenciarse de las fases en ejecución o terminadas.

**Evidencia:** [Evidencia TC-D-5.3-03](../../testing/evidence/img/Fase-d/TC-D-5.3-03.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.3-04 — Visualización de fases en ejecución

**Estado:** `PASS`

### Precondiciones

* Existe una fase en `EN_EJECUCION`.

### Pasos

1. Acceder a la vista global de planta.
2. Ubicar la fase.

### Resultado esperado

La fase se presenta como actualmente en ejecución.

**Evidencia:** [Evidencia TC-D-5.3-04](../../testing/evidence/img/Fase-d/TC-D-5.3-04.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.3-05 — Visualización de fases terminadas

**Estado:** `PASS`

### Precondiciones

* Existe una fase en `TERMINADO`.

### Pasos

1. Acceder a la vista global.
2. Consultar la información de la fase.

### Resultado esperado

La fase aparece con estado `TERMINADO` y no se presenta como pendiente o en ejecución.

**Evidencia:** [Evidencia TC-D-5.3-05](../../testing/evidence/img/Fase-d/TC-D-5.3-05.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.3-06 — Orden y consistencia de información productiva

**Estado:** `PASS`

### Precondiciones

* Existen varias órdenes y fases en diferentes estados.

### Pasos

1. Acceder a la vista global.
2. Comparar la información mostrada con los datos registrados en las órdenes.

### Resultado esperado

La información presentada mantiene correspondencia con los estados reales de producción.

**Evidencia:** [Evidencia TC-D-5.3-06](../../testing/evidence/img/Fase-d/TC-D-5.3-06.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.3-07 — No mostrar rendimiento individual de operadores

**Estado:** `PASS`

### Pasos

1. Acceder a la vista global de planta.
2. Revisar la información presentada.
3. Verificar si existen indicadores de rendimiento individual.

### Resultado esperado

La vista global no presenta métricas de rendimiento individual de operadores, dado que ese comportamiento no forma parte del alcance definido para HU-5.3.

**Evidencia:** [Evidencia TC-D-5.3-07](../../testing/evidence/img/Fase-d/TC-D-5.3-07.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

# 7. HU-5.4 — Vista global de Calidad

## TC-D-5.4-01 — Acceso a vista global de Calidad

**Estado:** `PASS`

### Precondiciones

* Usuario con permisos correspondientes.
* Existencia de información de Calidad.

### Pasos

1. Ingresar al sistema.
2. Acceder a la vista global de Calidad.

### Resultado esperado

La vista se encuentra disponible y presenta información consolidada de Calidad.

**Evidencia:** [Evidencia TC-D-5.4-01](../../testing/evidence/img/Fase-d/TC-D-5.4-01.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.4-02 — Porcentaje de órdenes conformes

**Estado:** `PASS`

### Precondiciones

* Existen órdenes con veredicto `CONFORME`.

### Pasos

1. Acceder a la vista global de Calidad.
2. Identificar el indicador de conformidad.

### Resultado esperado

El porcentaje mostrado corresponde a las órdenes con veredicto conforme registradas en el período/conjunto de datos correspondiente.

**Evidencia:** [Evidencia TC-D-5.4-02](../../testing/evidence/img/Fase-d/TC-D-5.4-02.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.4-03 — Porcentaje de órdenes no conformes

**Estado:** `PASS`

### Precondiciones

* Existen órdenes con veredicto `NO CONFORME`.

### Pasos

1. Acceder a la vista global de Calidad.
2. Identificar el indicador correspondiente.

### Resultado esperado

El porcentaje mostrado corresponde a las órdenes con veredicto no conforme registradas.

**Evidencia:** [Evidencia TC-D-5.4-03](../../testing/evidence/img/Fase-d/TC-D-5.4-03.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.4-04 — Consistencia entre conformidad y no conformidad

**Estado:** `PASS`

### Precondiciones

* Existen órdenes conformes y no conformes.

### Pasos

1. Consultar los indicadores.
2. Compararlos con las órdenes auditadas.

### Resultado esperado

Los indicadores reflejan los datos reales registrados y no incluyen órdenes sin veredicto como conformes o no conformes.

**Evidencia:** [Evidencia TC-D-5.4-04](../../testing/evidence/img/Fase-d/TC-D-5.4-04.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.4-05 — Reprocesos por fase

**Estado:** `PASS`

### Precondiciones

* Existe al menos una orden con reproceso registrado.

### Pasos

1. Acceder a la vista global de Calidad.
2. Consultar el indicador de reprocesos.
3. Identificar la fase correspondiente.

### Resultado esperado

Los reprocesos se reflejan asociados a la fase correspondiente.

**Evidencia:** [Evidencia TC-D-5.4-05](../../testing/evidence/img/Fase-d/TC-D-5.4-05.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.4-06 — Auditorías recientes

**Estado:** `PASS`

### Precondiciones

* Existen auditorías de Calidad registradas.

### Pasos

1. Acceder a la vista global.
2. Consultar la sección de auditorías recientes.

### Resultado esperado

Las auditorías recientes disponibles corresponden a registros reales del sistema.

**Evidencia:** [Evidencia TC-D-5.4-06](../../testing/evidence/img/Fase-d/TC-D-5.4-06.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.4-07 — Tiempo promedio de Calidad

**Estado:** `PASS`

### Precondiciones

* Existen órdenes con finalización de última fase y posterior veredicto de Calidad.

### Pasos

1. Identificar la fecha/hora de finalización de la última fase.
2. Identificar la fecha/hora del veredicto de Calidad.
3. Consultar el tiempo promedio mostrado.

### Resultado esperado

El cálculo utiliza como intervalo el tiempo comprendido entre la finalización de la última fase de producción y el veredicto de Calidad.

**Evidencia:** [Evidencia TC-D-5.4-07](../../testing/evidence/img/Fase-d/TC-D-5.4-07.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

## TC-D-5.4-08 — Actualización de indicadores después de una nueva auditoría

**Estado:** `PASS`

### Precondiciones

* Existe información previamente consolidada.
* Puede registrarse una nueva auditoría.

### Pasos

1. Registrar/completar una auditoría válida.
2. Obtener el veredicto correspondiente.
3. Acceder nuevamente a la vista global de Calidad.
4. Revisar los indicadores.

### Resultado esperado

La información consolidada refleja el nuevo registro cuando corresponda.

**Evidencia:** [Evidencia TC-D-5.4-08](../../testing/evidence/img/Fase-d/TC-D-5.4-08.png)
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

# 8. E2E-D-01 — Consulta y visibilidad global

**Estado:** `PASS`

## Objetivo

Validar que la información generada durante el ciclo de una orden pueda ser consultada posteriormente desde el expediente y que los datos relevantes se reflejen en las vistas globales.

### Precondiciones

* Backend disponible.
* Usuarios con roles correspondientes.
* Existencia de una OT procesada.
* Existencia de información de producción.
* Existencia de información de Calidad.
* Datos suficientes para alimentar las vistas globales.

### Flujo

1. Ingresar al sistema con un usuario autorizado.
2. Buscar una OT existente.
3. Abrir el expediente.
4. Verificar datos del cliente.
5. Verificar información de la solicitud.
6. Verificar cotización.
7. Verificar estado de la OT.
8. Verificar fases asociadas.
9. Verificar estados de producción.
10. Verificar información de Calidad.
11. Verificar observaciones/notas disponibles.
12. Verificar adjuntos disponibles.
13. Acceder a la vista global de planta.
14. Comparar los estados productivos mostrados con los datos de la OT.
15. Acceder a la vista global de Calidad.
16. Comparar los indicadores con los registros de Calidad.
17. Verificar reprocesos.
18. Verificar auditorías recientes.
19. Verificar tiempo promedio de Calidad.
20. Comparar la información consolidada con los registros individuales.

### Resultado esperado

La información consultada desde el expediente y las vistas globales mantiene consistencia con los datos registrados en el sistema.

**Evidencia:** `N/A`
**Defecto / Issue:** `N/A`
**PR:** `N/A`
**Observaciones:** `N/A`

---

# 9. Casos negativos E2E

## E2E-D-NEG-01 — Consulta de orden inexistente

**Estado:** `PASS`

### Resultado esperado

El sistema no muestra información de una orden diferente cuando la búsqueda no encuentra coincidencias.

**Evidencia:** `N/A`
**Defecto / Issue:** `N/A`
**PR:** `N/A`

---

## E2E-D-NEG-02 — Información inconsistente entre expediente y vista global

**Estado:** `PASS`

### Resultado esperado

Los datos presentados en el expediente y las vistas globales deben corresponder a los registros reales del sistema.

Si se detecta una diferencia, debe registrarse como defecto con evidencia suficiente para determinar el dato esperado y el dato observado.

**Evidencia:** `N/A`
**Defecto / Issue:** `N/A`
**PR:** `N/A`

---

## E2E-D-NEG-03 — Indicadores sin datos suficientes

**Estado:** `PASS`

### Resultado esperado

Cuando no existan registros suficientes para calcular un indicador, el sistema no debe presentar un valor que pueda interpretarse como un dato real incorrecto.

**Evidencia:** `N/A`
**Defecto / Issue:** `N/A`
**PR:** `N/A`

---

## E2E-D-NEG-04 — Datos de una orden mezclados con otra

**Estado:** `PASS`

### Resultado esperado

La consulta de una orden debe mostrar exclusivamente la información correspondiente al expediente seleccionado.

No deben mezclarse:

* clientes;
* solicitudes;
* cotizaciones;
* fases;
* adjuntos;
* auditorías;
* observaciones;
* estados

pertenecientes a otra orden.

**Evidencia:** `N/A`
**Defecto / Issue:** `N/A`
**PR:** `N/A`

---

# 10. Resumen de cobertura Fase D

| Área                                 |  Casos |
| ------------------------------------ | -----: |
| HU-1.2 — Buscar órdenes / expediente |      8 |
| HU-5.3 — Vista global de planta      |      7 |
| HU-5.4 — Vista global de Calidad     |      8 |
| E2E principal                        |      1 |
| E2E negativos                        |      4 |
| **Total Fase D**                     | **28** |

**Resultado:** 28 casos `PASS`.

---

# 11. Registro de ejecución

| ID           | Resultado | Evidencia | Issue / Defecto | PR | Observaciones |
| ------------ | --------- | --------- | --------------- | -- | ------------- |
| TC-D-1.2-01  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-1.2-01.png) | —               | —  | —             |
| TC-D-1.2-02  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-1.2-02.png) | —               | —  | —             |
| TC-D-1.2-03  | PASS   | —         | —               | —  | —             |
| TC-D-1.2-04  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-1.2-04.png) | —               | —  | —             |
| TC-D-1.2-05  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-1.2-05.png) | —               | —  | —             |
| TC-D-1.2-06  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-1.2-06.png) | —               | —  | —             |
| TC-D-1.2-07  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-1.2-07.png) | —               | —  | —             |
| TC-D-1.2-08  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-1.2-08.png) | —               | —  | —             |
| TC-D-5.3-01  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.3-01.png) | —               | —  | —             |
| TC-D-5.3-02  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.3-02.png) | —               | —  | —             |
| TC-D-5.3-03  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.3-03.png) | —               | —  | —             |
| TC-D-5.3-04  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.3-04.png) | —               | —  | —             |
| TC-D-5.3-05  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.3-05.png) | —               | —  | —             |
| TC-D-5.3-06  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.3-06.png) | —               | —  | —             |
| TC-D-5.3-07  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.3-07.png) | —               | —  | —             |
| TC-D-5.4-01  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-01.png) | —               | —  | —             |
| TC-D-5.4-02  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-02.png) | —               | —  | —             |
| TC-D-5.4-03  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-03.png) | —               | —  | —             |
| TC-D-5.4-04  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-04.png) | —               | —  | —             |
| TC-D-5.4-05  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-05.png) | —               | —  | —             |
| TC-D-5.4-06  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-06.png) | —               | —  | —             |
| TC-D-5.4-07  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-07.png) | —               | —  | —             |
| TC-D-5.4-08  | PASS   | [Evidencia](../../testing/evidence/img/Fase-d/TC-D-5.4-08.png) | —               | —  | —             |
| E2E-D-01     | PASS   | —         | —               | —  | —             |
| E2E-D-NEG-01 | PASS   | —         | —               | —  | —             |
| E2E-D-NEG-02 | PASS   | —         | —               | —  | —             |
| E2E-D-NEG-03 | PASS   | —         | —               | —  | —             |
| E2E-D-NEG-04 | PASS   | —         | —               | —  | —             |

---

# 12. Evidencias

Las evidencias de ejecución deberán almacenarse en:

```text
docs/qa/testing/evidence/img/Fase-d/
docs/qa/testing/evidence/img/Fase-d/
```

Convención sugerida:

```text
TC-D-1.2-01.png
TC-D-1.2-02.png
TC-D-5.3-01.png
TC-D-5.4-01.png
E2E-D-01-01.png
E2E-D-01-02.png
```

La columna **Evidencia** deberá contener el enlace relativo al archivo correspondiente cuando el caso sea ejecutado.

Ejemplo:

```text
[evidencia](../evidence/img/Fase-d/TC-D-5.4-02.png)
```

---

# 13. Registro de defectos

Cuando un caso produzca `FAIL`, el defecto deberá registrarse mediante Issue de GitHub.

La documentación QA deberá conservar:

* ID del caso;
* resultado observado;
* resultado esperado;
* evidencia;
* Issue;
* PR relacionado, si existe;
* observaciones.

El caso no debe eliminarse ni reemplazarse después de corregir el defecto.

La nueva ejecución deberá quedar registrada como una nueva evidencia/resultado asociado al mismo caso o mediante el mecanismo de historial definido para la matriz.

---

# 14. Trazabilidad

La Fase D deberá mantener la siguiente relación:

```text
PRD v2
   ↓
Backlog v2
   ↓
User Story
   ↓
Criterio funcional
   ↓
Caso de prueba
   ↓
Ejecución
   ↓
Evidencia
   ↓
Issue / Defecto
   ↓
PR
   ↓
Reejecución / Regresión
```

Las referencias históricas a PR, Issues o decisiones anteriores deberán conservarse cuando expliquen el origen o modificación de una regla funcional.

---

# 15. Relación con decisiones D-1 a D-6

| Decisión | Relación con Fase D                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| D-1      | Puede impactar la trazabilidad de reasignaciones consultada desde el expediente                              |
| D-2      | La información de checklist y veredicto forma parte de la información de Calidad                             |
| D-3      | La asignación de reprocesos puede reflejarse en la trazabilidad del expediente                               |
| D-4      | Los datos obligatorios del cliente deben mantenerse consistentes en las consultas                            |
| D-5      | La disponibilidad de operadores afecta el flujo productivo y la información que posteriormente se consulta   |
| D-6      | Los adjuntos almacenados deben permanecer asociados al expediente y ser consultables según la regla definida |

---

# 16. Criterios de cierre de Fase D

La fase podrá considerarse ejecutada cuando:

* los casos definidos hayan sido ejecutados;
* cada caso tenga resultado;
* los `FAIL` tengan Issue asociado;
* los bloqueos tengan causa documentada;
* las evidencias estén almacenadas;
* los datos observados puedan relacionarse con la orden correspondiente;
* se haya validado la consistencia entre expediente y vistas globales;
* se hayan validado las métricas de Calidad correspondientes;
* los defectos relevantes hayan sido vinculados a sus PR cuando corresponda;
* se haya realizado la regresión de los casos afectados por correcciones.

---

# 17. Estado final de la Fase D

**Total de casos diseñados:** 28
**PASS:** 28
**FAIL:** 0
**BLOCKED:** 0
**NOT RUN:** 0

> La condición `NOT RUN` indica únicamente que el caso está diseñado y pendiente de ejecución. No representa un resultado de calidad ni implica que la funcionalidad esté aprobada o rechazada.

---

# 18. Histórico QA

Esta documentación forma parte de la estructura permanente:

```text
docs/qa/
├── README.md
├── doc/
│   ├── Matriz-General-TestCases-4fases.md
│   └── Matriz-General-TestCases-4fases.xlsx
├── Analisis-Funcional.md
├── Plan-Trabajo.md
├── QualityTrack-Matriz-TestCases-4fases.xlsx
├── QualityTrack-QA-Registro-Seguimiento-E2E-Frontend-Backend.md
│
└── testing/
    ├── doc/
    │   ├── Fase-A.md
    │   ├── Fase-B.md
    │   ├── Fase-C.md
    │   └── Fase-D.md
    │
    └── evidence/
        └── img/
            ├── Fase-a/
            ├── Fase-b/
            ├── Fase-c/
            └── Fase-d/
```

La creación de esta estructura no reemplaza ni elimina la documentación QA histórica existente en:

```text
docs/historico/maria/
```

ni modifica el historial de las ramas, Issues o PR anteriores.

La documentación histórica deberá conservarse para mantener la trazabilidad de las decisiones, casos diseñados, defectos detectados y correcciones realizadas durante el proyecto.
