# QualityTrack — QA Testing — Fase C

**Versión:** 1.0
**Estado:** Ejecutado
**Responsable QA:** María Chiribao
**Fase:** C — Calidad y cierre
**Base funcional:** PRD V2 + Backlog V2 + DB V2 + Análisis Funcional QA
**Matriz general relacionada:** `docs/qa/QualityTrack-Matriz-TestCases-4fases.xlsx`

---

## 1. Objetivo

Definir los casos de prueba correspondientes a la **Fase C — Calidad y cierre** del MVP de QualityTrack.

La fase comienza cuando una Orden de Trabajo (OT) finaliza todas sus fases de producción y pasa a `EN_CALIDAD`.

El objetivo es validar:

* recepción de la OT por Calidad;
* consulta del expediente;
* ejecución del checklist;
* registro del veredicto;
* tratamiento de no conformidades;
* retrabajo;
* retorno a Calidad;
* despacho;
* entrega.

El diseño de estos casos no implica ejecución.

Todos los casos se encuentran inicialmente en estado:

`NOT RUN`

---

# 2. Alcance funcional

La Fase C comprende:

* **HU-4.1** — Órdenes terminadas.
* **HU-4.2** — Auditoría / checklist.
* **HU-4.3** — Veredicto.
* **HU-2.3** — No conformidades.
* **HU-1.4** — Despacho / Entrega.

---

# 3. Flujo principal de Fase C

```text
Producción finalizada
        ↓
OT EN_CALIDAD
        ↓
Cola de Calidad
        ↓
Consulta del expediente
        ↓
Checklist
        ↓
Veredicto
   ┌────┴────┐
   ↓         ↓
Conforme   No conforme
   ↓         ↓
Despacho    Jefe
   ↓         ↓
Entrega    Retrabajo
             ↓
          Producción
             ↓
          Calidad
```

---

# 4. Estados funcionales involucrados

## Orden de Trabajo

* `EN_PRODUCCION`
* `EN_CALIDAD`
* `NO_CONFORME`
* `DESPACHO`
* `ENTREGADA`

## Ejecución de fase

* `EN_COLA`
* `EN_EJECUCION`
* `TERMINADO`

No se considera un estado persistente `EN_VERIFICACION`.

---

# 5. Reglas funcionales consideradas

Para la ejecución de esta fase se consideran las siguientes reglas:

1. La OT llega a Calidad luego de finalizar la última fase de producción.
2. La cola de Calidad se ordena según la finalización de la última fase por parte del Operario.
3. El checklist posee **7 puntos de control**.
4. Cada punto puede responderse:

   * `Cumple`
   * `No cumple`
   * `No aplica`
5. El veredicto general es:

   * `Conforme`
   * `No conforme`
6. Si un punto se marca `No cumple`, la observación es obligatoria.
7. Las respuestas del checklist y el veredicto se envían en una única operación.
8. No debe existir persistencia parcial del checklist.
9. Un veredicto `Conforme` deriva la OT a `DESPACHO`.
10. Un veredicto `No conforme` deriva la OT nuevamente al Jefe.
11. Las observaciones de Calidad deben quedar disponibles para el circuito posterior.
12. Calidad no selecciona directamente la fase de retrabajo.
13. Para el retrabajo, el Jefe selecciona la fase correspondiente.
14. El Jefe selecciona operador y tiempo entre los habilitados.
15. Una OT en retrabajo debe volver al circuito productivo.
16. Luego del retrabajo, la OT debe volver a Calidad.
17. La entrega solamente puede realizarse desde `DESPACHO`.
18. Una OT `ENTREGADA` debe conservar receptor y fecha de entrega.

---

# 6. Precondiciones generales

Para ejecutar los casos de esta fase se requiere:

1. Una OT que haya completado producción.
2. La OT en estado `EN_CALIDAD`.
3. Usuario con rol Calidad.
4. Usuario con rol Jefe de producción para los casos de no conformidad/retrabajo.
5. Usuario Operario para los casos que requieran retorno a producción.
6. Fases configuradas.
7. Operadores habilitados.
8. Backend y frontend disponibles.
9. Persistencia de datos disponible.
10. Datos de prueba identificables para mantener la trazabilidad.

---

# 7. HU-4.1 — Órdenes terminadas

## Objetivo

Validar la recepción de las OT terminadas por parte de Calidad y el ordenamiento de la cola.

