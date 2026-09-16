# Plan de Trabajo QA — QualityTrack

**Proyecto:** QualityTrack
**Área:** QA Funcional / Testing
**Documento:** Plan de Trabajo QA
**Versión:** 1.0
**Fecha:** 08/09/2026
**Estado:** Pendiente de aprobación PM

---

## 1. Objetivo

Definir el plan de trabajo de QA para el proyecto QualityTrack, estableciendo las actividades de análisis, diseño, ejecución, validación, documentación y cierre de pruebas durante las cinco semanas de desarrollo.

El plan busca asegurar la trazabilidad entre:

- Requisitos funcionales.
- User Stories (HU).
- Criterios de aceptación.
- Casos de prueba.
- Ejecución.
- Evidencias.
- Defectos.
- Resultado final.

QA participa desde el análisis y preparación de las pruebas hasta la validación funcional de las funcionalidades disponibles, sin intervenir en las responsabilidades de desarrollo Backend, Frontend o gestión del proyecto.

---

## 2. Alcance

El alcance de QA comprende las **17 User Stories activas definidas en el Backlog v2** de QualityTrack.

Se excluye explícitamente:

- **HU-5.2**, eliminada en la versión 2 del Backlog.
- Funcionalidades declaradas fuera del alcance del MVP.
- Funcionalidades que no se encuentren implementadas o disponibles para prueba.

El alcance contempla pruebas:

- Funcionales.
- Negativas.
- De integración.
- De API.
- End-to-End.
- De regresión.

La ejecución se realizará de acuerdo con la disponibilidad real de las funcionalidades y con el cierre de cada fase del cronograma.

---

## 3. Fuentes de referencia

El trabajo de QA se basa en los documentos vigentes del proyecto:

### Documentación funcional

- `docs/funcional/QualityTrack-PRD-v2.md`
- `docs/funcional/QualityTrack-Backlog-v2.md`
- `docs/funcional/QualityTrack-Cambios-PRD-Backlog.md`

### Documentación de datos

- `docs/datos/QualityTrack-Esquema-Base-Datos-v2.md`

### Documentación Backend

- `docs/backend/Especificacion-Tecnica.md`
- `docs/backend/Plan-Trabajo.md`

### Documentación Frontend

- `docs/frontend/Especificacion-Tecnica.md`
- `docs/frontend/Plan-Trabajo.md`
- `docs/frontend/Service-Blueprint.md`

### Documentación QA

- `docs/qa/Analisis-Funcional.md`
- `docs/qa/Plan-Trabajo.md`

### Cronograma del proyecto

El cronograma de desarrollo definido por PM constituye la referencia para determinar cuándo una funcionalidad debe encontrarse disponible para ejecución.

---

## 4. Estrategia de trabajo QA

La estrategia de QA seguirá el siguiente flujo:

**Detectar → Analizar → Documentar → Comunicar → Validar**

### Detectar

Identificar comportamientos, reglas, dependencias, inconsistencias o riesgos que puedan afectar el ciclo funcional.

### Analizar

Determinar el impacto funcional de cada situación detectada y relacionarla con:

- User Story.
- Criterio de aceptación.
- Flujo funcional.
- Rol involucrado.
- Dependencias.

### Documentar

Registrar la información necesaria para permitir su trazabilidad y posterior validación.

### Comunicar

Informar los hallazgos al equipo correspondiente mediante los canales definidos para el proyecto.

### Validar

Verificar posteriormente el comportamiento de la funcionalidad cuando se encuentre disponible para prueba.

QA no modifica directamente implementaciones de Backend o Frontend ni redefine decisiones funcionales establecidas por PM.

---

## 5. Cronograma general QA

El trabajo de QA se organiza en cinco semanas, alineadas con el cronograma general del proyecto.

| Semana | Actividad QA | Estado |
|---|---|---|
| S1 | Revisión y revalidación del análisis funcional | Completado |
| S2 | Diseño de casos de prueba | Proyectado |
| S3 | Ejecución funcional e integración | Proyectado |
| S4 | Pruebas E2E, negativas y regresión | Proyectado |
| S5 | Regresión final, evidencias y cierre | Proyectado |

