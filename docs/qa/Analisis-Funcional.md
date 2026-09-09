# QualityTrack — Análisis Funcional QA

## Semana 1 — Revalidación contra PRD v2 / Backlog v2 / Esquema v2

**Proyecto:** QualityTrack
**Área:** QA / Análisis Funcional
**Documento:** `docs/qa/Analisis-Funcional.md`
**Versión del análisis:** 2.0
**Fecha de referencia:** 04/09/2026
**Estado:** Revalidado contra documentación funcional y modelo de datos vigente

---

# 1. Objetivo

El presente documento contiene el análisis funcional realizado desde QA sobre el producto **QualityTrack**, tomando como fuente la documentación vigente del proyecto en su **versión 2**.

El objetivo del análisis es transformar las definiciones funcionales existentes en elementos verificables desde QA:

- comportamiento esperado;
- reglas de negocio;
- estados;
- transiciones;
- dependencias;
- escenarios funcionales;
- escenarios negativos;
- riesgos;
- trazabilidad;
- flujos End-to-End;
- puntos que requieren validación funcional cuando corresponda.

Este documento **no modifica el alcance ni redefine unilateralmente las decisiones del proyecto**.

Las definiciones de producto, alcance y prioridades corresponden a la documentación funcional aprobada por el equipo.

QA utiliza esas definiciones como fuente de validación y, ante una inconsistencia, la documenta y solicita su resolución correspondiente.

---

# 2. Alcance del análisis

El análisis contempla las **17 User Stories vigentes** del Backlog v2.

La versión anterior contemplaba 18 historias.

La **HU-5.2 — Alta de operarios** fue eliminada en V2.

## Distribución actual

| Épica | Rol | Historias |
|---|---|---:|
| Épica 1 | Vendedor | 4 |
| Épica 2 | Jefe de producción | 3 |
| Épica 3 | Operario | 4 |
| Épica 4 | Calidad | 3 |
| Épica 5 | Gerente | 3 |
| **Total** | | **17** |

La eliminación de HU-5.2 es un cambio explícito de alcance documentado en la V2. El resto de las definiciones y correcciones de la V2 precisan el comportamiento funcional y la trazabilidad del flujo vigente.

---

# 3. Fuentes documentales

El análisis se realizó tomando como referencia las siguientes versiones vigentes:

1. `docs/funcional/QualityTrack-PRD-v2.md`
2. `docs/funcional/QualityTrack-Backlog-v2.md`
3. `docs/funcional/QualityTrack-Cambios-PRD-Backlog.md`
4. `docs/datos/QualityTrack-Esquema-Base-Datos-v2.md`

El Backlog v2 declara expresamente que aplica las 15 definiciones y correcciones documentadas y que HU-5.2 fue eliminada.

El PRD v2 indica que las 15 definiciones y correcciones surgieron del contraste con el esquema de base de datos y que ninguna modifica el flujo cerrado previamente; las correcciones precisan dicho flujo.

---

# 4. Criterio de análisis QA

Para cada User Story se analiza:

1. Objetivo funcional.
2. Actor.
3. Precondiciones.
4. Comportamiento esperado.
5. Criterios de aceptación vigentes.
6. Reglas de negocio involucradas.
7. Estados afectados.
8. Dependencias.
9. Escenarios positivos.
10. Escenarios negativos.
11. Datos relevantes para prueba.
12. Riesgos funcionales.
13. Trazabilidad con otras historias.

El análisis distingue entre:

- **Definido:** comportamiento explícitamente establecido en la documentación vigente.
- **Derivado:** comportamiento que puede inferirse directamente de una regla ya definida y que será validado mediante pruebas.
- **A confirmar:** punto que no puede determinarse únicamente a partir de la documentación vigente.

No se considera una inferencia de QA como una modificación del producto.

---

# 5. Rol de QA dentro del proyecto

QA participa transversalmente en la validación funcional del sistema.

## Responsabilidades de QA

- Analizar las User Stories.
- Interpretar criterios de aceptación.
- Identificar reglas de negocio verificables.
- Diseñar escenarios positivos y negativos.
- Identificar dependencias entre funcionalidades.
- Diseñar flujos E2E.
- Preparar casos de prueba.
- Validar comportamiento funcional.
- Validar transiciones de estados.
- Validar integración entre módulos.
- Validar trazabilidad.
- Registrar evidencias.
- Reportar defectos.
- Realizar retesting.
- Ejecutar regresión.
- Identificar riesgos funcionales.

## Fuera del alcance de QA

QA no define unilateralmente:

- arquitectura;
- modelo técnico;
- endpoints;
- estructura interna del backend;
- componentes frontend;
- tecnologías;
- alcance del MVP;
- prioridades de producto.

Cuando QA detecta una inconsistencia funcional o una regla no definida, corresponde documentarla y solicitar su confirmación al responsable funcional/equipo.

---

# 6. Visión funcional del producto

QualityTrack centraliza la trazabilidad de una pieza o trabajo industrial desde la solicitud inicial hasta la entrega.

## Flujo principal

```text
Cliente
   ↓
Solicitud
   ↓
Cotización
   ↓
Aprobación / No aprobación
   ↓
Generación automática de OT
   ↓
Secuencia de fases
   ↓
Ejecución de operaciones
   ↓
Control de Calidad
   ↓
   ├── Conforme → Despacho → Entrega
   │
   └── No conforme
          ↓
      Jefe de producción
          ↓
      Selección de fase(s) a rehacer
          ↓
      Retrabajo
          ↓
      Nueva ejecución
          ↓
      Calidad
```

El objetivo central es que el expediente de una OT permita reconstruir el historial completo del trabajo sin depender de múltiples sistemas, planillas o carpetas.

---

# 7. Roles funcionales

## 7.1 Vendedor

Responsable de:

-  cargar solicitudes;
-  registrar datos del cliente;
-  adjuntar documentación;
-  registrar descripción y cantidad;
-  consultar expedientes;
-  gestionar cotizaciones derivadas;
-  registrar envío al cliente;
-  registrar aprobación o no aprobación;
-  gestionar despacho/entrega.

