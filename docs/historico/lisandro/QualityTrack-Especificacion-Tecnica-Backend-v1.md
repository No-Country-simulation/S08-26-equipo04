

# **QUALITYTRACK**

## **ESPECIFICACIÓN TÉCNICA DEL SISTEMA**

### **Backend — MVP v1.0**

**Proyecto:** QualityTrack  
**Programa:** NO-Country  
**Semana:** 1 de 5  
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Estado:** Base técnica para desarrollo del MVP

---

# **1\. Objetivo del documento**

Este documento define la arquitectura técnica, estructura del backend, responsabilidades de los módulos, tecnologías, reglas técnicas y contratos generales de API para el desarrollo del MVP de QualityTrack.

QualityTrack es una plataforma para gestionar y centralizar la trazabilidad de órdenes de trabajo de una empresa industrial de mecanizado.

El sistema debe permitir reconstruir la historia completa de una Orden de Trabajo (OT), incluyendo:

* solicitud inicial;  
* información del cliente;  
* documentación asociada;  
* cotización;  
* aprobación o rechazo;  
* creación de la OT;  
* fases de producción;  
* operadores responsables;  
* ejecución de cada fase;  
* controles de calidad;  
* no conformidades;  
* retrabajos;  
* despacho;  
* entrega;  
* documentación asociada.

El criterio principal de éxito del MVP es:

> Poder tomar una Orden de Trabajo y reconstruir su historial completo y documentación asociada desde un único lugar.

---

# **2\. Fuente funcional de verdad**

La fuente funcional principal del desarrollo es:

**Especificación Funcional · Versión 1 — QualityTrack — Flujo unificado del MVP**

La especificación funcional define el comportamiento esperado del sistema.

Los documentos técnicos y el modelo de base de datos deben mantenerse alineados con dicha especificación.

En caso de conflicto entre documentos anteriores y la especificación funcional vigente, prevalece la especificación funcional vigente.

---

# **3\. Flujo general del sistema**

El flujo principal del MVP es:

Solicitud  
    ↓  
Cotización  
    ↓  
Aprobación / Rechazo  
    ↓  
Orden de Trabajo  
    ↓  
Hoja de Ruta / Fases  
    ↓  
Operaciones  
    ↓  
Control de Calidad  
    ↓  
Despacho  
    ↓  
Entrega

Flujo alternativo:

Calidad  
    ↓  
No Conforme  
    ↓  
Jefe de Producción  
    ↓  
Selecciona fase(s) a rehacer  
    ↓  
Asigna operador / tiempo / instrucciones  
    ↓  
Operario  
    ↓  
Ejecuta nuevamente la fase  
    ↓  
Calidad

---

# **4\. Arquitectura general**

La arquitectura propuesta para el MVP es:

                   ┌─────────────────────┐  
                    │       React         │  
                    │      Frontend       │  
                    └──────────┬──────────┘  
                               │  
                         HTTP / JSON  
                               │  
                               ▼  
                    ┌─────────────────────┐  
                    │    Spring Boot      │  
                    │       Backend       │  
                    └──────────┬──────────┘  
                               │  
              ┌────────────────┼────────────────┐  
              │                │                │  
              ▼                ▼                ▼  
        Spring Data JPA   Spring Security   Bean Validation  
              │                │  
              └────────────────┘  
                       │  
                       ▼  
                 ┌───────────┐  
                 │ PostgreSQL│  
                 └───────────┘

La comunicación entre frontend y backend se realizará mediante una API REST utilizando JSON sobre HTTP.

---

# **5\. Tecnologías**

## **Backend**

* Java 17+  
* Spring Boot  
* Spring Web  
* Spring Data JPA  
* Hibernate  
* Spring Security  
* JWT  
* Bean Validation  
* Maven

## **Base de datos**

* PostgreSQL

## **API**

* REST  
* JSON  
* HTTP  
* OpenAPI / Swagger

## **Control de versiones**

* Git  
* GitHub

## **Frontend**

* React

---

# **6\. Estructura del proyecto**

La estructura general del repositorio será:

qualitytrack/  
│  
├── backend/  
│  
├── frontend/  
│  
├── docs/  
│  
├── README.md  
│  
└── .gitignore

Estructura propuesta del backend:

