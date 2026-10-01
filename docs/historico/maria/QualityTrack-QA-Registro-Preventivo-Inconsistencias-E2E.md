# QA — Nota preventiva de riesgos e inconsistencias E2E para el MVP

## Objetivo

Como parte del seguimiento de QA y del análisis del flujo **End-to-End (E2E)** de QualityTrack, se identificaron algunos puntos que sería conveniente tener presentes durante las próximas cinco semanas de desarrollo.

El objetivo de esta nota **no es determinar qué equipo o documento tiene razón**, sino anticipar posibles situaciones de integración que podrían generar retrabajo, inconsistencias o defectos cuando Frontend, Backend y Base de Datos comiencen a integrarse.

La intención es que estos puntos puedan revisarse y definirse oportunamente, antes de que lleguen a etapas avanzadas del desarrollo.

---

## 1. Enfoque QA preventivo

Dado que el MVP tiene un plazo de cinco semanas, desde QA se considera conveniente validar progresivamente no solamente cada funcionalidad de manera aislada, sino también su comportamiento dentro del flujo completo.

El análisis se plantea sobre la siguiente perspectiva:

```text
Requerimientos V2
       ↓
Reglas de negocio
       ↓
Modelo de datos
       ↓
Contrato API
       ↓
Frontend
       ↓
Integración
       ↓
Flujo E2E
       ↓
Validación QA
```

Una diferencia en cualquiera de estos niveles puede no generar un error inmediato, pero sí manifestarse posteriormente como un problema de integración.

Por este motivo, se propone identificar tempranamente los puntos que puedan requerir confirmación o alineación.

---

# 2. Principales áreas de riesgo identificadas

## 2.1 Estados funcionales

Los estados tienen impacto transversal porque son utilizados por Base de Datos, Backend, Frontend, reglas de negocio y pruebas.

Por ejemplo, una diferencia en la denominación de un estado puede provocar que:

* Backend persista un valor.
* Frontend espere otro.
* QA no pueda validar correctamente la transición.
* Una condición de negocio no se ejecute como estaba previsto.

Por lo tanto, conviene mantener una única referencia para los estados definidos en V2 y evitar redefiniciones en las distintas capas.

**Riesgo:** Alto.

**Momento recomendado de validación:** Semana 1 y durante cada integración.

---

## 2.2 Contrato API Frontend ↔ Backend

Es importante validar progresivamente que exista correspondencia entre:

* rutas;
* métodos HTTP;
* nombres de propiedades;
* tipos de datos;
* campos obligatorios;
* estructuras de request;
* estructuras de response;
* códigos HTTP;
* permisos;
* estados devueltos.

Una API puede funcionar correctamente desde el punto de vista técnico y, al mismo tiempo, resultar incompatible con la forma en que Frontend necesita consumirla.

**Riesgo:** Alto.

**Momento recomendado de validación:** desde Semana 1, antes de las integraciones de cada funcionalidad.

---

## 2.3 Roles y permisos

Los permisos forman parte de las reglas funcionales del sistema y deben mantenerse consistentes entre Frontend y Backend.

Se recomienda validar tanto:

* qué acciones puede visualizar un usuario;
* como qué acciones puede realmente ejecutar contra la API.

Esto es especialmente importante en funcionalidades como:

* solicitudes;
* cotizaciones;
* reasignaciones;
* notas;
* calidad;
* despacho;
* entrega;
* expediente.

**Riesgo:** Alto.

**Momento recomendado de validación:** desde Semana 1 y durante cada módulo.

---

## 2.4 Transiciones del flujo E2E

El sistema no está compuesto únicamente por funcionalidades independientes. Las operaciones forman una cadena de negocio.

Ejemplo:

```text
Solicitud
   ↓
Cotización
   ↓
Aprobación
   ↓
Orden de Trabajo
   ↓
Fases de Producción
   ↓
Calidad
   ↓
Conforme / No conforme
   ↓
Retrabajo (si corresponde)
   ↓
Despacho
   ↓
Entrega
```

Por ello, cada funcionalidad debería validarse también considerando:

> ¿Qué información genera y qué necesita la siguiente etapa?

Una operación que funciona individualmente puede generar problemas si deja información incompleta, utiliza un estado diferente o no conserva las relaciones necesarias para continuar el proceso.

**Riesgo:** Alto.

**Momento recomendado de validación:** desde que existan dos módulos integrables.

---

# 3. Puntos que conviene mantener bajo observación

Durante la revisión del plan de trabajo y su relación con las definiciones V2 aparecen algunos puntos que sería conveniente confirmar durante la implementación.

### Estados de cotización

Mantener consistente la denominación del estado de una cotización que no fue aprobada con la definición vigente del modelo V2.

El objetivo es evitar que diferentes capas manejen nombres distintos para representar la misma situación.

---

### Cotización y acciones de aprobación/rechazo

Conviene mantener claramente diferenciadas las operaciones de modificación de datos de las acciones de negocio de:

* aprobar;
* no aprobar.

Esto permitirá que Frontend, Backend y QA tengan claro qué operación modifica información y cuál provoca una transición de negocio.

---

### Notas

Conviene mantener claramente definido:

* quién puede consultar;
* quién puede crear;
* cuál es el origen de la nota;
* a qué elemento del proceso pertenece.

