# QualityTrack — Esquema de Base de Datos · Versión 2 (consolidada)

Diagrama entidad-relación, diccionario de datos, reglas de integridad y script SQL

| Programa | Fecha | Estado | Deriva de |
|---|---|---|---|
| NO-Country · Semana 1 de 5 | 04/09/2026 | Validado con el equipo y backend | `spec/QualityTrack-PRD.md`, `spec/QualityTrack-Backlog-v1.md` |

Esta versión unifica las dos propuestas independientes de esquema (v1 de Mel Zarate y v1 de Ángel) y aplica las correcciones surgidas de contrastarlas contra el PRD y el Backlog. Los cambios que este trabajo obliga a hacer en esos dos documentos están listados aparte, en `docs/funcional/QualityTrack-Cambios-PRD-Backlog.md`.

---

## 00. Decisiones de diseño y supuestos

Convenciones adoptadas: PostgreSQL 14+, nombres de tabla en plural y `snake_case`, valores de dominio en `MAYUSCULAS`, `id` como `BIGINT GENERATED ALWAYS AS IDENTITY`, `created_at` y `updated_at` en todas las tablas con datos de negocio.

### Decisiones cerradas con el equipo

| # | Decisión | Impacto en el modelo |
|---|---|---|
| D1 | **Un solo tipo de elemento por OT, con N unidades.** El Vendedor carga la cantidad de piezas; todas del mismo tipo | `solicitudes.cantidad` y `ordenes_trabajo.cantidad`. Es el contraste del punto 4 del checklist |
| D2 | **El vencimiento de la fase se calcula hacia adelante**: se resuelve cuando la fase entra en la cola del operario, sumando `tiempo_estimado_minutos` | `ot_fases.fecha_vencimiento` se persiste resuelta, no se calcula al vuelo |
| D3 | **La fecha esperada de entrega del cliente es informativa.** No dispara alertas ni condiciona la planificación | `solicitudes.fecha_esperada_entrega` sin lógica asociada |
| D4 | **Calidad no atribuye la falla a una fase.** Observa el defecto sobre la pieza terminada; el diagnóstico es criterio del Jefe de producción | La auditoría no tiene FK a fase. El indicador "por fase" sale del retrabajo (ver R8) |
| D5 | **El checklist admite tres resultados por punto**: cumple, no cumple, no aplica — y queda vacío mientras no se contestó | `resultado_item` con 3 valores y **nulo permitido** (nulo = sin responder) |
| D6 | **Una fase puede repetirse dentro de la misma OT** (ej. Mecanizado → Soldadura → Mecanizado) | La unicidad se ancla en `numero_secuencia`, no en `fase_catalogo_id` |
| D7 | **Sin versionado de cotizaciones.** Una cotización por solicitud, que se aprueba o se rechaza. Si se rechaza y hay que recotizar, se carga una solicitud nueva | `UNIQUE` en `cotizaciones.solicitud_id` |
| D8 | **Una cotización aprobada genera exactamente una OT** | `UNIQUE` en `ordenes_trabajo.cotizacion_id` |
| D9 | **Los usuarios se cargan directamente en la base por el equipo de desarrollo.** El Gerente no da de alta operarios: solo los consulta y les asigna fases | `email` y `password_hash` obligatorios para todos los roles. **Elimina HU-5.2 tal como está escrita** |
| D10 | **Todos los usuarios se loguean, operarios incluidos** (consecuencia de D9) | Sin `CHECK` condicional de credenciales |
| D11 | **La habilitación operario↔fase es individual, no por tipo de tarea.** Resuelve la duda abierta en HU-5.1 del backlog (*"esto es por tipo verdad?"*) | Se mantiene la tabla `fase_operarios_habilitados` |
| D12 | **Se registra el historial de reasignaciones de operario** por balanceo de carga | Tabla `ot_fase_reasignaciones` |

### Extensiones documentadas para una fase 2

No se implementan en el MVP, pero el modelo está preparado para recibirlas sin rediseño:

| Extensión | Cómo se agrega |
|---|---|
| **Recotización con historial** | `numero_version` + `vigente` en `cotizaciones`, y quitar el `UNIQUE` de `solicitud_id`. Requiere además una acción "recotizar" en el dashboard del Vendedor |
| **Entregas parciales** | Tabla hija `entregas` (fecha, cantidad, receptor) colgando de `ordenes_trabajo`. La OT se cierra cuando la suma de entregas alcanza `cantidad`. **No requiere tocar el `UNIQUE` de `cotizacion_id`**: una entrega parcial no es una OT nueva |
| **Alta de operarios por el Gerente** | Restituir HU-5.2 y hacer `email`/`password_hash` opcionales para el rol `OPERARIO`, o generar credenciales automáticas |
| **Automatización del precio por variables** | Ya previsto como no-P0 en la sección 09 del PRD |

### Tabla descartada respecto de la propuesta de Ángel

`no_conformidades` no se incorporó. Su campo `estado` (`PENDIENTE_ANALISIS` → `FASES_REASIGNADAS` → `EN_CORRECCION` → `CERRADA`) duplica lo que ya expresan `ordenes_trabajo.estado` y el estado de las propias `ot_fases` en retrabajo; su `resolucion_jefe` duplica una nota de origen `JEFE_PRODUCCION`; y el vínculo con la auditoría ya existe vía `orden_trabajo_id`. Sumaba una tabla y tres puntos de sincronización sin agregar un dato que no estuviera disponible.

---

## 01. Diagrama entidad-relación

