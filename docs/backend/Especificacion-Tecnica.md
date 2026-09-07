# Especificación técnica

## Arquitectura general

Se utiliza una arquitectura cliente-servidor, donde el frontend se comunica con el backend a través de una REST API, organizada de manera modular para los diferentes tipos de acceso (Vendedor, Jefe de producción, Operario, Calidad, Gerente), que a su vez gestiona una base de datos PostgreSQL.

## Stack tecnológico

### Desarrollo

- **Backend:** *Java + Spring Boot*, por su robustez y facilidad para crear REST APIs e implementar servicios de seguridad y autenticación a través de Spring Security, así como también diversos otros servicios que cubran todos los requerimientos del proyecto.
- **Frontend:** *React*, por su popularidad y eficiencia en la creación de interfaces de usuario dinámicas.
- **Base de datos:** *PostgreSQL*, por su fiabilidad y soporte para relaciones complejas entre datos. Además, una de las opciones más recomendadas para el despliegue gratuito de bases de datos (Neon) solo acepta PostgreSQL.

## Autenticación y autorización

En esta sección, se desarrolla cómo se identifica a cada usuario y cómo se restringe cada dashboard usando los roles ya cerrados (Vendedor, Jefe de producción, Operario, Calidad, Gerente).

Para autorizar el acceso a los distintos endpoints de la API, se implementará un sistema de roles mediante Spring Security. Los roles a identificar son los siguientes:

- Vendedor (ROLE_SALES)
- Jefe de producción (ROLE_PRODUCTION)
- Operario (ROLE_OPERATOR)
- Calidad (ROLE_QUALITY)
- Gerente (ROLE_MANAGER)

Para la identificación de usuarios, se utilizarán JWT (JSON Web Tokens). Cuando los usuarios inician sesión con sus credenciales, Spring Security las valida con la base de datos y devuelve un token JWT codificado que lo identifica junto a su rol.

## Manejo de errores y validaciones

Para validaciones, se hará uso de Jakarta en los DTO de entrada para asegurar que los datos obligatorios estén presentes y cumplan con los formatos esperados antes de procesar la solicitud.

## Contratos de API

Se desarrollan los endpoints a utilizar en el sistema. Para mejor organización, tienen como prefijos a las épicas que les corresponden.

Se detalla por cada endpoint:

- Método HTTP
- Ruta
- Qué rol puede usarlo
- Qué datos espera recibir
- Qué devuelve en caso de éxito o error, con sus códigos de estado

### Solicitudes

#### Alta de solicitud (HU-1.1)

- Método HTTP: POST
- Ruta: /api/requests
- Roles: Vendedor
- Body: Datos de cliente como JSON, Archivos de documentación, Notas
- Respuesta exitosa: 201 - Created { --datos JSON-- }
- Respuesta de error: 400 Bad Request (faltan datos)

#### Obtener solicitudes (HU-2.1A)

- Método HTTP: GET
- Ruta: /api/requests
- Roles: Vendedor, Jefe de producción
- Respuesta exitosa: 200 - OK { para cada solicitud: --datos de cliente como JSON, archivos de documentación, notas-- }
- Respuesta de error: 404 Not Found (solicitud no encontrada)

### Cotizaciones

#### Alta de cotización (HU-2.1B)

- Método HTTP: POST
- Ruta: /api/quotations
- Roles: Jefe de producción
- Body: {
    phases: [
        {
            phase: "nombre de fase",
            estimatedTime: "tiempo estimado",
        }
        ...
    ]
    price: 0 <- double
}
- Respuesta exitosa: 201 - Created { --datos JSON de la cotización creada-- }
- Respuesta de error: 400 Bad Request (faltan datos o estado inválido)

#### Obtener cotizaciones (HU-1.3A)

- Método HTTP: GET
- Ruta: /api/quotations
- Roles: Vendedor
- Respuesta exitosa: 200 - OK { --JSON con info de cotizaciones derivadas: fases, tiempos, precio-- }
- Respuesta de error: 404 Not Found (no existen cotizaciones derivadas)

#### Aprobar cotización (HU-1.3B)