Esto es importante para evitar diferencias entre permisos visuales del Frontend y permisos efectivos del Backend.

---

### Checklist de Calidad

La validación de Calidad involucra los puntos individuales del checklist y el resultado general.

Conviene mantener claramente diferenciados:

```text
Puntos del checklist
       +
Resultado general de Calidad
```

Esto facilita tanto la persistencia como la validación funcional y la visualización posterior.

---

### Expediente de la OT

Conviene confirmar qué identificador utilizarán las operaciones relacionadas con el expediente:

* identificador interno;
* número visible de OT;
* o ambos según el contexto.

La definición anticipada evita inconsistencias entre URL, Frontend, Backend y consultas posteriores.

---

# 4. Retrabajo y trazabilidad

El retrabajo constituye una de las áreas que merece especial atención desde el punto de vista E2E.

El flujo esperado no consiste simplemente en volver a ejecutar una fase, sino en conservar la trazabilidad de lo ocurrido anteriormente.

Por lo tanto, durante la implementación será importante verificar que:

* las ejecuciones anteriores permanezcan registradas;
* las fases que no requieren retrabajo no pierdan su estado;
* las nuevas ejecuciones puedan distinguirse de las anteriores;
* se conserve la información necesaria para reconstruir el historial;
* Calidad pueda determinar qué fases fueron enviadas a retrabajo;
* el expediente final mantenga la trazabilidad completa.

**Riesgo:** Alto.

---

# 5. Integridad de la información entre módulos

Otro riesgo importante aparece cuando una funcionalidad genera información que será utilizada posteriormente.

Ejemplos:

```text
Solicitud
   ↓
datos utilizados por Cotización

Cotización
   ↓
datos utilizados para generar OT

OT
   ↓
datos utilizados por Producción

Producción
   ↓
datos utilizados por Calidad

Calidad
   ↓
datos utilizados por Retrabajo / Despacho / Expediente
```

Desde QA será importante comprobar que la información no solamente exista, sino que sea **consistente y trazable durante todo el recorrido**.

---

# 6. Riesgo de decisiones tardías

Algunas definiciones que todavía puedan encontrarse abiertas o ambiguas representan un riesgo mayor cuanto más tarde se resuelvan.

Una decisión tomada en:

```text
Semana 1
```

puede implicar solamente un ajuste documental.

La misma decisión tomada en:

```text
Semana 4
```

puede implicar cambios simultáneos en:

* Base de Datos;
* Backend;
* Frontend;
* pruebas;
* datos de prueba;
* documentación;
* integración.

Por este motivo, cuando aparezca una definición que afecte transversalmente al sistema, sería conveniente resolverla antes de avanzar demasiado con su implementación.

---

# 7. Propuesta de seguimiento QA durante las cinco semanas

Para reducir riesgos de integración, QA propone acompañar cada semana con una validación progresiva:

| Semana | Foco preventivo                                                           |
| ------ | ------------------------------------------------------------------------- |
| **1**  | Contratos, estados, roles, solicitudes, documentos, fases y autenticación |
| **2**  | Cotización → aprobación → generación de OT                                |
| **3**  | Producción → ejecución de fases → reasignación → trazabilidad             |
| **4**  | Calidad → checklist → conformidad → no conformidad → retrabajo → despacho |
| **5**  | Expediente → dashboards → flujo E2E completo → regresión                  |

La intención es **no concentrar toda la validación en la última semana**.

---

# 8. Criterio de priorización

No todos los hallazgos tendrán el mismo impacto.

Desde QA se propone priorizar especialmente aquellos que puedan:

### 🔴 Impactar el flujo completo

Por ejemplo:

* estados incompatibles;
* contratos API incompatibles;
* permisos incorrectos;
* pérdida de trazabilidad;
* datos que impidan continuar el flujo.

### 🟠 Generar problemas de integración

Por ejemplo:

* diferencias de nombres;
* estructuras de request/response;
* identificadores;
* códigos HTTP;
* campos opcionales/obligatorios.

### 🟡 Generar ajustes menores

Por ejemplo:

* diferencias de presentación;
* información secundaria;
* aspectos que no bloqueen el flujo principal.

---

# 9. Conclusión

Esta nota se plantea como una **alerta preventiva de QA**, especialmente considerando que el MVP debe completarse en un período reducido de cinco semanas.

El objetivo no es agregar burocracia ni establecer responsabilidades sobre las definiciones de cada equipo.

El objetivo es detectar tempranamente aquellos puntos que, por su impacto transversal, podrían convertirse posteriormente en:

* bugs de integración;
* retrabajo;
* inconsistencias entre Frontend y Backend;
* problemas de datos;
* fallos en los permisos;
* errores de transición;
* pérdida de trazabilidad;
* o bloqueos del flujo E2E.

La propuesta es que estos puntos se utilicen como **checkpoints de alineación durante el desarrollo**, permitiendo que las decisiones necesarias se tomen lo antes posible y que QA pueda validar progresivamente el sistema completo a medida que las funcionalidades estén disponibles.

> **QA no busca definir cómo debe implementarse cada componente, sino verificar que las decisiones de implementación permitan que el producto funcione como un sistema integrado y que el flujo de negocio pueda recorrerse de punta a punta.**