```mermaid
erDiagram
    USUARIOS ||--o{ FASE_OPERARIOS_HABILITADOS : "habilitado en"
    FASES_CATALOGO ||--o{ FASE_OPERARIOS_HABILITADOS : "habilita a"

    CLIENTES ||--o{ SOLICITUDES : "solicita"
    USUARIOS ||--o{ SOLICITUDES : "carga (vendedor)"
    SOLICITUDES ||--o{ ADJUNTOS : "incluye"
    USUARIOS ||--o{ ADJUNTOS : "sube"

    SOLICITUDES ||--o| COTIZACIONES : "deriva en"
    USUARIOS ||--o{ COTIZACIONES : "arma (jefe)"
    COTIZACIONES ||--o{ COTIZACION_FASES : "define secuencia"
    FASES_CATALOGO ||--o{ COTIZACION_FASES : "es elegida en"

    COTIZACIONES ||--o| ORDENES_TRABAJO : "genera al aprobarse"
    ORDENES_TRABAJO ||--o{ OT_FASES : "ejecuta"
    FASES_CATALOGO ||--o{ OT_FASES : "instancia"
    USUARIOS ||--o{ OT_FASES : "ejecuta (operario)"
    OT_FASES ||--o{ OT_FASE_REASIGNACIONES : "historial de cambios"
    USUARIOS ||--o{ OT_FASE_REASIGNACIONES : "interviene"

    ORDENES_TRABAJO ||--o{ OT_NOTAS : "recibe"
    OT_FASES ||--o{ OT_NOTAS : "aplica a"
    USUARIOS ||--o{ OT_NOTAS : "escribe"

    ORDENES_TRABAJO ||--o{ AUDITORIAS_CALIDAD : "es auditada"
    USUARIOS ||--o{ AUDITORIAS_CALIDAD : "audita (calidad)"
    AUDITORIAS_CALIDAD ||--o{ AUDITORIA_CHECKLIST_RESPUESTAS : "contiene 7 puntos"

    USUARIOS {
        bigint id PK
        varchar nombre
        varchar email "obligatorio para todos los roles (D9/D10)"
        varchar password_hash "obligatorio para todos los roles (D9/D10)"
        varchar rol
        varchar tipo_tarea
        varchar telefono
        boolean activo
    }
    CLIENTES {
        bigint id PK
        varchar razon_social
        varchar contacto_nombre
        varchar telefono
        varchar direccion
        varchar email
        boolean activo
    }
    FASES_CATALOGO {
        bigint id PK
        varchar codigo UK
        varchar nombre UK
        text descripcion
        boolean activo
    }
    FASE_OPERARIOS_HABILITADOS {
        bigint id PK
        bigint fase_catalogo_id FK
        bigint operario_id FK
        boolean habilitado
        bigint asignado_por_id FK
    }
    SOLICITUDES {
        bigint id PK
        varchar numero_solicitud UK
        bigint cliente_id FK
        bigint vendedor_id FK
        text descripcion_pieza
        integer cantidad
        date fecha_esperada_entrega
        text notas_comerciales
        varchar estado
    }
    ADJUNTOS {
        bigint id PK
        bigint solicitud_id FK
        varchar nombre_original
        varchar tipo_archivo
        varchar mime_type
        bigint tamanio_bytes
        varchar ruta_almacenamiento
        bigint subido_por_id FK
    }
    COTIZACIONES {
        bigint id PK
        varchar numero_cotizacion UK
        bigint solicitud_id FK_UK
        bigint jefe_produccion_id FK
        decimal precio_final
        varchar estado
        timestamptz fecha_envio_cliente
        timestamptz fecha_respuesta_cliente
        text motivo_rechazo_cliente
    }
    COTIZACION_FASES {
        bigint id PK
        bigint cotizacion_id FK
        bigint fase_catalogo_id FK
        integer numero_secuencia
        integer tiempo_estimado_minutos
        text instrucciones_fase
    }
    ORDENES_TRABAJO {
        bigint id PK
        varchar numero_ot UK
        bigint cotizacion_id FK_UK
        integer cantidad
        varchar estado
        timestamptz fecha_inicio_produccion
        timestamptz fecha_pase_calidad
        timestamptz fecha_pase_despacho
        timestamptz fecha_entrega
        varchar receptor_nombre
    }
    OT_FASES {
        bigint id PK
        bigint orden_trabajo_id FK
        bigint fase_catalogo_id FK
        integer numero_secuencia
        bigint operario_id FK
        integer tiempo_estimado_minutos
        timestamptz fecha_vencimiento
        varchar estado
        timestamptz fecha_inicio_real
        timestamptz fecha_fin_real
        boolean es_rehacer
        integer ciclo_iteracion
    }
    OT_FASE_REASIGNACIONES {
        bigint id PK
        bigint ot_fase_id FK
        bigint operario_anterior_id FK
        bigint operario_nuevo_id FK
        bigint reasignado_por_id FK
        text motivo
    }
    OT_NOTAS {
        bigint id PK
        bigint orden_trabajo_id FK
        bigint ot_fase_id FK
        bigint usuario_id FK
        varchar origen
        text contenido
    }
    AUDITORIAS_CALIDAD {
        bigint id PK
        bigint orden_trabajo_id FK
        bigint auditor_id FK
        integer numero_auditoria
        varchar resultado
        text observaciones_generales
        timestamptz fecha_veredicto
    }
    AUDITORIA_CHECKLIST_RESPUESTAS {
        bigint id PK
        bigint auditoria_id FK
        integer item_numero
        varchar criterio_nombre
        varchar resultado_item
        text observaciones
    }
```

---

## 02. Diccionario de datos

### 2.1 · `usuarios`

Los 5 roles del sistema en una sola tabla. **Todos los usuarios se cargan en la base por el equipo de desarrollo y todos tienen credenciales** (D9, D10). El Gerente consulta operarios y les asigna fases, pero no los crea.

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | Identificador único |
| `nombre` | VARCHAR(120) | NO | | | Nombre y apellido |
| `email` | VARCHAR(150) | NO | UK | | Login |
| `password_hash` | VARCHAR(255) | NO | | bcrypt / Argon2id | Nunca en texto plano |
| `rol` | VARCHAR(30) | NO | | `GERENTE`, `JEFE_PRODUCCION`, `OPERARIO`, `CALIDAD`, `VENDEDOR` | Define dashboard y permisos |
| `tipo_tarea` | VARCHAR(100) | SÍ | | Ej. `Tornero`, `Soldador` | Solo para operarios (HU-5.1) |
| `telefono` | VARCHAR(30) | SÍ | | | Contacto interno |
| `activo` | BOOLEAN | NO | | `TRUE` | Baja lógica |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.2 · `clientes`

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `razon_social` | VARCHAR(150) | NO | | | Nombre del cliente (HU-1.1) |
| `contacto_nombre` | VARCHAR(120) | NO | | | Persona de contacto (HU-1.1) |
| `telefono` | VARCHAR(30) | NO | | | Obligatorio por HU-1.1 |
| `direccion` | VARCHAR(255) | NO | | | Obligatorio por HU-1.1 |
| `email` | VARCHAR(150) | SÍ | | | Canal para enviar la cotización |
| `activo` | BOOLEAN | NO | | `TRUE` | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.3 · `fases_catalogo`

