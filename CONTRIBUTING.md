# Contributing Guide

## 0. Procedimiento paso a paso (primera vez)

Si es tu primer cambio en este repo, seguí estos pasos en orden:

1. Identificá o creá tu tarea (**Issue**) en GitHub según la sección 1 para tener tu número de ticket asignado (ej. `#26`).
2. Actualizá tu copia local de `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```
3. Creá tu rama, con el nombre según la sección 2 (`<tipo>/<numero-ticket>-<descripcion-corta>`):
   ```bash
   git checkout -b docs/26-mi-cambio
   ```
4. Hacé tus cambios y commiteá siguiendo el formato de la sección 4.
5. Subí tu rama:
   ```bash
   git push -u origin docs/26-mi-cambio
   ```
6. El push te devuelve un link — abrilo para crear el Pull Request contra `develop`. Completá la descripción según la sección 5 (Qué se hizo / Ticket / Cómo probarlo).
7. Esperá la revisión — el `CODEOWNERS` le pide aprobación automáticamente a quien corresponda según la carpeta que tocaste — y mergealo cuando esté aprobado.
8. **Limpieza post-merge ("Rama mergeada, rama eliminada"):** eliminá la rama remota desde GitHub una vez mergeada a `develop` (botón _Delete branch_). Como **recomendación**, podés limpiar también tu copia local para no acumular ramas viejas:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d docs/26-mi-cambio
   git fetch --prune
   ```

---

## 1. Gestión de Issues (Tareas en GitHub)

Todo cambio, funcionalidad, corrección o tarea en el proyecto debe comenzar con un **Issue en GitHub**. No se deben crear ramas sin un Issue asociado.

### Título del Issue

Estructura: `[ÁREA] tipo: descripción breve`

- **Áreas:** `[BE]` (Backend), `[FE]` (Frontend), `[DATA]` (Datos / BD), `[QA]` (Quality Assurance), `[DOCS]` (Documentación), `[FUNC]` (Funcional / PM).
- **Tipos:** `feat` (funcionalidad), `fix` (corrección de error), `refactor` (mejora o refactorización), `test` (pruebas / testing), `docs` (documentación), `style` (estilos / UI).

Ejemplos:

- `[BE] feat: Endpoint de autenticación con JWT`
- `[FE] fix: Validación en campo de email en formulario de registro`
- `[QA] test: Casos de prueba para flujo de creación de expedientes`
- `[DOCS] docs: Actualizar guía de contribución`

### Contenido de la Descripción del Issue

Cada Issue debe crearse con un contenido mínimo que permita al equipo entender el alcance y verificar su cumplimiento:

```markdown
### Objetivo / Contexto

Breve explicación de qué se necesita hacer, el problema que resuelve o el valor que aporta.

### Criterios de Aceptación (DoD - Definition of Done)

Lista de condiciones verificables que deben cumplirse para dar la tarea por finalizada:

- [ ] Debe validar token expirado devolviendo 401.
- [ ] Debe registrar logs de acceso en consola.
- [ ] Pruebas unitarias pasando correctamente.

### Recursos / Referencias (Opcional)

- Enlace al diseño en Figma, endpoint relacionado o documentación en `/docs/`.
```

### Buenas Prácticas para Issues

- **Assignee:** Asignar siempre al responsable antes de comenzar a trabajar en la tarea.
- **Labels:** Asignar las etiquetas pertinentes (`backend`, `frontend`, `documentation`, `bug`, etc.).
- **Número de Issue como Ticket:** El número que GitHub genera automáticamente (`#N`) se utiliza como identificador en el nombre de la rama (ej. `docs/26-...` o `feature/BE-10-...`) y en los commits (`Closes #26` / `Refs #26`).

---

## 2. Nombrado de Ramas (Branches)

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

## 3. Flujo de Trabajo (Git Workflow)

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

## 4. Commits

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

## 5. Pull Requests (PRs)

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

### Post-Merge: Eliminación de Ramas ("Rama mergeada, rama eliminada")

Para mantener el repositorio limpio y evitar confusiones con ramas y código obsoletos:

> **Regla de oro:** Rama que se mergea en `develop`, rama que se elimina inmediatamente.

1. **En GitHub (Remoto):**
   - Inmediatamente tras confirmar el merge del PR en `develop`, quien realice la acción (o el autor) debe hacer clic en el botón **"Delete branch"**.
   - _(Nota de seguridad: Los commits y el historial quedan preservados permanentemente en `develop`. GitHub además conserva siempre la opción "Restore branch" y "Revert" en el PR cerrado ante cualquier eventualidad)._

2. **En tu máquina local (Sugerencia de buenas prácticas):**
   - Para no acumular ramas viejas en tu computadora y mantener limpio tu entorno, se sugiere eliminar tu copia local una vez integrada:

   ```bash
   git checkout develop
   git pull origin develop
   git branch -d <nombre-de-tu-rama>
   git fetch --prune
   ```

3. **Sugerencia futura de configuración (Admin del repositorio):**
   - A futuro se sugiere que el administrador del repositorio active en GitHub la opción **"Automatically delete head branches"** (`Settings > General > Pull Requests`). De esta forma GitHub eliminará la rama remota de manera automática al mergear, ahorrando el paso manual sin riesgo de perder historial.
