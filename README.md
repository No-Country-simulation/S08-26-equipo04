# ⚙️ QualityTrack — Sistema de Gestión de Calidad Industrial

> **Plataforma centralizada para la gestión, trazabilidad y documentación de Órdenes de Trabajo (OT) en la industria del mecanizado y manufactura.**

[![Repo](https://img.shields.io/badge/repo-GitHub-181717?logo=github)](https://github.com/No-Country-simulation/S08-26-equipo04)
[![Board](https://img.shields.io/badge/tablero-Project-blue)](https://github.com/orgs/No-Country-simulation/projects/490)
[![Figma](https://img.shields.io/badge/diseño-Figma-F24E1E?logo=figma)](https://www.figma.com/design/icUziVsu86Dl1fhjNhxfk2/QualityTrack)

---

## 📌 Sobre el Proyecto

Hoy, en una industria de mecanizado, la información de un trabajo viaja dispersa: el plano en una carpeta física, los certificados de materia prima en un bibliorato, los controles de calidad en hojas sueltas. Ante un reclamo o una auditoría, reconstruir el historial completo de una pieza toma horas y depende de encontrar el papel correcto.

**QualityTrack** centraliza todo el circuito en un solo lugar: desde que el Vendedor carga la solicitud de un cliente, pasando por la cotización, la producción por fases, el control de Calidad, hasta el despacho y la entrega — de forma que cualquier Orden de Trabajo pueda reconstruirse de punta a punta sin buscar en distintos sistemas.

El MVP se desarrolla en 5 semanas dentro del programa **NO-Country**, con 5 roles de negocio (Vendedor, Jefe de Producción, Operario, Calidad, Gerente).

---

## 🚀 Funcionalidades Principales

| Rol | Qué hace en el sistema |
|---|---|
| **Vendedor** | Levanta pedidos, gestiona las cotizaciones derivadas y la respuesta del cliente, consulta el expediente completo de una OT, y registra el despacho/entrega |
| **Jefe de Producción** | Arma la cotización eligiendo fases del catálogo, tiempos y precio único; gestiona la carga de planta y reasignaciones; decide qué fase(s) rehacer ante una no conformidad |
| **Operario** | Ve sus tareas en cola y en ejecución, marca inicio/fin de cada fase, consulta adjuntos, vencimiento y notas — interfaz mobile-first para planta |
| **Calidad** | Corre el checklist de 8 puntos sobre las OTs terminadas y emite el veredicto (conforme / no conforme) |
| **Gerente** | Configura el catálogo global de fases y qué operarios pueden ejecutar cada una; consulta indicadores globales de planta y de calidad |

---

## 🛠️ Stack Tecnológico

- **Backend:** Java + Spring Boot, Spring Security (JWT), Spring Data JPA
- **Base de datos:** PostgreSQL (Neon)
- **Frontend:** React + Vite, Tailwind CSS, react-router-dom, TanStack Query/Table, react-hook-form + zod, axios
- **Diseño:** Figma
- **Despliegue:** Vercel (frontend) · Render (backend)
- **Control de versiones & workflow:** Git + GitHub (Issues, Pull Requests, Project board, CODEOWNERS)

---

## 📁 Estructura del Repositorio

| Carpeta / archivo | Contenido | Responsable |
|---|---|---|
| `docs/funcional/` | PRD, Backlog, Changelog de decisiones | Mel |
| `docs/datos/` | Esquema de Base de Datos | Mel |
| `docs/backend/` | Especificación Técnica y Plan de Trabajo de Backend | Lisandro / Felipe |
| `docs/frontend/` | Especificación Técnica, Plan de Trabajo, Service Blueprint | Alicia / Alfredo |
| `docs/qa/` | Análisis Funcional QA | Maria |
| `docs/historial/` | Documentación histórica del planteo inicial del proyecto | — |
| `docs/historico/` | Propuestas paralelas, superadas por las versiones vigentes | — |
| `CONTRIBUTING.md` | Convención de ramas, commits y Pull Requests | — |
| `CODEOWNERS` | Revisores automáticos por carpeta | — |

---

## 🌿 Flujo de Trabajo (Git Workflow)

El equipo trabaja sobre `develop` como rama de integración, con ramas de feature por tarea. El detalle completo de convenciones de nombrado, commits y criterios de merge está en [`CONTRIBUTING.md`](CONTRIBUTING.md).

- `main`: código en producción, rama protegida.
- `develop`: rama principal de integración y desarrollo.
- `feature/`, `fix/`, `refactor/`, `docs/`, `style/`: ramas de trabajo por tipo de cambio, siempre desde `develop`.

---

## 👥 Equipo de Desarrollo

- **Project Manager:** Mel Zarate
- **Backend:** Abel Fucili, Felipe Arroyo, Lisandro, Luis
- **Frontend:** Alfredo Agüero Ortiz, Alicia Zúñega
- **UX/UI:** Hazaelld
- **QA:** Maria Chiribao

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