Catálogo maestro configurado por el Gerente (HU-5.1, sección 05 del PRD). **No contiene orden ni precedencia** — la secuencia se arma pedido por pedido.

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `codigo` | VARCHAR(20) | NO | UK | Ej. `CORTE`, `PLEGADO` | Código corto para referencia |
| `nombre` | VARCHAR(100) | NO | UK | Ej. `Corte`, `Soldadura` | Nombre visible de la fase |
| `descripcion` | TEXT | SÍ | | | Detalle del proceso industrial |
| `activo` | BOOLEAN | NO | | `TRUE` | Baja lógica sin perder historial |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.4 · `fase_operarios_habilitados`

Relación muchos-a-muchos: qué operarios pueden ejecutar cada fase (HU-5.1, D11).

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `fase_catalogo_id` | BIGINT | NO | FK | `fases_catalogo(id)` | |
| `operario_id` | BIGINT | NO | FK | `usuarios(id)` | Usuario con rol `OPERARIO` |
| `habilitado` | BOOLEAN | NO | | `TRUE` | Permite suspender sin borrar |
| `asignado_por_id` | BIGINT | NO | FK | `usuarios(id)` | Gerente que otorgó la habilitación |
| `created_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

`UNIQUE (fase_catalogo_id, operario_id)`

### 2.5 · `solicitudes`

Pedido de cotización cargado por el Vendedor (HU-1.1).

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `numero_solicitud` | VARCHAR(30) | NO | UK | Ej. `SOL-2026-0001` | Código legible para el cliente |
| `cliente_id` | BIGINT | NO | FK | `clientes(id)` | |
| `vendedor_id` | BIGINT | NO | FK | `usuarios(id)` | Quien cargó el pedido |
| `descripcion_pieza` | TEXT | NO | | | Qué pieza o trabajo se pide (dato nuevo — ver documento de cambios) |
| `cantidad` | INTEGER | NO | | `1`, CHECK `> 0` | Unidades del mismo tipo de pieza (D1) |
| `fecha_esperada_entrega` | DATE | SÍ | | | Fecha que pide el cliente, si la dio. Informativa (D3) |
| `notas_comerciales` | TEXT | SÍ | | | Notas del Vendedor |
| `estado` | VARCHAR(30) | NO | | `PENDIENTE_COTIZACION`, `COTIZADA` | Solo eso: el ciclo comercial vive en la cotización |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.6 · `adjuntos`

Documentación de la solicitud. El Jefe y el Operario la alcanzan navegando desde la OT — no hay FK duplicada a `ordenes_trabajo`.

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `solicitud_id` | BIGINT | NO | FK | `solicitudes(id)` | |
| `nombre_original` | VARCHAR(255) | NO | | | Nombre del archivo subido |
| `tipo_archivo` | VARCHAR(50) | NO | | `PLANO`, `CERTIFICADO`, `ESPECIFICACION`, `OTRO` | Etiqueta; no habilita funcionalidad |
| `mime_type` | VARCHAR(100) | NO | | Ej. `application/pdf` | |
| `tamanio_bytes` | BIGINT | NO | | CHECK `> 0` | |
| `ruta_almacenamiento` | VARCHAR(500) | NO | | | URI o path del storage |
| `subido_por_id` | BIGINT | NO | FK | `usuarios(id)` | |
| `created_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.7 · `cotizaciones`

Armada por el Jefe (HU-2.1), gestionada ante el cliente por el Vendedor (HU-1.3). **Precio único global** (regla 1 del PRD). Una sola por solicitud (D7).

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `numero_cotizacion` | VARCHAR(30) | NO | UK | Ej. `COT-2026-0001` | Código legible |
| `solicitud_id` | BIGINT | NO | FK, UK | `solicitudes(id)` | **Único** — sin versionado (D7) |
| `jefe_produccion_id` | BIGINT | NO | FK | `usuarios(id)` | |
| `precio_final` | DECIMAL(14,2) | NO | | CHECK `>= 0` | Único valor monetario del sistema |
| `estado` | VARCHAR(30) | NO | | `LISTA_PARA_ENVIAR`, `ENVIADA_A_CLIENTE`, `APROBADA`, `NO_APROBADA` | Único lugar donde vive la respuesta del cliente |
| `fecha_envio_cliente` | TIMESTAMPTZ | SÍ | | | El Vendedor la marca como enviada |
| `fecha_respuesta_cliente` | TIMESTAMPTZ | SÍ | | | |
| `motivo_rechazo_cliente` | TEXT | SÍ | | | |
| `observaciones` | TEXT | SÍ | | | Notas internas de producción |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.8 · `cotizacion_fases`

