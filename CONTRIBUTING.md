# Contributing Guide

## 0. Procedimiento paso a paso (primera vez)

Si es tu primer cambio en este repo, seguí estos pasos en orden:

1. Actualizá tu copia local de `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Creá tu rama, con el nombre según la sección 1 (`<tipo>/<numero-ticket>-<descripcion-corta>`):
   ```bash
   git checkout -b docs/mi-cambio
   ```
3. Hacé tus cambios y commiteá siguiendo el formato de la sección 3.
4. Subí tu rama:
   ```bash
   git push -u origin docs/mi-cambio
   ```
5. El push te devuelve un link — abrilo para crear el Pull Request contra `develop`. Completá la descripción según la sección 4 (Qué se hizo / Ticket / Cómo probarlo).
6. Esperá la revisión — el `CODEOWNERS` le pide aprobación automáticamente a quien corresponda según la carpeta que tocaste — y mergealo cuando esté aprobado.

---

## 1. Nombrado de Ramas (Branches)

Estructura sugerida:
`<tipo>/<numero-ticket>-<descripcion-corta>`

> Usar `kebab-case` y todo en minúsculas.

### Prefijos

- `feature/` ➔ Nuevas funcionalidades.  
  Ejemplo: `feature/BE-10-autenticacion-jwt`
- `fix/` o `bugfix/` ➔ Corrección de errores.  
  Ejemplo: `fix/QA-03-checklist-no-guarda-respuestas`
- `refactor/` ➔ Reestructuración o limpieza de código sin cambiar funcionalidad.  
  Ejemplo: `refactor/BE-07-separar-validacion-de-rutas`
- `docs/` ➔ Cambios en documentación o README.  
  Ejemplo: `docs/actualizar-schema-de-datos`
- `style/` ➔ Ajustes visuales, maquetación o estilos de UI.  
  Ejemplo: `style/FE-03-estilos-tarjeta-propiedad`

---

## 2. Flujo de Trabajo (Git Workflow)

### `main`

Código en producción.

- Rama protegida.
- Nadie debe subir cambios directamente a `main`.

### `develop`

Rama principal de integración y desarrollo.

**Regla 1:**

> Toda rama nueva debe salir de `develop` y reincorporarse a `develop` a través de un **Pull Request (PR)**.

**Regla 2:**

> Antes de crear cualquier rama nueva, verifica siempre que estés parado en `develop` y haz un `git pull origin develop` para sincronizar la versión más reciente del equipo.

```text
main
  │
  └── develop
        │
        ├── feature/BE-10-autenticacion-jwt
        ├── fix/QA-03-checklist-no-guarda-respuestas
        ├── docs/actualizar-schema-de-datos
        └── refactor/BE-07-separar-validacion-de-rutas
```

#### Pasos para iniciar una nueva tarea:

```bash
# 1. Cambiar a develop y obtener los últimos cambios
git checkout develop
git pull origin develop

# 2. Crear y cambiar a la nueva rama
git checkout -b feature/BE-10-autenticacion-jwt
```

---

## 3. Commits

Se debe seguir el formato de **Conventional Commits** (en español, minúsculas y tiempo presente):

```text
<tipo>(<scope>): <descripción breve>

[...] (cuerpo opcional)

Closes #N  |  Refs #N
```

### Estructura

- **Tipo:** `feat`, `fix`, `refactor`, `docs`, `style`, etc.
- **Scope:** carpeta afectada del proyecto: `backend`, `frontend`, `datos`, `funcional`, `qa`.
- **Descripción:** una línea corta en presente y minúsculas.
- **Cuerpo (opcional):** se agrega solo cuando el diff no deja claro el **por qué** del cambio. Se separa de la descripción por una línea en blanco.
- **Footer (obligatorio):** referencia al Issue de GitHub.
  - `Closes #N` — cuando el commit cierra el ticket.
  - `Refs #N` — cuando es un avance parcial.

### Ejemplos

**Con cuerpo (el diff no explica el motivo):**

```text
feat(qa): agregar script de smoke test para flujos críticos

Los flujos de-login, creación de solicitud y checklist de calidad
no estaban cubiertos por ninguno automatizado. Se agrega un script
que recorre los tres y reporta fallos en la terminal.

Closes #22
```

**Sin cuerpo (el diff explica por sí solo el cambio):**

```text
fix(datos): corregir nombre de columna en tabla de fases

Refs #18
```

**Más ejemplos por área:**

```text
feat(backend): agregar endpoint de consulta de expediente

Refs #14
```

```text
docs(funcional): actualizar descripción de HU-4.2 en el backlog

Refs #20
```

---

## 4. Pull Requests (PRs)

### Título del PR

El título debe seguir el mismo formato utilizado para los commits (en español):

Ejemplo:  
`feat(backend): agregar endpoint de consulta de expediente`

### Contenido mínimo de la descripción

La descripción del PR debe incluir:

- **¿Qué se hizo?** Breve resumen de los cambios realizados.
- **Ticket / Issue:** Enlace o código de la tarea asociada (ej. `FE-12`).
- **¿Cómo probarlo?** Pasos sencillos para verificar los cambios.
- **Capturas de pantalla / GIF:** Obligatorio cuando existan cambios visuales o de UI, especialmente en diseños _responsive_ o móviles.
- **Referencia al Issue:** `Closes #N` si el PR cierra el ticket, o `Refs #N` si es un avance parcial. Aunque ya vaya en el commit, incluirlo aquí permite que GitHub cierre el Issue automáticamente al mergear y lo hace visible en el tablero.

### Criterios para Merge

Para realizar el merge, el PR debe cumplir con los siguientes criterios:

- Al menos **1 aprobación** de un compañero.
- Superar las verificaciones automáticas (`build` / `linter`).
- No tener conflictos con la rama base (`develop`).
- El autor del PR, o el colaborador que lo aprueba, realiza el merge una vez aprobado.

### Cierre de Issues

> `develop` es la rama default del repositorio. Por eso, incluir `Closes #N` en un commit **cierra el Issue automáticamente** al mergear el PR. No es necesario cerrarlo a mano.