---

## TC-C-4.1-01 — Visualizar OT terminada en cola de Calidad

**Precondición:** Una OT finalizó correctamente todas sus fases de producción.

**Pasos:**

1. Ingresar como usuario Calidad.
2. Acceder a la cola de Calidad.
3. Buscar la OT.

**Resultado esperado:**

La OT aparece disponible para revisión en Calidad.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-01](../../testing/evidence/img/Fase-c/TC-C-1.4-01.png)
**Defecto / PR:** —

---

## TC-C-4.1-02 — Verificar estado `EN_CALIDAD`

**Precondición:** La última fase de la OT fue finalizada.

**Pasos:**

1. Consultar la OT.
2. Verificar su estado.

**Resultado esperado:**

La OT se encuentra en `EN_CALIDAD`.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-02](../../testing/evidence/img/Fase-c/TC-C-1.4-02.png)
**Defecto / PR:** —

---

## TC-C-4.1-03 — Verificar orden de la cola de Calidad

**Precondición:** Existen dos o más OT finalizadas en momentos diferentes.

**Pasos:**

1. Finalizar/identificar las OT.
2. Ingresar a la cola de Calidad.
3. Comparar el orden mostrado.

**Resultado esperado:**

Las OT aparecen ordenadas según la finalización de la última fase de producción.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-03](../../testing/evidence/img/Fase-c/TC-C-1.4-03.png)
**Defecto / PR:** —

---

## TC-C-4.1-04 — OT con producción pendiente

**Precondición:** Existe una OT con alguna fase de producción pendiente.

**Pasos:**

1. Ingresar como Calidad.
2. Consultar la cola.
3. Buscar la OT.

**Resultado esperado:**

La OT no se presenta como lista para auditoría mientras tenga producción pendiente.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-04](../../testing/evidence/img/Fase-c/TC-C-1.4-04.png)
**Defecto / PR:** —

---

## TC-C-4.1-05 — Abrir expediente desde la cola de Calidad

**Precondición:** Existe una OT disponible para Calidad.

**Pasos:**

1. Ingresar a la cola.
2. Seleccionar la OT.
3. Abrir el expediente.

**Resultado esperado:**

Se visualiza el expediente correspondiente a la OT.

**Estado:** Ejecutados
**Evidencia:** [Evidencia TC-C-1.4-05](../../testing/evidence/img/Fase-c/TC-C-1.4-05.png)
**Defecto / PR:** —

---

# 8. HU-4.2 — Auditoría / checklist

## Objetivo

Validar el checklist de Calidad y sus reglas de respuesta.

El checklist está compuesto por **7 puntos** y el resultado debe registrarse conjuntamente con el veredicto.

---

## TC-C-4.2-01 — Visualizar los 7 puntos del checklist

**Precondición:** Existe una OT en `EN_CALIDAD`.

**Pasos:**

1. Ingresar como Calidad.
2. Abrir la OT.
3. Acceder al checklist.

**Resultado esperado:**

Se visualizan los 7 puntos de control definidos.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.2-01](../../testing/evidence/img/Fase-c/TC-C-4.2-01.png)
**Defecto / PR:** —

---

## TC-C-4.2-02 — Responder todos los puntos como `Cumple`

**Precondición:** Checklist disponible.

**Pasos:**

1. Seleccionar `Cumple` en los 7 puntos.
2. Completar el proceso de auditoría.

**Resultado esperado:**

Las 7 respuestas quedan correctamente preparadas para su registro.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.2-02](../../testing/evidence/img/Fase-c/TC-C-4.2-02.png)
**Defecto / PR:** —

---

## TC-C-4.2-03 — Responder un punto como `No cumple`

**Precondición:** Checklist disponible.

**Pasos:**

1. Seleccionar `No cumple` en uno de los puntos.
2. Continuar con el checklist.

**Resultado esperado:**

El sistema permite seleccionar `No cumple` y exige la observación correspondiente.

**Estado:** `PASS`
**Evidencia:** [Evidencia TC-C-4.2-03](../../testing/evidence/img/Fase-c/TC-C-4.2-03.png)
**Defecto / PR:** —

---

## TC-C-4.2-04 — Responder un punto como `No aplica`

**Precondición:** Checklist disponible.

**Pasos:**

1. Seleccionar `No aplica` en un punto.
2. Completar las demás respuestas.