backend/  
│  
├── pom.xml  
├── README.md  
├── .env.example  
│  
└── src/  
    ├── main/  
    │   ├── java/  
    │   │   └── com/  
    │   │       └── qualitytrack/  
    │   │  
    │   │           ├── QualityTrackApplication.java  
    │   │  
    │   │           ├── config/  
    │   │  
    │   │           ├── security/  
    │   │  
    │   │           ├── usuario/  
    │   │  
    │   │           ├── cliente/  
    │   │  
    │   │           ├── solicitud/  
    │   │  
    │   │           ├── cotizacion/  
    │   │  
    │   │           ├── orden/  
    │   │  
    │   │           ├── fase/  
    │   │  
    │   │           ├── otfase/  
    │   │  
    │   │           ├── calidad/  
    │   │  
    │   │           ├── documento/  
    │   │  
    │   │           ├── despacho/  
    │   │  
    │   │           ├── expediente/  
    │   │  
    │   │           ├── dashboard/  
    │   │  
    │   │           └── exception/  
    │   │  
    │   └── resources/  
    │       ├── application.properties  
    │       └── application-dev.properties  
    │  
    └── test/

---

# **7\. Organización interna de los módulos**

Cada módulo funcional debe mantener una estructura similar:

cliente/  
├── controller/  
├── service/  
├── repository/  
├── entity/  
├── dto/  
└── mapper/

La separación busca evitar colocar toda la lógica en los controladores.

Responsabilidades:

### **Controller**

Recibe las solicitudes HTTP y devuelve las respuestas de la API.

### **Service**

Contiene la lógica de negocio y las reglas del proceso.

### **Repository**

Gestiona el acceso a PostgreSQL mediante Spring Data JPA.

### **Entity**

Representa las entidades persistidas en la base de datos.

### **DTO**

Define los objetos utilizados para entrada y salida de la API.

### **Mapper**

Realiza la conversión entre Entity y DTO cuando sea necesario.

---

# **8\. Roles del sistema**

El sistema tendrá los siguientes roles:

VENDEDOR  
JEFE\_PRODUCCION  
OPERARIO  
CALIDAD  
GERENTE

## **8.1 Vendedor**

Responsabilidades:

* crear solicitudes;  
* registrar información del cliente;  
* cargar plano y documentos;  
* registrar fecha esperada;  
* consultar cotizaciones;  
* comunicar la cotización al cliente;  
* registrar la aprobación o rechazo informado por el cliente;  
* consultar expedientes completos;  
* gestionar despacho y entrega.

Importante:

> El cliente no aprueba directamente dentro del sistema en el MVP. El Vendedor registra la respuesta del cliente.

---

# **9\. Jefe de Producción**

Responsabilidades:

* recibir solicitudes;  
* revisar documentación;  
* seleccionar fases;  
* ordenar las fases;  
* estimar tiempo por fase;  
* definir el precio final de la cotización;  
* devolver la cotización al Vendedor;  
* gestionar carga de trabajo;  
* asignar y reasignar operadores;  
* gestionar fases no conformes;  
* seleccionar las fases que deben rehacerse.

El precio del MVP será:

Precio final de la cotización

No se implementará precio individual por fase.

---

# **10\. Operario**

El Operario podrá:

* consultar tareas pendientes;  
* consultar tareas en ejecución;  
* iniciar una fase;  
* finalizar una fase;  
* consultar tiempo estimado;  
* consultar fecha límite;  
* agregar notas;  
* adjuntar documentación;  
* consultar instrucciones provenientes del Jefe de Producción;  
* consultar observaciones provenientes de Calidad.

La interfaz debe considerar un uso sencillo desde:

* computador;  
* tablet;  
* dispositivo móvil.

---

# **11\. Calidad**

Calidad podrá:

* consultar OTs que finalizaron todas sus fases;  
* ejecutar el checklist de calidad;  
* registrar resultado conforme;  
* registrar resultado no conforme;  
* agregar observaciones;  
* devolver una OT al proceso de producción cuando exista una no conformidad.

El checklist tendrá ocho puntos:

1. Conformidad dimensional.  
2. Todas las fases completas.  
3. Acabado / apariencia.  
4. Cantidad.  
5. Identificación con número de OT.  
6. Prueba funcional, cuando corresponda.  
7. Documentación de respaldo completa y correspondiente.  
8. Resultado conforme / no conforme.