Secuencia y tiempos definidos por el Jefe para este pedido puntual (reglas 2 y 3 del PRD). **Sin columna de precio.**

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `cotizacion_id` | BIGINT | NO | FK | `cotizaciones(id)` | |
| `fase_catalogo_id` | BIGINT | NO | FK | `fases_catalogo(id)` | |
| `numero_secuencia` | INTEGER | NO | | CHECK `> 0` | Posición en el orden de ejecución |
| `tiempo_estimado_minutos` | INTEGER | NO | | CHECK `> 0` | Estimación del Jefe (regla 2) |
| `instrucciones_fase` | TEXT | SÍ | | | Indicaciones técnicas |
| `created_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

`UNIQUE (cotizacion_id, numero_secuencia)` — dos fases no ocupan la misma posición.
**Sin** `UNIQUE (cotizacion_id, fase_catalogo_id)`: una fase puede repetirse en la secuencia (D6).

### 2.9 · `ordenes_trabajo`

Se genera automáticamente al confirmar el Vendedor la aprobación del cliente (HU-1.3). Cliente, vendedor y solicitud se alcanzan navegando vía `cotizacion_id` — no se duplican como FK.

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `numero_ot` | VARCHAR(30) | NO | UK | Ej. `OT-2026-0001` | Se marca en la pieza (checklist punto 5) |
| `cotizacion_id` | BIGINT | NO | FK, UK | `cotizaciones(id)` | **Único** — una cotización, una OT (D8) |
| `cantidad` | INTEGER | NO | | CHECK `> 0` | Copiada de la solicitud. Contraste del checklist punto 4 |
| `estado` | VARCHAR(30) | NO | | `EN_PRODUCCION`, `EN_CALIDAD`, `NO_CONFORME`, `DESPACHO`, `ENTREGADA` | Ciclo de vida global |
| `fecha_inicio_produccion` | TIMESTAMPTZ | SÍ | | | Arranque de la primera fase |
| `fecha_pase_calidad` | TIMESTAMPTZ | SÍ | | | Cuando el operario termina la última fase. **Base del indicador de tiempo en Calidad (HU-5.4)** |
| `fecha_pase_despacho` | TIMESTAMPTZ | SÍ | | | Veredicto conforme de Calidad |
| `fecha_entrega` | TIMESTAMPTZ | SÍ | | | Obligatoria si `estado = ENTREGADA` |
| `receptor_nombre` | VARCHAR(150) | SÍ | | | Obligatorio si `estado = ENTREGADA` (HU-1.4) |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.10 · `ot_fases`

Instancia ejecutable de cada fase. Estados del tablero del operario: `EN_COLA` → `EN_EJECUCION` → `TERMINADO` (HU-3.1).

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `orden_trabajo_id` | BIGINT | NO | FK | `ordenes_trabajo(id)` | |
| `fase_catalogo_id` | BIGINT | NO | FK | `fases_catalogo(id)` | |
| `numero_secuencia` | INTEGER | NO | | CHECK `> 0` | Copiado de `cotizacion_fases` |
| `operario_id` | BIGINT | NO | FK | `usuarios(id)` | Debe estar habilitado para la fase (R3) |
| `tiempo_estimado_minutos` | INTEGER | NO | | CHECK `> 0` | Duración prevista |
| `fecha_vencimiento` | TIMESTAMPTZ | SÍ | | | Resuelta al entrar en cola (D2). Es lo que ve el operario (HU-3.3) |
| `estado` | VARCHAR(30) | NO | | `EN_COLA`, `EN_EJECUCION`, `TERMINADO` | |
| `fecha_inicio_real` | TIMESTAMPTZ | SÍ | | | Botón "comenzar" |
| `fecha_fin_real` | TIMESTAMPTZ | SÍ | | | Botón "terminar" |
| `duracion_real_minutos` | INTEGER | SÍ | | CHECK `>= 0` | Calculada al finalizar |
| `es_rehacer` | BOOLEAN | NO | | `FALSE` | Marca las fases originadas en un retrabajo |
| `ciclo_iteracion` | INTEGER | NO | | `1`, CHECK `>= 1` | 1 = ejecución normal, 2+ = retrabajo |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

`UNIQUE (orden_trabajo_id, numero_secuencia, ciclo_iteracion)` — **anclado en la posición, no en la fase**, para permitir que una fase se repita en la secuencia (D6).

### 2.11 · `ot_fase_reasignaciones`

Historial de cambios de operario por balanceo de carga (HU-2.2). Sin esta tabla, la reasignación pisa `ot_fases.operario_id` y se pierde quién la tenía antes.

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `ot_fase_id` | BIGINT | NO | FK | `ot_fases(id)` | |
| `operario_anterior_id` | BIGINT | NO | FK | `usuarios(id)` | Deja de ver la tarea |
| `operario_nuevo_id` | BIGINT | NO | FK | `usuarios(id)` | La recibe en su cola |
| `reasignado_por_id` | BIGINT | NO | FK | `usuarios(id)` | Jefe que ordenó el cambio |
| `motivo` | TEXT | SÍ | | | |
| `fecha_reasignacion` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.12 · `ot_notas`

Notas discriminadas por origen (HU-3.4). **Solo dos orígenes**: el dashboard del operario es de solo lectura y el vendedor no interviene en planta.

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `orden_trabajo_id` | BIGINT | NO | FK | `ordenes_trabajo(id)` | |
| `ot_fase_id` | BIGINT | SÍ | FK | `ot_fases(id)` | Nulo si aplica a toda la OT |
| `usuario_id` | BIGINT | NO | FK | `usuarios(id)` | Autor |
| `origen` | VARCHAR(30) | NO | | `CALIDAD`, `JEFE_PRODUCCION` | Nunca se mezclan en la vista del operario |
| `contenido` | TEXT | NO | | | |
| `created_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

### 2.13 · `auditorias_calidad`

Corrida del control previo a despacho (HU-4.1 a 4.3). Puede haber más de una por OT si vuelve tras un retrabajo. **No tiene FK a fase**: Calidad observa el defecto, no lo atribuye (D4).

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `orden_trabajo_id` | BIGINT | NO | FK | `ordenes_trabajo(id)` | |
| `auditor_id` | BIGINT | NO | FK | `usuarios(id)` | Rol `CALIDAD` |
| `numero_auditoria` | INTEGER | NO | | `1`, CHECK `>= 1` | Ordinal por OT |
| `resultado` | VARCHAR(20) | NO | | `CONFORME`, `NO_CONFORME` | Punto 8 del checklist |
| `observaciones_generales` | TEXT | SÍ | | Obligatorio si `NO_CONFORME` | Lo que ve el Jefe al rebotar la OT |
| `fecha_veredicto` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | Cierre del control |
| `created_at` | TIMESTAMPTZ | NO | | `CURRENT_TIMESTAMP` | |

`UNIQUE (orden_trabajo_id, numero_auditoria)`

### 2.14 · `auditoria_checklist_respuestas`

Los 7 puntos verificables del checklist (sección 08 del PRD). El punto 8 es el veredicto y vive en la cabecera.

| Atributo | Tipo | Nulo | Clave | Dominio / Default | Descripción |
|---|---|---|---|---|---|
| `id` | BIGINT IDENTITY | NO | PK | | |
| `auditoria_id` | BIGINT | NO | FK | `auditorias_calidad(id)` | |
| `item_numero` | INTEGER | NO | | CHECK `BETWEEN 1 AND 7` | |
| `criterio_nombre` | VARCHAR(120) | NO | | | Nombre del punto según PRD 08 |
| `resultado_item` | VARCHAR(20) | SÍ | | `CUMPLE`, `NO_CUMPLE`, `NO_APLICA` | **Nulo = todavía sin responder.** Los tres valores explícitos evitan que "no aplica" se confunda con "no contestado" (D5) |
| `observaciones` | TEXT | SÍ | | | Detalle de la desviación |

