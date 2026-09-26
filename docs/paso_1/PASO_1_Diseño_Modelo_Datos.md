# 🎯 QualityTrack - PASO 1: Diseño del Modelo de Datos

## Objetivo de este paso
Definir **QUÉ información necesitamos guardar** y **CÓMO se relacionan esas entidades** en la base de datos.  
Sin código aún. Solo lógica, diagramas y relaciones.

---

## 📋 Entidades Principales

Basándonos en el flujo de QualityTrack, necesitamos estas entidades:

### 1. **CLIENTE** 
Quien solicita trabajos.
```
Atributos:
- id (PK)
- nombre
- razonSocial
- email
- telefono
- direccion
- cuit
- estado (ACTIVO, INACTIVO)
- fechaRegistro
- fechaActualizacion
```

---

### 2. **SOLICITUD DE TRABAJO (WorkRequest)**
Primera etapa: el cliente requiere mecanizar una pieza.
```
Atributos:
- id (PK)
- clienteId (FK → Cliente)
- descripcion
- especificaciones (aquí van los requerimientos técnicos)
- fechaSolicitud
- estado (PENDIENTE_ANALISIS, ANALIZADA, COTIZADA, RECHAZADA)
```

**Relación:** Muchas solicitudes → 1 Cliente

---

### 3. **COTIZACIÓN (Quote)**
La empresa analiza la solicitud y genera una cotización.
```
Atributos:
- id (PK)
- solicitudTrabajoId (FK → SolicitudTrabajo)
- numeroQuote (único, ej: QT-2024-001)
- precioTotal
- tiempoEstimado (en horas o días)
- materialEstimado (descripción de material necesario)
- notas
- estado (GENERADA, ENVIADA, ACEPTADA, RECHAZADA)
- fechaGeneracion
- fechaValidez
- fechaRespuesta
```

**Relación:** 1 Cotización → 1 SolicitudTrabajo  
(Una solicitud puede tener múltiples cotizaciones iteradas)

---

### 4. **ORDEN DE TRABAJO (WorkOrder)**
Una vez aprobada la cotización, se convierte en una OT que la planta ejecutará.
```
Atributos:
- id (PK)
- cotizacionId (FK → Cotizacion)
- numeroOT (único, ej: OT-2024-0001)
- clienteId (FK → Cliente)
- descripcionPieza
- especificacionesTecnicas (vinculadas con la solicitud)
- materialAProcesar (detalle específico)
- cantidadAProducir
- fechaGeneracion
- fechaVencimiento (cuándo debe estar lista)
- estado (CREADA, EN_PROGRESO, COMPLETADA, CANCELADA)
- responsableId (FK → Usuario/Supervisor)
```

**Relación:** 1 OT → 1 Cotización  
**Relación:** 1 OT → 1 Cliente

---

### 5. **HOJA DE RUTA (WorkSheet)**
Divide la OT en operaciones específicas que debe ejecutar cada operario.
```
Atributos:
- id (PK)
- numeroHojaRuta (único)
- ordenTrabajoId (FK → OrdenTrabajo)
- estado (PLANIFICADA, EN_EJECUCION, COMPLETADA)
- fechaCreacion
```

**Relación:** 1 HojaRuta → 1 OrdenTrabajo  
(Una OT puede tener múltiples hojas de ruta si el trabajo es complejo)

---

### 6. **OPERACIÓN (Operation)**
Cada paso concreto dentro de una hoja de ruta.
```
Atributos:
- id (PK)
- hojaRutaId (FK → HojaRuta)
- numeroOperacion (ej: 01, 02, 03...)
- descripcion (ej: "Fresado de superficie principal")
- maquinaRequerida (ej: "Fresadora CNC modelo X")
- tiempoEstimado (minutos)
- secuencia (orden en que se ejecuta)
- estado (PENDIENTE, EN_EJECUCION, COMPLETADA)
- responsableId (FK → Usuario/Operario)
- fechaInicio
- fechaFin
```

**Relación:** 1 Operación → 1 HojaRuta

---

### 7. **USUARIO (User)**
Personal de la empresa: administrativos, operarios, supervisores, etc.
```
Atributos:
- id (PK)
- username (único)
- email (único)
- passwordEncriptada
- nombre
- apellido
- rol (ADMIN, SUPERVISOR, OPERARIO, COMERCIAL, CALIDAD)
- estado (ACTIVO, INACTIVO)
- fechaRegistro
```

**Relación:** Múltiple (aparece en varios lados: responsable de OT, responsable de Operación, etc.)

---

