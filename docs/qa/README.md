# QualityTrack — QA Analyst

## 1. Propósito

La carpeta `docs/qa/` contiene la estructura organizada para la documentación, planificación, diseño y ejecución de QA Funcional y Testing End-to-End del proyecto **QualityTrack**.

Su objetivo es mantener en un único espacio la documentación QA actual, los casos de prueba por fase, la planificación de trabajo, el seguimiento E2E y las evidencias generadas durante las ejecuciones.

Esta estructura también permite mantener la trazabilidad entre:

* requisitos funcionales;
* User Stories;
* criterios de aceptación;
* casos de prueba;
* ejecuciones;
* evidencias;
* Issues;
* Pull Requests;
* correcciones y regresiones.

---

## 2. Estructura actual

```text
docs/qa/
├── README.md
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

---

# 3. Documentación QA general

La raíz de `docs/qa/` contiene la documentación transversal de QA del proyecto.

## `Analisis-Funcional.md`

Contiene el análisis funcional realizado desde QA sobre el comportamiento esperado del sistema.

Su función es establecer el marco funcional utilizado para diseñar los casos de prueba y analizar la trazabilidad de las User Stories.

---

## `QualityTrack-Matriz-TestCases-4fases.xlsx`

Matriz en Excel con los casos de las cuatro fases, para filtrar, organizar y seguir la ejecución.

La fuente de verdad de cada caso, su resultado y su evidencia es el archivo `testing/doc/Fase-X.md` de su fase. Cuando cambie un caso, se actualiza primero el `.md` y después el Excel.

---

## `Plan-Trabajo.md`

Contiene la planificación de trabajo QA y la organización de las actividades previstas para las diferentes fases del MVP.

Permite relacionar:

* fases;
* actividades;
* casos de prueba;
* ejecución;
* seguimiento;
* tareas pendientes.

La planificación se interpreta junto con la disponibilidad real de las funcionalidades para ejecutar las pruebas.

---

## `QualityTrack-QA-Registro-Seguimiento-E2E-Frontend-Backend.md`

Contiene el seguimiento de la trazabilidad entre:

```text
Contrato
   ↓
Datos
   ↓
Backend
   ↓
Frontend
   ↓
Integración
   ↓
E2E
```

Este documento permite registrar y seguir posibles inconsistencias que puedan aparecer durante la integración entre las distintas capas del sistema.

QA utiliza este registro para documentar observaciones, evidencias y defectos detectados durante el proceso de validación.

---

# 4. Testing por fase

La carpeta:

```text
testing/doc/
```

contiene la documentación específica de testing de cada fase del MVP.

Cada archivo mantiene los casos correspondientes a la fase y permite registrar posteriormente los resultados de las ejecuciones.

---

## `Fase-A.md`

Documentación de testing correspondiente a la **Fase A**.

Incluye los casos relacionados con el circuito comercial definido para esta fase y los escenarios E2E correspondientes.

Los casos comienzan en estado:

```text
NOT RUN
```

hasta que se realice la ejecución sobre la implementación disponible.

---

## `Fase-B.md`

Documentación de testing correspondiente a la **Fase B**.

Contiene los casos relacionados con el flujo de producción, incluyendo los escenarios correspondientes al funcionamiento de las fases y su ejecución.

---

## `Fase-C.md`

Documentación de testing correspondiente a la **Fase C**.

Incluye los casos relacionados con:

* Calidad;
* checklist;
* veredicto;
* reprocesos;
* despacho;
* entrega;
* escenarios E2E y negativos.

---

## `Fase-D.md`

Documentación de testing correspondiente a la **Fase D**.

Incluye los casos relacionados con:

* búsqueda de órdenes;
* expediente;
* visibilidad global de planta;
* visibilidad global de Calidad;
* indicadores;
* trazabilidad;
* escenarios E2E y negativos.

---

# 5. Evidencias

Las evidencias visuales se almacenan en:

```text
evidence/img/
```

organizadas por fase:

```text
evidence/
└── img/
    ├── Fase-a/
    ├── Fase-b/
    ├── Fase-c/
    └── Fase-d/
```

Esta ubicación es independiente de `testing/doc/`.

La evidencia debe relacionarse directamente con el caso de prueba ejecutado.

Ejemplos:

```text
TC-A-1.1-01.png
TC-B-3.1-02.png
TC-C-4.2-03.png
TC-D-5.4-07.png
```

En la documentación del caso de prueba se puede utilizar un enlace relativo a la evidencia correspondiente.

Ejemplo:

```markdown
[evidencia](../evidence/img/Fase-a/TC-A-1.1-01.png)
```

> La ruta relativa deberá verificarse según la ubicación del archivo Markdown desde el que se realiza el enlace.

---

# 6. Ejecución de casos

El hecho de que un caso esté documentado no significa que haya sido ejecutado.

Por lo tanto:

```text
Caso diseñado ≠ Caso ejecutado
```

El estado inicial de los casos de prueba es:

```text
NOT RUN
```

Una vez ejecutado, se registra el resultado observado.

### PASS

Se utiliza cuando el comportamiento observado coincide con el resultado esperado.

### FAIL

Se utiliza cuando el comportamiento observado no coincide con el resultado esperado.

Cuando corresponda, el defecto deberá registrarse mediante un Issue de GitHub.

### BLOCKED

Se utiliza cuando la ejecución no puede realizarse debido a una dependencia, bloqueo técnico o condición que impide completar la prueba.

La causa del bloqueo debe quedar documentada.

---

# 7. Evidencia e Issues

Cuando un caso produzca `FAIL`, la documentación QA debe conservar la relación entre:

```text
Caso de prueba
   ↓
