# QualityTrack — Plan de Trabajo Frontend — MVP v1.0

**Proyecto:** QualityTrack
**Programa:** NO-Country · Semana 1 de 5
**Versión:** 2.0
**Fecha:** Septiembre 2026
**Estado:** Plan de trabajo

> **Nota:** Este documento reemplaza y consolida la información de trabajo que se encontraba en `Plan_Distribucion_Tareas_Frontend.md` (distribución de tareas y task cards). Se reestructuró para alinearse con el formato del Sprint Plan del Backend, agregando secciones de dependencias, riesgos y definición de Done.

---

## 1. Objetivo de la Semana 1

Construir la base técnica del Frontend sobre la cual trabajarán ambos desarrolladores durante las 5 semanas del MVP.

Al finalizar la semana debemos tener:

- React + Vite configurado con Tailwind CSS.
- Layout base con Sidebar/Navbar responsivo.
- Sistema de rutas con protección por rol (JWT).
- Design System base (`/src/components/ui`).
- Formulario de Solicitud (HU-1.1) consumiendo API o mock.
- Configuración Global de Fases (HU-5.1) consumiendo API o mock.
- Login funcional con JWT.

---

## 2. Principio de Trabajo

El desarrollo debe seguir esta alineación:

```text
ESPECIFICACIÓN FUNCIONAL (v2)
        ↓
   USER STORIES
        ↓
   BASE DE DATOS (v2)
        ↓
   BACKEND / API
        ↓
    FRONTEND
        ↓
       QA
```

Ningún equipo debe desarrollar su propia interpretación aislada del flujo. La fuente de verdad funcional es el **PRD v2**.

---

## 3. División de Responsabilidades por Perfil

Para minimizar conflictos de merge y avanzar en paralelo, la aplicación se divide por Capas de Dominio / Roles del Sistema:

| Rol        | Responsable | Módulos                                               | Responsabilidades                                                                                                                                                    |
| ---------- | ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend 1 | Alfredo     | Core Architecture, Gerencia, Cotizaciones, Expediente | Estructura base, UI Kit/Design System, vistas de Gerencia (HU-5.1, 5.3, 5.4), Cotizaciones (HU-2.1), Expediente (HU-1.2)                                             |
| Frontend 2 | Alicia      | Operario, Calidad, Despacho, No conformidades         | Flujo reactivo de OT en planta, vistas mobile-first para operarios (HU-3.1 a 3.4), paneles de auditoría (HU-4.1 a 4.3), despacho (HU-1.4), no conformidades (HU-2.3) |

---

## 4. Matriz de Asignación por Semanas (Release Plan)

### SEMANA 1 & 2: SETUP & CIRCUITO COMERCIAL

| FRONTEND 1 (Alfredo)                                                                                      | FRONTEND 2 (Alicia)                                                                                         |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Setup Router, Layout Base & UI Kit (Buttons, Inputs, Modals, Badges).                                     | HU-5.1: Configuración Global de Fases (Catálogo global y asignación de operarios habilitados).              |
| HU-1.1: Formulario "Levantar Pedido" (Solicitud + Drag&Drop de planos + descripción de pieza + cantidad). | HU-2.1: Panel Jefe de Producción (Armado dinámico de fases/tiempos, permite repetir fases en la secuencia). |
| HU-1.3: Panel Vendedor "Cotizaciones Derivadas" y confirmación.                                           |                                                                                                             |

### SEMANA 3: EJECUCIÓN EN PLANTA & OPERACIONES