`UNIQUE (auditoria_id, item_numero)`

**Los 7 criterios canónicos:** 1 Conformidad dimensional · 2 Fases completas · 3 Terminación/acabado · 4 Cantidad · 5 Identificación · 6 Prueba funcional · 7 Documentación de respaldo.

---

## 03. Claves primarias y foráneas

| Tabla | PK | FKs | ON DELETE |
|---|---|---|---|
| `usuarios` | id | — | — |
| `clientes` | id | — | — |
| `fases_catalogo` | id | — | — |
| `fase_operarios_habilitados` | id | fase_catalogo_id → fases_catalogo · operario_id → usuarios · asignado_por_id → usuarios | RESTRICT |
| `solicitudes` | id | cliente_id → clientes · vendedor_id → usuarios | RESTRICT |
| `adjuntos` | id | solicitud_id → solicitudes · subido_por_id → usuarios | CASCADE / RESTRICT |
| `cotizaciones` | id | solicitud_id → solicitudes **(UK)** · jefe_produccion_id → usuarios | RESTRICT |
| `cotizacion_fases` | id | cotizacion_id → cotizaciones · fase_catalogo_id → fases_catalogo | CASCADE / RESTRICT |
| `ordenes_trabajo` | id | cotizacion_id → cotizaciones **(UK)** | RESTRICT |
| `ot_fases` | id | orden_trabajo_id → ordenes_trabajo · fase_catalogo_id → fases_catalogo · operario_id → usuarios | RESTRICT |
| `ot_fase_reasignaciones` | id | ot_fase_id → ot_fases · operario_anterior_id, operario_nuevo_id, reasignado_por_id → usuarios | CASCADE / RESTRICT |
| `ot_notas` | id | orden_trabajo_id → ordenes_trabajo · ot_fase_id → ot_fases · usuario_id → usuarios | CASCADE / SET NULL / RESTRICT |
| `auditorias_calidad` | id | orden_trabajo_id → ordenes_trabajo · auditor_id → usuarios | RESTRICT |
| `auditoria_checklist_respuestas` | id | auditoria_id → auditorias_calidad | CASCADE |

**Criterio de las políticas de borrado:** `RESTRICT` en todo lo que sea dato maestro o expediente (usuarios, clientes, fases, cotizaciones, OTs, auditorías) para no perder trazabilidad; `CASCADE` solo en lo que no tiene sentido por sí solo (adjuntos, fases de una cotización, notas, ítems de checklist). En producción no se espera borrar nada.

---

## 04. Reglas de integridad

**R1 · Precio único.** El único campo monetario del sistema es `cotizaciones.precio_final`. Ni `cotizacion_fases` ni `ot_fases` tienen precio ni subtotal. *(Regla 1 del PRD.)*

**R2 · Secuencia variable e independiente del catálogo.** `fases_catalogo` no almacena orden ni precedencia. La secuencia se define en `cotizacion_fases.numero_secuencia` y se copia a `ot_fases.numero_secuencia` al generar la OT. *(Regla 3 del PRD.)*

**R3 · Competencia del operario.** `ot_fases.operario_id` debe corresponder a un usuario con `rol = 'OPERARIO'` que tenga un registro con `habilitado = TRUE` en `fase_operarios_habilitados` para el mismo `fase_catalogo_id`. Se garantiza en la base con el trigger `trg_chk_operario_habilitado` — no depende de que la aplicación lo valide bien en cada endpoint. *(HU-5.1.)*

**R4 · Una sola cotización por solicitud.** `UNIQUE (solicitud_id)`. Si el cliente rechaza, el Jefe reescribe la misma fila; no se guarda historial de versiones. *(D7 — decisión de alcance del MVP.)*

**R5 · Una sola OT por cotización.** `UNIQUE (cotizacion_id)`. Protege contra doble generación por doble click o reintento del backend. *(D8, HU-1.3.)*

**R6 · Sin FKs redundantes en la OT.** La OT se vincula únicamente a la cotización. Solicitud, cliente y vendedor se alcanzan navegando. Evita que tres caminos al mismo dato puedan contradecirse. Ese recorrido está centralizado en la vista `v_ot_expediente` (ver sección 05): ningún endpoint debería rearmar el JOIN a mano. *(HU-1.2 depende de que ese recorrido sea consistente.)*

**R7 · Notas nunca mezcladas.** `ot_notas.origen` restringido a `CALIDAD` y `JEFE_PRODUCCION`. La vista del operario consulta cada origen por separado. *(HU-3.4.)*

**R8 · Retrabajo selectivo sin pérdida de historia.** Cuando el Jefe manda a rehacer una fase, se inserta una fila nueva en `ot_fases` con `es_rehacer = TRUE` y `ciclo_iteracion + 1`. Las fases conformes conservan su estado `TERMINADO`. **De acá sale el indicador "retrabajos por fase" del Gerente**, agrupando las filas con `es_rehacer = TRUE` por `fase_catalogo_id`. *(HU-2.3, HU-5.4, D4.)*

**R9 · Observación obligatoria en no conformidad.** Si `resultado = 'NO_CONFORME'`, `observaciones_generales` no puede ser nulo ni vacío. `CHECK` en la tabla. *(HU-4.2, punto 8 del PRD.)*

**R10 · Checklist completo antes del veredicto.** Cada auditoría debe tener las 7 respuestas cargadas y **ninguna con `resultado_item` nulo** antes de confirmar el resultado. Se garantiza con el constraint trigger `trg_chk_checklist_completo`, diferido al final de la transacción para permitir insertar la cabecera y las 7 respuestas en un mismo commit. *(HU-4.2.)*

**R11 · Entrega solo desde Despacho.** `estado = 'ENTREGADA'` exige `fecha_entrega` y `receptor_nombre` (`CHECK`), y solo es alcanzable desde `DESPACHO` (validación de aplicación). *(HU-1.4.)*

**R12 · Tiempo en Calidad.** Se mide como `auditorias_calidad.fecha_veredicto − ordenes_trabajo.fecha_pase_calidad`. La marca de entrada se sella cuando el operario termina la última fase, no cuando el auditor abre la OT. *(HU-3.1, HU-5.4.)*

---

## 05. Script SQL de creación

