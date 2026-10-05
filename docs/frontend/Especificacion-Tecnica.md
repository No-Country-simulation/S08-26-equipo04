# QualityTrack — Especificación Técnica del Sistema Frontend — MVP v1.0

**Proyecto:** QualityTrack
**Programa:** NO-Country · Semana 1 de 5
**Versión:** 1.0
**Fecha:** Septiembre 2026
**Estado:** Base técnica para desarrollo del MVP

> **Nota:** Este documento reemplaza y consolida la información técnica que se encontraba dispersa en `Plan-de-trabajo-y-Arquitectura.md` (stack, arquitectura y GitFlow). Se reestructuró para alinearse con el formato de la Especificación Técnica del Backend.

---

## 1. Objetivo del documento

Este documento define la arquitectura técnica, estructura del frontend, responsabilidades de los módulos, tecnologías, reglas técnicos y contratos de integración con Backend para el desarrollo del MVP de QualityTrack.

El Frontend consume la API REST expuesta por el Backend y presenta la interfaz de usuario para los 5 roles del sistema: Vendedor, Jefe de Producción, Operario, Calidad y Gerente.

El criterio principal de éxito del MVP desde el Frontend es:

> Presentar una interfaz clara, responsiva y consistente que permita a cada rol ejecutar sus tareas sin ambigüedades, y que consuma las APIs del Backend de forma transparente.

---

## 2. Fuente funcional de verdad

La fuente funcional principal del desarrollo Frontend es:

> Especificación Funcional · Versión 2 — QualityTrack — Flujo unificado del MVP (`../funcional/QualityTrack-PRD-v2.md`)

La especificación funcional define el comportamiento esperado del sistema. El Backlog de Historias de Usuario (`../funcional/QualityTrack-Backlog-v2.md`) define los criterios de aceptación.

En caso de conflicto entre documentos anteriores y la especificación funcional vigente, prevalece la especificación funcional vigente.

---

## 3. Stack Tecnológico

Definimos una pila de tecnologías moderna y escalable basada en **React + Vite**, orientada al alto rendimiento y velocidad de desarrollo:

- **Core & Enrutado:** React + Vite + `react-router-dom`
- **Manejo de Estado y API:** `axios` (con interceptores JWT) + `@tanstack/react-query`
- **Estilos & UI:** Tailwind CSS (sistema de tokens CSS) + `lucide-react` (iconos) + `sonner` (notificaciones/toasts)
- **Formularios & Validaciones:** `react-hook-form` + `zod`
- **Tablas & Gráficos:** `@tanstack/react-table` (tablas dinámicas) + `recharts`
- **Animaciones:** `gsap` (GreenSock Animation Platform) — transiciones de dashboard, micro-interacciones y animaciones de estado.
- **Drag & Drop:** `@hello-pangea/dnd` (fork mantenido de react-beautiful-dnd) — reordenamiento de fases en la cotización (HU-2.1) y cualquier lista ordenable.
- **Utilidades de fecha:** `date-fns` — formateo de fechas a ISO 8601 para envío al backend (TIMESTAMPTZ/DATE en PostgreSQL), cálculo de vencimientos (HU-3.3) y diferencias de tiempo.

---

## 4. Arquitectura del Proyecto

Organización modular dentro del repositorio para asegurar mantenibilidad a largo plazo.

```text
src/
├── api/             # Clientes Axios y llamadas a endpoints por dominio
├── assets/          # Recursos estáticos (imágenes, logos)
├── components/      # Componentes UI reutilizables (Botones, Inputs, Tablas, Modales)
│   └── ui/          # Design System: Button, Input, Badge, Card, Modal, DatePicker, etc.
├── context/         # Estado global de la aplicación (Auth, UI)
├── hooks/           # Custom hooks reutilizables (useOrders, usePhases, etc.)
├── layouts/         # Layouts estructurales (MainLayout, AuthLayout, AdminLayout)
├── mocks/           # Mocks de API para desarrollo sin backend
├── pages/           # Vistas/Pantallas principales vinculadas a rutas
├── routes/          # Configuración central de rutas (AppRouter, PrivateRoutes)
├── styles/          # Tokens del Design System (globals.css, variables de color/fuentes)
└── utils/           # Helpers, formateadores y validadores
```

