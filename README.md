# ⚙️ QualityTrack — Sistema de Gestión de Producción y Calidad

> **Plataforma para PyMEs con producción por fases: centraliza el recorrido completo de cada Orden de Trabajo, de la solicitud del cliente a la entrega, con trazabilidad de cada etapa.**

[![Demo](https://img.shields.io/badge/demo-qualitytrack--six.vercel.app-0D6C7C)](https://qualitytrack-six.vercel.app)
[![Video](https://img.shields.io/badge/video-demo%20en%20YouTube-FF0000?logo=youtube)](https://www.youtube.com/watch?v=u0yK_OM8CLY)
[![Repo](https://img.shields.io/badge/repo-GitHub-181717?logo=github)](https://github.com/No-Country-simulation/S08-26-equipo04)
[![Board](https://img.shields.io/badge/tablero-Project-blue)](https://github.com/orgs/No-Country-simulation/projects/490)
[![Figma](https://img.shields.io/badge/diseño-Figma-F24E1E?logo=figma)](https://www.figma.com/design/icUziVsu86Dl1fhjNhxfk2/QualityTrack)

---

## 📌 Sobre el Proyecto

En una PyME que produce por fases —metalmecánica, carpintería industrial u otros rubros— la información de cada trabajo suele quedar repartida entre papeles, planillas y conversaciones. El costo aparece ante un reclamo o una auditoría: reconstruir qué se hizo, quién lo hizo y con qué resultado lleva horas y depende de encontrar el registro correcto.

**QualityTrack** reúne todo el circuito en un solo sistema: la solicitud del cliente, la cotización, la producción fase por fase, el control de Calidad, el despacho y la entrega. Cada Orden de Trabajo se puede reconstruir de punta a punta desde su expediente, con las reasignaciones y los retrabajos incluidos.

El MVP se desarrolló en 32 días dentro del programa **NO-Country**, con 5 roles de negocio: Vendedor, Jefe de Producción, Operario, Calidad y Gerente.

---

## ✅ Estado

- **MVP completo y presentado el 02/10/2026.** Las 17 historias de usuario tienen backend y pantalla conectados.
- **QA ejecutado en las 4 fases del flujo:** 134 casos en PASS, con evidencia por caso ([`docs/qa/testing/`](docs/qa/testing/)).
- **Demo:** [qualitytrack-six.vercel.app](https://qualitytrack-six.vercel.app). El primer ingreso puede tardar hasta un minuto, porque el servidor gratuito se activa con la primera visita.
- **Video de la demo:** [recorrido completo del flujo en YouTube](https://www.youtube.com/watch?v=u0yK_OM8CLY).

---

## 🚀 Funcionalidades Principales

| Rol | Qué hace en el sistema |
|---|---|
| **Vendedor** | Carga las solicitudes de los clientes con su documentación, envía las cotizaciones y registra la respuesta del cliente, consulta el expediente completo de cada OT y registra la entrega |
| **Jefe de Producción** | Arma la cotización eligiendo fases del catálogo, tiempos y precio; sigue la carga de planta y reasigna fases entre operarios habilitados; decide qué fases rehacer ante una no conformidad |
| **Operario** | Ve sus tareas en cola y en ejecución, inicia y termina cada fase, y consulta documentos, vencimiento y notas, en una interfaz pensada para usar en planta desde el celular |
| **Calidad** | Audita las OT terminadas con un checklist de 7 puntos y emite el veredicto: conforme o no conforme |
| **Gerente** | Configura el catálogo de fases y qué operarios pueden ejecutar cada una; consulta indicadores de planta y de Calidad |

---

## 🛠️ Stack Tecnológico

- **Backend:** Java 21, Spring Boot 4.1, Spring Security (JWT), Spring Data JPA
- **Base de datos:** PostgreSQL (Neon)
- **Frontend:** React 19 + Vite 8, Tailwind CSS, React Router, TanStack Query y Table, React Hook Form + Zod, Axios, Recharts
- **Landing y animaciones:** GSAP, Three.js
- **Diseño:** Figma
- **Despliegue:** Vercel (frontend) · Render (backend)
- **Control de versiones y workflow:** Git + GitHub (Issues, Pull Requests, Project board, CODEOWNERS)

---

## 📁 Estructura del Repositorio

| Carpeta / archivo | Contenido | Responsable |
|---|---|---|
| `backend/qualititrack/` | API REST en Spring Boot | Backend |
| `frontend/` | Aplicación React y landing page | Frontend |
| `docs/funcional/` | PRD, Backlog, Changelog de decisiones | Mel |
| `docs/datos/` | Esquema de Base de Datos | Mel |
| `docs/backend/` | Especificación Técnica y Plan de Trabajo de Backend | Felipe |
| `docs/frontend/` | Especificación Técnica, Plan de Trabajo, Service Blueprint | Alicia / Alfredo |
| `docs/qa/` | Análisis Funcional, Plan de Trabajo, casos de prueba por fase con resultados y evidencias (`testing/`) y registro E2E de QA | Maria |
| `docs/historico/` | Antecedentes del proyecto y propuestas paralelas, superados por las versiones vigentes | — |
| `CONTRIBUTING.md` | Convención de ramas, commits y Pull Requests | — |
| `CODEOWNERS` | Revisores automáticos por carpeta | — |

---

## 🌿 Flujo de Trabajo (Git Workflow)

El equipo trabaja sobre `develop` como rama de integración, con una rama por tarea. El detalle de convenciones de nombrado, commits y criterios de merge está en [`CONTRIBUTING.md`](CONTRIBUTING.md).

- `develop`: rama principal de integración. **La app publicada se despliega desde esta rama** (Vercel y Render).
- `main`: rama protegida. Conserva la estructura inicial del repositorio.
- `feature/`, `fix/`, `refactor/`, `docs/`, `style/`, `chore/`: ramas de trabajo por tipo de cambio, siempre desde `develop`.

---

## 🔭 Evolución futura

**Arquitectura de microservicios (exploración de Abel Fucili).** La rama `microservicios` tiene una propuesta que divide el backend en `api-gateway`, `ms-auth`, `ms-business`, `ms-execution` y `ms-common`, con Docker Compose. No está integrada al MVP: incorporarla requiere actualizarla con `develop`, definir el despliegue de cada servicio y volver a correr QA completo.

**Mejoras detectadas durante QA y la revisión del código:**

- Alta y gestión de usuarios desde la app (hoy se crean directamente en la base de datos).
- Validar los adjuntos por su contenido real, además de la extensión y el tipo de archivo declarado.
- Control de Calidad: mostrar desde cuándo cada OT está en cola y el resultado de las auditorías como texto legible.
- Optimizar la carga de la animación 3D del login.
- Automatizar los casos de prueba de QA, hoy ejecutados en forma manual.
- Completar las evidencias pendientes de QA ([#298](https://github.com/No-Country-simulation/S08-26-equipo04/issues/298)).
- Evitar la demora del primer ingreso con un plan pago de Render o un mecanismo que mantenga el servidor activo.

---

## 👥 Equipo de Desarrollo

- **Project Manager:** Mel Zarate
- **Backend:** Felipe Arroyo, Abel Fucili, Luis Feliz, Lisandro Sánchez Morales
- **Frontend:** Alicia Zuñega, Alfredo Agüero Ortiz
- **UX/UI:** Hazael Degante
- **QA:** Maria Chiribao

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consultá el archivo [`LICENSE`](LICENSE) para más detalles.