- Método HTTP: PATCH
- Ruta: /api/quotations/{quotationId}/approval
- Roles: Vendedor
- Respuesta exitosa: 200 - OK { --JSON con info de la cotización actualizada-- }
- Respuesta de error: 400 Bad Request (cotización no encontrada o estado inválido)

#### Rechazar cotización (HU-1.3C)

- Método HTTP: PATCH
- Ruta: /api/quotations/{quotationId}/rejection
- Roles: Vendedor
- Respuesta exitosa: 200 - OK { --JSON con info de la cotización actualizada-- }
- Respuesta de error: 400 Bad Request (cotización no encontrada o estado inválido)

### OTs

#### Obtener lista de OTs dado un criterio de búsqueda (HU-1.2)

- Método HTTP: GET
- Ruta: /api/ot?{queryParameters}
- Query parameters: número de OT, cliente, etc. (/api/ot?ot_id=0&cliente=nombre)
- Roles: Vendedor
- Respuesta exitosa: 200 - OK { --JSON con info de OTs que cumplan con los criterios de búsqueda-- }
- Respuesta de error: 404 Not Found (no existe la OT)

#### Obtener OTs en desarrollo (HU-2.2A)

- Método HTTP: GET
- Ruta: /api/ot/assigned
- Roles: Jefe de producción
- Respuesta exitosa: 200 - OK { --JSON con info de las OTs asignadas a cada operario [operario, ot]-- }
- Respuesta de error: 404 Not Found (no existen OTs asignadas)

#### Obtener documentación de una OT (HU-3.2)

- Método HTTP: GET
- Ruta: /api/ot/{otId}/attachments
- Roles: Operario
- Respuesta exitosa: 200 - OK { --JSON con info de los enlaces a los adjuntos de la OT-- }
- Respuesta de error: 404 Not Found (no encuentra referencia de adjuntos para la OT)

#### Reasignar OT a otro operario (HU-2.2B)

- Método HTTP: PATCH
- Ruta: /api/ot/{otId}/reassignment/{operatorId}
- Roles: Jefe de producción
- Respuesta exitosa: 200 - OK { --JSON con info de la OT actualizada-- }
- Respuesta de error: 400 Bad Request (OT no encontrada o estado inválido)

#### Marcar OT como entregada (HU-1.4)

- Método HTTP: PATCH
- Ruta: /api/ot/{otId}/delivery
- Roles: Vendedor
- Respuesta exitosa: 200 - OK { --JSON con info de la OT actualizada-- }
- Respuesta de error: 400 Bad Request (OT no encontrada o estado inválido)

### Control de calidad

#### Enviar a rehacer fases de OT no conforme (HU-2.3A)

- Método HTTP: PATCH
- Ruta: /api/ot/{otId}/redo
- Roles: Jefe de producción
- Body: {por cada fase a rehacer, nombre de fase, operario asignado, tiempo estimado, notas de jefe de producción}
- Respuesta exitosa: 200 - OK { --JSON con info de la OT actualizada-- }
- Respuesta de error: 400 Bad Request (OT no encontrada o estado inválido)

#### Obtener OTs a rehacer (HU-2.3B)

- Método HTTP: GET
- Ruta: /api/ot/redo
- Roles: Jefe de producción
- Respuesta exitosa: 200 - OK {---JSON con info de OTs a rehacer---}
- Respuesta de error: 400 Bad Request (falla en conexión)

---

### Fases

#### Ver fases (HU-3.1A)

- Método HTTP: GET
- Ruta: /api/ot/tasks
- Roles: Operario
- Respuesta exitosa: 200 - OK { --JSON con info de las fases pendientes y en ejecución del operario en cuestión -- }
- Respuesta de error: 404 Not Found (no encuentra fases)

#### Avanzar fase (HU-3.1B)

- Método HTTP: PATCH
- Ruta: /api/ot/tasks/{taskId}/advance
- Roles: Operario
- Respuesta exitosa: 200 - OK { --JSON con próxima fase si hay, o se remarca que pasa a Calidad si no hay-- }
- Respuesta de error: 400 Bad Request (fase no encontrada o estado inválido)

#### Ver vencimiento de fase (HU-3.3)

