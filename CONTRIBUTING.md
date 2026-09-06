# Contributing Guide

## 1. Nombrado de Ramas (Branches)

Estructura sugerida:
`<tipo>/<numero-ticket>-<descripcion-corta>`

> Usar `kebab-case` y todo en minúsculas.

### Prefijos

- `feature/` ➔ Nuevas funcionalidades.  
  Ejemplo: `feature/FE-12-filtro-tareas`
- `fix/` o `bugfix/` ➔ Corrección de errores.  
  Ejemplo: `fix/FE-05-error-token-autenticacion`
- `refactor/` ➔ Reestructuración o limpieza de código sin cambiar funcionalidad.  
  Ejemplo: `refactor/FE-08-simplificar-contexto`
- `docs/` ➔ Cambios en documentación o README.  
  Ejemplo: `docs/agregar-guia-contribucion`
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
        ├── feature/FE-12-filtro-tareas
        ├── fix/FE-05-error-token-autenticacion
        └── refactor/simplificar-autenticacion
```

#### Pasos para iniciar una nueva tarea:

```bash
# 1. Cambiar a develop y obtener los últimos cambios
git checkout develop
git pull origin develop

# 2. Crear y cambiar a la nueva rama
git checkout -b feature/FE-12-filtro-tareas
```

---

## 3. Commits

Se debe seguir el formato de **Conventional Commits** (en español, minúsculas y tiempo presente):

`<tipo>: <descripción breve en presente y minúsculas>`

### Ejemplos

```text
feat: agregar componente de lista de seguidores
fix: corregir clave de token en almacenamiento local
refactor: simplificar estado del proveedor de contexto
docs: agregar guia de contribucion
```

---

## 4. Pull Requests (PRs)

### Título del PR

El título debe seguir el mismo formato utilizado para los commits (en español):

Ejemplo:  
`feat: agregar componente de lista de seguidores`

### Contenido mínimo de la descripción

La descripción del PR debe incluir:

- **¿Qué se hizo?** Breve resumen de los cambios realizados.
- **Ticket / Issue:** Enlace o código de la tarea asociada (ej. `FE-12`).
- **¿Cómo probarlo?** Pasos sencillos para verificar los cambios.
- **Capturas de pantalla / GIF:** Obligatorio cuando existan cambios visuales o de UI, especialmente en diseños _responsive_ o móviles.

### Criterios para Merge

Para realizar el merge, el PR debe cumplir con los siguientes criterios:

- Al menos **1 aprobación** de un compañero.
- Superar las verificaciones automáticas (`build` / `linter`).
- No tener conflictos con la rama base (`develop`).
- El autor del PR, o el colaborador que lo aprueba, realiza el merge una vez aprobado.