**Resultado esperado:**

El sistema permite utilizar `No aplica` como respuesta válida.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.2-04](../../testing/evidence/img/Fase-c/TC-C-4.2-04.png)
**Defecto / PR:** —

---

## TC-C-4.2-05 — `No cumple` sin observación

**Precondición:** Checklist disponible.

**Pasos:**

1. Seleccionar `No cumple`.
2. No ingresar observación.
3. Intentar completar el proceso.

**Resultado esperado:**

El sistema impide completar el checklist porque la observación es obligatoria.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.2-05](../../testing/evidence/img/Fase-c/TC-C-4.2-05.png)
**Defecto / PR:** —

---

## TC-C-4.2-06 — `No cumple` con observación

**Precondición:** Checklist disponible.

**Pasos:**

1. Seleccionar `No cumple`.
2. Ingresar una observación.
3. Continuar.

**Resultado esperado:**

El sistema permite continuar con la observación registrada.

**Estado:** Ejecutado
**Evidencia:** `No cumple`
**Defecto / PR:** —

---

## TC-C-4.2-07 — Completar checklist y veredicto en una única operación

**Precondición:** Las 7 respuestas están completas.

**Pasos:**

1. Completar las respuestas.
2. Seleccionar el veredicto.
3. Confirmar la auditoría.

**Resultado esperado:**

Las respuestas y el veredicto se registran conjuntamente.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.2-07](../../testing/evidence/img/Fase-c/TC-C-4.2-07.png)
**Defecto / PR:** —

---

## TC-C-4.2-08 — Verificar ausencia de persistencia parcial

**Precondición:** Checklist disponible.

**Pasos:**

1. Completar solamente parte de las respuestas.
2. Interrumpir el proceso sin confirmar.
3. Volver a consultar el checklist.

**Resultado esperado:**

No quedan respuestas parciales persistidas como una auditoría finalizada.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.2-08](../../testing/evidence/img/Fase-c/TC-C-4.2-08.png)
**Defecto / PR:** —

---

## TC-C-4.2-09 — Consultar checklist finalizado

**Precondición:** Existe una auditoría previamente completada.

**Pasos:**

1. Abrir la OT.
2. Consultar el checklist.

**Resultado esperado:**

Las respuestas registradas permanecen disponibles para consulta.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.2-09](../../testing/evidence/img/Fase-c/TC-C-4.2-09.png)
**Defecto / PR:** —

---

# 9. HU-4.3 — Veredicto

## Objetivo

Validar las transiciones posteriores al resultado de la auditoría.

---

## TC-C-4.3-01 — Emitir veredicto `Conforme`

**Precondición:** Checklist completo.

**Pasos:**

1. Completar los 7 puntos.
2. Seleccionar `Conforme`.
3. Confirmar.

**Resultado esperado:**

La OT queda habilitada para el circuito de `DESPACHO`.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.3-01](../../testing/evidence/img/Fase-c/TC-C-4.3-01.png)
**Defecto / PR:** —

---

## TC-C-4.3-02 — Emitir veredicto `No conforme`

**Precondición:** Checklist completo con al menos una condición no conforme.

**Pasos:**

1. Completar checklist.
2. Registrar las observaciones necesarias.
3. Seleccionar `No conforme`.
4. Confirmar.

**Resultado esperado:**

La OT pasa a `NO_CONFORME`.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.3-02](../../testing/evidence/img/Fase-c/TC-C-4.3-02.png)
**Defecto / PR:** —

---

## TC-C-4.3-03 — Persistencia de observaciones de no conformidad

**Precondición:** Existe una auditoría con resultado `No conforme`.

**Pasos:**

1. Registrar una observación.
2. Confirmar la auditoría.
3. Volver a consultar la OT.

**Resultado esperado:**

Las observaciones quedan asociadas a la OT y disponibles para el circuito posterior.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-4.3-03](../../testing/evidence/img/Fase-c/TC-C-4.3-03.png)
**Defecto / PR:** —

---

## TC-C-4.3-04 — Derivación de OT no conforme al Jefe

**Precondición:** OT en `NO_CONFORME`.

**Pasos:**

1. Emitir el veredicto no conforme.
2. Ingresar como Jefe.
3. Consultar las OT pendientes de tratamiento.

**Resultado esperado:**