### 8. **DOCUMENTACIÓN (Document)**
Archivos asociados a cada trabajo: planos, certificados, especificaciones, etc.
```
Atributos:
- id (PK)
- nombreArchivo
- tipo (PLANO, CERTIFICADO_MATERIA_PRIMA, ESPECIFICACION, OC, FACTURA, OTRO)
- urlOPath (dónde se guarda)
- tamaño
- fechaSubida
- uploadPorId (FK → Usuario)
- vinculadoA (¿a qué entidad?) → Este es importante
- estado (ACTIVO, ARCHIVADO)
```

**Relación:** 1 Documento → 1 SolicitudTrabajo O 1 OrdenTrabajo O 1 Cotizacion

---

### 9. **CONTROL DE CALIDAD (QualityCheck)**
Registra las inspecciones y validaciones de cada operación.
```
Atributos:
- id (PK)
- operacionId (FK → Operacion)
- resultado (CONFORME, NO_CONFORME, PENDIENTE)
- detalles
- notas
- fechaControl
- inspectorId (FK → Usuario)
```

**Relación:** 1 ó muchos QualityChecks → 1 Operación

---

### 10. **ENTREGA (Delivery)**
Registro final del trabajo completado.
```
Atributos:
- id (PK)
- ordenTrabajoId (FK → OrdenTrabajo)
- fechaEntrega
- cantidadEntregada
- estadoEntrega (PREPARADA, ENTREGADA, RECHAZADA)
- firmaClienteId (FK → Usuario - cliente que recibe)
- notas
```

**Relación:** 1 Entrega → 1 OrdenTrabajo

---

## 🔗 Diagrama de Relaciones (Texto)

```
CLIENTE
  ├── 1:N → SOLICITUD_TRABAJO
  │         ├── 1:N → COTIZACION
  │         │         ├── 1:1 → ORDEN_TRABAJO
  │         │         │         ├── 1:N → HOJA_RUTA
  │         │         │         │         ├── 1:N → OPERACION
  │         │         │         │         │         ├── 1:N → QUALITY_CHECK
  │         │         │         │         │         └── M:1 → USUARIO (Operario)
  │         │         │         │         │
  │         │         │         │         ├── 1:M → USUARIO (Responsable)
  │         │         │         │         └── 1:1 → ENTREGA
  │         │         │         │
  │         │         │         └── 1:N → DOCUMENTO (vinculados a OT)
  │         │
  │         └── 1:N → DOCUMENTO (vinculados a Solicitud)
  │
  └── (Múltiples referencias como cliente en entregas, etc.)

USUARIO
  ├── M:1 → ORDEN_TRABAJO (como responsable)
  ├── M:1 → OPERACION (como responsable)
  ├── M:1 → QUALITY_CHECK (como inspector)
  └── M:1 → DOCUMENTO (como quien lo subió)
```

---

## 📌 Puntos Clave de Diseño

### ✅ Decisiones Tomadas:

1. **Trazabilidad centralizada**: Cada OT tiene un ID único que vincula toda la información.

2. **Historial completo**: Las Cotizaciones quedan guardadas (no se borran), permitiendo auditoría.

3. **Documentos polifacéticos**: Un mismo documento puede adjuntarse a Solicitud, Cotización u OT según convenga.

4. **Estados a través del flujo**: Cada entidad tiene su propio estado, permitiendo conocer dónde está el trabajo en cada momento.

5. **Usuarios en múltiples roles**: Un usuario puede ser operario, supervisor o inspector (controlado por el campo `rol`).

6. **Auditoria**: Cada registro tiene `fechaRegistro` y `fechaActualizacion` para saber cuándo se creó/modificó.

---

## 🤔 Preguntas para tu equipo:

**Antes de avanzar, revisen esto como equipo y respondan:**

1. ¿Falta alguna entidad importante según el flujo de su empresa?
2. ¿Alguna relación no tiene sentido con cómo trabajan ustedes?
3. ¿Hay datos adicionales que necesiten guardar en alguna entidad?
4. ¿Necesitamos auditoría detallada (quién modificó qué y cuándo)?
5. ¿Las máquinas/equipos merecen su propia entidad o están OK descriptos en Operación?

---

## 📝 Próximo Paso (PASO 2):

Una vez que confirmes que este modelo tiene sentido:
- Definiremos las anotaciones de JPA (@Entity, @ManyToOne, etc.)
- Crearemos las clases entidad en Java
- Configuraremos las relaciones de forma correcta

**Di "ok" cuando hayas revisado esto con tu equipo y estés listo para el PASO 2.**
