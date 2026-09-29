# QualityTrack — QA Testing — Fase B

**Versión:** 1.0
**Estado:** Diseñado — `NOT RUN`
**Responsable QA:** María Chiribao
**Fase:** B — Producción
**Base funcional:** PRD V2 + Backlog V2 + DB V2 + Análisis Funcional QA
**Matriz general relacionada:** `qa-analyst/doc/Matriz-General-TestCases.md`

---

## 1. Objetivo

Definir los casos de prueba correspondientes a la **Fase B — Producción** del MVP de QualityTrack.

La fase comienza con una **OT generada correctamente en Fase A** y tiene como objetivo validar el circuito productivo desde el ingreso de la primera fase a cola hasta la finalización de las fases y el envío de la OT a Calidad.

El diseño de los casos no implica ejecución.

Todos los casos se encuentran inicialmente en estado:

`NOT RUN`

---

# 2. Alcance funcional

La Fase B comprende:

* **HU-3.1** — Tareas en ejecución y pendientes.
* **HU-3.2** — Adjuntos.
* **HU-3.3** — Vencimiento.
* **HU-3.4** — Notas discriminadas por origen.
* **HU-2.2** — Gestión de planta / reasignación.

### Flujo principal

```text
OT aprobada
    ↓
Primera fase EN_COLA
    ↓
Operador inicia fase
    ↓
EN_EJECUCION
    ↓
Finalización de fase
    ↓
TERMINADO
    ↓
Siguiente fase EN_COLA
    ↓
Repetición del circuito
    ↓
Última fase TERMINADO
    ↓
OT EN_CALIDAD
```

---

# 3. Estados funcionales involucrados

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

# 4. Precondiciones generales

Para ejecutar los casos de esta fase se requiere, como mínimo:

1. Una OT generada correctamente.
2. Una cotización aprobada.
3. Una secuencia de fases definida.
4. Las fases correspondientes creadas en el catálogo.
5. Al menos un operador habilitado para cada fase a ejecutar.
6. Un usuario con rol **Operario**.
7. Un usuario con rol **Jefe de producción** para los casos correspondientes.
8. Backend y frontend disponibles.
9. Persistencia de datos disponible.
10. Datos de prueba identificables para mantener la trazabilidad de la ejecución.

---

# 5. HU-3.1 — Tareas en ejecución y pendientes

## Objetivo

Validar la disponibilidad de las tareas para el Operario y la transición de cada fase entre:

`EN_COLA → EN_EJECUCION → TERMINADO`

También se valida el avance automático hacia la siguiente fase y el envío de la OT a Calidad al finalizar la última fase.

---

## TC-B-3.1-01 — Visualizar una OT asignada en cola

**Precondición:** Existe una OT con una primera fase asignada a un operador habilitado.

**Pasos:**

1. Ingresar como Operario.
2. Acceder a las tareas pendientes.
3. Buscar la OT asignada.
4. Visualizar la fase correspondiente.

**Resultado esperado:**

La fase aparece disponible en estado `EN_COLA`.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-02 — Iniciar una fase en cola

**Precondición:** Existe una fase en `EN_COLA` asignada al Operario.

**Pasos:**

1. Ingresar como Operario.
2. Seleccionar la tarea.
3. Iniciar la ejecución.

**Resultado esperado:**

La fase pasa de `EN_COLA` a `EN_EJECUCION`.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-03 — Visualizar tarea en ejecución

**Precondición:** Existe una fase en `EN_EJECUCION`.

**Pasos:**

1. Ingresar como Operario.
2. Consultar las tareas.
3. Identificar la tarea iniciada.

**Resultado esperado:**

La tarea activa se muestra correctamente como fase en ejecución.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-04 — Finalizar una fase

**Precondición:** Existe una fase en `EN_EJECUCION`.

**Pasos:**

1. Ingresar a la tarea.
2. Completar la operación.
3. Marcar la fase como finalizada.

**Resultado esperado:**

La fase pasa a `TERMINADO`.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-05 — Avanzar automáticamente a la siguiente fase

**Precondición:** La OT posee al menos dos fases y la primera se encuentra en ejecución.

**Pasos:**