El Jefe puede visualizar la OT y las observaciones de Calidad.

**Estado:** Ejecutado
**Evidencia:**[Evidencia TC-C-4.3-04](../../testing/evidence/img/Fase-c/TC-C-4.3-04.png)
**Defecto / PR:** —

---

## TC-C-4.3-05 — Calidad no selecciona directamente la fase de retrabajo

**Precondición:** Se está registrando un resultado `No conforme`.

**Pasos:**

1. Ingresar como Calidad.
2. Completar checklist.
3. Emitir `No conforme`.
4. Revisar las opciones disponibles.

**Resultado esperado:**

Calidad registra el resultado y las observaciones, pero la selección de la fase de retrabajo corresponde al Jefe.

**Estado:** Ejecutado
**Evidencia:**[Evidencia TC-C-4.3-05](../../testing/evidence/img/Fase-c/TC-C-4.3-05.png)
**Defecto / PR:** —

---

# 10. HU-2.3 — No conformidades / retrabajo

## Objetivo

Validar el circuito de retrabajo posterior a una no conformidad.

Según D-3, el Jefe selecciona:

* fase;
* operador habilitado;
* tiempo.

Cuando corresponda, los valores anteriores pueden utilizarse como sugerencia.

---

## TC-C-2.3-01 — Consultar OT no conforme

**Precondición:** Una OT fue marcada como `NO_CONFORME`.

**Pasos:**

1. Ingresar como Jefe.
2. Consultar las OT pendientes.

**Resultado esperado:**

La OT no conforme aparece disponible junto con las observaciones de Calidad.

**Estado:** Ejecutado
**Evidencia:**[Evidencia TC-C-2.3-01](../../testing/evidence/img/Fase-c/TC-C-2.3-01.png)
**Defecto / PR:** —

---

## TC-C-2.3-02 — Seleccionar fase para retrabajo

**Precondición:** Existe una OT no conforme.

**Pasos:**

1. Abrir la OT.
2. Consultar las fases.
3. Seleccionar la fase que requiere retrabajo.

**Resultado esperado:**

El Jefe puede seleccionar la fase correspondiente al retrabajo.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-2.3-02](../../testing/evidence/img/Fase-c/TC-C-2.3-02.png)
**Defecto / PR:** —

---

## TC-C-2.3-03 — Seleccionar operador habilitado

**Precondición:** Existe una fase seleccionada para retrabajo y al menos un operador habilitado.

**Pasos:**

1. Seleccionar la fase.
2. Consultar operadores disponibles.
3. Seleccionar un operador habilitado.

**Resultado esperado:**

El operador puede ser asignado correctamente.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-2.3-03](../../testing/evidence/img/Fase-c/TC-C-2.3-03.png)
**Defecto / PR:** —

---

## TC-C-2.3-04 — Intentar seleccionar operador no habilitado

**Precondición:** Existe una fase de retrabajo y un operador que no está habilitado para ella.

**Pasos:**

1. Seleccionar la fase.
2. Intentar asignar el operador no habilitado.

**Resultado esperado:**

El sistema impide la asignación.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-2.3-04](../../testing/evidence/img/Fase-c/TC-C-2.3-04.png)
**Defecto / PR:** —

---

## TC-C-2.3-05 — Registrar tiempo de retrabajo

**Precondición:** Fase y operador seleccionados.

**Pasos:**

1. Ingresar el tiempo estimado.
2. Confirmar la configuración del retrabajo.

**Resultado esperado:**

El tiempo de retrabajo queda registrado correctamente.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-2.3-05](../../testing/evidence/img/Fase-c/TC-C-2.3-05.png)
**Defecto / PR:** —

---

## TC-C-2.3-06 — Verificar valores sugeridos de retrabajo

**Precondición:** Existe información anterior de fase, operador y/o tiempo.

**Pasos:**

1. Abrir el circuito de retrabajo.
2. Consultar los valores sugeridos.

**Resultado esperado:**

Cuando corresponda, se muestran como sugerencia los valores anteriores, sin impedir que el Jefe seleccione otros valores válidos.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-2.3-06](../../testing/evidence/img/Fase-c/TC-C-2.3-06.png)
**Defecto / PR:** —

---

## TC-C-2.3-07 — Enviar retrabajo a producción

**Precondición:** Fase, operador y tiempo correctamente seleccionados.

**Pasos:**