---

## 5. Flujo de Trabajo y GitFlow

Para garantizar la transparencia del trabajo y mantener la estabilidad del código:

- **Estrategia de Ramas:** Se trabaja sobre la rama `develop`. Cada tarea o pantalla se desarrolla en una rama aislada (ej. `feature/FE-01-login`, `feature/FE-05-tabla-ordenes`).
- **Estándares:** Las convenciones de commits, nombrado de ramas y reglas de contribución se documentan en `CONTRIBUTING.md`.
- **Integración:** Sub-branches por feature, integración en develop mediante Pull Request con revisión cruzada.
- **Despliegue Continuo (Vercel):** Cada Pull Request hacia `develop` genera un entorno de pruebas (**Preview Environment**). Este enlace navegable se comparte con la PM y el diseñador UX/UI para validación previa.

---

## 6. Contratos de Integración

Cada Historia de Usuario consume endpoints específicos del Backend. La estructura definitiva de request/response debe mantenerse documentada y comunicada al equipo Frontend.

### 6.1 Autenticación

| Endpoint               | Método | Descripción              |
| ---------------------- | ------ | ------------------------ |
| `POST /api/auth/login` | POST   | Login y obtención de JWT |

**Request:**

```json
{
  "email": "usuario@qualitytrack.com",
  "password": "..."
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "rol": "VENDEDOR",
  "nombre": "Carlos Vendedor"
}
```

### 6.2 Módulo Vendedor

| HU     | Endpoint                                   | Método | Descripción                      |
| ------ | ------------------------------------------ | ------ | -------------------------------- |
| HU-1.1 | `POST /api/solicitudes`                    | POST   | Crear solicitud                  |
| HU-1.1 | `POST /api/documentos`                     | POST   | Subir documento adjunto          |
| HU-1.2 | `GET /api/ordenes-trabajo/{id}/expediente` | GET    | Expediente completo de la OT     |
| HU-1.3 | `GET /api/cotizaciones`                    | GET    | Listar cotizaciones del vendedor |
| HU-1.3 | `PUT /api/cotizaciones/{id}`               | PUT    | Registrar respuesta del cliente  |
| HU-1.3 | `POST /api/cotizaciones/{id}/aprobar`      | POST   | Aprobar cotización (genera OT)   |
| HU-1.3 | `POST /api/cotizaciones/{id}/rechazar`     | POST   | Rechazar cotización              |
| HU-1.4 | `POST /api/ordenes-trabajo/{id}/entrega`   | POST   | Registrar entrega                |

**Ejemplo — Crear Solicitud (HU-1.1):**

```json
// Request
{
  "cliente_id": 1,
  "descripcion_pieza": "Eje cilíndrico Ø50mm",
  "cantidad": 10,
  "fecha_esperada_entrega": "2026-09-30",
  "notas_comerciales": "Pieza urgente"
}

// Response
{
  "id": 1,
  "numero_solicitud": "SOL-2026-0001",
  "estado": "PENDIENTE_COTIZACION"
}
```

**Ejemplo — Registrar Entrega (HU-1.4):**

```json
// Request
{
  "receptor_nombre": "Roberto Fontana"
}

// Response
{
  "id": 1,
  "estado": "ENTREGADA",
  "fecha_entrega": "2026-09-15T14:30:00Z",
  "receptor_nombre": "Roberto Fontana"
}
```

### 6.3 Módulo Jefe de Producción

