# 🔑 Claves Primarias y Foráneas - QualityTrack

## ¿Qué es una Clave Primaria (PK)?

Es el **identificador único** de cada registro en una tabla. No puede repetirse y no puede ser NULL.

```
Ejemplo:
Tabla CLIENTE
┌────┬──────────────┐
│ id │ nombre       │
├────┼──────────────┤
│ 1  │ Acme Corp    │  ← id=1 es la PK
│ 2  │ Tech Solutions│  ← id=2 es la PK
│ 3  │ Industrial SA │  ← id=3 es la PK
└────┴──────────────┘

No puede haber dos clientes con id=1
```

---

## ¿Qué es una Clave Foránea (FK)?

Es una **columna que hace referencia** a la clave primaria de otra tabla. Crea la relación entre tablas.

```
Tabla SOLICITUD_TRABAJO
┌────┬────────────────────┬──────────────┐
│ id │ clienteId          │ descripcion  │
├────┼────────────────────┼──────────────┤
│ 1  │ 1 (FK→CLIENTE)     │ Pieza A...   │  ← clienteId=1 apunta a CLIENTE.id=1
│ 2  │ 1 (FK→CLIENTE)     │ Pieza B...   │  ← clienteId=1 apunta a CLIENTE.id=1
│ 3  │ 2 (FK→CLIENTE)     │ Pieza C...   │  ← clienteId=2 apunta a CLIENTE.id=2
└────┴────────────────────┴──────────────┘

El mismo cliente (id=1) puede tener múltiples solicitudes
```

---

## 🔗 Las 3 Tipos de Relaciones

### 1️⃣ **UNO A MUCHOS (1:N)** 
Un registro en la tabla A se relaciona con muchos registros en la tabla B.

```
CLIENTE (1) ────────→ SOLICITUD_TRABAJO (N)

Un cliente puede tener MUCHAS solicitudes
La FK va en la tabla "muchos" (SOLICITUD_TRABAJO.clienteId)
```

### 2️⃣ **UNO A UNO (1:1)**
Un registro en la tabla A se relaciona con exactamente uno en la tabla B.

```
COTIZACION (1) ────────→ ORDEN_TRABAJO (1)

Una cotización genera EXACTAMENTE UNA orden de trabajo
La FK va en la tabla "dependiente" (ORDEN_TRABAJO.cotizacionId)
```

### 3️⃣ **MUCHOS A MUCHOS (N:N)**
Múltiples registros en A se relacionan con múltiples en B.

```
USUARIO (N) ────────→ PERMISO (N)

Un usuario puede tener MUCHOS permisos
Un permiso puede asignarse a MUCHOS usuarios
Se requiere una tabla INTERMEDIA: USUARIO_PERMISO
```

*(En QualityTrack no necesitamos esto en la fase inicial)*

---

## 📊 DIAGRAMA: Todas las Tablas y sus Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUALITYTRACK - ESTRUCTURA DE BD                     │
└─────────────────────────────────────────────────────────────────────────────┘


                              ┌──────────────────────┐
                              │      USUARIO         │
                              ├──────────────────────┤
                              │ PK: id               │
                              │ - username           │
                              │ - email              │
                              │ - nombre             │
                              │ - rol                │
                              └──────────────────────┘
                                       △
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    │ (supervisor)     │ (operario)      │ (inspector)
                    │                  │                  │
                    ↓                  ↓                  ↓


    ┌────────────────────────┐
    │      CLIENTE           │
    ├────────────────────────┤
    │ PK: id                 │
    │ - nombre               │
    │ - email                │
    │ - telefono             │
    └────────────────────────┘
            │
            │ 1:N (clienteId FK)
            │
            ↓
    ┌────────────────────────────────────┐
    │    SOLICITUD_TRABAJO               │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: clienteId → CLIENTE.id         │
    │ - descripcion                      │
    │ - estado                           │
    └────────────────────────────────────┘
            │
            │ 1:N (solicitudTrabajoId FK)
            │
            ↓
    ┌────────────────────────────────────┐
    │      COTIZACION                    │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: solicitudTrabajoId             │
    │ - numeroQuote                      │
    │ - precioTotal                      │
    │ - estado                           │
    └────────────────────────────────────┘
            │
            │ 1:1 (cotizacionId FK)
            │
            ↓
    ┌────────────────────────────────────┐
    │    ORDEN_TRABAJO                   │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: cotizacionId → COTIZACION.id   │
    │ FK: clienteId → CLIENTE.id         │
    │ FK: responsableId → USUARIO.id     │ ←─────┐
    │ - numeroOT                         │       │
    │ - estado                           │   (relación con USUARIO)
    └────────────────────────────────────┘
            │
            │ 1:N (ordenTrabajoId FK)
            │
            ↓
    ┌────────────────────────────────────┐
    │      HOJA_RUTA                     │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: ordenTrabajoId                 │
    │ - numeroHojaRuta                   │
    │ - estado                           │
    └────────────────────────────────────┘
            │
            │ 1:N (hojaRutaId FK)
            │
            ↓
    ┌────────────────────────────────────┐
    │      OPERACION                     │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: hojaRutaId → HOJA_RUTA.id      │
    │ FK: responsableId → USUARIO.id     │ ←─────┐
    │ - numeroOperacion                  │       │
    │ - descripcion                      │   (relación con USUARIO)
    │ - estado                           │
    └────────────────────────────────────┘
            │
            │ 1:N (operacionId FK)
            │
            ↓
    ┌────────────────────────────────────┐
    │     QUALITY_CHECK                  │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: operacionId → OPERACION.id     │
    │ FK: inspectorId → USUARIO.id       │ ←─────┐
    │ - resultado                        │       │
    │ - detalles                         │   (relación con USUARIO)
    └────────────────────────────────────┘


    ┌────────────────────────────────────┐
    │      DOCUMENTO                     │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: vinculadoAId (múltiples usos)  │
    │ FK: uploadPorId → USUARIO.id       │ ←─────┐
    │ - nombreArchivo                    │       │
    │ - tipo                             │   (relación con USUARIO)
    │ - vinculadoATipo (qué entidad)     │
    └────────────────────────────────────┘
            ▲
            │ Puede vincularse a:
            │ - SOLICITUD_TRABAJO
            │ - COTIZACION
            │ - ORDEN_TRABAJO


    ┌────────────────────────────────────┐
    │      ENTREGA                       │
    ├────────────────────────────────────┤
    │ PK: id                             │
    │ FK: ordenTrabajoId                 │
    │ - fechaEntrega                     │
    │ - cantidadEntregada                │
    │ - estadoEntrega                    │
    └────────────────────────────────────┘