## 7.2 Jefe de producción

Responsable de:

-  recibir solicitudes;
-  definir fases;
-  ordenar fases;
-  establecer tiempos;
-  definir precio final;
-  gestionar planta;
-  reasignar tareas;
-  analizar no conformidades;
-  seleccionar fases para retrabajo;
-  asignar operarios;
-  registrar instrucciones.

## 7.3 Operario

Responsable de:

-  visualizar tareas propias;
-  comenzar una fase;
-  finalizar una fase.

El dashboard está diseñado para una interacción mínima, orientada a celular/tablet.

## 7.4 Calidad

Responsable de:

-  recibir OTs terminadas;
-  ejecutar checklist;
-  emitir veredicto;
-  registrar observaciones cuando corresponde;
-  derivar a Despacho o a Producción.

## 7.5 Gerente

Responsable de:

-  administrar el catálogo global de fases;
-  asignar habilitaciones de fases a operarios;
-  visualizar situación global de planta;
-  visualizar indicadores generales de Calidad.

Los cinco roles están definidos en la documentación funcional V2.

---

# 8. Estados funcionales vigentes

Los estados incluidos en este análisis corresponden a los dominios vigentes de la V2.

## 8.1 Solicitud

Estados:

```
PENDIENTE_COTIZACION
COTIZADA
```

La Solicitud no contiene el estado comercial de aprobación del cliente.

El estado comercial pertenece a la Cotización.

El esquema V2 restringe explícitamente el estado de Solicitud a esos dos valores.

---

## 8.2 Cotización

Estados:

```
LISTA_PARA_ENVIAR
ENVIADA_A_CLIENTE
APROBADA
NO_APROBADA
```

La respuesta comercial del cliente vive únicamente en la Cotización.

No debe duplicarse como estado comercial en Solicitud.

El esquema V2 define literalmente estos cuatro estados.

---

## 8.3 Orden de Trabajo

Estados:

```
EN_PRODUCCION
EN_CALIDAD
NO_CONFORME
DESPACHO
ENTREGADA
```

Estos son los cinco estados globales vigentes de la OT.

El esquema V2 los establece explícitamente mediante `CHECK`.

---

## 8.4 Fase de OT

Estados de ejecución de una fase:

```
EN_COLA
EN_EJECUCION
TERMINADO
```

El esquema V2 define estos estados para el tablero del Operario.

---

## 8.5 Checklist de Calidad

Cada uno de los primeros siete puntos puede responder:

```
Cumple
No cumple
No aplica
```

Mientras un punto no haya sido contestado, su valor permanece vacío.

El punto 8 corresponde al resultado final:

```
CONFORME
NO_CONFORME
```

En caso de `NO_CONFORME`, las observaciones son obligatorias.

---

# 9. Inventario de User Stories V2

| ID | Épica | Rol | Historia |
|---|---|---|---|
| HU-1.1             | Vendedor   | Vendedor           | Levantar pedido                      |
| HU-1.2             | Vendedor   | Vendedor           | Buscar órdenes / expediente completo |
| HU-1.3             | Vendedor   | Vendedor           | Cotizaciones derivadas               |
| HU-1.4             | Vendedor   | Vendedor           | Despacho / Entrega                   |
| HU-2.1             | Producción | Jefe de producción | Recepción de cotización              |
| HU-2.2             | Producción | Jefe de producción | Gestión de planta                    |
| HU-2.3             | Producción | Jefe de producción | No conformidades                     |
| HU-3.1             | Operario   | Operario           | Tareas en ejecución y pendientes     |
| HU-3.2             | Operario   | Operario           | Adjuntos                             |
| HU-3.3             | Operario   | Operario           | Vencimiento                          |
| HU-3.4             | Operario   | Operario           | Notas discriminadas por origen       |
| HU-4.1             | Calidad    | Calidad            | Órdenes terminadas                   |
| HU-4.2             | Calidad    | Calidad            | Auditoría / checklist                |
| HU-4.3             | Calidad    | Calidad            | Veredicto                            |
| HU-5.1             | Gerente    | Gerente            | Configuración global de fases        |
| HU-5.3             | Gerente    | Gerente            | Vista global de planta               |
| HU-5.4             | Gerente    | Gerente            | Vista global de Calidad              |

**Total: 17 User Stories activas.**

---

# 10. HU-1.1 — Levantar pedido

## Objetivo

Permitir al Vendedor registrar una solicitud de cliente para iniciar el circuito de cotización.

## Datos funcionales

La solicitud contempla:

-  nombre del cliente;
-  dirección;
-  teléfono;
-  documentación;
-  notas;
-  descripción de la pieza o trabajo;
-  cantidad de unidades;
-  fecha esperada de entrega.

La descripción y la cantidad son datos obligatorios incorporados en V2.

## Reglas

### RN-01 — Descripción obligatoria

La solicitud debe indicar qué pieza o trabajo se solicita.

### RN-02 — Cantidad obligatoria

La cantidad representa unidades del mismo tipo de pieza.

El valor por defecto es `1`.

La cantidad debe ser mayor que cero.

### RN-03 — Fecha esperada informativa

La fecha esperada de entrega:

-  puede registrarse;
-  debe poder consultarse;
-  no genera alertas;
-  no modifica la planificación;
-  no condiciona la secuencia de fases.

Esta definición está formalizada como AR-2.

### RN-04 — Estado inicial

Al guardar correctamente la solicitud:

```
PENDIENTE_COTIZACION
```

## Escenarios positivos

-  Crear solicitud con datos obligatorios.
-  Crear solicitud con cantidad = 1 por defecto.
-  Crear solicitud con cantidad mayor que 1.
-  Registrar fecha esperada.
-  Adjuntar documentación.
-  Registrar descripción de pieza.

## Escenarios negativos