1. Iniciar la primera fase.
2. Finalizar la primera fase.
3. Consultar el estado de la siguiente fase.

**Resultado esperado:**

La primera fase queda `TERMINADO` y la siguiente fase pasa a `EN_COLA`.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-06 — Finalizar la última fase

**Precondición:** La OT posee varias fases y se está ejecutando la última.

**Pasos:**

1. Iniciar la última fase.
2. Finalizar la operación.
3. Consultar el estado de la OT.

**Resultado esperado:**

La última fase queda `TERMINADO` y la OT pasa a `EN_CALIDAD`.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-07 — Consultar tareas pendientes

**Precondición:** Existe al menos una fase en `EN_COLA`.

**Pasos:**

1. Ingresar como Operario.
2. Acceder a las tareas pendientes.

**Resultado esperado:**

El Operario visualiza correctamente las tareas que tiene pendientes.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-08 — Verificar orden de ejecución de fases

**Precondición:** La OT posee un orden de fases definido.

**Pasos:**

1. Iniciar la primera fase.
2. Finalizarla.
3. Consultar la siguiente fase.
4. Repetir el proceso.

**Resultado esperado:**

Las fases se habilitan respetando el orden establecido para la OT.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-09 — Ejecutar una OT con una fase repetida

**Precondición:** La cotización/OT contiene una misma fase más de una vez.

**Pasos:**

1. Ejecutar la primera instancia de la fase.
2. Finalizarla.
3. Avanzar según el orden definido.
4. Ejecutar la segunda instancia.

**Resultado esperado:**

Cada instancia de la fase se mantiene diferenciada dentro del flujo de producción y respeta el orden definido.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.1-10 — Verificar fase terminada

**Precondición:** Una fase fue finalizada correctamente.

**Pasos:**

1. Finalizar una fase.
2. Consultar nuevamente la OT.
3. Revisar el estado de la fase.

**Resultado esperado:**

La fase permanece en `TERMINADO` y no vuelve automáticamente a `EN_COLA`.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

# 6. HU-3.2 — Adjuntos

## Objetivo

Validar la asociación y persistencia de archivos vinculados a la OT/fase durante el circuito productivo.

La decisión D-6 establece almacenamiento en base de datos, límite máximo de **10 MB** y visualización en navegador sin descarga obligatoria.

---

## TC-B-3.2-01 — Adjuntar archivo válido

**Precondición:** Existe una OT/fase disponible para producción.

**Pasos:**

1. Ingresar al contexto de la OT.
2. Seleccionar la opción de adjuntar archivo.
3. Seleccionar un archivo válido dentro del límite permitido.
4. Confirmar.

**Resultado esperado:**

El archivo queda asociado correctamente a la OT/fase.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.2-02 — Persistencia del adjunto

**Precondición:** Existe un archivo previamente adjuntado.

**Pasos:**

1. Adjuntar el archivo.
2. Recargar la aplicación.
3. Volver a consultar la OT.

**Resultado esperado:**

El archivo continúa disponible después de recargar la aplicación.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.2-03 — Visualizar adjunto en navegador

**Precondición:** Existe un archivo adjunto válido.

**Pasos:**

1. Consultar la OT.
2. Abrir el adjunto.

**Resultado esperado:**

El archivo puede visualizarse en el navegador sin requerir una descarga para su consulta.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.2-04 — Intentar adjuntar archivo mayor a 10 MB

**Precondición:** Existe una OT disponible.

**Pasos:**

1. Seleccionar un archivo superior a 10 MB.
2. Intentar adjuntarlo.

**Resultado esperado:**

El sistema rechaza el archivo por superar el límite permitido.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.2-05 — Verificar asociación del adjunto

**Precondición:** Existe una OT con un archivo adjunto.

**Pasos:**

1. Consultar la OT.
2. Identificar el adjunto.
3. Verificar el contexto al que pertenece.

**Resultado esperado:**

El archivo aparece asociado a la OT/fase correspondiente y no a otra orden.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

# 7. HU-3.3 — Vencimiento

## Objetivo

Validar el cálculo y comportamiento del vencimiento de las fases.

La regla funcional establece:

**Vencimiento = ingreso a cola + tiempo estimado de la fase.**

---

## TC-B-3.3-01 — Registrar tiempo estimado de una fase

**Precondición:** Existe una fase configurada en una OT.

**Pasos:**

1. Consultar la información de la fase.
2. Identificar el tiempo estimado.

**Resultado esperado:**

La fase conserva el tiempo estimado correspondiente.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.3-02 — Verificar cálculo de vencimiento

**Precondición:** Existe una fase con tiempo estimado conocido.

**Pasos:**

1. Registrar/identificar el momento de ingreso de la fase a `EN_COLA`.
2. Identificar el tiempo estimado.
3. Consultar el vencimiento calculado.

**Resultado esperado:**

El vencimiento corresponde al ingreso a cola más el tiempo estimado de la fase.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.3-03 — Fase dentro del plazo

**Precondición:** Existe una fase cuyo vencimiento todavía no fue superado.

**Pasos:**

1. Consultar la fase.
2. Comparar el estado temporal con el vencimiento.

**Resultado esperado:**

La fase se identifica correctamente como dentro del plazo.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.3-04 — Fase con plazo superado

**Precondición:** Existe una fase cuyo vencimiento fue superado.

**Pasos:**

1. Consultar la fase.
2. Verificar la información temporal.

**Resultado esperado:**

El sistema identifica correctamente que el plazo fue superado.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.3-05 — Finalizar fase antes del vencimiento

**Precondición:** Existe una fase en ejecución cuyo vencimiento aún no fue alcanzado.

**Pasos:**

1. Ejecutar la fase.
2. Finalizarla antes del vencimiento.
3. Consultar el estado.

**Resultado esperado:**

La fase queda `TERMINADO` correctamente, independientemente de que el vencimiento todavía no haya sido alcanzado.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

# 8. HU-3.4 — Notas discriminadas por origen

## Objetivo

Validar la visualización y origen de las notas asociadas al expediente.

Según la regla funcional, las notas consideradas en esta HU corresponden a los orígenes:

* Jefe de producción.
* Calidad.

El Operario no crea notas de estos tipos.

---

## TC-B-3.4-01 — Consultar nota originada por Jefe

**Precondición:** Existe una nota registrada por Jefe.

**Pasos:**

1. Consultar la OT.
2. Acceder a las notas.

**Resultado esperado:**

La nota aparece disponible y se identifica como originada por Jefe.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.4-02 — Consultar nota originada por Calidad

**Precondición:** Existe una nota registrada por Calidad.

**Pasos:**

1. Consultar la OT.
2. Acceder a las notas.

**Resultado esperado:**

La nota aparece disponible y se identifica como originada por Calidad.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.4-03 — Intentar crear nota como Operario

**Precondición:** Usuario autenticado con rol Operario.

**Pasos:**

1. Acceder a la OT.
2. Buscar la funcionalidad de creación de notas.
3. Intentar registrar una nota.

**Resultado esperado:**

El Operario no puede crear notas correspondientes a los orígenes definidos para Jefe y Calidad.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.4-04 — Consultar notas de una OT

**Precondición:** Existe una OT con notas registradas.

**Pasos:**

1. Abrir la OT.
2. Consultar las notas.

**Resultado esperado:**

Las notas disponibles correspondientes a la OT se muestran correctamente.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-3.4-05 — Verificar origen de cada nota

**Precondición:** Existe una OT con notas de distintos orígenes.

**Pasos:**

1. Abrir la OT.
2. Consultar las notas.
3. Revisar el origen de cada una.

**Resultado esperado:**

Cada nota conserva correctamente su origen.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

# 9. HU-2.2 — Gestión de planta / reasignación

## Objetivo

Validar la gestión de operadores y la reasignación de fases antes de su inicio.

### Regla funcional D-1

Una fase **no puede ser reasignada una vez que el operador comenzó su ejecución**.

La reasignación debe actualizar la visibilidad y registrar el cambio en el historial.

---

## TC-B-2.2-01 — Consultar operadores habilitados

**Precondición:** Existe una fase configurada con operadores habilitados.

**Pasos:**

