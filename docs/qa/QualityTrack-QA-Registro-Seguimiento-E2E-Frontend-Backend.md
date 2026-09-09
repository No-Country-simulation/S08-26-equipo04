# QA — Registro de seguimiento E2E y cruces Frontend ↔ Backend

**Fecha:** 8 de septiembre de 2026
**Proyecto:** QualityTrack — MVP
**Referencia:** Documentación V2

## Objetivo

Como continuidad del informe preventivo de inconsistencias presentado anteriormente, se deja registrado el seguimiento realizado desde QA sobre el **flujo E2E y la interacción entre Frontend y Backend**, tomando como referencia las definiciones V2 vigentes.

La finalidad de este registro es dejar constancia de los puntos que QA identifica como posibles riesgos de integración y que requieren seguimiento o definición entre los equipos.

QA no interviene en la decisión de cuál implementación técnica debe adoptarse ni modifica los contratos de otros equipos. El alcance de este seguimiento es **detectar, documentar y comunicar riesgos que puedan afectar el funcionamiento del sistema como un flujo integrado**.

---

## Situación observada

Luego de la revisión y alineación realizada entre Frontend y Backend, se observa que continúan apareciendo puntos que, considerados individualmente, pueden parecer ajustes menores, pero que desde una perspectiva **E2E** pueden afectar la continuidad del flujo.

Entre ellos se encuentran:

* funcionalidades necesarias para que un rol pueda avanzar hacia la siguiente etapa del proceso;
* permisos de acceso asociados a determinadas funcionalidades;
* correspondencia entre endpoints y necesidades de navegación del Frontend;
* identificación de recursos necesarios para continuar un flujo;
* estados y transiciones del proceso;
* información requerida para mantener la trazabilidad de una OT.

El hecho de que las rutas, métodos, requests y responses estén alineados documentalmente no garantiza por sí solo que el **flujo completo pueda recorrerse de punta a punta**.

---

## Cruce QA de los dos entornos

Desde QA se considera necesario continuar observando la correspondencia entre:

| V2 / Proceso              | Frontend                                  | Backend                               | Riesgo E2E               |
| ------------------------- | ----------------------------------------- | ------------------------------------- | ------------------------ |
| Solicitud → Cotización    | Pantallas y datos necesarios para avanzar | Endpoints y estados de Solicitud      | Continuidad del flujo    |
| Cotización → Aprobación   | Acciones disponibles para Vendedor        | Endpoints de aprobar / no aprobar     | Transición de estado     |
| Aprobación → OT           | Visualización de la OT generada           | Generación automática de OT           | Integración              |
| OT → Producción           | Visualización de fases/tareas             | OT_FASE y ejecuciones                 | Continuidad operativa    |
| Catálogo de fases         | Jefe necesita consultar fases             | Permisos de `GET /api/fases`          | Acceso funcional         |
| Producción → Calidad      | Estado y datos de la OT                   | Pase automático a Calidad             | Transición E2E           |
| Calidad → Retrabajo       | Visualización del resultado               | Nuevas ejecuciones y trazabilidad     | Integridad del historial |
| OT → Expediente           | Vendedor necesita acceder a sus OTs       | Endpoint de listado + expediente      | Navegación E2E           |
| Expediente → trazabilidad | Visualización del historial               | Reasignaciones, ejecuciones y calidad | Integridad de datos      |

---

## Punto de atención actual

Un ejemplo concreto surgido durante la alineación es la necesidad de disponer de un **listado de OTs para el Vendedor** antes de acceder al expediente.

Esto muestra una diferencia importante entre validar un endpoint de manera aislada y validar el flujo completo:

```text
Vendedor
   ↓
Listado de OTs
   ↓
Selección de OT
   ↓
Expediente
   ↓
Trazabilidad completa
```

Si falta un elemento intermedio, el endpoint final puede existir y estar correctamente documentado, pero el usuario igualmente puede quedar imposibilitado de completar el recorrido.

También se identificó la necesidad de contemplar el acceso del **Jefe de Producción al catálogo de fases**, dado que dicho catálogo forma parte de la construcción de las cotizaciones y, por lo tanto, tiene impacto sobre el flujo posterior de generación y ejecución de la OT.

---

## Seguimiento QA para las próximas semanas

Considerando que el MVP dispone de cinco semanas de desarrollo, QA continuará realizando el seguimiento desde una perspectiva transversal:

**Contrato → Datos → Backend → Frontend → Integración → Flujo E2E**

El objetivo será detectar tempranamente cualquier diferencia que pueda transformarse posteriormente en un defecto de integración, bloqueo de flujo o pérdida de trazabilidad.

Este registro queda como **constancia del seguimiento preventivo realizado desde QA** y podrá utilizarse como referencia durante las pruebas de integración, E2E y regresión del MVP.