- Método HTTP: GET
- Ruta: /api/ot/tasks/{taskId}/deadline
- Roles: Operario
- Respuesta exitosa: 200 - OK { --JSON con info del tiempo de vencimiento de la fase-- }
- Respuesta de error: 404 Not Found (fase no encontrada)

#### Obtener notas discriminadas por origen (HU-3.4)

- Método HTTP: GET
- Ruta: /api/ot/tasks/{taskId}/notes
- Roles: Operario
- Respuesta exitosa: 200 - OK { --JSON con info de las notas de la fase, separadas por origen-- }
- Respuesta de error: 404 Not Found (fase no encontrada)

#### Obtener órdenes terminadas por operarios (HU-4.1)

- Método HTTP: GET
- Ruta: /api/ot/completed
- Roles: Calidad
- Respuesta exitosa: 200 - OK { --JSON con info de las OTs terminadas-- }
- Respuesta de error: 404 Not Found (no existen OTs terminadas)

#### Obtener checklist de OT terminada (HU-4.2A)

- Método HTTP: GET
- Ruta: /api/ot/checklist
- Roles: Calidad
- Respuesta exitosa: 200 - OK { --JSON con info de los 8 puntos del checklist-- }
- Respuesta de error: 404 Not Found (no encuentra checklist)

#### Marcar OT terminada como conforme (HU-4.2B)

- Método HTTP: PATCH
- Ruta: /api/ot/checklist/{otId}/verdict
- Roles: Calidad
- Body: { conforme = true }
- Respuesta exitosa: 200 - OK { --JSON con info de la OT actualizada-- }
- Respuesta de error: 404 Not Found (OT no encontrada o estado inválido)

#### Marcar OT terminada como no conforme (HU-4.2C)

- Método HTTP: PATCH
- Ruta: /api/ot/checklist/{otId}/verdict
- Roles: Calidad
- Body: {resultados en cada check + observaciones en texto}
- Respuesta exitosa: 200 - OK { --JSON con info de la OT actualizada-- }
- Respuesta de error: 404 Not Found (OT no encontrada o estado inválido)

---

#### Alta de fase (HU-5.1)

- Método HTTP: POST
- Ruta: /api/phases
- Roles: Gerente
- Body: {nombre de fase, [tipos de tarea]}
- Respuesta exitosa: 201 - Created { --JSON con info de la fase creada-- }
- Respuesta de error: 400 Bad Request (faltan datos o estado inválido)

#### Alta de operarios (HU-5.2)

- Método HTTP: POST
- Ruta: /api/operators
- Roles: Gerente
- Body: {nombre de operario, tipo de tarea}
- Respuesta exitosa: 201 - Created { --JSON con info del operario creado-- }
- Respuesta de error: 400 Bad Request (faltan datos o estado inválido)

#### Obtener vista global de planta (HU-5.3)

- Método HTTP: GET
- Ruta: /api/plant/overview
- Roles: Gerente
- Respuesta exitosa: 200 - OK { --JSON con la vista global de planta: cantidad de OTs pendientes/activas, fases y cuellos de botella-- }
- Respuesta de error: 404 Not Found (no encuentra endpoint)

#### Obtener vista global de Calidad (HU-5.4)

- Método HTTP: GET
- Ruta: /api/quality/overview
- Roles: Gerente
- Respuesta exitosa: 200 - OK { --JSON con la vista global de Calidad: porcentaje de conformes vs. no conformes, no conformidades por fase, listado de auditorías con resultado y tiempo-- }
- Respuesta de error: 404 Not Found (no encuentra endpoint)

## Despliegue

- **Backend:** *Render* ofrece la capacidad de autodeployear proyectos de Java a partir de GitHub a través de un contenedor Docker, lo que facilita el despliegue en las diferentes etapas planificadas para el desarrollo del proyecto.
- **Frontend:** *Vercel* ofrece una configuración simple y rápida para aplicaciones React desde GitHub.
- **Base de datos:** *Neon* (como fue mencionado en la subsección de desarrollo) es de las mejores opciones en el mercado para el despliegue de bases de datos serverless, con compatibilidad nativa con PostgreSQL y un plan gratuito que cubre las necesidades del proyecto.