```sql
-- =============================================================================
-- QualityTrack — DDL v2 (consolidado)
-- Motor: PostgreSQL 14+
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. usuarios
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL
        CHECK (rol IN ('GERENTE','JEFE_PRODUCCION','OPERARIO','CALIDAD','VENDEDOR')),
    tipo_tarea VARCHAR(100) NULL,
    telefono VARCHAR(30) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- tipo_tarea aplica únicamente a operarios
    CONSTRAINT chk_tipo_tarea CHECK (tipo_tarea IS NULL OR rol = 'OPERARIO')
);

-- -----------------------------------------------------------------------------
-- 2. clientes
-- -----------------------------------------------------------------------------
CREATE TABLE clientes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    contacto_nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    email VARCHAR(150) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. fases_catalogo  (catálogo global del Gerente — HU-5.1)
-- Sin orden ni precedencia: la secuencia se arma pedido por pedido
-- -----------------------------------------------------------------------------
CREATE TABLE fases_catalogo (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. fase_operarios_habilitados  (competencias — HU-5.1)
-- -----------------------------------------------------------------------------
CREATE TABLE fase_operarios_habilitados (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fase_catalogo_id BIGINT NOT NULL REFERENCES fases_catalogo(id) ON DELETE RESTRICT,
    operario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,
    asignado_por_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fase_operario UNIQUE (fase_catalogo_id, operario_id)
);

-- -----------------------------------------------------------------------------
-- 5. solicitudes  (levantar pedido — HU-1.1)
-- -----------------------------------------------------------------------------
CREATE TABLE solicitudes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_solicitud VARCHAR(30) NOT NULL UNIQUE,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    vendedor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    descripcion_pieza TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    fecha_esperada_entrega DATE NULL,
    notas_comerciales TEXT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_COTIZACION'
        CHECK (estado IN ('PENDIENTE_COTIZACION','COTIZADA')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. adjuntos  (planos y documentación — HU-1.1, HU-3.2)
-- -----------------------------------------------------------------------------
CREATE TABLE adjuntos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    solicitud_id BIGINT NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(50) NOT NULL
        CHECK (tipo_archivo IN ('PLANO','CERTIFICADO','ESPECIFICACION','OTRO')),
    mime_type VARCHAR(100) NOT NULL,
    tamanio_bytes BIGINT NOT NULL CHECK (tamanio_bytes > 0),
    ruta_almacenamiento VARCHAR(500) NOT NULL,
    subido_por_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. cotizaciones  (HU-2.1 / HU-1.3)
-- Precio único global · una sola cotización por solicitud (R4)
-- -----------------------------------------------------------------------------
CREATE TABLE cotizaciones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_cotizacion VARCHAR(30) NOT NULL UNIQUE,
    solicitud_id BIGINT NOT NULL UNIQUE REFERENCES solicitudes(id) ON DELETE RESTRICT,
    jefe_produccion_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    precio_final DECIMAL(14,2) NOT NULL CHECK (precio_final >= 0.00),
    estado VARCHAR(30) NOT NULL DEFAULT 'LISTA_PARA_ENVIAR'
        CHECK (estado IN ('LISTA_PARA_ENVIAR','ENVIADA_A_CLIENTE','APROBADA','NO_APROBADA')),
    fecha_envio_cliente TIMESTAMPTZ NULL,
    fecha_respuesta_cliente TIMESTAMPTZ NULL,
    motivo_rechazo_cliente TEXT NULL,
    observaciones TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. cotizacion_fases  (secuencia y tiempos por pedido — reglas 2 y 3)
-- Sin columna de precio. Sin unique por fase: una fase puede repetirse (D6)
-- -----------------------------------------------------------------------------
CREATE TABLE cotizacion_fases (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cotizacion_id BIGINT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
    fase_catalogo_id BIGINT NOT NULL REFERENCES fases_catalogo(id) ON DELETE RESTRICT,
    numero_secuencia INTEGER NOT NULL CHECK (numero_secuencia > 0),
    tiempo_estimado_minutos INTEGER NOT NULL CHECK (tiempo_estimado_minutos > 0),
    instrucciones_fase TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cotizacion_secuencia UNIQUE (cotizacion_id, numero_secuencia)
);

-- -----------------------------------------------------------------------------
-- 9. ordenes_trabajo  (generada al aprobar el cliente — HU-1.3)
-- Sin FKs redundantes: solicitud/cliente/vendedor se alcanzan vía cotización (R6)
-- -----------------------------------------------------------------------------
CREATE TABLE ordenes_trabajo (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_ot VARCHAR(30) NOT NULL UNIQUE,
    cotizacion_id BIGINT NOT NULL UNIQUE REFERENCES cotizaciones(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    estado VARCHAR(30) NOT NULL DEFAULT 'EN_PRODUCCION'
        CHECK (estado IN ('EN_PRODUCCION','EN_CALIDAD','NO_CONFORME','DESPACHO','ENTREGADA')),
    fecha_inicio_produccion TIMESTAMPTZ NULL,
    fecha_pase_calidad TIMESTAMPTZ NULL,
    fecha_pase_despacho TIMESTAMPTZ NULL,
    fecha_entrega TIMESTAMPTZ NULL,
    receptor_nombre VARCHAR(150) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_ot_entrega CHECK (
        estado <> 'ENTREGADA'
        OR (fecha_entrega IS NOT NULL AND receptor_nombre IS NOT NULL)
    )
);

-- -----------------------------------------------------------------------------
-- 10. ot_fases  (tablero del operario — HU-3.1)
-- Unicidad anclada en la posición, no en la fase (D6)
-- -----------------------------------------------------------------------------
CREATE TABLE ot_fases (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    orden_trabajo_id BIGINT NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE RESTRICT,
    fase_catalogo_id BIGINT NOT NULL REFERENCES fases_catalogo(id) ON DELETE RESTRICT,
    numero_secuencia INTEGER NOT NULL CHECK (numero_secuencia > 0),
    operario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tiempo_estimado_minutos INTEGER NOT NULL CHECK (tiempo_estimado_minutos > 0),
    fecha_vencimiento TIMESTAMPTZ NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'EN_COLA'
        CHECK (estado IN ('EN_COLA','EN_EJECUCION','TERMINADO')),
    fecha_inicio_real TIMESTAMPTZ NULL,
    fecha_fin_real TIMESTAMPTZ NULL,
    duracion_real_minutos INTEGER NULL CHECK (duracion_real_minutos >= 0),
    es_rehacer BOOLEAN NOT NULL DEFAULT FALSE,
    ciclo_iteracion INTEGER NOT NULL DEFAULT 1 CHECK (ciclo_iteracion >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ot_secuencia_ciclo UNIQUE (orden_trabajo_id, numero_secuencia, ciclo_iteracion)
);

-- Regla R3 (operario habilitado para la fase) — activa en la base.
CREATE OR REPLACE FUNCTION chk_operario_habilitado() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM fase_operarios_habilitados
        WHERE fase_catalogo_id = NEW.fase_catalogo_id
          AND operario_id = NEW.operario_id
          AND habilitado = TRUE
    ) THEN
        RAISE EXCEPTION 'El operario % no está habilitado para la fase %',
            NEW.operario_id, NEW.fase_catalogo_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chk_operario_habilitado
    BEFORE INSERT OR UPDATE OF operario_id ON ot_fases
    FOR EACH ROW EXECUTE FUNCTION chk_operario_habilitado();

-- -----------------------------------------------------------------------------
-- 11. ot_fase_reasignaciones  (historial de balanceo de carga — HU-2.2, D12)
-- -----------------------------------------------------------------------------
CREATE TABLE ot_fase_reasignaciones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ot_fase_id BIGINT NOT NULL REFERENCES ot_fases(id) ON DELETE CASCADE,
    operario_anterior_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    operario_nuevo_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    reasignado_por_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    motivo TEXT NULL,
    fecha_reasignacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 12. ot_notas  (discriminadas por origen — HU-3.4)
-- Solo dos orígenes: el operario no escribe, el vendedor no interviene en planta
-- -----------------------------------------------------------------------------
CREATE TABLE ot_notas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    orden_trabajo_id BIGINT NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    ot_fase_id BIGINT NULL REFERENCES ot_fases(id) ON DELETE SET NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    origen VARCHAR(30) NOT NULL CHECK (origen IN ('CALIDAD','JEFE_PRODUCCION')),
    contenido TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 13. auditorias_calidad  (HU-4.1 a 4.3)
-- Sin FK a fase: Calidad observa el defecto, no lo atribuye (D4)
-- -----------------------------------------------------------------------------
CREATE TABLE auditorias_calidad (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    orden_trabajo_id BIGINT NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE RESTRICT,
    auditor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    numero_auditoria INTEGER NOT NULL DEFAULT 1 CHECK (numero_auditoria >= 1),
    resultado VARCHAR(20) NOT NULL CHECK (resultado IN ('CONFORME','NO_CONFORME')),
    observaciones_generales TEXT NULL,
    fecha_veredicto TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ot_auditoria UNIQUE (orden_trabajo_id, numero_auditoria),
    CONSTRAINT chk_rechazo_observacion CHECK (
        resultado <> 'NO_CONFORME'
        OR (observaciones_generales IS NOT NULL AND LENGTH(TRIM(observaciones_generales)) > 0)
    )
);

-- -----------------------------------------------------------------------------
-- 14. auditoria_checklist_respuestas  (7 puntos verificables — PRD 08)
-- El punto 8 es el veredicto y vive en auditorias_calidad.resultado
-- -----------------------------------------------------------------------------
CREATE TABLE auditoria_checklist_respuestas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auditoria_id BIGINT NOT NULL REFERENCES auditorias_calidad(id) ON DELETE CASCADE,
    item_numero INTEGER NOT NULL CHECK (item_numero BETWEEN 1 AND 7),
    criterio_nombre VARCHAR(120) NOT NULL,
    -- NULL = todavía sin responder. Los 3 valores son respuestas explícitas del auditor
    resultado_item VARCHAR(20) NULL
        CHECK (resultado_item IN ('CUMPLE','NO_CUMPLE','NO_APLICA')),
    observaciones TEXT NULL,
    CONSTRAINT uq_auditoria_item UNIQUE (auditoria_id, item_numero)
);

-- -----------------------------------------------------------------------------
-- Regla R10 (checklist completo antes del veredicto) — constraint trigger.
-- Se ejecuta DEFERRED, al final de la transacción: permite insertar la
-- cabecera (auditorias_calidad) y las 7 respuestas en el mismo commit sin
-- problema de orden, y solo entonces exige que las 7 estén respondidas.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION chk_checklist_completo() RETURNS TRIGGER AS $$
DECLARE
    respuestas_completas INTEGER;
BEGIN
    SELECT COUNT(*) INTO respuestas_completas
    FROM auditoria_checklist_respuestas
    WHERE auditoria_id = NEW.id
      AND resultado_item IS NOT NULL;

    IF respuestas_completas < 7 THEN
        RAISE EXCEPTION 'La auditoría % no tiene los 7 puntos del checklist respondidos (tiene %)',
            NEW.id, respuestas_completas;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_chk_checklist_completo
    AFTER INSERT OR UPDATE ON auditorias_calidad
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION chk_checklist_completo();

-- =============================================================================
-- ÍNDICES PARA LOS DASHBOARDS
-- =============================================================================
-- Tablero del operario (HU-3.1)
CREATE INDEX idx_ot_fases_operario_estado ON ot_fases(operario_id, estado);
-- Gestión de planta: carga por operario (HU-2.2)
CREATE INDEX idx_ot_fases_carga_planta ON ot_fases(operario_id)
    WHERE estado IN ('EN_COLA','EN_EJECUCION');
-- Panel de Calidad: OTs esperando control (HU-4.1)
CREATE INDEX idx_ot_pendiente_calidad ON ordenes_trabajo(estado, fecha_pase_calidad)
    WHERE estado = 'EN_CALIDAD';
-- Vista global de planta: congestión por fase (HU-5.3)
CREATE INDEX idx_ot_fases_congestion ON ot_fases(fase_catalogo_id, estado);
-- Vista global de calidad: conformidad (HU-5.4)
CREATE INDEX idx_auditorias_stats ON auditorias_calidad(resultado, fecha_veredicto);
-- Retrabajos por fase (HU-5.4, regla R8)
CREATE INDEX idx_ot_fases_retrabajo ON ot_fases(fase_catalogo_id)
    WHERE es_rehacer = TRUE;
-- Expediente del vendedor (HU-1.2)
CREATE INDEX idx_solicitudes_cliente ON solicitudes(cliente_id, estado);
-- Notas por origen (HU-3.4)
CREATE INDEX idx_ot_notas_origen ON ot_notas(orden_trabajo_id, origen, created_at);

-- =============================================================================
-- MANTENIMIENTO AUTOMÁTICO DE updated_at
-- La columna se actualiza sola en cada UPDATE: no depende de que el backend
-- se acuerde de setearla, así que nunca queda desactualizada.
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated        BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_clientes_updated        BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fases_catalogo_updated  BEFORE UPDATE ON fases_catalogo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_solicitudes_updated     BEFORE UPDATE ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cotizaciones_updated    BEFORE UPDATE ON cotizaciones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ordenes_trabajo_updated BEFORE UPDATE ON ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ot_fases_updated        BEFORE UPDATE ON ot_fases
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- VISTA — Expediente de la OT (R6 / HU-1.2)
-- Único camino de navegación válido: OT -> cotización -> solicitud -> cliente
-- / vendedor. Cualquier consulta que necesite estos datos usa esta vista en
-- vez de repetir el JOIN a mano, para que no puedan coexistir dos versiones
-- del mismo recorrido que terminen contradiciéndose.
-- =============================================================================
CREATE VIEW v_ot_expediente AS
SELECT
    ot.id                   AS ot_id,
    ot.numero_ot,
    ot.estado                AS ot_estado,
    ot.cantidad               AS ot_cantidad,
    ot.fecha_inicio_produccion,
    ot.fecha_pase_calidad,
    ot.fecha_pase_despacho,
    ot.fecha_entrega,
    ot.receptor_nombre,
    cot.id                   AS cotizacion_id,
    cot.numero_cotizacion,
    cot.precio_final,
    cot.estado                AS cotizacion_estado,
    sol.id                   AS solicitud_id,
    sol.numero_solicitud,
    sol.descripcion_pieza,
    sol.fecha_esperada_entrega,
    cli.id                   AS cliente_id,
    cli.razon_social          AS cliente_razon_social,
    cli.contacto_nombre       AS cliente_contacto_nombre,
    ven.id                   AS vendedor_id,
    ven.nombre                AS vendedor_nombre
FROM ordenes_trabajo ot
JOIN cotizaciones cot ON cot.id = ot.cotizacion_id
JOIN solicitudes sol  ON sol.id = cot.solicitud_id
JOIN clientes cli     ON cli.id = sol.cliente_id
JOIN usuarios ven     ON ven.id = sol.vendedor_id;
```