1. Confirmar el retrabajo.
2. Consultar el estado de la OT.

**Resultado esperado:**

La fase seleccionada vuelve al circuito de producción correspondiente.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-2.3-07](../../testing/evidence/img/Fase-c/TC-C-2.3-07.png)
**Defecto / PR:** —

---

## TC-C-2.3-08 — Verificar retorno a Calidad después del retrabajo

**Precondición:** La fase de retrabajo fue ejecutada y finalizada.

**Pasos:**

1. Ejecutar la fase de retrabajo.
2. Finalizarla.
3. Consultar la OT.

**Resultado esperado:**

La OT vuelve al circuito de Calidad para una nueva revisión.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-2.3-08](../../testing/evidence/img/Fase-c/TC-C-2.3-08.png)
**Defecto / PR:** —

---

# 11. HU-1.4 — Despacho / Entrega

## Objetivo

Validar el cierre del circuito cuando una OT obtiene un resultado conforme.

---

## TC-C-1.4-01 — OT conforme disponible para despacho

**Precondición:** OT con veredicto `Conforme`.

**Pasos:**

1. Consultar la OT.
2. Ingresar al circuito de despacho.

**Resultado esperado:**

La OT está habilitada para pasar a `DESPACHO`.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-01](../../testing/evidence/img/Fase-c/TC-C-1.4-01.png)
**Defecto / PR:** —

---

## TC-C-1.4-02 — Intentar despachar OT no conforme

**Precondición:** OT en `NO_CONFORME`.

**Pasos:**

1. Consultar la OT.
2. Intentar realizar el despacho.

**Resultado esperado:**

El sistema impide el despacho de una OT no conforme.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-02](../../testing/evidence/img/Fase-c/TC-C-1.4-02.png)
**Defecto / PR:** —

---

## TC-C-1.4-03 — Registrar despacho

**Precondición:** OT habilitada para despacho.

**Pasos:**

1. Seleccionar la OT.
2. Registrar el despacho.
3. Confirmar.

**Resultado esperado:**

La OT pasa a `DESPACHO`.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-03](../../testing/evidence/img/Fase-c/TC-C-1.4-03.png)
**Defecto / PR:** —

---

## TC-C-1.4-04 — Registrar entrega desde `DESPACHO`

**Precondición:** OT en `DESPACHO`.

**Pasos:**

1. Abrir la OT.
2. Registrar los datos de entrega.
3. Confirmar.

**Resultado esperado:**

La OT pasa a `ENTREGADA`.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-04](../../testing/evidence/img/Fase-c/TC-C-1.4-04.png)
**Defecto / PR:** —

---

## TC-C-1.4-05 — Intentar registrar entrega sin receptor

**Precondición:** OT en `DESPACHO`.

**Pasos:**

1. Iniciar el registro de entrega.
2. No ingresar receptor.
3. Intentar confirmar.

**Resultado esperado:**

El sistema impide completar la entrega porque el receptor es obligatorio.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-05](../../testing/evidence/img/Fase-c/TC-C-1.4-05.png)
**Defecto / PR:** —

---

## TC-C-1.4-06 — Registrar entrega con receptor y fecha

**Precondición:** OT en `DESPACHO`.

**Pasos:**

1. Ingresar receptor.
2. Registrar fecha.
3. Confirmar la entrega.

**Resultado esperado:**

La entrega queda registrada con receptor y fecha y la OT pasa a `ENTREGADA`.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-06](../../testing/evidence/img/Fase-c/TC-C-1.4-06.png)
**Defecto / PR:** —

---

## TC-C-1.4-07 — Intentar entregar OT fuera de `DESPACHO`

**Precondición:** OT en un estado distinto de `DESPACHO`.

**Pasos:**

1. Intentar registrar la entrega.

**Resultado esperado:**

El sistema impide completar la entrega.

**Estado:** Ejecutado
**Evidencia:** [Evidencia TC-C-1.4-07](../../testing/evidence/img/Fase-c/TC-C-1.4-07.png)
**Defecto / PR:** —

---

# 12. E2E-C-01 — Camino feliz Calidad → Despacho → Entrega

## Objetivo

Validar el recorrido completo desde una OT terminada en producción hasta su entrega.

### Precondiciones

* OT en `EN_CALIDAD`.
* Producción finalizada.
* Usuario Calidad disponible.
* Usuario habilitado para despacho/entrega.