Cuando el resultado sea no conforme:

observaciones obligatorias

---

# **12\. Gerente**

El Gerente tendrá funciones globales:

* gestionar catálogo global de fases;  
* definir operadores elegibles para fases;  
* crear operadores;  
* consultar estado global de planta;  
* consultar indicadores globales de calidad.

El sistema no debe utilizar un orden fijo global de fases.

Cada solicitud puede tener su propia secuencia de fases.

---

# **13\. Modelo de estados**

Los estados son fundamentales para controlar el flujo del sistema.

## **Solicitud**

CREADA  
COTIZACION\_ENVIADA  
ACEPTADA  
RECHAZADA

## **Cotización**

GENERADA  
ENVIADA  
ACEPTADA  
RECHAZADA

## **Orden de Trabajo**

CREADA  
EN\_PROGRESO  
EN\_CALIDAD  
DESPACHO  
ENTREGADA  
COMPLETADA  
CANCELADA

## **Fase de OT**

PENDIENTE  
EJECUCION  
TERMINADO

## **Calidad**

EN\_VERIFICACION  
CONFORME  
NO\_CONFORME

---

# **14\. Reglas principales del negocio**

## **Regla 1 — Precio**

La cotización tendrá un único precio final.

COTIZACION.precio\_total

No se implementará precio individual por fase en el MVP.

---

## **Regla 2 — Secuencia de fases**

Cada OT puede tener una secuencia de fases diferente.

La empresa no tendrá una secuencia única obligatoria para todas las OTs.

---

## **Regla 3 — Estimación**

El Jefe de Producción define el tiempo estimado de cada fase.

---

## **Regla 4 — Aprobación**

El cliente comunica su decisión al Vendedor.

El Vendedor registra:

APROBADA

o

RECHAZADA

en el sistema.

Si la cotización es aprobada:

Cotización aprobada  
        ↓  
Creación de OT  
        ↓  
Inicio del flujo productivo

Si es rechazada:

Cotización rechazada  
        ↓  
No se crea OT  
        ↓  
Regresa al proceso comercial / Jefe según corresponda

---

# **15\. Regla de avance de fases**

Cuando un Operario finaliza una fase, el sistema debe identificar si existe una siguiente fase.

Fase terminada  
      ↓  
¿Existe siguiente fase?  
   /              \\  
 Sí                No  
 ↓                  ↓  
Asignar             Calidad  
siguiente  
fase

---

# **16\. Reasignación**

El Jefe de Producción puede reasignar una fase a otro Operario.

La reasignación no debe eliminar la información histórica de la OT.

---

# **17\. Rework / Retrabajo**

La no conformidad puede afectar una o varias fases.

El Jefe de Producción debe poder seleccionar específicamente las fases que requieren retrabajo.

Ejemplo:

OT-001

Fase 1 → TERMINADO  
Fase 2 → NO CONFORME → REHACER  
Fase 3 → TERMINADO  
Fase 4 → TERMINADO

No se debe reiniciar toda la OT automáticamente.

Las fases que no fueron afectadas mantienen su estado.

Además:

> El sistema debe conservar la trazabilidad de la ejecución anterior.

Por esta razón, el diseño definitivo del retrabajo debe contemplar un mecanismo de historial o intentos de ejecución para evitar sobrescribir la evidencia de la ejecución anterior.

Este mecanismo puede implementarse mediante una entidad específica de ejecución/retrabajo en una iteración posterior del MVP, si el equipo determina que resulta necesario para mantener la trazabilidad completa.

---

# **18\. Documentos**

Los documentos pueden asociarse inicialmente a una Solicitud o posteriormente a una Orden de Trabajo.

Tipos posibles:

* plano;  
* especificación técnica;  
* certificado;  
* documento de producción;  
* documento de calidad;  
* evidencia;  
* otro.

El modelo técnico no obliga a crear una entidad independiente para cada tipo de documento.

En el MVP se utilizará una entidad documental general.

---

# **19\. API REST propuesta**

## **Autenticación**

POST /api/auth/login

---

## **Usuarios**

GET    /api/usuarios  
POST   /api/usuarios  
GET    /api/usuarios/{id}  
PUT    /api/usuarios/{id}