---

## 06. Datos semilla para demo

```sql
-- Usuarios: uno por rol + dos operarios. Todos con credenciales, cargados
-- por el equipo de desarrollo (D9). El Gerente no crea usuarios.
INSERT INTO usuarios (nombre, email, password_hash, rol, tipo_tarea) VALUES
('Gonzalo Gerente',  'gerente@qualitytrack.com',   '$2a$12$...', 'GERENTE',         NULL),
('Martín Jefe',      'jefe@qualitytrack.com',      '$2a$12$...', 'JEFE_PRODUCCION', NULL),
('Carlos Vendedor',  'vendedor@qualitytrack.com',  '$2a$12$...', 'VENDEDOR',        NULL),
('Valeria Calidad',  'calidad@qualitytrack.com',   '$2a$12$...', 'CALIDAD',         NULL),
('Lucas Operario',   'lucas@qualitytrack.com',     '$2a$12$...', 'OPERARIO', 'Corte y plegado'),
('Jorge Operario',   'jorge@qualitytrack.com',     '$2a$12$...', 'OPERARIO', 'Soldador');

-- Catálogo global (cubre los dos ejemplos del PRD sección 05)
INSERT INTO fases_catalogo (codigo, nombre, descripcion) VALUES
('CORTE',      'Corte',      'Corte por láser, plasma o sierra'),
('PLEGADO',    'Plegado',    'Conformado en prensa plegadora'),
('SOLDADURA',  'Soldadura',  'Unión térmica MIG/TIG'),
('FUNDICION',  'Fundición',  'Colada en molde'),
('MECANIZADO', 'Mecanizado', 'CNC por arranque de viruta'),
('ENSAMBLE',   'Ensamble',   'Montaje y fijación de componentes'),
('PRUEBA',     'Prueba',     'Ensayos y test de estanqueidad');

-- Competencias: Lucas hace corte y plegado, Jorge soldadura y ensamble
INSERT INTO fase_operarios_habilitados (fase_catalogo_id, operario_id, asignado_por_id) VALUES
(1, 5, 1), (2, 5, 1), (3, 6, 1), (6, 6, 1);

INSERT INTO clientes (razon_social, contacto_nombre, telefono, direccion, email) VALUES
('Metalúrgica del Centro S.A.', 'Roberto Fontana', '+54 351 425-8899',
 'Av. Vélez Sarsfield 1420, Córdoba', 'compras@metalcentro.com.ar');
```