1. Ingresar como Jefe.
2. Consultar la fase.
3. Abrir las opciones de asignación.

**Resultado esperado:**

Se muestran los operadores habilitados para esa fase.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-2.2-02 — Reasignar fase antes de iniciar ejecución

**Precondición:** La fase se encuentra en `EN_COLA` y tiene un operador asignado.

**Pasos:**

1. Ingresar como Jefe.
2. Seleccionar la fase.
3. Seleccionar otro operador habilitado.
4. Confirmar la reasignación.

**Resultado esperado:**

La fase queda asignada al nuevo operador.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-2.2-03 — Intentar reasignar fase ya iniciada

**Precondición:** La fase se encuentra en `EN_EJECUCION`.

**Pasos:**

1. Ingresar como Jefe.
2. Consultar la fase.
3. Intentar cambiar el operador.

**Resultado esperado:**

El sistema impide la reasignación porque la fase ya fue iniciada.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-2.2-04 — Intentar reasignar a operador no habilitado

**Precondición:** Existe una fase en `EN_COLA` y un operador que no está habilitado para esa fase.

**Pasos:**

1. Ingresar como Jefe.
2. Seleccionar la fase.
3. Intentar asignarla al operador no habilitado.

**Resultado esperado:**

El sistema impide la asignación.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-2.2-05 — Verificar actualización de visibilidad

**Precondición:** Una fase fue reasignada antes de iniciar su ejecución.

**Pasos:**

1. Reasignar la fase al operador B.
2. Consultar las tareas del operador A.
3. Consultar las tareas del operador B.

**Resultado esperado:**

La fase deja de estar disponible para el operador anterior y aparece disponible para el nuevo operador.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## TC-B-2.2-06 — Verificar historial de reasignación

**Precondición:** Se realizó una reasignación válida.

**Pasos:**

1. Realizar la reasignación.
2. Consultar el historial correspondiente.

**Resultado esperado:**

El historial registra:

* operador anterior;
* nuevo operador;
* usuario que realizó el cambio;
* fecha/hora del cambio.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

# 10. E2E-B-01 — Camino feliz de Producción

## Objetivo

Validar de extremo a extremo el circuito productivo desde una OT correctamente generada hasta su ingreso a Calidad.

### Precondiciones

* OT aprobada y generada.
* Fases configuradas.
* Operadores habilitados.
* Usuarios disponibles para la ejecución.
* Backend y frontend operativos.

| Paso | Acción                        | Resultado esperado                           | Estado    |
| ---: | ----------------------------- | -------------------------------------------- | --------- |
|    1 | Ingresar con usuario Operario | Acceso correcto                              | `NOT RUN` |
|    2 | Consultar tareas pendientes   | Aparece la primera fase de la OT             | `NOT RUN` |
|    3 | Identificar fase en cola      | Estado `EN_COLA`                             | `NOT RUN` |
|    4 | Iniciar fase                  | Estado `EN_EJECUCION`                        | `NOT RUN` |
|    5 | Ejecutar operación            | La tarea permanece disponible para completar | `NOT RUN` |
|    6 | Finalizar fase                | Estado `TERMINADO`                           | `NOT RUN` |
|    7 | Consultar siguiente fase      | Siguiente fase disponible en `EN_COLA`       | `NOT RUN` |
|    8 | Iniciar siguiente fase        | Estado `EN_EJECUCION`                        | `NOT RUN` |
|    9 | Completar las fases restantes | Cada fase pasa a `TERMINADO`                 | `NOT RUN` |
|   10 | Finalizar última fase         | Última fase queda `TERMINADO`                | `NOT RUN` |
|   11 | Consultar estado de OT        | OT pasa a `EN_CALIDAD`                       | `NOT RUN` |
|   12 | Consultar desde Calidad       | OT disponible para el circuito de Calidad    | `NOT RUN` |

---

# 11. Escenarios negativos Fase B

## E2E-B-NEG-01 — Intentar ejecutar fase sin asignación válida

**Escenario:**

Intentar iniciar una fase sin un operador habilitado/asignado correctamente.

**Resultado esperado:**

La fase no puede comenzar su ejecución.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## E2E-B-NEG-02 — Intentar reasignar fase en ejecución