La planificación de QA se encuentra condicionada por la disponibilidad efectiva de las funcionalidades.

El calendario no implica que una prueba deba ejecutarse automáticamente por encontrarse en una semana determinada.

---

## 6. Semana 1 — Análisis funcional

Durante S1 se realizó la revisión y revalidación del análisis funcional contra:

- PRD v2.
- Backlog v2.
- Esquema de Base de Datos v2.
- Documentación Backend vigente.
- Documentación Frontend vigente.

La revalidación contempló las 17 User Stories activas.

### Resultado

- Análisis funcional actualizado.
- HU-5.2 eliminada.
- Épica 5 ajustada a tres User Stories activas.
- Estados alineados con V2.
- Criterios de aceptación revisados.
- Reglas de negocio documentadas.
- Riesgos y dependencias identificados.

**Estado:** Completado.

---

## 7. Semana 2 — Diseño de casos de prueba

Durante S2 se realizará el diseño de los casos de prueba correspondientes a las 17 User Stories activas.

El objetivo de esta etapa es dejar preparada la cobertura de pruebas antes de la ejecución.

Cada caso deberá estar relacionado con:

- HU.
- Épica.
- Criterio de aceptación.
- Escenario.
- Rol.
- Datos.
- Precondiciones.
- Pasos.
- Resultado esperado.
- Prioridad.
- Tipo de prueba.

### Importante

Durante S2 se diseñan los casos.

La existencia de un caso de prueba no implica que la funcionalidad ya esté disponible ni que deba ejecutarse inmediatamente.

---

## 8. Semana 3 — Ejecución funcional e integración

Durante S3 se realizará la ejecución de las funcionalidades correspondientes a las fases A y B del cronograma, siempre que se encuentren disponibles para QA.

### Fase A — Comercial

Se validará principalmente el flujo:

**Solicitud → Cotización → Aprobación → Generación de OT**

Incluyendo las User Stories:

- HU-1.1
- HU-5.1
- HU-2.1
- HU-1.3

### Fase B — Producción

Se validará principalmente el flujo:

**OT → Fases → Ejecución → Reasignación → Finalización**

Incluyendo:

- HU-3.1
- HU-3.2
- HU-3.3
- HU-3.4
- HU-2.2

### Objetivo

Verificar que las funcionalidades individuales funcionen correctamente y que la integración entre componentes mantenga las reglas funcionales definidas.

---

## 9. Semana 4 — E2E, negativos y regresión

Durante S4 se realizará la validación de la fase C del cronograma.

El foco principal será comprobar el cierre funcional del proceso:

**Producción → Calidad → No conformidad / Conformidad → Retrabajo / Despacho**

Se contemplarán:

- HU-4.1
- HU-4.2
- HU-4.3
- HU-2.3
- HU-1.4

### Pruebas End-to-End

Se comprobará el recorrido completo de una orden de trabajo, incluyendo escenarios de:

- Conformidad.
- No conformidad.
- Retrabajo.
- Retorno a producción.
- Nueva validación.
- Despacho.
- Entrega.

### Pruebas negativas

Se verificarán especialmente:

- Datos obligatorios.
- Estados inválidos.
- Acciones no permitidas por rol.
- Transiciones no permitidas.
- Reglas de checklist.
- Observaciones obligatorias.
- Restricciones de entrega.
- Reasignaciones.
- Datos inconsistentes.

---

## 10. Semana 5 — Regresión final y cierre

Durante S5 se realizará la regresión final del sistema sobre las funcionalidades que hayan sido implementadas e integradas.

También se validarán las funcionalidades correspondientes a la fase D:

- HU-1.2
- HU-5.3
- HU-5.4

El objetivo será verificar que:

- Las correcciones realizadas no hayan introducido regresiones.
- Los flujos principales continúen funcionando.
- Las funcionalidades críticas se encuentren disponibles.
- Las User Stories comprometidas tengan cobertura.
- Los defectos críticos estén resueltos o correctamente documentados.
- Las evidencias se encuentren organizadas.
- La trazabilidad se encuentre completa.

El cierre incluirá la documentación del resultado final de QA.

---

## 11. Matriz de casos de prueba

La matriz de casos de prueba será el principal instrumento de seguimiento y trazabilidad.

Cada caso deberá contener, como mínimo:

| Campo | Descripción |
|---|---|
| ID | Identificador único del caso |
| HU | User Story relacionada |
| Épica | Épica correspondiente |
| Criterio de aceptación | CA validado |
| Escenario | Situación a comprobar |
| Tipo de prueba | Funcional, negativa, API, integración, E2E o regresión |
| Rol | Rol que ejecuta la acción |
| Precondiciones | Condiciones necesarias |
| Datos de prueba | Datos utilizados |
| Pasos | Secuencia de ejecución |
| Resultado esperado | Comportamiento esperado |
| Prioridad | Alta, media o baja |
| Semana | Semana planificada |
| Ambiente | Ambiente utilizado |
| Resultado | PASS / FAIL / BLOCKED / NOT RUN |
| Evidencia | Captura, respuesta API u otra evidencia |
| Defecto | Issue relacionado, si corresponde |
| Observaciones | Información adicional |

La matriz deberá permitir identificar rápidamente qué criterio de aceptación se encuentra cubierto por cada caso.

---

## 12. Tipos de pruebas

La estrategia contempla los siguientes tipos de prueba.

### Pruebas funcionales

Validan que la funcionalidad cumpla con los requisitos y criterios de aceptación definidos.

### Pruebas negativas

Validan el comportamiento ante datos inválidos, acciones no permitidas o condiciones de error.

### Pruebas de API

Validan contratos Backend mediante endpoints disponibles, incluyendo:

- Método.
- Parámetros.
- Body.
- Autenticación.
- Autorización.
- Respuesta.
- Código HTTP.
- Mensajes de error.

### Pruebas de integración

Validan la comunicación entre componentes y la correcta propagación de datos y estados.

### Pruebas End-to-End

Validan el flujo completo del negocio desde el inicio hasta la finalización.

### Pruebas de regresión

Validan que los cambios o correcciones no afecten funcionalidades previamente validadas.

---

## 13. Ambientes requeridos

Para realizar las pruebas será necesario contar con información actualizada de los ambientes disponibles.

### Frontend

Se deberá disponer de:

- URL del ambiente.
- Versión o commit desplegado.
- Acceso a la aplicación.
- Funcionalidades disponibles.
- Información sobre ambiente de prueba o preview.

### Backend

Se deberá disponer de:

- Base URL.
- Endpoints disponibles.
- Swagger/OpenAPI, si corresponde.
- Mecanismo de autenticación.
- Usuarios de prueba.
- Roles disponibles.
- Información sobre versión desplegada.

### Base de datos

Se deberá disponer de:

- Ambiente de datos de prueba.
- Datos necesarios para ejecución.
- Separación respecto de datos productivos.
- Información necesaria para validar resultados cuando corresponda.

Las URLs y credenciales definitivas quedan sujetas a la disponibilidad y configuración del equipo correspondiente.

QA no define ni administra la infraestructura de despliegue.

---

## 14. Usuarios y datos de prueba

Las pruebas deberán contemplar los cinco roles funcionales definidos en el PRD:

- Vendedor.
- Jefe de producción.
- Operario.
- Calidad.
- Gerente.

Los datos de prueba deberán permitir cubrir los diferentes flujos del negocio.

### Datos requeridos

Según cada User Story podrán requerirse:

- Clientes.
- Solicitudes.
- Documentos.
- Cotizaciones.
- Órdenes de trabajo.
- Fases.
- Operarios.
- Reasignaciones.
- Adjuntos.
- Notas.
- Checklists.
- No conformidades.
- Retrabajos.
- Despachos.
- Entregas.