| HU     | Endpoint                            | Método | Descripción                    |
| ------ | ----------------------------------- | ------ | ------------------------------ |
| HU-2.1 | `GET /api/solicitudes`              | GET    | Listar solicitudes pendientes  |
| HU-2.1 | `POST /api/cotizaciones`            | POST   | Crear cotización con fases     |
| HU-2.2 | `GET /api/ot-fases`                 | GET    | Consultar fases asignadas      |
| HU-2.2 | `POST /api/ot-fases/{id}/reasignar` | POST   | Reasignar fase a otro operario |
| HU-2.3 | `POST /api/ot-fases`                | POST   | Crear fase de retrabajo        |

**Ejemplo — Crear Cotización (HU-2.1):**

```json
// Request
{
  "solicitud_id": 1,
  "precio_final": 15000.00,
  "fases": [
    {
      "fase_catalogo_id": 1,
      "numero_secuencia": 1,
      "tiempo_estimado_minutos": 120,
      "instrucciones_fase": "Corte por láser según plano"
    },
    {
      "fase_catalogo_id": 3,
      "numero_secuencia": 2,
      "tiempo_estimado_minutos": 90,
      "instrucciones_fase": "Soldadura MIG"
    }
  ]
}

// Response
{
  "id": 1,
  "numero_cotizacion": "COT-2026-0001",
  "estado": "LISTA_PARA_ENVIAR"
}
```

### 6.4 Módulo Operario

| HU     | Endpoint                               | Método | Descripción                  |
| ------ | -------------------------------------- | ------ | ---------------------------- |
| HU-3.1 | `GET /api/ot-fases`                    | GET    | Tareas asignadas al operario |
| HU-3.1 | `POST /api/ot-fases/{id}/iniciar`      | POST   | Iniciar fase                 |
| HU-3.1 | `POST /api/ot-fases/{id}/finalizar`    | POST   | Finalizar fase               |
| HU-3.2 | `GET /api/solicitudes/{id}/documentos` | GET    | Adjuntos de la solicitud     |
| HU-3.4 | `GET /api/ot-fases/{id}/notas`         | GET    | Notas de la fase             |

### 6.5 Módulo Calidad

| HU     | Endpoint                             | Método | Descripción                      |
| ------ | ------------------------------------ | ------ | -------------------------------- |
| HU-4.1 | `GET /api/calidad`                   | GET    | OTs pendientes de auditoría      |
| HU-4.2 | `POST /api/calidad/{id}/checklist`   | POST   | Guardar respuestas del checklist |
| HU-4.3 | `POST /api/calidad/{id}/conforme`    | POST   | Marcar como conforme             |
| HU-4.3 | `POST /api/calidad/{id}/no-conforme` | POST   | Marcar como no conforme          |

**Ejemplo — Checklist (HU-4.2):**

```json
// Request
{
  "respuestas": [
    { "item_numero": 1, "resultado_item": "CUMPLE", "observaciones": null },
    { "item_numero": 2, "resultado_item": "CUMPLE", "observaciones": null },
    { "item_numero": 3, "resultado_item": "NO_APLICA", "observaciones": null },
    { "item_numero": 4, "resultado_item": "CUMPLE", "observaciones": null },
    { "item_numero": 5, "resultado_item": "CUMPLE", "observaciones": null },
    {
      "item_numero": 6,
      "resultado_item": "NO_CUMPLE",
      "observaciones": "Hermeticidad no superada"
    },
    { "item_numero": 7, "resultado_item": "CUMPLE", "observaciones": null }
  ],
  "resultado": "NO_CONFORME",
  "observaciones_generales": "Fallo en prueba funcional punto 6"
}
```

### 6.6 Módulo Gerente