-  Intentar guardar sin cliente.
-  Intentar guardar sin datos obligatorios.
-  Intentar guardar sin descripción.
-  Intentar guardar con cantidad = 0.
-  Intentar guardar con cantidad negativa.

---

# 11. HU-1.2 — Buscar órdenes / expediente completo

## Objetivo

Permitir al Vendedor consultar una OT y reconstruir su historial completo.

## Información esperada

El expediente debe permitir visualizar:

-  solicitud;
-  cliente;
-  documentación;
-  cotización;
-  fases;
-  tiempos;
-  precio;
-  operaciones;
-  operarios;
-  reasignaciones;
-  retrabajos;
-  notas;
-  auditorías;
-  checklist;
-  veredicto;
-  despacho;
-  entrega.

## Regla

### RN-05 — No perder historial

Una reasignación o retrabajo no debe eliminar la información de ejecuciones anteriores.

El expediente debe mostrar historial, no únicamente el estado final.

El Backlog V2 exige explícitamente que reasignaciones y retrabajos puedan reconstruirse.

## Escenarios positivos

-  Buscar por número de OT.
-  Buscar por cliente.
-  Consultar OT en producción.
-  Consultar OT en Calidad.
-  Consultar OT no conforme.
-  Consultar OT entregada.
-  Consultar OT con reasignaciones.
-  Consultar OT con retrabajos.

## Escenarios negativos

-  OT inexistente.
-  OT sin etapas posteriores todavía ejecutadas.
-  Intentar mostrar información futura como si estuviera realizada.
-  Historial incompleto después de una reasignación.

---

# 12. HU-1.3 — Cotizaciones derivadas

## Objetivo

Permitir al Vendedor consultar cotizaciones preparadas por Producción y registrar la respuesta del cliente.

## Estados

```
LISTA_PARA_ENVIAR
ENVIADA_A_CLIENTE
APROBADA
NO_APROBADA
```

## Reglas

### RN-06 — Un único estado comercial

La aprobación/no aprobación pertenece únicamente a la Cotización.

### RN-07 — Una cotización por solicitud

No existe versionado de cotizaciones en MVP.

### RN-08 — No aprobación

Si el cliente no aprueba:

-  la cotización queda `NO_APROBADA`;
-  no se genera OT;
-  no se vuelve a versionar la cotización;
-  si se necesita una nueva cotización, se carga una nueva solicitud.

La V2 establece explícitamente esta decisión.

### RN-09 — Aprobación

Cuando el Vendedor registra la aprobación:

-  se genera automáticamente la OT;
-  se inicia el flujo productivo;
-  la primera fase queda disponible para el operario correspondiente.

## Escenarios positivos

-  Visualizar cotización.
-  Marcar envío.
-  Registrar aprobación.
-  Generar OT automáticamente.
-  Registrar no aprobación.

## Escenarios negativos

-  Aprobar una cotización inexistente.
-  Generar más de una OT para la misma cotización.
-  Generar OT ante `NO_APROBADA`.
-  Duplicar el estado comercial en Solicitud.
-  Recotizar la misma solicitud dentro del MVP.

---

# 13. HU-1.4 — Despacho / Entrega

## Objetivo

Cerrar el ciclo de una OT registrando la entrega.

## Regla

Solo una OT en:

```
DESPACHO
```

puede pasar a:

```
ENTREGADA
```

Debe registrarse el nombre del receptor.

El esquema V2 establece que `fecha_entrega` y `receptor_nombre` son obligatorios cuando la OT está `ENTREGADA`.

## Escenarios positivos

-  OT en Despacho → Entregada.
-  Registrar receptor.
-  Registrar fecha de entrega.

## Escenarios negativos

-  Entregar una OT en producción.
-  Entregar una OT en Calidad.
-  Entregar una OT no conforme.
-  Marcar entregada sin receptor.

---

# 14. HU-2.1 — Recepción de cotización

## Objetivo

Permitir al Jefe de producción configurar una cotización.

## Datos

El Jefe visualiza:

-  documentación;
-  descripción;
-  cantidad;
-  fases disponibles.

Puede:

-  seleccionar fases;
-  ordenar fases;
-  repetir una fase;
-  definir tiempo por fase;
-  establecer precio final.

## Reglas

### RN-10 — Catálogo sin orden obligatorio

El catálogo global no determina la secuencia.

### RN-11 — Secuencia por OT

El Jefe define el orden de fases para cada pedido.

### RN-12 — Fases repetibles

Una misma fase puede aparecer más de una vez dentro de una secuencia.

Ejemplo:

```
Mecanizado
→ Soldadura
→ Mecanizado
```

### RN-13 — Precio único

La cotización posee un único precio final.

No existe precio individual por fase.

Estas reglas están expresamente definidas en V2.

## Escenarios positivos

-  Crear cotización.
-  Seleccionar varias fases.
-  Repetir fase.
-  Ordenar fases.
-  Cargar tiempos.
-  Cargar precio final.
-  Aceptar cotización para devolverla al Vendedor.

## Escenarios negativos

-  Fase inexistente.
-  Tiempo inválido.
-  Secuencia sin fases.
-  Precio inválido.
-  Intentar cargar precio por fase.

---

# 15. HU-2.2 — Gestión de planta

## Objetivo

Permitir al Jefe gestionar la carga de trabajo y reasignar tareas.

## Reglas

### RN-14 — Reasignación

Una fase puede reasignarse a otro operario habilitado.

### RN-15 — Historial de reasignación

La reasignación debe conservar:

-  operario anterior;
-  operario nuevo;
-  responsable del cambio;
-  fecha/hora.

La V2 incorpora esta regla explícitamente.

### RN-16 — No pérdida de historial

Modificar el operario actual no debe borrar el registro de quién tuvo anteriormente la tarea.

## Escenarios positivos

-  Visualizar carga por operario.
-  Reasignar tarea.
-  Confirmar nuevo responsable.
-  Consultar historial.

## Escenarios negativos