No se inventarán usuarios, credenciales, URLs ni datos técnicos que todavía no hayan sido proporcionados por el equipo.

Cuando una dependencia no esté disponible, el caso podrá quedar como **NOT RUN** o **BLOCKED**, según corresponda.

---

## 15. Gestión de resultados

Cada caso ejecutado tendrá uno de los siguientes resultados:

### PASS

El comportamiento observado coincide con el resultado esperado.

### FAIL

El comportamiento observado no coincide con el resultado esperado.

En este caso deberá registrarse el defecto correspondiente cuando aplique.

### BLOCKED

La ejecución no puede realizarse debido a una dependencia, bloqueo técnico, funcional o de ambiente.

### NOT RUN

El caso todavía no fue ejecutado.

Este estado se utilizará especialmente cuando la funcionalidad aún no esté disponible para QA.

---

## 16. Gestión de defectos

Cuando una prueba resulte FAIL, se analizará si corresponde registrar un defecto.

El defecto deberá contener, como mínimo:

- Título.
- User Story relacionada.
- Descripción.
- Precondiciones.
- Pasos para reproducir.
- Resultado esperado.
- Resultado actual.
- Evidencia.
- Severidad/prioridad según criterio del proyecto.
- Ambiente.
- Información adicional relevante.

La trazabilidad deberá permitir relacionar:

**HU → Caso de prueba → Defecto → Corrección → Reejecución**

QA documenta y comunica el defecto.

La corrección del defecto corresponde al equipo responsable de la implementación.

---

## 17. Evidencias

Las evidencias deberán respaldar los resultados obtenidos durante la ejecución.

Podrán incluir:

- Capturas de pantalla.
- Videos o GIF cuando sea necesario.
- Respuestas de API.
- Payloads.
- Logs relevantes.
- Datos observados en la aplicación.
- Resultado de una ejecución.
- Referencia al commit o versión probada.

Las evidencias deberán permitir comprender qué se probó y qué resultado se obtuvo.

Se priorizará la evidencia de:

- Flujos críticos.
- Casos FAIL.
- Casos BLOCKED.
- Correcciones revalidadas.
- Escenarios E2E.
- Reglas de negocio críticas.

---

## 18. Dependencias QA

La ejecución de QA depende de la disponibilidad de componentes desarrollados por otros equipos.

Entre las principales dependencias se encuentran:

### Frontend

- Pantallas implementadas.
- Navegación.
- Formularios.
- Componentes funcionales.
- Integración con Backend.
- Ambiente disponible.

### Backend

- Endpoints implementados.
- Autenticación.
- Autorización.
- Validaciones.
- Persistencia.
- Integración con base de datos.
- Ambiente disponible.

### Base de datos

- Esquema implementado.
- Datos de prueba.
- Persistencia funcional.

### Proyecto

- User Stories disponibles.
- Criterios de aceptación definidos.
- Funcionalidad marcada como disponible.
- Ambiente accesible.

Una dependencia pendiente no se considerará un defecto de QA por sí misma.

Se documentará como bloqueo o dependencia según corresponda.

---

## 19. Criterios de entrada

Un caso de prueba podrá pasar a ejecución cuando se cumplan las condiciones necesarias.

Entre ellas:

- User Story implementada.
- Criterios de aceptación disponibles.
- Funcionalidad accesible.
- Ambiente disponible.
- Datos necesarios disponibles.
- Usuario/rol disponible.
- Endpoint disponible cuando corresponda.
- Dependencias necesarias resueltas.

La existencia del caso de prueba por sí sola no constituye criterio suficiente para su ejecución.

---

## 20. Criterios de salida

Una User Story podrá considerarse validada por QA cuando:

- Los casos definidos hayan sido ejecutados según el alcance.
- Los criterios de aceptación estén cubiertos.
- Los resultados hayan sido registrados.
- Las evidencias relevantes estén disponibles.
- Los defectos encontrados estén documentados.
- Los defectos críticos estén resueltos o tengan una decisión explícita del proyecto.
- Las pruebas de regresión necesarias hayan sido ejecutadas.