---

## 07. Trazabilidad con el Release Plan

| Tablas | Historias | Semana |
|---|---|---|
| `usuarios` (carga directa por el equipo, sin pantalla) | — (reemplaza HU-5.2, ver D9) | 1 |
| `fases_catalogo`, `fase_operarios_habilitados` | HU-5.1 | 1 |
| `clientes`, `solicitudes`, `adjuntos` | HU-1.1 | 1 |
| `cotizaciones`, `cotizacion_fases` | HU-2.1 | 2 |
| `ordenes_trabajo` (generación automática) | HU-1.3 | 2 |
| `ot_fases`, `ot_fase_reasignaciones`, `ot_notas` | HU-3.1 a 3.4, HU-2.2 | 3 |
| `auditorias_calidad`, `auditoria_checklist_respuestas` | HU-4.1 a 4.3 | 4 |
| `ot_fases` (ciclo de retrabajo), `ot_notas` | HU-2.3 | 4 |
| `ordenes_trabajo.fecha_entrega`, `receptor_nombre` | HU-1.4 | 4 |
| Consultas e índices de agregación | HU-1.2, HU-5.3, HU-5.4 | 5 |

---

*QualityTrack · NO-Country 2026. Consolidación de las propuestas de esquema de Mel Zarate y Ángel, contrastadas contra la Especificación Funcional v1 y el Backlog v1.*