-  Asignar fase a operario no habilitado.
-  Reasignar sin responsable.
-  Perder historial anterior.
-  Reasignar a usuario inexistente.

---

# 16. HU-2.3 — No conformidades

## Objetivo

Permitir al Jefe determinar qué fases deben rehacerse luego de un rechazo de Calidad.

## Regla fundamental

Calidad registra el defecto observado.

Calidad **no determina la fase de origen**.

El diagnóstico sobre qué fase debe rehacerse corresponde al Jefe de producción.

## Retrabajo selectivo

El Jefe puede seleccionar:

-  una fase;
-  varias fases.

Las fases no seleccionadas conservan su estado terminado.

Las fases seleccionadas generan una nueva ejecución y conservan la anterior.

## Ejemplo

```
Fase 1 → Terminada
Fase 2 → Terminada
Fase 3 → Terminada
Fase 4 → Terminada

Calidad → No conforme

Jefe selecciona:
Fase 2
Fase 4

Resultado:

Fase 1 → Terminada
Fase 2 → Nuevo intento
Fase 3 → Terminada
Fase 4 → Nuevo intento
```

## Regla de indicador

Si se rehacen dos fases:

```
2 retrabajos
```

No:

```
1 no conformidad
```

La definición corresponde a DF-5.

---

# 17. HU-3.1 — Tareas en ejecución y pendientes

## Objetivo

Permitir al Operario gestionar las fases asignadas.

## Estados

```
EN_COLA
EN_EJECUCION
TERMINADO
```

## Flujo

```
EN_COLA
   ↓
EN_EJECUCION
   ↓
TERMINADO
```

Al terminar una fase:

-  si existe una fase siguiente, se deriva a esa fase;
-  si no existen fases siguientes, la OT pasa a Calidad.

La V2 establece además que el momento de finalización de la última fase constituye el inicio del tiempo de espera en Calidad.

## Escenarios negativos

-  Comenzar tarea no asignada.
-  Finalizar tarea no iniciada.
-  Finalizar dos veces.
-  Avanzar a una fase inexistente.
-  Saltar una fase de la secuencia.

---

# 18. HU-3.2 — Adjuntos

## Objetivo

Permitir al Operario consultar documentación necesaria para ejecutar su tarea.

## Regla

Los adjuntos disponibles corresponden a documentación asociada al trabajo.

El Operario puede visualizarlos o descargarlos.

## Escenarios

### Positivos

-  OT con plano.
-  OT con documentación.
-  Consultar adjunto.

### Negativos

-  Adjuntos inexistentes.
-  Documento inaccesible.
-  Documento correspondiente a otra OT.

---

# 19. HU-3.3 — Vencimiento

## Objetivo

Permitir al Operario conocer el vencimiento estimado de su tarea.

## Regla V2

El vencimiento se calcula cuando la fase entra en la cola del Operario.

```
Momento de ingreso a cola
+
Tiempo estimado de fase
=
Fecha/hora de vencimiento
```

Ejemplo:

```
Ingreso: 10:00
Tiempo estimado: 180 minutos

Vencimiento: 13:00
```

La decisión DF-1 establece expresamente que el cálculo se realiza hacia adelante.

## Escenarios negativos

-  Tiempo estimado inexistente.
-  Tiempo igual a cero.
-  Calcular vencimiento desde la fecha esperada del cliente.
-  Cambiar vencimiento únicamente porque el Operario abrió la tarea.

---

# 20. HU-3.4 — Notas discriminadas por origen

## Objetivo

Permitir al Operario conocer las instrucciones y motivos asociados a su tarea.

## Orígenes permitidos

```
CALIDAD
JEFE_PRODUCCION
```

No existen otros orígenes de notas en MVP.

El Operario no crea notas propias.

La definición está expresamente consolidada en AR-3.

## Escenarios positivos

-  Nota de Calidad.
-  Nota del Jefe.
-  Ambas notas presentes.
-  Visualización separada.

## Escenarios negativos

-  Mezclar notas.
-  Crear nota como Operario.
-  Crear nota de origen no permitido.
-  Mostrar nota de otra OT.

---

# 21. HU-4.1 — Órdenes terminadas

## Objetivo

Permitir a Calidad visualizar las OTs pendientes de auditoría.

## Regla

Una OT ingresa a la cola de Calidad cuando finaliza la última fase.

La cola se ordena por antigüedad desde ese momento.

## Escenarios negativos

-  Mostrar OT con fases pendientes.
-  Ordenar por fecha de apertura del auditor.
-  Mostrar OT sin haber terminado última fase.

---

# 22. HU-4.2 — Auditoría / Checklist

## Objetivo

Permitir ejecutar el control de calidad sobre una OT terminada.

## Checklist

### Punto 1

Conformidad dimensional.

### Punto 2

Fases completas.

### Punto 3

Terminación/acabado.

### Punto 4

Cantidad.

### Punto 5

Identificación.

### Punto 6

Prueba funcional.

### Punto 7

Documentación de respaldo.

### Punto 8

Resultado final.

Los primeros siete puntos admiten:

```
Cumple
No cumple
No aplica
```

El esquema V2 permite además que el valor permanezca nulo mientras el punto no haya sido respondido.

## Regla

El punto 6 puede ser `No aplica` cuando la prueba funcional no corresponda al producto.

## Regla de cierre

Los siete puntos deben estar respondidos antes de cerrar la auditoría.

## Resultado

```
CONFORME
NO_CONFORME
```

Si el resultado es:

```
NO_CONFORME
```

las observaciones son obligatorias.

---

# 23. HU-4.3 — Veredicto

## Objetivo

Derivar la OT según el resultado del control.

## Conforme

```
EN_CALIDAD
   ↓
DESPACHO
```

## No conforme

```
EN_CALIDAD
   ↓
NO_CONFORME
   ↓
Jefe de producción
```

Las observaciones de Calidad acompañan la derivación.

Calidad describe el defecto observado, pero no atribuye la falla a una fase específica.

---

# 24. HU-5.1 — Configuración global de fases