**Escenario:**

Intentar modificar el operador de una fase que ya está en `EN_EJECUCION`.

**Resultado esperado:**

La reasignación es rechazada conforme a D-1.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## E2E-B-NEG-03 — Intentar asignar operador no habilitado

**Escenario:**

Intentar asignar una fase a un operador que no está habilitado para esa fase.

**Resultado esperado:**

El sistema rechaza la asignación.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

## E2E-B-NEG-04 — Intentar superar el límite de adjuntos

**Escenario:**

Intentar cargar un archivo superior a 10 MB durante producción.

**Resultado esperado:**

El sistema rechaza el archivo y mantiene la información previamente registrada.

**Estado:** `NOT RUN`
**Evidencia:** —
**Defecto / PR:** —

---

# 12. Matriz resumida de cobertura

| User Story                                |  Casos | Estado inicial |
| ----------------------------------------- | -----: | -------------- |
| HU-3.1 — Tareas en ejecución y pendientes |     10 | `NOT RUN`      |
| HU-3.2 — Adjuntos                         |      5 | `NOT RUN`      |
| HU-3.3 — Vencimiento                      |      5 | `NOT RUN`      |
| HU-3.4 — Notas discriminadas por origen   |      5 | `NOT RUN`      |
| HU-2.2 — Gestión de planta / reasignación |      6 | `NOT RUN`      |
| E2E-B-01 — Camino feliz                   |      1 | `NOT RUN`      |
| E2E negativos                             |      4 | `NOT RUN`      |
| **Total Fase B**                          | **36** | **`NOT RUN`**  |

---

# 13. Evidencias

Las evidencias correspondientes a esta fase deberán almacenarse en:

```text
qa-analyst/testing/evidence/img/fase-b/
```

La evidencia de cada caso deberá vincularse posteriormente desde la columna correspondiente de la matriz general y/o desde este documento.

Ejemplo:

```text
qa-analyst/testing/evidence/img/fase-b/TC-B-3.1-02.png
```

Durante la ejecución pueden utilizarse, según corresponda:

* capturas de pantalla;
* evidencia de navegador;
* respuestas de API;
* registros de estados;
* evidencia de persistencia;
* evidencia de historial;
* evidencia de defectos.

---

# 14. Registro de ejecución

Esta sección se completará durante la ejecución real de Fase B.

| Fecha | Caso / rango | Resultado | Evidencia | Issue | PR | Observaciones |
| ----- | ------------ | --------- | --------- | ----- | -- | ------------- |
| —     | —            | `NOT RUN` | —         | —     | —  | —             |

---

# 15. Criterios de cierre de Fase B

La fase deberá considerar, como mínimo:

* ejecución de los casos definidos;
* identificación de casos `PASS`, `FAIL` o `BLOCKED`;
* evidencia asociada;
* registro de defectos detectados;
* trazabilidad de los defectos con sus Issues y PR;
* validación del flujo completo de producción;
* verificación del ingreso de la OT a `EN_CALIDAD` al finalizar la última fase.

Un caso `FAIL` no deberá eliminarse aunque posteriormente sea corregido.

La corrección deberá generar una nueva validación conservando el antecedente de la detección original.

---

# 16. Trazabilidad

La Fase B se relaciona con:

```text
Fase A
  ↓
OT generada
  ↓
Fase B — Producción
  ├── HU-3.1
  ├── HU-3.2
  ├── HU-3.3
  ├── HU-3.4
  └── HU-2.2
  ↓
OT EN_CALIDAD
  ↓
Fase C — Calidad y cierre
```

La ejecución deberá mantener relación con:

* User Story;
* caso de prueba;
* evidencia;
* Issue;
* PR;
* decisión funcional correspondiente.

---

# 17. Estado inicial

Al incorporar este documento al repositorio:

```text
FASE B
Estado: NOT RUN
Casos diseñados: 36
Casos ejecutados: 0
PASS: 0
FAIL: 0
BLOCKED: 0
```

Este documento representa el **diseño inicial de pruebas de Fase B** y no constituye evidencia de ejecución ni de validación funcional del sistema.
