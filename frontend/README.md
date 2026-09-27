# QualityTrack — Frontend

Aplicación cliente web para **QualityTrack** (Sistema de Gestión de Calidad Industrial), desarrollada en React con Vite.

## 🚀 Stack Tecnológico

El proyecto utiliza una arquitectura moderna basada en React, enfocada en rendimiento, mantenibilidad y rapidez de desarrollo:

- **Core & Enrutado:** [React](https://react.dev/) (v19) + [Vite](https://vitejs.dev/) + [React Router DOM](https://reactrouter.com/) (v7) + [React Helmet Async](https://github.com/staylor/react-helmet-async) (gestión de `<head>` y títulos dinámicos)
- **Manejo de Estado y API:** [Axios](https://axios-http.com/) (con interceptores para JWT) + providers de Context por dominio (`Auth`, `Solicitudes`, `Cotizaciones`, `OtFases`, `OrdenesTrabajo`)
- **Estilos & UI:** [Tailwind CSS v3](https://tailwindcss.com/) (con PostCSS & Autoprefixer) + [Lucide React](https://lucide.dev/) (iconografía) + [Sonner](https://sonner.emilkowal.ski/) (notificaciones / toasts)
- **Formularios & Validaciones:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) + `@hookform/resolvers`
- **Tablas & Gráficos:** [TanStack Table](https://tanstack.com/table/v8) + [Recharts](https://recharts.org/)
- **Drag & Drop:** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (reordenamiento de fases)
- **Animaciones:** [GSAP](https://gsap.com/)
- **Utilidades de fecha:** [date-fns](https://date-fns.org/)

## 📁 Estructura del Proyecto

La estructura del código fuente está organizada por capas modulares en `src/`:

```text
src/
├── api/             # Clientes Axios, interceptores y endpoints por dominio
├── assets/          # Recursos estáticos (imágenes, logos)
├── components/      # Componentes UI reutilizables (ui/, modales, tablas)
├── context/         # Estado global por dominio (Auth, Solicitudes, Cotizaciones, OtFases, OrdenesTrabajo)
├── hooks/           # Custom hooks por dominio (useSolicitudes, useCotizaciones, useOtFases, useOrdenesTrabajo)
├── layouts/         # Layouts estructurales (AppLayout, OperarioLayout) con Sidebar y Navbar
├── mocks/           # Mocks de API y datos locales para desarrollo
├── pages/           # Vistas/Pantallas principales vinculadas a rutas
├── routes/          # Definición de rutas (AppRoutes) y protección por rol (ProtectedRoute)
├── utils/           # Esquemas de validación (Zod) por dominio
├── App.jsx          # Componente raíz
├── index.css        # Importaciones de Tailwind CSS y estilos globales
└── main.jsx         # Punto de entrada de la aplicación React
```

## 🛠️ Instalación y Configuración Local

### Prerrequisitos

- `Node.js: >= 18.x`

- `npm` o `pnpm`

### Pasos

1. Clonar el repositorio y navegar a la carpeta del frontend:

```bash
    cd frontend
```

2. Instalar dependencias:

```bash
    npm install
```

3. Configurar variables de entorno:
   Crea un archivo `.env.local` en la raíz del frontend tomando como base `.env.example`:

```text
VITE_API_BASE_URL=http://localhost:8080
```

4. Iniciar servidor de desarrollo:

```bash
    npm run dev
```

5. Otros scripts disponibles:

`npm run build`: Genera el bundle compilado para producción.

`npm run preview`: Sirve localmente la build de producción.

`npm run lint`: Corre las validaciones del Linter.

## 🛡️ Roles y Rutas de la Aplicación

El sistema cuenta con 5 roles diferenciados (GERENTE, JEFE_PRODUCCION, VENDEDOR, OPERARIO, CALIDAD). Las rutas están protegidas mediante el wrapper `ProtectedRoute` según el rol autenticado (JWT):

| Ruta                              | Rol permitido                  | Descripción                                        |
| --------------------------------- | ------------------------------ | -------------------------------------------------- |
| `/`                               | Todos (OPERARIO va a `/operario`) | Panel general con resumen operativo             |
| `/solicitudes`                    | VENDEDOR                       | Listado de solicitudes de pedido                   |
| `/solicitudes/nueva`              | VENDEDOR                       | Creación de solicitud con adjuntos                 |
| `/cotizaciones`                   | VENDEDOR, JEFE_PRODUCCION      | Revisión de cotizaciones                           |
| `/cotizaciones/:id`               | VENDEDOR, JEFE_PRODUCCION      | Detalle de cotización                              |
| `/cotizaciones/nueva`             | JEFE_PRODUCCION                | Creación de cotización con fases y tiempos         |
| `/cotizaciones/:id/editar`        | JEFE_PRODUCCION                | Edición de cotización                              |
| `/despacho`                       | VENDEDOR, JEFE_PRODUCCION      | Registro de entregas de OTs en estado Despacho     |
| `/planta`                         | JEFE_PRODUCCION                | Gestión de planta                                  |
| `/config/fases`                   | GERENTE                        | Catálogo global de fases                           |
| `/config/fases/:faseId/operarios` | GERENTE                        | Habilitación de operarios por fase                 |
| `/operario`                       | OPERARIO                       | Tareas asignadas al operario                       |
| `/login`                          | Pública                        | Inicio de sesión                                   |

## 🤝 Flujo de Contribución

Antes de crear una rama o hacer cambios, asegúrate de revisar el archivo `CONTRIBUTING.md` en la raíz del repositorio.

### Reglas básicas para Frontend:

- **Ramas**: Salen siempre desde develop. Nombre sugerido: <tipo>/FE-<ticket>-<descripcion-corta> (ej. docs/FE-143-crear-readme-frontend).

- **Componentes**: Todo componente UI atómico (botones, modales, campos) debe crearse o consumirse desde src/components/ui/.

- **Mocks**: Si un endpoint de Backend no está listo, se consume el archivo local en `src/mocks/` respetando estrictamente el contrato del esquema de BD v2.

- **Commits**: Seguir las convenciones de Conventional Commits especificando el scope (frontend). Ej: `docs(frontend): agregar readme del proyecto`.

- **Pull Requests**: Requieren revisión cruzada y aprobación antes de integrarse a develop.

_QualityTrack · NO-Country 2026_