## Objetivo

Permitir al Gerente configurar el catálogo global de fases.

## Funcionalidades

El Gerente puede:

-  crear fases;
-  nombrarlas;
-  consultarlas;
-  definir qué operarios pueden ejecutarlas.

## Regla

La habilitación es individual:

```
Operario ↔ Fase
```

No se define por tipo general de tarea.

La definición DF-2 resuelve explícitamente esta cuestión.

## Operarios

Los usuarios son cargados directamente en la base por el equipo de desarrollo.

El Gerente:

-  consulta los operarios;
-  asigna fases habilitadas.

No crea usuarios nuevos desde el sistema.

Esto reemplaza la funcionalidad de HU-5.2, eliminada en V2.

---

# 25. HU-5.3 — Vista global de planta

## Objetivo

Permitir al Gerente observar el estado global de producción.

## Indicadores

-  cantidad de OTs pendientes/activas;
-  fases existentes;
-  cantidad de OTs acumuladas por fase.

## Exclusión

No incluye desempeño individual por operario.

Ese seguimiento corresponde al Jefe de producción.

La V2 establece expresamente esta separación.

---

# 26. HU-5.4 — Vista global de Calidad

## Objetivo

Proporcionar indicadores generales de Calidad.

## Indicadores

### Porcentaje de conformidad

```
% Conforme
% No conforme
```

### Retrabajos por fase

Cuenta las fases efectivamente enviadas a rehacer.

Ejemplo:

```
Una OT rechazada
↓
Se rehacen dos fases

Resultado:
2 retrabajos
```

No representa una atribución del defecto realizada por Calidad.

### Tiempo promedio en Calidad

Se mide desde:

```
Finalización de la última fase
```

hasta:

```
Veredicto de Calidad
```

No se mide desde que el auditor abre la OT.

### Últimas auditorías

Se muestran auditorías recientes y su resultado.

Estas reglas están establecidas en el Backlog V2.

---

# 27. Reglas de negocio transversales

## RN-01 — Solicitud

La Solicitud solo maneja:

```
PENDIENTE_COTIZACION
COTIZADA
```

## RN-02 — Estado comercial

El estado comercial vive exclusivamente en Cotización.

## RN-03 — Cotización única

Existe una sola cotización por solicitud en MVP.

## RN-04 — Sin recotización

Si el cliente no aprueba y se necesita una nueva cotización:

```
Nueva Solicitud
```

No se versiona la cotización actual.

## RN-05 — Precio único

La cotización posee un único precio final.

## RN-06 — Tiempo por fase

Cada fase posee un tiempo estimado.

## RN-07 — Orden de fases

La secuencia se define por pedido.

## RN-08 — Fase repetible

Una misma fase puede aparecer varias veces.

## RN-09 — Habilitación individual

Solo los operarios habilitados para una fase pueden recibirla.

## RN-10 — Reasignación trazable

Toda reasignación conserva historial.

## RN-11 — Retrabajo selectivo

Solo se rehacen las fases seleccionadas por el Jefe.

## RN-12 — Historial de retrabajo

La ejecución anterior no se elimina.

## RN-13 — Notas

Solo existen notas de:

```
CALIDAD
JEFE_PRODUCCION
```

## RN-14 — Fecha esperada

Es informativa.

## RN-15 — Calidad

Cada punto 1–7:

```
Cumple / No cumple / No aplica
```

## RN-16 — No conformidad

`NO_CONFORME` requiere observaciones.

## RN-17 — Tiempo en Calidad

Se cuenta desde la finalización de la última fase.

## RN-18 — Entrega

Solo se puede entregar desde:

```
DESPACHO
```

## RN-19 — Receptor

Una OT entregada debe registrar receptor.

## RN-20 — Trazabilidad

El expediente debe conservar la historia completa de la OT.

---

# 28. Dependencias funcionales

| Funcionalidad | Depende de |
|---|---|
| HU-1.1                  | Cliente / usuarios                     |
| HU-2.1                  | HU-1.1 + HU-5.1                        |
| HU-1.3                  | HU-2.1                                 |
| Generación OT           | Aprobación de HU-1.3                   |
| HU-3.1                  | OT + secuencia de fases                |
| HU-3.2                  | Documentación                          |
| HU-3.3                  | Tiempo estimado + cola                 |
| HU-3.4                  | Notas generadas por Calidad/Jefe       |
| HU-2.2                  | OT + operarios habilitados             |
| HU-4.1                  | Finalización de última fase            |
| HU-4.2                  | HU-4.1                                 |
| HU-4.3                  | HU-4.2                                 |
| HU-2.3                  | HU-4.3 No conforme                     |
| HU-1.4                  | HU-4.3 Conforme                        |
| HU-1.2                  | Información acumulada de todo el flujo |
| HU-5.3                  | Datos de producción acumulados         |
| HU-5.4                  | Auditorías + retrabajos + tiempos      |

El Release Plan V2 mantiene la construcción por dependencias del flujo.

---

# 29. Flujo E2E principal

## E2E-01 — Solicitud a entrega

```
Vendedor
  ↓
HU-1.1 Levantar pedido
  ↓
Solicitud PENDIENTE_COTIZACION
  ↓
Jefe de producción
  ↓
HU-2.1 Recepción de cotización
  ↓
Cotización LISTA_PARA_ENVIAR
  ↓
Vendedor
  ↓
ENVIADA_A_CLIENTE
  ↓
APROBADA
  ↓
Generación automática de OT
  ↓
OT EN_PRODUCCION
  ↓
Operario
  ↓
EN_COLA
  ↓
EN_EJECUCION
  ↓
TERMINADO
  ↓
Siguiente fase
  ↓
...
  ↓
Última fase terminada
  ↓
OT EN_CALIDAD
  ↓
Calidad
  ↓
Checklist
  ↓
CONFORME
  ↓
DESPACHO
  ↓
Vendedor
  ↓
ENTREGADA
```

---