| HU     | Endpoint                         | Método | Descripción                  |
| ------ | -------------------------------- | ------ | ---------------------------- |
| HU-5.1 | `GET /api/fases`                 | GET    | Catálogo de fases            |
| HU-5.1 | `POST /api/fases`                | POST   | Crear fase                   |
| HU-5.1 | `PUT /api/fases/{id}`            | PUT    | Editar fase                  |
| HU-5.1 | `GET /api/usuarios`              | GET    | Listar operarios             |
| HU-5.1 | `POST /api/fases/{id}/habilitar` | POST   | Habilitar operario para fase |
| HU-5.3 | `GET /api/dashboard/planta`      | GET    | Métricas de planta           |
| HU-5.4 | `GET /api/dashboard/calidad`     | GET    | Métricas de calidad          |

---

## 7. Estados de UI

Cada pantalla debe manejar 4 estados de UI: Loading, Error, Empty y Success.

### 7.1 Matriz de estados por pantalla

| Pantalla                    | Loading              | Error                            | Empty                              | Success                             |
| --------------------------- | -------------------- | -------------------------------- | ---------------------------------- | ----------------------------------- |
| **Login**                   | Spinner en botón     | Toast "Credenciales incorrectas" | —                                  | Redirect a dashboard según rol      |
| **Solicitud (HU-1.1)**      | Spinner al guardar   | Toast error + detalle de campos  | Formulario vacío                   | Toast "Solicitud creada" + redirect |
| **Cotizaciones (HU-1.3)**   | Skeleton de cards    | Toast error                      | "No hay cotizaciones pendientes"   | Badge de estado actualizado         |
| **Expediente (HU-1.2)**     | Skeleton full-page   | "No se encontró la OT"           | Secciones marcadas "Pendiente"     | Todo visible en secciones           |
| **Gestión Planta (HU-2.2)** | Skeleton de cards    | Toast error                      | "No hay operarios activos"         | Cards de carga actualizadas         |
| **Operario (HU-3.1)**       | Spinner centrado     | Toast + botón retry              | "No hay tareas asignadas"          | Card actualizada inline             |
| **Checklist (HU-4.2)**      | Spinner al enviar    | Toast + campos resaltados        | Formulario con 7 checkboxes vacíos | Redirect a lista de calidad         |
| **Despacho (HU-1.4)**       | Spinner al confirmar | Toast error                      | "No hay OTs en despacho"           | Toast "OT entregada" + redirect     |
| **Config Fases (HU-5.1)**   | Skeleton de tabla    | Toast error                      | "No hay fases configuradas"        | Tabla actualizada                   |
| **Métricas (HU-5.3/5.4)**   | Skeleton de gráficos | Toast error                      | "Sin datos disponibles"            | Gráficos renderizados               |

### 7.2 Componentes de estado reutilizables

```text
src/components/ui/
├── LoadingSpinner.jsx       # Spinner centrado
├── SkeletonCard.jsx         # Skeleton para cards
├── SkeletonTable.jsx        # Skeleton para tablas
├── SkeletonChart.jsx        # Skeleton para gráficos
├── EmptyState.jsx           # Mensaje de estado vacío con icono
├── ErrorBanner.jsx          # Banner de error con opción retry
└── Toast.jsx                # Configuración de sonner
```

---

## 8. Manejo de Errores y Excepciones

El Frontend debe manejar los siguientes códigos de respuesta del Backend:

| Código HTTP | Significado           | Acción en UI                                    |
| ----------- | --------------------- | ----------------------------------------------- |
| 200         | OK                    | Procesar respuesta                              |
| 201         | Created               | Toast de éxito + actualizar lista               |
| 400         | Datos inválidos       | Resaltar campos con errores del response        |
| 401         | No autenticado        | Limpiar token + redirect a login                |
| 403         | No autorizado         | Toast "No tienes permisos para esta acción"     |
| 404         | Recurso no encontrado | Página de "No encontrado" o sección vacía       |
| 409         | Conflicto de estado   | Toast con mensaje del backend                   |
| 500         | Error interno         | Toast "Error del servidor. Intenta nuevamente." |

### 8.1 Interceptores de Axios