---

## **Clientes**

GET    /api/clientes  
POST   /api/clientes  
GET    /api/clientes/{id}  
PUT    /api/clientes/{id}

---

## **Solicitudes**

GET    /api/solicitudes  
POST   /api/solicitudes  
GET    /api/solicitudes/{id}  
PUT    /api/solicitudes/{id}

---

## **Documentos**

POST   /api/documentos  
GET    /api/documentos/{id}  
GET    /api/solicitudes/{id}/documentos  
GET    /api/ordenes-trabajo/{id}/documentos

---

## **Cotizaciones**

GET    /api/cotizaciones  
POST   /api/cotizaciones  
GET    /api/cotizaciones/{id}  
PUT    /api/cotizaciones/{id}

POST   /api/cotizaciones/{id}/aprobar  
POST   /api/cotizaciones/{id}/rechazar

---

# **20\. Orden de Trabajo**

GET    /api/ordenes-trabajo  
POST   /api/ordenes-trabajo  
GET    /api/ordenes-trabajo/{id}

La creación automática de la OT debe producirse como consecuencia de la aprobación registrada por el Vendedor, según las reglas de negocio.

---

# **21\. Fases**

GET    /api/fases  
POST   /api/fases  
PUT    /api/fases/{id}  
DELETE /api/fases/{id}

---

# **22\. Fases de una OT**

GET    /api/ot-fases  
POST   /api/ot-fases

POST   /api/ot-fases/{id}/asignar  
POST   /api/ot-fases/{id}/reasignar  
POST   /api/ot-fases/{id}/iniciar  
POST   /api/ot-fases/{id}/finalizar

---

# **23\. Calidad**

GET    /api/calidad  
GET    /api/calidad/{id}  
POST   /api/calidad/{id}/checklist  
POST   /api/calidad/{id}/conforme  
POST   /api/calidad/{id}/no-conforme

---

# **24\. Despacho y entrega**

POST /api/ordenes-trabajo/{id}/despacho  
POST /api/ordenes-trabajo/{id}/entrega

El sistema debe impedir marcar una OT como entregada si previamente no se encuentra en estado:

DESPACHO

La entrega debe registrar el receptor.

---

# **25\. Expediente completo**

El Vendedor podrá consultar el expediente completo:

GET /api/ordenes-trabajo/{id}/expediente

El expediente debe permitir reconstruir:

Cliente  
   ↓  
Solicitud  
   ↓  
Documentos  
   ↓  
Cotización  
   ↓  
Aprobación  
   ↓  
OT  
   ↓  
Fases  
   ↓  
Operarios  
   ↓  
Ejecuciones  
   ↓  
Calidad  
   ↓  
Retrabajos  
   ↓  
Despacho  
   ↓  
Entrega

---

# **26\. Dashboards**

## **Jefe de Producción**

Debe visualizar:

* OTs pendientes;  
* OTs activas;  
* carga de trabajo;  
* fases pendientes;  
* fases en ejecución;  
* fases que requieren retrabajo.

## **Gerente**

Debe visualizar:

* total de OTs pendientes;  
* OTs activas;  
* congestión por fase;  
* estado general de planta;  
* porcentaje de conformidad;  
* porcentaje de no conformidad;  
* no conformidades por fase;  
* auditorías recientes;  
* tiempo promedio en Calidad.

No se utilizarán indicadores de rendimiento individual de operadores en el MVP.

---

# **27\. Seguridad**

La seguridad utilizará:

* Spring Security;  
* autenticación mediante JWT;  
* autorización basada en roles;  
* contraseñas almacenadas mediante hash seguro;  
* endpoints protegidos según rol.

Ejemplo conceptual:

VENDEDOR  
→ Solicitudes  
→ Cotizaciones  
→ Expedientes  
→ Despacho

JEFE\_PRODUCCION  
→ Cotizaciones  
→ Producción  
→ Reasignaciones  
→ Retrabajos

OPERARIO  
→ Sus tareas  
→ Ejecución

CALIDAD  
→ Control de calidad

GERENTE  
→ Configuración global  
→ Dashboards

---

# **28\. Validaciones**

Las entradas de la API deberán validarse mediante Bean Validation.

Ejemplos:

@NotNull  
@NotBlank  
@Email  
@Size  
@Positive