# 30. Flujo E2E — Cliente no aprueba

```
Solicitud
  ↓
Cotización
  ↓
ENVIADA_A_CLIENTE
  ↓
Cliente no aprueba
  ↓
NO_APROBADA
  ↓
No se genera OT
```

Si se requiere una nueva propuesta:

```
Nueva Solicitud
```

No existe versionado de cotización en MVP.

---

# 31. Flujo E2E — No conformidad

```
OT
  ↓
Producción
  ↓
Última fase terminada
  ↓
Calidad
  ↓
Checklist
  ↓
NO_CONFORME
  ↓
Observaciones
  ↓
Jefe de producción
  ↓
Diagnóstico
  ↓
Selección de fase(s)
  ↓
Asignación
  ↓
Retrabajo
  ↓
Calidad
```

---

# 32. Flujo E2E — Retrabajo parcial

Ejemplo:

```
OT
├── Fase 1 → Terminada
├── Fase 2 → Terminada
├── Fase 3 → Terminada
└── Fase 4 → Terminada
```

Calidad:

```
NO_CONFORME
```

Jefe:

```
Rehacer Fase 2
Rehacer Fase 4
```

Resultado:

```
Fase 1 → Terminada
Fase 2 → Nuevo intento
Fase 3 → Terminada
Fase 4 → Nuevo intento
```

El historial de las ejecuciones anteriores permanece disponible.

---

# 33. Escenarios negativos transversales

| ID | Escenario |
|---|---|
|---|---|
| NEG-01      | Guardar solicitud sin cliente                                    |
| NEG-02      | Guardar solicitud sin descripción                                |
| NEG-03      | Guardar cantidad 0                                               |
| NEG-04      | Guardar cantidad negativa                                        |
| NEG-05      | Aprobar cotización inexistente                                   |
| NEG-06      | Generar dos OTs para una cotización                              |
| NEG-07      | Generar OT con cotización no aprobada                            |
| NEG-08      | Asignar fase a operario no habilitado                            |
| NEG-09      | Perder historial de reasignación                                 |
| NEG-10      | Finalizar fase inexistente                                       |
| NEG-11      | Saltar una fase de la secuencia                                  |
| NEG-12      | Crear nota desde Operario                                        |
| NEG-13      | Registrar origen de nota no permitido                            |
| NEG-14      | Cerrar checklist incompleto                                      |
| NEG-15      | Marcar NO\_CONFORME sin observaciones                            |
| NEG-16      | Entregar OT fuera de DESPACHO                                    |
| NEG-17      | Entregar OT sin receptor                                         |
| NEG-18      | Rehacer todas las fases cuando solo fueron seleccionadas algunas |
| NEG-19      | Eliminar historial de ejecución anterior                         |
| NEG-20      | Atribuir a Calidad una fase de origen no determinada             |

---

# 34. Riesgos funcionales

| ID | Riesgo | Impacto |
|---|---|---|
|---|---|---|
| R-01            | Duplicación de estado comercial                     | Alto       |
| R-02            | Generación duplicada de OT                          | Alto       |
| R-03            | Pérdida de historial de reasignaciones              | Alto       |
| R-04            | Pérdida de historial de retrabajo                   | Alto       |
| R-05            | Asignación a operario no habilitado                 | Alto       |
| R-06            | Checklist incompleto aceptado                       | Alto       |
| R-07            | No conformidad sin observaciones                    | Alto       |
| R-08            | Cálculo incorrecto del tiempo en Calidad            | Medio/Alto |
| R-09            | Confundir retrabajos con no conformidades           | Medio      |
| R-10            | Utilizar fecha esperada como regla de planificación | Medio      |
| R-11            | Introducir estados eliminados de V1                 | Alto       |
| R-12            | Reintroducir HU-5.2 en el alcance MVP               | Medio      |

---

# 35. Puntos V2 revisados y considerados definidos

Los puntos que anteriormente podían aparecer como "a confirmar" fueron revisados contra la documentación V2.

## 35.1 Cantidad

**Estado:** Definido.

La Solicitud registra cantidad de unidades del mismo tipo de pieza.

---

## 35.2 Descripción

**Estado:** Definido.

La descripción de pieza/trabajo es obligatoria.

---

## 35.3 Vencimiento

**Estado:** Definido.

Se calcula desde el ingreso a la cola del Operario.

---

## 35.4 Habilitación Operario/Fase

**Estado:** Definido.

Es individual por operario.

---

## 35.5 Recotización

**Estado:** Definido.

No existe en MVP.

Se genera una nueva Solicitud si se requiere una nueva cotización.

---

## 35.6 Reasignaciones

**Estado:** Definido.

Se conserva historial.

---

## 35.7 Retrabajo

**Estado:** Definido.

Puede afectar una o varias fases.

---

## 35.8 Indicador de retrabajo

**Estado:** Definido.

Cuenta fases rehechas.

---

## 35.9 Tiempo en Calidad

**Estado:** Definido.

Se mide desde la finalización de la última fase hasta el veredicto.

---

## 35.10 Checklist

**Estado:** Definido.

Los puntos 1–7:

```
Cumple
No cumple
No aplica
```

---

## 35.11 Notas

**Estado:** Definido.

Solo existen dos orígenes:

```
CALIDAD
JEFE_PRODUCCION
```

Las 15 precisiones fueron tomadas como definiciones del equipo y quedaron incorporadas en PRD/Backlog V2.

---

# 36. Relación QA con el Esquema de Base de Datos V2

El esquema V2 se utiliza como fuente de consistencia para verificar que las reglas funcionales tengan representación coherente en datos.

No corresponde a QA definir el esquema.

Sí corresponde verificar funcionalmente los comportamientos que dichas restricciones deben garantizar.

## Ejemplos

### Solicitud

```
estado:
PENDIENTE_COTIZACION
COTIZADA
```

### Cotización

```
LISTA_PARA_ENVIAR
ENVIADA_A_CLIENTE
APROBADA
NO_APROBADA
```

### OT