```

---

## 📝 SQL: Cómo se Declaran las Claves

```sql
-- Tabla CLIENTE (Independiente)
CREATE TABLE cliente (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'ACTIVO'
);

-- Tabla SOLICITUD_TRABAJO (Depende de CLIENTE)
CREATE TABLE solicitud_trabajo (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id BIGINT NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Aquí va la clave foránea
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- Tabla COTIZACION (Depende de SOLICITUD_TRABAJO)
CREATE TABLE cotizacion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    solicitud_trabajo_id BIGINT NOT NULL,
    numero_quote VARCHAR(50) UNIQUE,
    precio_total DECIMAL(10, 2),
    estado VARCHAR(50),
    
    FOREIGN KEY (solicitud_trabajo_id) REFERENCES solicitud_trabajo(id)
);

-- Tabla ORDEN_TRABAJO (Depende de COTIZACION y CLIENTE)
CREATE TABLE orden_trabajo (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cotizacion_id BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL,
    responsable_id BIGINT,
    numero_ot VARCHAR(50) UNIQUE,
    estado VARCHAR(50),
    
    FOREIGN KEY (cotizacion_id) REFERENCES cotizacion(id),
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (responsable_id) REFERENCES usuario(id)
);
```

---

## 🎯 Resumen de Relaciones en QualityTrack

| De Tabla | A Tabla | Relación | FK va en |
|----------|---------|----------|----------|
| CLIENTE | SOLICITUD_TRABAJO | 1:N | solicitud_trabajo.cliente_id |
| SOLICITUD_TRABAJO | COTIZACION | 1:N | cotizacion.solicitud_trabajo_id |
| COTIZACION | ORDEN_TRABAJO | 1:1 | orden_trabajo.cotizacion_id |
| ORDEN_TRABAJO | HOJA_RUTA | 1:N | hoja_ruta.orden_trabajo_id |
| HOJA_RUTA | OPERACION | 1:N | operacion.hoja_ruta_id |
| OPERACION | QUALITY_CHECK | 1:N | quality_check.operacion_id |
| ORDEN_TRABAJO | ENTREGA | 1:1 | entrega.orden_trabajo_id |
| USUARIO | ORDEN_TRABAJO | M:1 | orden_trabajo.responsable_id |
| USUARIO | OPERACION | M:1 | operacion.responsable_id |
| USUARIO | QUALITY_CHECK | M:1 | quality_check.inspector_id |
| USUARIO | DOCUMENTO | M:1 | documento.upload_por_id |
| \* | DOCUMENTO | Variable | documento.vinculado_a_id + vinculado_a_tipo |

---

## ⚡ Puntos Clave Para Explicar a tu Equipo

1. **Clave Primaria (PK)**: Es como el "DNI" de cada fila - único e irrepetible
   
2. **Clave Foránea (FK)**: Es como una "referencia" que apunta a la PK de otra tabla

3. **La FK siempre va en la tabla "muchos"**:
   ```
   1 Cliente ──→ N Solicitudes
   La FK (cliente_id) va en SOLICITUD_TRABAJO, NO en CLIENTE
   ```

4. **Sin FK no hay integridad**: La BD se encarga de que no puedas crear una solicitud con un cliente que no existe

5. **En Spring/Java**: Las FKs se manejan con anotaciones (@ManyToOne, @OneToMany, etc.)

---

## 🔍 Ejemplo Visual: Cómo se ve en la Base de Datos

**Tabla CLIENTE:**
```
id  │ nombre          │ email               │ estado
────┼─────────────────┼─────────────────────┼────────
1   │ Acme Corp       │ contacto@acme.com   │ ACTIVO
2   │ Tech Solutions  │ info@tech.com       │ ACTIVO
3   │ Industrial SA   │ ventas@industrial.ar│ ACTIVO
```

**Tabla SOLICITUD_TRABAJO:**
```
id  │ cliente_id (FK) │ descripcion         │ estado
────┼─────────────────┼─────────────────────┼─────────────
1   │ 1               │ Fresado de piezas   │ COTIZADA
2   │ 1               │ Taladrado especial  │ PENDIENTE
3   │ 2               │ Roscado interno     │ COTIZADA
4   │ 3               │ Pulido superficial  │ PENDIENTE
```

**Si intentas hacer esto → ❌ ERROR:**
```
INSERT INTO solicitud_trabajo VALUES (5, 999, 'Algo', 'PENDIENTE');
                                          ↑
                             No existe cliente con id=999
                             La FK lo impide → Error de Integridad Referencial
```

---

## 📚 Próximo Paso

Cuando entiendas esto, estarás listo para el PASO 2 donde:
- Convertiremos estas relaciones en **anotaciones JPA** (@Entity, @ManyToOne, @OneToMany)
- Crearemos las **clases Java** que representan estas tablas
- Spring se encargará automáticamente de generar el SQL