El estado final será comunicado al equipo y quedará registrado en la documentación correspondiente.

---

## 21. Trazabilidad

La trazabilidad QA seguirá la siguiente relación:

**PRD → Épica → HU → Criterio de aceptación → Caso de prueba → Ejecución → Evidencia → Defecto → Revalidación**

Esta estructura permitirá verificar que cada requisito funcional tenga cobertura de prueba.

### Ejemplo

```text
HU-4.2
   ↓
CA-4.2
   ↓
CP-4.2-01
   ↓
Ejecución
   ↓
PASS / FAIL / BLOCKED
   ↓
Evidencia
   ↓
Defecto, si corresponde
   ↓
Revalidación
```
La matriz será utilizada como herramienta principal para mantener esta trazabilidad.

---

## 22. Distribución de trabajo QA

La distribución de los casos de prueba entre integrantes de QA será definida cuando corresponda, de acuerdo con la organización del equipo y aprobación de PM.

Cuando participen varios testers, se buscará:

- Evitar duplicación innecesaria.
- Mantener la trazabilidad.
- Distribuir la carga de forma equilibrada.
- Definir claramente el responsable de cada caso.
- Mantener un criterio común de ejecución y registro.

La asignación definitiva deberá quedar documentada antes de la ejecución correspondiente.

---

## 23. Seguimiento semanal

El seguimiento de QA se realizará en coordinación con el estado real del proyecto.

Cada semana se podrá registrar:

- User Stories disponibles.
- User Stories pendientes.
- Casos diseñados.
- Casos ejecutados.
- Casos PASS.
- Casos FAIL.
- Casos BLOCKED.
- Casos NOT RUN.
- Defectos abiertos.
- Defectos corregidos.
- Defectos pendientes de revalidación.
- Dependencias.
- Riesgos.
- Evidencias.

El seguimiento se realizará tomando como referencia el estado de GitHub y la disponibilidad efectiva de las funcionalidades.

---

## 24. Principio de ejecución

El cronograma de QA establece una planificación, pero la ejecución está condicionada por la disponibilidad real del producto.

Por lo tanto:

> **Un caso de prueba no se ejecuta simplemente porque corresponde a una determinada semana. Se ejecuta cuando la funcionalidad se encuentra disponible y cumple los criterios de entrada necesarios.**

El criterio de ejecución será:

**Funcionalidad disponible → Dependencias resueltas → Ambiente disponible → Datos disponibles → Ejecución**

Esto permite mantener alineado el trabajo de QA con el avance real del proyecto y evitar ejecuciones prematuras.

---

## 25. Estado del plan

### Semana 1

**Estado:** Completado.

Se realizó la revalidación del análisis funcional de las 17 User Stories activas.

### Semana 2

**Estado:** Proyectado.

Se realizará el diseño de los casos de prueba correspondientes a las 17 User Stories.

### Semana 3

**Estado:** Proyectado.

Se realizará la ejecución funcional e integración de las fases disponibles del proyecto.

### Semana 4

**Estado:** Proyectado.

Se realizarán pruebas E2E, negativas y regresión sobre las funcionalidades correspondientes.

### Semana 5

**Estado:** Proyectado.

Se realizará la regresión final, recopilación de evidencias y preparación del cierre QA.

---

## 26. Aprobación

El presente Plan de Trabajo QA queda sujeto a revisión y aprobación de PM antes de la distribución definitiva de los casos de prueba y del inicio de las ejecuciones correspondientes.

La aprobación permitirá:

- Confirmar el alcance.
- Validar el cronograma.
- Confirmar la estrategia de ejecución.
- Definir la distribución de casos cuando corresponda.
- Alinear QA con el cronograma general del proyecto.

### Estado actual

**Pendiente de aprobación PM.**

---

## Control de versiones

| Versión | Fecha | Descripción | Responsable |
|---|---|---|---|
| 1.0 | 08/09/2026 | Creación del Plan de Trabajo QA alineado al PRD v2, Backlog v2 y cronograma vigente | QA |