```
EN_PRODUCCION
EN_CALIDAD
NO_CONFORME
DESPACHO
ENTREGADA
```

### Fase

```
EN_COLA
EN_EJECUCION
TERMINADO
```

El esquema V2 establece estos dominios mediante restricciones y estructura de datos.

---

# 37. Trazabilidad funcional inicial

| HU | Funcionalidad | Dependencias principales | Resultado verificable |
|---|---|---|---|
| HU-1.1                                                       | Solicitud      | Cliente               | Solicitud registrada         |
| HU-1.2                                                       | Expediente     | OT                    | Historial completo           |
| HU-1.3                                                       | Cotización     | HU-2.1                | Aprobación genera OT         |
| HU-1.4                                                       | Entrega        | Despacho              | OT entregada                 |
| HU-2.1                                                       | Cotización     | HU-1.1 / HU-5.1       | Cotización configurada       |
| HU-2.2                                                       | Gestión planta | OT / habilitación     | Reasignación trazable        |
| HU-2.3                                                       | Retrabajo      | No conformidad        | Fases seleccionadas rehechas |
| HU-3.1                                                       | Ejecución      | OT                    | Avance de fases              |
| HU-3.2                                                       | Adjuntos       | Documentación         | Información disponible       |
| HU-3.3                                                       | Vencimiento    | Tiempo / cola         | Vencimiento correcto         |
| HU-3.4                                                       | Notas          | Calidad / Jefe        | Origen discriminado          |
| HU-4.1                                                       | Cola Calidad   | Última fase           | OT disponible para auditoría |
| HU-4.2                                                       | Checklist      | HU-4.1                | Auditoría completa           |
| HU-4.3                                                       | Veredicto      | HU-4.2                | Despacho o no conformidad    |
| HU-5.1                                                       | Configuración  | Usuarios              | Fases habilitadas            |
| HU-5.3                                                       | Planta global  | Datos producción      | Indicadores de carga         |
| HU-5.4                                                       | Calidad global | Auditorías/retrabajos | Indicadores de calidad       |

La relación del modelo de datos con las historias también está documentada en el Esquema V2.

---

# 38. Trazabilidad con el modelo de datos

| Entidad / estructura | Historias relacionadas |
|---|---|
| `usuarios`                                 | HU-5.1                   |
| `clientes`                                 | HU-1.1                   |
| `solicitudes`                              | HU-1.1                   |
| `adjuntos`                                 | HU-1.1 / HU-3.2          |
| `fases_catalogo`                           | HU-5.1                   |
| `fase_operarios_habilitados`               | HU-5.1                   |
| `cotizaciones`                             | HU-2.1 / HU-1.3          |
| `cotizacion_fases`                         | HU-2.1                   |
| `ordenes_trabajo`                          | HU-1.3 / HU-1.4          |
| `ot_fases`                                 | HU-3.1 / HU-2.3          |
| `ot_fase_reasignaciones`                   | HU-2.2                   |
| `ot_notas`                                 | HU-3.4 / HU-2.3          |
| `auditorias_calidad`                       | HU-4.1 / HU-4.2 / HU-4.3 |
| `auditoria_checklist_respuestas`           | HU-4.2                   |
| Consultas/agregaciones                     | HU-1.2 / HU-5.3 / HU-5.4 |

Esta correspondencia coincide con la trazabilidad documentada en el esquema V2.

---

# 39. Validaciones funcionales transversales

QA deberá verificar especialmente:

## Estados

-  Solo permitir estados válidos.
-  No introducir estados eliminados de V1.
-  Respetar transiciones válidas.

## Trazabilidad

-  No perder ejecuciones.
-  No perder reasignaciones.
-  No perder retrabajos.
-  No duplicar información comercial.

## Seguridad funcional

-  Cada rol accede únicamente a las funcionalidades correspondientes.
-  El Operario visualiza únicamente sus tareas.
-  El Gerente no crea operarios en MVP.
-  Calidad no asigna fases de origen.

## Integridad

-  No generar OT sin aprobación.
-  No generar más de una OT por cotización.
-  No entregar fuera de Despacho.
-  No cerrar una auditoría incompleta.

---

# 40. Reglas de transición principales

## Solicitud

```
PENDIENTE_COTIZACION
        ↓
     COTIZADA
```

## Cotización

```
LISTA_PARA_ENVIAR
        ↓
ENVIADA_A_CLIENTE
        ↓
   ┌────┴────┐
   ↓         ↓
APROBADA   NO_APROBADA
   ↓
Generación OT
```

## OT

```
EN_PRODUCCION
      ↓
EN_CALIDAD
      ↓
 ┌────┴─────────┐
 ↓              ↓
DESPACHO     NO_CONFORME
 ↓              ↓
ENTREGADA   Retrabajo
                ↓
          EN_PRODUCCION
```

La representación anterior expresa el comportamiento funcional definido para el análisis QA; las implementaciones concretas de transición corresponden al equipo de desarrollo.

---

# 41. Principios de calidad funcional

QualityTrack debe conservar como principios transversales:

## 41.1 Trazabilidad

Toda OT debe poder reconstruirse históricamente.

## 41.2 No pérdida de información

Una reasignación o retrabajo no debe borrar evidencia anterior.

## 41.3 Estado único

Cada entidad debe mantener su estado en el lugar funcional correspondiente.

## 41.4 Reglas verificables

Las reglas de negocio deben poder transformarse en escenarios de prueba.

## 41.5 Separación de responsabilidades

Cada rol debe realizar únicamente las acciones correspondientes.

## 41.6 Consistencia documental

PRD, Backlog, Esquema y documentación QA deben mantenerse alineados.

---

# 42. Elementos fuera del MVP

El análisis QA no considera como funcionalidades MVP:

1.  Automatización avanzada del precio por variables.
2.  Alta de operarios por Gerente.
3.  Recotización con historial/versionado.
4.  Entregas parciales.

Estos elementos están documentados como extensiones futuras en PRD V2.