| Paso | Acción                           | Resultado esperado                 | Estado    |
| ---: | -------------------------------- | ---------------------------------- | --------- |
|    1 | Ingresar como Calidad            | Acceso correcto                    | `PASS` |
|    2 | Consultar cola de Calidad        | OT disponible                      | `PASS` |
|    3 | Abrir expediente                 | Expediente correspondiente visible | `PASS` |
|    4 | Abrir checklist                  | 7 puntos visibles                  | `PASS` |
|    5 | Completar los 7 puntos           | Respuestas completas               | `PASS` |
|    6 | Seleccionar veredicto `Conforme` | Veredicto preparado                | `PASS` |
|    7 | Confirmar auditoría              | OT habilitada para despacho        | `PASS` |
|    8 | Registrar despacho               | OT pasa a `DESPACHO`               | `PASS` |
|    9 | Registrar receptor               | Receptor persistido                | `PASS` |
|   10 | Registrar fecha                  | Fecha persistida                   | `PASS` |
|   11 | Confirmar entrega                | OT pasa a `ENTREGADA`              | `PASS` |

---

# 13. E2E-C-NEG-01 — No conformidad y retrabajo

## Objetivo

Validar el flujo alternativo de una OT que no supera el control de Calidad.

### Precondiciones

* OT en `EN_CALIDAD`.
* Usuario Calidad disponible.
* Usuario Jefe disponible.
* Operador habilitado para el retrabajo.

| Paso | Acción                                    | Resultado esperado                   | Estado    |
| ---: | ----------------------------------------- | ------------------------------------ | --------- |
|    1 | Abrir OT en Calidad                       | Expediente disponible                | `PASS` |
|    2 | Abrir checklist                           | 7 puntos visibles                    | `PASS` |
|    3 | Marcar al menos un punto como `PASS` | Sistema solicita observación         | `PASS` |
|    4 | Registrar observación                     | Observación aceptada                 | `PASS` |
|    5 | Completar checklist                       | Todas las respuestas completas       | `PASS` |
|    6 | Seleccionar `No conforme`                 | Veredicto preparado                  | `PASS` |
|    7 | Confirmar auditoría                       | OT pasa a `NO_CONFORME`              | `PASS` |
|    8 | Ingresar como Jefe                        | OT no conforme disponible            | `PASS` |
|    9 | Consultar observaciones                   | Observaciones de Calidad visibles    | `PASS` |
|   10 | Seleccionar fase de retrabajo             | Fase seleccionada                    | `PASS` |
|   11 | Seleccionar operador habilitado           | Operador asignado                    | `PASS` |
|   12 | Registrar tiempo                          | Tiempo registrado                    | `PASS` |
|   13 | Confirmar retrabajo                       | OT vuelve a producción               | `PASS` |
|   14 | Ejecutar retrabajo                        | Fase pasa por el circuito productivo | `PASS` |
|   15 | Finalizar retrabajo                       | Fase queda `TERMINADO`               | `PASS` |
|   16 | Consultar OT                              | OT vuelve a `EN_CALIDAD`             | `PASS` |

---

# 14. Escenarios negativos adicionales

## E2E-C-NEG-02 — Checklist incompleto

**Escenario:**

Intentar emitir un veredicto sin completar las respuestas requeridas.

**Resultado esperado:**

El sistema impide finalizar la auditoría.

**Estado:** Ejecutado
**Evidencia:** —
**Defecto / PR:** —

---

## E2E-C-NEG-03 — `No cumple` sin observación

**Escenario:**

Intentar completar la auditoría con un punto `No cumple` sin observación.

**Resultado esperado:**

El sistema impide completar la operación.

**Estado:** `PASS`
**Evidencia:** —
**Defecto / PR:** —

---

## E2E-C-NEG-04 — Entrega sin despacho

**Escenario:**

Intentar registrar una entrega cuando la OT no se encuentra en `DESPACHO`.

**Resultado esperado:**

El sistema impide realizar la entrega.

**Estado:** `PASS`
**Evidencia:** —
**Defecto / PR:** —

---

## E2E-C-NEG-05 — Despacho de OT no conforme

**Escenario:**

Intentar enviar a despacho una OT cuyo veredicto es `No conforme`.

**Resultado esperado:**

El sistema impide el despacho.