| FRONTEND 1 (Alfredo)                                                                                 | FRONTEND 2 (Alicia)                                                                                    |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| HU-2.2: Panel "Gestión de Planta" (Vista del Jefe con carga de trabajo y reasignación de operarios). | HU-3.1: Vista Operario Mobile (Tareas en cola / ejecución / botones grandes).                          |
| Lógica global de Axios Interceptors / API Client y Helpers de formato (Fechas, OT#).                 | HU-3.2, 3.3, 3.4: Modal de Detalle de Tarea (Adjuntos, Vencimientos y Notas discriminadas por origen). |

### SEMANA 4 & 5: CALIDAD, DESPACHO & DASHBOARDS

| FRONTEND 1 (Alfredo)                                                                                             | FRONTEND 2 (Alicia)                                                  |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| HU-1.2: Vendedor "Expediente Completo" (Vista unificada de trazabilidad).                                        | HU-4.1 & 4.2: Checklist de Calidad (Formulario de 8 puntos + Modal). |
| HU-5.3 & 5.4: Dashboards del Gerente (Métricas de planta, cuellos de botella y gráficos/indicadores de calidad). | HU-4.3: Veredicto de Calidad (Tarea 2.4).                            |
|                                                                                                                  | HU-2.3: Circuito de No Conformidad (Tarea 2.6).                      |
|                                                                                                                  | HU-1.4: Pantalla/Modal de Despacho.                                  |

---

## 5. Desglose Detallado de Tareas (Task Cards)

### FRONTEND 1 (Alfredo)

**Tarea 1.0 — Architecture & UI Base System**

- Descripción: Crear repositorio, integrar Tailwind CSS, definir componentes compartidos (`<Button/>`, `<Input/>`, `<Badge/>`, `<Card/>`, `<Modal/>`, `<DatePicker/>`).
- Entregable: Subir a develop el layout base con Sidebar/Navbar responsivo.

**Tarea 1.1 — Formulario "Levantar Pedido" (HU-1.1)**

- Descripción: Crear la vista donde el Vendedor carga datos del cliente, descripción de la pieza, cantidad de unidades, adjunta planos/documentos y registra la fecha esperada de entrega.
- Componentes clave: `CustomerForm`, `FileUploadDropzone`, `DatePicker`.
- Criterios de éxito: Validación de campos obligatorios (cliente, dirección, teléfono, descripción de pieza, cantidad) con React Hook Form / Zod.

**Tarea 1.2 — Cotizaciones Derivadas & Aprobación (HU-1.3)**

- Descripción: Vista donde el Vendedor revisa el precio fijado por Producción y registra si el cliente aprueba o rechaza.
- Criterios de éxito: Confirmar aprobación dispara el evento/API de generación de la OT.

**Tarea 1.3 — Gestión de Planta & Reasignación (HU-2.2)**

- Descripción: Dashboard del Jefe de Producción para monitorear la carga de trabajo por operario y reasignar OTs.
- Componentes clave: `OperatorWorkloadCard`, `ReassignModal`.

**Tarea 1.4 — Expediente Único de la OT (HU-1.2)**

- Descripción: La pantalla "estrella" del Vendedor. Muestra el historial unificado de una OT (datos, cotización, tiempos por fase, dictamen de Calidad y estado de entrega).

**Tarea 1.5 — Vistas de Métricas del Gerente (HU-5.3 & HU-5.4)**

- Descripción: Pantallas con KPIs de congestión en planta, % de conformidades y no conformidades de Calidad, retrabajos por fase, auditorías recientes y resultados, tiempo promedio de calidad.

### FRONTEND 2 (Alicia)

**Tarea 2.1 — Configuración Global de Fases & Asignación de Operarios (HU-5.1)**

- Descripción: Vistas administrativas para crear fases del catálogo global y asignar qué operarios habilitados pueden ejecutar cada una.
- Componentes clave: `PhaseCatalogTable`, `OperatorAssignmentTable`.

**Tarea 2.2 — Armado de Cotización en Producción (HU-2.1)**

- Descripción: Interfaz para que el Jefe de Producción seleccione fases del catálogo, las ordene, asigne tiempos estimados y el precio total.
- Componentes clave: `PhaseSelector`, `DragAndDropList` (con `@hello-pangea/dnd`), `TimePriceInput`.

**Tarea 2.3 — App Operario (Mobile-First) (HU-3.1 a HU-3.4)**

- Descripción: Interfaz pensada para tablet/celular. Lista de tareas en cola/ejecución con botones táctiles grandes de "Iniciar" y "Terminar".
- Componentes clave: `TaskCardMobile`, `TaskDetailModal` (muestra notas clasificadas por etiquetas: Calidad o Producción).

**Tarea 2.4 — Auditoría de Calidad & Checklist (HU-4.1 a HU-4.3)**

- Descripción: Panel de auditoría con el formulario de 8 puntos (7 con resultado Cumple/No cumple/No aplica + veredicto final).
- Criterios de éxito: Si el resultado es "No Conforme", el campo de observaciones debe ser obligatorio antes de permitir guardar y rederivar la OT a Producción.

**Tarea 2.5 — Flujo de Despacho & Entrega (HU-1.4)**

- Descripción: Vista final para marcar OTs listas como "Entregadas", registrando el nombre del receptor.

**Tarea 2.6 — Circuito de No Conformidad (HU-2.3)**

- Descripción: Flujo de devolución a Producción cuando una OT tiene veredicto "No Conforme". Permite reasignar fases específicas y notificar al Jefe de Producción.
- Criterios de éxito: Al confirmar no conformidad, la OT vuelve al estado de producción con las fases afectadas reasignadas.

---

## 6. Reglas de Coordinación entre Frontends

- **Componentes UI Comunes:** Ningún desarrollador creará un botón, input o modal desde cero. Todo se consume desde `/src/components/ui`.
- **Mocks de API:** Si el Backend no tiene listo un endpoint, se usará un archivo JSON local (`/src/mocks/`) con la misma estructura del modelo de datos v2 para no bloquear la maquetación.
- **Pull Requests:** Todo PR requiere revisión cruzada antes de mergear a develop.
- **Comunicación:** Antes de modificar contratos API o estructuras compartidas, comunicar al otro frontend.

---

## 7. Dependencias con Backend

Frontend debe poder comenzar a trabajar contra APIs que Backend vaya estabilizando. Mientras Backend avanza con los módulos posteriores, Frontend puede integrar las APIs ya disponibles.

### 7.1 Dependencias por semana

| Semana | Frontend necesita de Backend            | Backend entrega                                                       |
| ------ | --------------------------------------- | --------------------------------------------------------------------- |
| 1      | Login JWT, Clientes, Solicitudes, Fases | Auth (`/api/auth/login`), Cliente CRUD, Solicitud CRUD, Fase catálogo |
| 2      | Cotizaciones, Aprobación, Generación OT | Cotización CRUD, endpoints `/aprobar` y `/rechazar`                   |
| 3      | OT_FASE, Reasignación, Notas            | OT_FASE CRUD, `/reasignar`, notas por fase                            |
| 4      | Calidad, Checklist, Despacho            | Calidad endpoints, `/conforme`, `/no-conforme`, `/entrega`            |
| 5      | Expediente, Dashboard endpoints         | `/expediente`, `/dashboard/planta`, `/dashboard/calidad`              |

### 7.2 Estrategia cuando Backend no está listo

- Usar mocks en `/src/mocks/` con la misma estructura del esquema v2.
- Los mocks deben seguir exactamente la estructura de los contratos documentados en la Especificación Técnica Frontend (§6).
- Cuando Backend entregue el endpoint real, solo se cambia la llamada en `/src/api/`.

---

## 8. Riesgos

| #   | Riesgo                                            | Impacto                             | Mitigación                                                                                           |
| --- | ------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Backend no entrega APIs a tiempo                  | Frontend bloqueado para integración | Usar mocks con misma estructura JSON del esquema v2. Integrar incrementalmente.                      |
| 2   | Estados del backend no coinciden con PRD v2       | Frontend usa estados incorrectos    | PRD v2 es fuente de verdad; backend se alineará. Documentar estados en §6 de Especificación Técnica. |
| 3   | Checklist booleano en backend vs. 3 valores en v2 | UI no compatible con backend        | Frontend implementa 3 valores (v2); backend se ajustará.                                             |
| 4   | Cambios de esquema sin comunicación               | Mocks desactualizados               | Contratos API documentados en Especificación Técnica §6. Comunicar antes de cambiar.                 |
| 5   | Integración tardía                                | Bugs de integración en semana 5     | Integración incremental desde semana 1. Probar contra backend real cuando esté disponible.           |
| 6   | Conflicto de ramas                                | Retrasos por merge conflicts        | Sub-branches por feature, PR con revisión, comunicar cambios en componentes compartidos.             |

---

## 9. Definición de Done Semanal

Al final de cada semana debe poder demostrarse:

### Semana 1

```text
Usuario inicia sesión → JWT generado → Rutas protegidas funcionando
Crear Solicitud (HU-1.1) → campos validados → enviado a API o mock
Configurar Fases (HU-5.1) → catálogo visible → operarios asignados
Layout base responsive → Sidebar/Navbar funcionando
Design System → componentes UI reutilizables disponibles
```

### Semana 2

```text
Jefe de Producción arma cotización (HU-2.1) → fases ordenadas → precio definido
Vendedor aprueba cotización (HU-1.3) → OT generada automáticamente
Cotizaciones derivadas visibles para el Vendedor
```

### Semana 3

```text
Operario ve sus tareas (HU-3.1) → puede iniciar y finalizar
Jefe de Producción reasigna tareas (HU-2.2) → historial registrado
Notas discriminadas por origen visibles (HU-3.4)
Vista mobile-first del operario funcionando
```

### Semana 4

```text
Calidad ejecuta checklist (HU-4.2) → 7 puntos con 3 valores + veredicto
No conformidad devuelta al Jefe (HU-2.3) → fases específicas reasignadas
Despacho registrado (HU-1.4) → nombre del receptor guardado
```

### Semana 5

```text
Expediente completo visible (HU-1.2) → trazabilidad de punta a punta
Dashboards del Gerente (HU-5.3/5.4) → métricas de planta y calidad
Testing completo de todos los flujos
Demo preparada con datos reales
```

---

_QualityTrack · NO-Country 2026. Plan de Trabajo Frontend — MVP v2.0_