También permanecen fuera del alcance actual:

-  modelo independiente de certificados de materia prima;
-  dashboard específico de órdenes de compra;
-  facturación;
-  comprobantes de pago;
-  documento formal de entrega;
-  indicadores de producción por período;
-  indicadores de entregas por período.

---

# 43. Estado del análisis funcional de Semana 1

## Resultado

El análisis funcional QA queda alineado con:

-  PRD V2;
-  Backlog V2;
-  Esquema de Base de Datos V2;
-  documento de Cambios PRD/Backlog.

## Cobertura

```
Épicas analizadas:       5
HU activas analizadas:  17
HU eliminadas:            1
Estados revisados:       Sí
Reglas de negocio:       Sí
Dependencias:            Sí
E2E principales:         Sí
Escenarios negativos:    Sí
Riesgos funcionales:     Sí
Trazabilidad inicial:    Sí
```

---

# 44. Criterio de cierre de Semana 1

El análisis funcional de Semana 1 se considera completo cuando:

-  las 17 HU activas están analizadas;
-  HU-5.2 no forma parte del alcance activo;
-  los estados coinciden con V2;
-  las reglas V2 están reflejadas;
-  no existen contradicciones conocidas con PRD/Backlog/Esquema V2;
-  los principales flujos E2E están identificados;
-  los escenarios negativos relevantes están identificados;
-  las dependencias están documentadas;
-  los riesgos funcionales están identificados;
-  existe una primera matriz de trazabilidad.

---

# 45. Consideraciones para QA

Este documento representa el **análisis funcional de Semana 1**.

No debe interpretarse como evidencia de que todos los casos funcionales, E2E, regresión o pruebas de integración ya fueron ejecutados.

La ejecución de pruebas, evidencias, defectos, retesting y regresión corresponden a las etapas posteriores del ciclo QA.

Por lo tanto:

```
Análisis funcional
        ↓
Escenarios
        ↓
Casos de prueba
        ↓
Ejecución
        ↓
Defectos
        ↓
Retesting
        ↓
Regresión
        ↓
Cierre QA
```

---

# 46. Control de consistencia V2

| Control | Resultado |
|---|---|
| 17 HU activas                                  | OK |
| HU-5.2 eliminada                               | OK |
| Solicitud con 2 estados V2                     | OK |
| Cotización con 4 estados V2                    | OK |
| OT con 5 estados V2                            | OK |
| Estados antiguos de V1 eliminados del análisis | OK |
| `EN_VERIFICACION` persistente eliminado        | OK |
| HU-1.1 incluye descripción                     | OK |
| HU-1.1 incluye cantidad                        | OK |
| Fecha esperada informativa                     | OK |
| HU-4.2:`Cumple / No cumple / No aplica`        | OK |
| Retrabajo selectivo                            | OK |
| Historial de reasignación                      | OK |
| Retrabajos por fase                            | OK |
| Tiempo en Calidad desde última fase            | OK |
| Dos orígenes de notas                          | OK |
| Sin recotización MVP                           | OK |
| Sin alta de operarios por Gerente              | OK |
| Precio único por cotización                    | OK |
| Fase repetible                                 | OK |
| Habilitación individual Operario/Fase          | OK |
| Entrega únicamente desde Despacho              | OK |

---

# 47. Conclusión

La revisión de este documento se realizó tomando como referencia las versiones V2 vigentes del proyecto.

El análisis QA queda orientado a verificar el comportamiento funcional definido por el equipo, manteniendo separados:

-  alcance y decisiones de producto;
-  implementación técnica;
-  validación QA.

La versión actual contempla **17 User Stories activas** distribuidas en las cinco épicas.

La eliminación de HU-5.2, los estados vigentes, la cantidad y descripción de la solicitud, el nuevo criterio del checklist, la trazabilidad de reasignaciones, el retrabajo selectivo, la medición del tiempo en Calidad, la ausencia de recotización en MVP y la separación de los orígenes de notas quedan incorporados como definiciones funcionales vigentes.

El análisis constituye la base para la posterior elaboración de:

-  escenarios funcionales;
-  casos de prueba;
-  matriz de trazabilidad detallada;
-  datos de prueba;
-  pruebas de integración;
-  pruebas E2E;
-  ejecución;
-  evidencias;
-  defectos;
-  retesting;
-  regresión.

---

# 48. Control documental

| Campo | Valor |
|---|---|
| Documento            | `docs/qa/Analisis-Funcional.md`     |
| Proyecto             | QualityTrack                        |
| Área                 | QA / Análisis Funcional             |
| Versión              | 2.0                                 |
| Base funcional       | PRD v2                              |
| Base de historias    | Backlog v2                          |
| Base de datos        | Esquema v2                          |
| Cambios funcionales  | QualityTrack-Cambios-PRD-Backlog.md |
| Historias activas    | 17                                  |
| Historias eliminadas | HU-5.2                              |
| Estado               | Revalidado                          |

---

## Nota de mantenimiento

Ante una nueva modificación aprobada de:

-  PRD;
-  Backlog;
-  Esquema;
-  reglas de negocio;

este documento deberá revisarse para garantizar que:

```
Fuente funcional
      ↓
Backlog
      ↓
Modelo de datos
      ↓
Análisis QA
      ↓
Escenarios
      ↓
Casos de prueba
```

permanezcan consistentes.

QA no debe actualizar unilateralmente decisiones de producto: cualquier cambio funcional debe provenir de la fuente de decisión correspondiente y luego reflejarse en la documentación de QA.

## Alcance temporal del documento

Este documento corresponde al análisis funcional de QA realizado durante la Semana 1 y a su revalidación contra la versión vigente del proyecto (PRD v2, Backlog v2 y Esquema de Base de Datos v2).

Las actividades posteriores de diseño de casos de prueba, ejecución, evidencias, gestión de defectos, retest, regresión y cierre QA corresponden a las siguientes etapas del proceso QA y serán documentadas en los artefactos correspondientes.