Resultado observado
   ↓
Evidencia
   ↓
Issue / Bug
   ↓
PR de corrección
   ↓
Reejecución
```

La evidencia no reemplaza al Issue y el Issue no reemplaza la evidencia.

Cada uno cumple una función diferente dentro de la trazabilidad.

---

# 8. Pull Requests

Los Pull Requests pueden registrarse en las observaciones o comentarios de los casos cuando exista una relación directa con:

* una corrección;
* una modificación funcional;
* una actualización de documentación;
* una solución de un defecto;
* una reejecución.

Ejemplo:

```text
Issue: #198
PR: #205
```

Las referencias históricas a Issues y PRs deben conservarse para permitir reconstruir la evolución de cada caso.

---

# 9. Trazabilidad QA

La trazabilidad general se representa de la siguiente manera:

```text
PRD
 ↓
Backlog
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
Pull Request
 ↓
Reejecución / Regresión
```

Esta relación permite identificar:

* qué requisito se está validando;
* qué caso lo cubre;
* cuándo fue ejecutado;
* cuál fue el resultado;
* qué evidencia respalda el resultado;
* si se detectó un defecto;
* qué corrección se realizó;
* cuál fue el resultado de la reejecución.

---

# 10. Herramientas QA

Según el tipo de validación, el trabajo QA puede utilizar:

* **GitHub** — Issues, Pull Requests, ramas y trazabilidad.
* **Markdown** — documentación funcional y casos de prueba.
* **Excel** — matrices y seguimiento.
* **Postman** — validación de APIs y casos que requieran comprobación directa del backend.
* **Navegadores web** — pruebas funcionales y exploratorias.
* **DevTools** — inspección y diagnóstico de apoyo.
* **Capturas de pantalla** — evidencia visual.
* **Testing End-to-End** — validación del flujo completo.

Las herramientas se utilizan como soporte para la validación y documentación; no modifican por sí mismas el alcance funcional definido por el proyecto.

---

# 11. Criterio de trabajo QA

QA valida el comportamiento observable del sistema frente a los requisitos y reglas funcionales definidos en la documentación oficial del proyecto.

La documentación debe diferenciar claramente entre:

* comportamiento esperado;
* comportamiento observado;
* resultado de la prueba;
* defecto detectado;
* corrección implementada;
* resultado de la reejecución.

Cuando se detecta una diferencia entre el comportamiento esperado y el observado, debe documentarse y trazarse mediante la evidencia correspondiente.

---

# 12. Conservación del histórico

La organización de `docs/qa/` no elimina ni reemplaza la documentación QA histórica. La documentación anterior a esta estructura (matriz de la Fase A en Markdown y en Excel, y el registro preventivo de inconsistencias E2E) está en `docs/historico/maria/`.

En particular, deben conservarse las referencias relacionadas con:

* matrices anteriores;
* versiones archivadas;
* casos de prueba históricos;
* Issues;
* Pull Requests;
* defectos detectados;
* decisiones funcionales;
* correcciones;
* ejecuciones anteriores.

La nueva estructura organiza el trabajo QA actual sin borrar la evolución histórica del proyecto.

---

# 13. Cambios funcionales y trazabilidad

Cuando una regla funcional cambie como consecuencia de una decisión formal del proyecto, la documentación QA debe actualizar los casos afectados manteniendo la trazabilidad del cambio.

Siempre que corresponda, debe poder identificarse:

```text
Regla anterior
     ↓
Decisión / cambio documentado
     ↓
Nueva regla
     ↓
Caso de prueba actualizado
     ↓
Issue / PR relacionado
```

No se deben eliminar silenciosamente referencias históricas que permitan comprender por qué un caso o una regla fue modificada.

---

# 14. Estado de la estructura

La carpeta `docs/qa/` constituye la estructura organizada de trabajo QA para el seguimiento del MVP.

Los casos de prueba que todavía no fueron ejecutados permanecen como:

```text
NOT RUN
```

Esto significa:

> El caso está diseñado y pendiente de ejecución sobre una implementación disponible.

`NOT RUN` no representa:

* PASS;
* FAIL;
* aprobación;
* rechazo;
* ausencia de funcionalidad.

El resultado se determina únicamente después de realizar la ejecución correspondiente.

---

# 15. Principio de trazabilidad

Toda modificación relevante de la documentación QA debe procurar mantener la relación entre:

```text
Requisito
→ Caso
→ Ejecución
→ Evidencia
→ Defecto
→ Corrección
→ Regresión
```

De esta manera, la carpeta `docs/qa/` funciona como espacio organizado para el trabajo QA actual.