```text
src/api/
├── axiosInstance.js         # Instancia base con baseURL
├── requestInterceptor.js    # Agrega JWT a cada request
├── responseInterceptor.js   # Maneja 401, 403, 500 globalmente
```

---

## 9. Seguridad

La seguridad del Frontend se basa en:

- **JWT:** Se almacena en `localStorage` o `httpOnly cookie`. Se envía en cada request via header `Authorization: Bearer <token>`.
- **Rutas protegidas:** `react-router-dom` con wrapper `PrivateRoutes` que verifica el token y el rol antes de renderizar.
- **Roles:** Cada ruta está asociada a uno o más roles. Si el usuario no tiene el rol requerido, se redirige a un pantalla de "Acceso denegado".
- **Sin datos sensibles en frontend:** Nunca se almacenan passwords, secrets o tokens de larga duración en el código fuente.

### 9.1Mapa de rutas por rol

| Ruta                 | Roles permitidos          |
| -------------------- | ------------------------- |
| `/solicitudes`       | VENDEDOR                  |
| `/cotizaciones`      | VENDEDOR, JEFE_PRODUCCION |
| `/expediente/:id`    | VENDEDOR                  |
| `/despacho`          | VENDEDOR                  |
| `/produccion`        | JEFE_PRODUCCION           |
| `/planta`            | JEFE_PRODUCCION           |
| `/operario`          | OPERARIO                  |
| `/calidad`           | CALIDAD                   |
| `/config/fases`      | GERENTE                   |
| `/dashboard/planta`  | GERENTE                   |
| `/dashboard/calidad` | GERENTE                   |

---

## 10. Principios de Desarrollo

El equipo Frontend deberá seguir estos principios:

1. No trabajar directamente sobre `main`.
2. No trabajar directamente sobre `develop`.
3. Cada funcionalidad se desarrolla en una rama aislada (`feature/FE-XX`).
4. Todo cambio relevante llega mediante Pull Request con revisión cruzada.
5. El código debe compilar y pasar lint antes de solicitar revisión.
6. No duplicar componentes — todo se consume desde `/src/components/ui`.
7. Si el Backend no tiene listo un endpoint, se usa un mock con la misma estructura del esquema v2.
8. No modificar contratos de integración sin comunicarlo al equipo.
9. Mantener compatibilidad entre Frontend y Backend.
10. Respetar los estados definidos en la especificación funcional v2.

---

## 11. Criterios de Finalización (Definition of Done)

Una Historia de Usuario de Frontend se considera técnicamente integrada cuando:

1. El componente compila sin errores ni warnings críticos.
2. Consume el endpoint correcto (o mock si backend no está listo).
3. Los campos obligatorios tienen validación con `react-hook-form` + `zod`.
4. Los estados de UI están implementados (loading, error, empty, success).
5. La vista es responsive (mobile-first para HU-3.x del operario).
6. Los componentes reutilizables están en `/src/components/ui`.
7. El PR fue revisado y aprobado por el otro frontend.
8. No rompe funcionalidades existentes.
9. Los estados utilizados coinciden con la especificación funcional v2.

---

## 12. Fuera del Alcance del MVP

No se implementa en el Frontend durante el MVP:

- Login/registro de usuarios nuevos (cargados directamente en la base por el equipo de desarrollo).
- Cálculo automático de precios por variables.
- Certificados de materia prima como módulo independiente.
- Órdenes de compra.
- Facturas y comprobantes de pago.
- Documento formal de entrega (solo se registra el nombre del receptor).
- Métricas de rendimiento individual de operarios.
- Entregas parciales de una OT.
- Versionado de cotizaciones rechazadas (se carga solicitud nueva).
- Automatización del precio por variables.
- Notificaciones push en tiempo real (toasts sí, push no).
- Modo offline / sin conectividad.

---

_QualityTrack · NO-Country 2026. Especificación Técnica Frontend — MVP v1.0_