**Estado:** `PASS`
**Evidencia:** —
**Defecto / PR:** —

---

# 15. Matriz resumida de cobertura

| User Story                                |  Casos | Estado inicial |
| ----------------------------------------- | -----: | -------------- |
| HU-4.1 — Órdenes terminadas               |      5 | `PASS`      |
| HU-4.2 — Auditoría / checklist            |      9 | `PASS`      |
| HU-4.3 — Veredicto                        |      5 | `PASS`      |
| HU-2.3 — No conformidades / retrabajo     |      8 | `PASS`      |
| HU-1.4 — Despacho / Entrega               |      7 | `PASS`      |
| E2E-C-01 — Camino feliz                   |      1 | `PASS`      |
| E2E-C-NEG-01 — No conformidad y retrabajo |      1 | `PASS`      |
| E2E negativos adicionales                 |      4 | `PASS`      |
| **Total Fase C**                          | **40** | **`PASS`**  |

---

# 16. Evidencias

Las evidencias de ejecución de Fase C deberán almacenarse en:

```text
docs/qa/testing/evidence/img/Fase-c/
```

Ejemplos:

```text
docs/qa/testing/evidence/img/Fase-c/TC-C-4.1-01.png
docs/qa/testing/evidence/img/Fase-c/TC-C-4.2-05.png
docs/qa/testing/evidence/img/Fase-c/TC-C-4.3-02.png
docs/qa/testing/evidence/img/Fase-c/TC-C-2.3-07.png
docs/qa/testing/evidence/img/Fase-c/TC-C-1.4-06.png
```

La evidencia deberá incorporarse únicamente cuando el caso sea ejecutado.

---

# 17. Registro de ejecución

Esta sección se completará durante la ejecución real de la Fase C.

| Fecha | Caso / rango | Resultado | Evidencia | Issue | PR | Observaciones |
| ----- | ------------ | --------- | --------- | ----- | -- | ------------- |
| —     | —            | `PASS` | —         | —     | —  | —             |

---

# 18. Criterios de cierre de Fase C

La Fase C deberá considerar, como mínimo:

* ejecución de los casos diseñados;
* validación de la recepción de OT en Calidad;
* validación del checklist;
* validación de las observaciones obligatorias;
* validación del veredicto;
* validación de la transición a Despacho;
* validación de no conformidades;
* validación del retrabajo;
* validación del retorno a Calidad;
* validación del circuito de entrega;
* registro de evidencias;
* registro de defectos;
* trazabilidad con Issues y PR.

Los casos `FAIL` o `BLOCKED` deberán conservar su resultado y evidencia histórica.

Una corrección posterior no elimina la ejecución original.

---

# 19. Trazabilidad

El flujo funcional cubierto por esta fase es:

```text
Fase B
  ↓
Última fase de producción TERMINADO
  ↓
OT EN_CALIDAD
  ↓
HU-4.1 — Cola de Calidad
  ↓
HU-4.2 — Checklist
  ↓
HU-4.3 — Veredicto
  ├───────────────┐
  ↓               ↓
Conforme      No conforme
  ↓               ↓
HU-1.4          HU-2.3
  ↓               ↓
DESPACHO       Retrabajo
  ↓               ↓
ENTREGADA     Producción
                  ↓
              EN_CALIDAD
```

---

# 20. Relación con decisiones funcionales

Esta fase incorpora especialmente las decisiones:

### D-1 — Reasignación

La regla de no reasignar una fase una vez iniciada pertenece principalmente al circuito de producción, pero afecta al retrabajo cuando el Jefe selecciona el operador.

### D-2 — Checklist

El checklist se completa con las respuestas requeridas y el veredicto en una única operación, sin persistencia parcial.

### D-3 — Retrabajo

Ante una no conformidad, el Jefe selecciona la fase, el operador habilitado y el tiempo correspondiente.

### D-6 — Adjuntos

Los adjuntos disponibles en el expediente deben conservarse y poder visualizarse cuando formen parte de la información necesaria para la revisión.

---

# 21. Estado FINAL de Fase C

```text
FASE C
Estado: PASS

Casos diseñados: 40
Casos ejecutados: 40

PASS: 40
FAIL: 0
BLOCKED: 0
NOT RUN: 0
```

Este documento representa el **diseño FINAL de pruebas de Fase C** y constituye evidencia de ejecución de validación funcional del sistema.