Las reglas de negocio deberán validarse en la capa Service.

No se debe confiar únicamente en las validaciones del frontend.

---

# **29\. Manejo de excepciones**

Se recomienda implementar un manejador global:

@RestControllerAdvice

Debe devolver respuestas consistentes para:

* recurso no encontrado;  
* datos inválidos;  
* conflicto de estado;  
* acceso no autorizado;  
* operación no permitida;  
* errores internos.

---

# **30\. Principios de desarrollo**

El equipo deberá seguir estos principios:

1. No trabajar directamente sobre `main`.  
2. No trabajar directamente sobre `develop`.  
3. Cada funcionalidad se desarrolla en una rama.  
4. Todo cambio relevante llega mediante Pull Request.  
5. El código debe compilar antes de solicitar revisión.  
6. Los endpoints deben documentarse.  
7. La lógica de negocio debe permanecer en Services.  
8. No duplicar entidades innecesariamente.  
9. No modificar el flujo funcional sin validación del equipo.  
10. Mantener compatibilidad entre backend y frontend.

---

# **31\. Estrategia Git**

Estructura recomendada:

main  
└── develop  
    ├── feature/backend-base  
    ├── feature/backend-security  
    ├── feature/backend-comercial  
    ├── feature/backend-produccion  
    └── feature/backend-calidad

El directorio físico:

backend/

es una carpeta del proyecto.

No es una rama de Git.

Las ramas son independientes y trabajan sobre el mismo repositorio.

---

# **32\. Responsabilidad técnica del equipo**

### **Technical Lead / Backend Lead**

Responsable de:

* arquitectura;  
* estructura del backend;  
* estándares técnicos;  
* modelo de integración;  
* contratos API;  
* coordinación técnica;  
* revisión de Pull Requests;  
* decisiones técnicas;  
* resolución de bloqueos;  
* coordinación entre módulos;  
* integración final.

### **Abel — Security / Users**

Responsable de:

* usuarios;  
* roles;  
* autenticación;  
* JWT;  
* Spring Security;  
* autorización.

### **Lisandro — Comercial**

Responsable de:

* Cliente;  
* Solicitud;  
* Cotización;  
* aprobación/rechazo;  
* flujo comercial.

### **Luis — Producción**

Responsable de:

* Orden de Trabajo;  
* Fase;  
* OT\_FASE;  
* asignaciones;  
* cola de producción;  
* inicio/finalización de fases.

### **Felipe — Calidad**

Responsable de:

* checklist;  
* control de calidad;  
* no conformidades;  
* integración con retrabajo;  
* despacho/entrega.

### **QA / Análisis Funcional**

Responsable de:

* escenarios de prueba;  
* criterios de aceptación;  
* casos negativos;  
* matriz de trazabilidad;  
* pruebas E2E;  
* regresión.

QA es transversal y no modifica por sí mismo las decisiones de arquitectura o alcance.

---

# **33\. Fuera del MVP**

No forman parte del alcance inicial:

* cálculo automático avanzado de precios;  
* modelado independiente y detallado de certificados de materia prima;  
* dashboard independiente de órdenes de compra;  
* dashboard independiente de facturas/comprobantes;  
* documento formal de entrega;  
* indicadores específicos de período de producción/entrega;  
* métricas de rendimiento individual de operadores.

La automatización de precios queda para una etapa posterior y podrá utilizar variables del proceso.

---

# **34\. Criterio técnico de finalización**

Una funcionalidad se considera técnicamente integrada cuando:

1. El código compila.  
2. La persistencia funciona.  
3. Las validaciones están implementadas.  
4. Los endpoints responden correctamente.  
5. Los estados respetan las reglas del flujo.  
6. Los errores tienen tratamiento.  
7. La funcionalidad puede ser consumida por frontend.  
8. Existe documentación mínima del endpoint.  
9. El Pull Request fue revisado.  
10. La integración no rompe funcionalidades existentes.

---

# **35\. Principio central del desarrollo**

QualityTrack no debe modelarse solamente como un conjunto de pantallas.

El backend debe modelar:

> **Estados \+ transiciones \+ trazabilidad \+ evidencia.**

Las interfaces representan el proceso, pero la lógica principal debe garantizar que una OT nunca pierda la historia de lo ocurrido.
