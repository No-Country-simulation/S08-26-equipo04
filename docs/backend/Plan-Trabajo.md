# QualityTrack — Plan de Trabajo Backend

En este plan de trabajo, se detallan las tareas a realizar por el equipo de backend para cumplir con los requerimientos del proyecto QualityTrack. Este está alineado al plan de trabajo elaborado por el equipo de frontend, así como también a la especificación técnica y el esquema de base de datos previamente elaborado.

Tal como se ha definido en conjunto, las tareas serán trabajadas en subramas a partir de develop. El desarrollo de estas tareas será realizado en Java + Spring Boot, con base de datos PostgreSQL y utilizando JWT para la autenticación; y tomará lugar en la carpeta "backend" del repositorio, a menos que se indique lo contrario (por ejemplo, para la configuración del despliegue).

## 1. Matriz de sincronía con Frontend

En primer lugar, y con el fin de que Frontend pase incrementalmente de usar mocks a comenzar a trabajar contra las APIs que serán desarrolladas, se sigue el siguiente plan de dependencias por semana, establecido por el equipo de Frontend en su plan de trabajo.
Esta planificación determina la organización de las tareas por semana que se presenta durante el resto del documento, en el sentido que establece el progreso mínimo necesario para cada una. Este scope inicial se ajusta levemente en la distribución semanal de tareas con el fin de asegurar una carga de tareas equitativa en el equipo, siempre asegurando que se cumplan los requisitos planteados.

| Semana | Frontend necesita de Backend            | Backend entrega                                                       |
|--------|-----------------------------------------|-----------------------------------------------------------------------|
| 1      | Login JWT, Clientes, Solicitudes, Fases | Auth (`/api/auth/login`), Cliente CRUD, Solicitud CRUD, Fase catálogo |
| 2      | Cotizaciones, Aprobación, Generación OT | Cotización CRUD, endpoints `/aprobar` y `/rechazar`                   |
| 3      | OT_FASE, Reasignación, Notas            | OT_FASE CRUD, `/reasignar`, notas por fase                            |
| 4      | Calidad, Checklist, Despacho            | Calidad endpoints, `/conforme`, `/no-conforme`, `/entrega`            |
| 5      | Expediente, Dashboard endpoints         | `/expediente`, `/dashboard/planta`, `/dashboard/calidad`              |

## 2. Listado de tareas por historia de usuario

Esta sección organiza cada tarea, vinculada a la historia de usuario encontrada en el Backlog. Para los casos donde aplica, se menciona entre paréntesis el mismo código HUX.X que se encuentra en el documento de Backlog para mantener la trazabilidad del proceso. Procesos más genéricos del desarrollo se marcan como "General".
Por cada tarea, se listan entidades, endpoints y nombres específicos, manteniendo coherencia con el plan ya elaborado por Frontend. Para evitar la repetición en los nombramientos de clases, se define el uso de nombres acordes a un modelo MVC. Cuando se hace referencia a esto, se está indicando que el nombramiento de los archivos sigue siempre el siguiente modelo, tomando como ejemplo a Cliente:

- Entidad: model/Cliente.java
- Servicio -> service/ClienteService.java
- Repositorio -> repository/ClienteRepository.java
- Controlador -> controller/ClienteController.java
- DTO -> dto/ClienteDTO.java

A su vez, la validación de datos de entrada y salida dentro de Spring Boot se realiza a través de anotaciones de validación. Como son @NotNull, @Size, @Email, entre otras, se aplican sobre los atributos de las clases DTO y se validan automáticamente en el controlador. En caso de que la validación falle, Spring Boot devuelve un error 400 con un mensaje de error detallado.

Otros detalles a tener en cuenta:

- Se plantea que cada una de las tareas mencionadas en este documento sea representada como una issue en GitHub. Por lo tanto, se utilizará el formato detallado en la guía de contribución para su definición.
- Con respecto a la asignación, esta fue realizada teniendo en cuenta principalmente que resulte en una distribución suficientemente equitativa de tareas por semana entre los 4 miembros del equipo, tomando como base la documentación previa elaborada al respecto. Por lo tanto, el manejo de asignaciones puede ser modificado dinámicamente, una vez fueron cargadas y si el equipo lo considera conveniente, a través del proyecto de GitHub.

### SEMANA 1

#### Tarea 1.1. [BE] feat: inicializar proyecto de aplicación Spring Boot (General)

- **Asignado:** Abel
- **Objetivo / Contexto:** Antes de poder realizar cualquiera de todas las tareas que se desarrollan en el documento, es imperativo inicializar el proyecto de Java + Spring Boot a través de Spring Initializr o un proceso análogo, estableciendo las dependencias necesarias para evitar conflictos de versionado o dependencias en el futuro. La definición del entorno de Spring Boot permite la implementación y configuración del esquema de base de datos definido en grupo, así como también proporciona el marco de trabajo estándar en la industria para este tipo de aplicaciones en el entorno, proporcionando la funcionalidad de APIs, seguridad, persistencia de datos, manejo de excepciones, entre otros aspectos.
- **Criterios de aceptación:**
  - [ ] Se inicializa el proyecto Spring Boot con dependencias de Spring Web, Spring Data JPA, Spring Security, Jakarta Bean Validation y JWT listadas en pom.xml, necesarias acorde a las necesidades del proyecto.
  - [ ] Todo el equipo puede acceder y compilar el proyecto inicializado sin inconvenientes.
  - [ ] Se constituye un entorno capaz de definir e interpretar clases Controller (recibir solicitudes HTTP y devolver respuestas), Service (lógica de negocio), Repository (interacción con la base de datos) y DTO (definición de entrada y salida de API), necesarias para cada entidad que conforma a la arquitectura MVC que estructura al proyecto.
  - [ ] Se implementa un manejador global de excepciones mediante @RestControllerAdvice que devuelva respuestas consistentes y estandarizadas para errores de recurso no encontrado (404), datos inválidos (400), conflicto de estado (409), acceso no autorizado/operación no permitida (401/403) y errores internos (500).

#### Tarea 1.2. [DATA] feat: configurar base de datos PostgreSQL en Neon (General)

- **Asignado:** Felipe
- **Objetivo / Contexto:** Dado que se plantea la configuración de una base de datos PostgreSQL para el proyecto y un despliegue relativamente temprano, es necesario establecer la conexión y configuración inicial para que el proyecto pueda interactuar con la base de datos correctamente. Dicha base de datos debe configurarse de manera tal que permita la creación de las tablas y relaciones definidas en el esquema de base de datos ya elaborado, y debe ser accesible desde el proyecto de Spring Boot para la implementación de operaciones de datos que luego serán utilizadas por los endpoints de la API.
- **Criterios de aceptación:**
  - [ ] Se logra una conexión exitosa a la base de datos PostgreSQL de NEON desde el proyecto Spring Boot.
  - [ ] Se crean las tablas necesarias para ambas partes, siguiendo el esquema de base de datos definido en la documentación del proyecto.
  - [ ] Establecer esquemas de base de datos para la rama de staging (develop) y la rama de producción (main).

#### Tarea 1.3. [BE] feat: establecer endpoint de autenticación para usuarios (General)

- **Asignado:** Abel
- **Objetivo / Contexto:** Establecer un endpoint `POST /api/auth/login` que sea utilizado para la autenticación de usuarios mediante JWT. Este endpoint permitirá que los usuarios inicien sesión y obtengan un token de acceso para interactuar con el resto de la API acorde a su rol.
- **Criterios de aceptación:**
  - [ ] Endpoint `POST /api/auth/login` creado en el Servicio de Usuario mediante Spring Security, a base de tokens JWT.
  - [ ] El pedido y respuesta de autenticación deben seguir un formato: ```Request: {"email": "...", "password": "..."} -> Response: {"token": "...", "rol": "...", "nombre": "..."}```, donde el rol debe formar parte de los roles definidos en el esquema de la base de datos.
  - [ ] El token detecta correctamente al usuario en cuestión (token, rol, nombre), de modo que pueda establecerse la autorización de acceso a los endpoints según el rol del usuario.
  - [ ] Dadas las credenciales de un usuario, el endpoint devuelve un token JWT válido.

#### Tarea 1.4. [BE] feat: generar endpoints de clientes (HU-1.1 Levantar pedido)

- **Asignado:** Lisandro
- **Objetivo / Contexto:** Crear un conjunto de endpoints para la gestión de clientes, permitiendo operaciones de creación, lectura, actualización y eliminación (CRUD) en el sistema. Estos endpoints son necesarios para que el Vendedor pueda levantar pedidos, ya que justamente necesita registrar la información del cliente para poder generar una solicitud. Si bien el plan de trabajo de frontend no indica el acceso específico a endpoint de clientes (ya que se interactúa con ellos a través de la creación de solicitudes), se deja abierto ante la posibilidad de un cambio en el diseño. En caso que no sean utilizados, su funcionalidad igual debe ser implementada en el sistema para actuar ante la carga de solicitudes.
- **Criterios de aceptación:**
  - [ ] Modelar la entidad Cliente con sus atributos y relaciones necesarias en "Cliente", acorde a la documentación y siguiendo el modelo de una típica entidad MVC.
  - [ ] Establecer un DTO para la entidad cliente, para permitir transportar los datos con el servidor sin exponer la estructura interna de la base de datos.
  - [ ] Implementar la lógica de negocio para la gestión de clientes en el servicio correspondiente.
  - [ ] Crear endpoint `GET /api/clientes` que permita acceder a la lista de clientes.
  - [ ] Los endpoints deben verificar que el rol del usuario solicitante sea Vendedor, y en caso contrario, devolver un error de autorización.
  - [ ] Asegurar que cada endpoint devuelva una respuesta válida y acorde a lo esperado.

#### Tarea 1.5. [BE] feat: generar endpoints de solicitudes (HU-1.1 Levantar pedido / HU-2.1 Generar endpoints)

- **Asignado:** Felipe
- **Objetivo / Contexto:** Implementar un conjunto de endpoints para la gestión de solicitudes: creación y lectura. La creación de solicitudes surge a partir de la necesidad del Vendedor de registrar la información del cliente, adjuntar documentación y establecer detalles de la pieza o trabajo solicitado. La lectura debe estar habilitada tanto para el Vendedor como para el Jefe de producción, ya que necesita revisar las solicitudes para armar las cotizaciones correspondientes.
- **Criterios de aceptación:**
  - [ ] Modelar la entidad Solicitud con sus atributos y relaciones necesarias en "Cliente", acorde a la documentación y siguiendo el modelo de una típica entidad MVC.
  - [ ] Crear endpoint `POST /api/solicitudes` para crear una nueva solicitud.
  - [ ] El cuerpo del request debe contar con: `{cliente_id, descripcion_pieza, cantidad, fecha_esperada_entrega, notas_comerciales}`.
  - [ ] La respuesta exitosa debe incluir en el cuerpo el siguiente formato: `{"id"=x, "numero_solicitud"=SOL-XXXX, "estado"=PENDIENTE_COTIZACION}`, para que se tenga referencia a la solicitud creada y su estado inicial.
  - [ ] Verificar que el endpoint de creación de solicitudes valide que todos los campos obligatorios estén presentes y sean correctos, devolviendo un error en caso contrario.
  - [ ] Dado que todos los campos obligatorios están presentes, verificar que exista un cliente asociado a dichos datos en la base de datos. De haber coincidencia, asociar la solicitud al cliente existente; de no haber coincidencia, crear un nuevo cliente y asociarlo a la solicitud.
  - [ ] Verificar que solo usuarios del rol Vendedor puedan crear nuevas solicitudes, devolver un error de autorización en caso contrario.
  - [ ] Crear endpoint `GET /api/solicitudes` para obtener la lista de solicitudes pendientes.
  - [ ] Verificar que el endpoint de obtención de solicitudes solo sea accesible por usuarios con rol Vendedor y Jefe de producción, devolviendo un error de autorización en caso contrario. (Nota: plan de frontend no menciona acceso a rol Vendedor, pero puede ser útil para que controle cuáles solicitudes siguen a la espera de cotizar)

#### Tarea 1.6. [BE] feat: generar endpoints para la carga y visualización de documentos adjuntos (HU-1.1 Levantar pedido (Solicitud) / HU-2.1 Recepción de cotización / HU-3.2 Adjuntos)

- **Asignado:** Lisandro
- **Objetivo / Contexto:** Durante el desarrollo del trabajo, se adjuntan documentos a las solicitudes. Estos documentos pueden ser planos, certificados, especificaciones u otros tipos de archivos. Por lo tanto, se deberá gestionar una serie de endpoints que permitan la carga y acceso a dichos documentos, asegurando que sean correctamente almacenados y asociados a la solicitud que corresponda.
- **Criterios de aceptación:**
  - [ ] Modelar la entidad Adjunto con sus atributos y relaciones necesarias en "Adjunto", acorde a la documentación y siguiendo el modelo de una típica entidad MVC.
  - [ ] Crear endpoint `POST /api/documentos` para subir un documento adjunto a una solicitud.
  - [ ] El endpoint debe recibir el archivo y la solicitud a la que se asocia en el controlador.
  - [ ] Solamente los usuarios de tipo Vendedor deben tener acceso a este endpoint, devolviendo un error de autorización en caso contrario.
  - [ ] Validar que los archivos recibidos sean de un tipo permitido (PLANO, CERTIFICADO, ESPECIFICACION, OTRO), devolviendo un error en caso contrario.
  - [ ] Validar que el id en subido_por_id sea efectivamente de un vendedor.
  - [ ] En el servicio, se debe gestionar el almacenamiento del archivo en un sistema de almacenamiento. Para desarrollo, se puede establecer una ruta de almacenamiento local; y para el despliegue, se debe obtener la ruta en la nube donde se almacene cada uno de ellos.
  - [ ] Una vez que el archivo fue almacenado, el servicio debe también gestionar el registro de la información del documento en la base de datos, incluyendo el enlace/ruta hacia el archivo.
  - [ ] Crear endpoint `GET /api/solicitudes/{id}/documentos` para obtener los adjuntos de una solicitud en específico.
  - [ ] Este endpoint debe estar a disposición del Vendedor, el Jefe de producción y los Operarios.

#### Tarea 1.7. [BE] feat: generar endpoints del catálogo de fases (HU-5.1 Configuración global de fases / HU-2.1 Recepción de cotización)

- **Asignado:** Luis
- **Objetivo / Contexto:** Implementar un conjunto de endpoints para la gestión del catálogo de fases, permitiendo operaciones de lectura y actualización en el sistema. La lectura del catálogo de fases es necesaria para que el Jefe de producción luego pueda armar las cotizaciones correspondientes a las solicitudes recibidas, mientras que las operaciones ABM de las fases quedan a cargo del Gerente, quien puede crear, modificar y eliminar nuevas fases, así como también asignar qué operarios pueden ejecutarlas.
- **Criterios de aceptación:**
  - [ ] Crear endpoint `POST /api/fases` para crear una nueva fase.
  - [ ] Verificar que el endpoint de creación de fases valide que todos los campos obligatorios estén presentes y sean correctos, devolviendo un error en caso contrario.
  - [ ] Verificar que solo usuarios del rol Gerente puedan crear nuevas fases, devolviendo un error de autorización en caso contrario.
  - [ ] Verificar que los usuarios habilitados sean existentes en la base de datos y que tengan rol Operario, devolviendo un error en caso contrario.
  - [ ] Crear endpoint `GET /api/fases` para obtener la lista de fases.
  - [ ] Verificar que la lista de fases solo sea accesible por usuarios con rol Gerente y Jefe de producción, devolviendo un error de autorización en caso contrario.
  - [ ] Crear endpoint `PUT /api/fases/{id}` para actualizar los campos de una fase existente.
  - [ ] Verificar que solo usuarios del rol Gerente puedan modificar las fases, devolviendo un error de autorización en caso contrario.
  - [ ] Verificar que los usuarios con rol Gerente pueden borrar fases (recordemos que es un borrado lógico mediante activo=false, por lo que el endpoint PUT debería permitirlo).
  - [ ] Crear endpoint `POST /api/fases/{id}/habilitar` para habilitar a un operario sobre una fase específica.
  - [ ] El payload/cuerpo de la petición debe contener el id del usuario a habilitar, y el estado de habilitación (de este modo, se puede también deshabilitar usuarios, una funcionalidad adicional deseable).
  - [ ] Verificar que solo los usuarios de rol Gerente pueden (des)habilitar operarios sobre fases, devolviendo un error de autorización en caso contrario.
  - [ ] Recordar que la implementación de la deshabilitación debe ser lógica, actualizando el campo booleano "habilitado" a false. No se debe borrar al operario de la base de datos ni de la relación con la fase, ya que esto podría afectar a OTs ya asignadas.

#### Tarea 1.8. [BE] feat: generar endpoints de acceso al listado de operarios (HU-5.1 Configuración global de fases)

- **Asignado:** Luis
- **Objetivo / Contexto:** El gerente debe tener acceso a la lista de operarios para poder asignarlos a las fases. El alta de usuarios se estableció como un proceso manual, por lo que no se requieren endpoints de creación, modificación o borrado.
- **Criterios de aceptación:**
  - [ ] Crear `GET /api/usuarios` para obtener la lista de operarios que el gerente puede asignar. (Nota: se utiliza el endpoint mencionado para utilizar el mismo nombre que frontend, pero se deberían mostrar solamente los operarios.)
  - [ ] Verificar que la lista de operarios solo sea accesible por usuarios con rol Gerente, devolviendo un error de autorización en caso contrario.

### SEMANA 2

#### Tarea 2.1. [BE] feat: generar endpoints para la alta de cotizaciones (HU-2.1 Generar endpoints)

- **Asignado:** Luis
- **Objetivo / Contexto:** Permitir al Jefe de Producción armar una cotización definiendo fases, tiempos y un precio único.
- **Criterios de aceptación:**
  - [ ] Endpoint `POST /api/cotizaciones` incorporado para la creación de cotizaciones.
  - [ ] Verificar que el endpoint de creación solo sea accesible para usuarios con rol Jefe de producción, devolviendo un error de autorización en caso contrario.
  - [ ] Debe recibir la información de las fases, tiempos y precio final establecidos. Exigir que exista el precio_final para su creación.
  - [ ] Verificar que se permita elegir una misma fase más de una vez en la secuencia.
  - [ ] Verificar que la información persista en cotizaciones y cotizacion_fases.

#### Tarea 2.2. [BE] feat: generar automáticamente OT al aprobar cotización (HU-1.3 Cotizaciones derivadas)

- **Asignado:** Felipe
- **Objetivo / Contexto:** Al aprobar una cotización, el sistema debe generar automáticamente la OT correspondiente y asignarla al operario que le corresponda la primera fase.
- **Criterios de aceptación:**
  - [ ] Generar la lógica tal que, al recibir una cotización con estado="APROBADA", se genere automáticamente una fila en la tabla de OTs.
  - [ ] Copiar la secuencia de la tabla cotizacion_fases a la tabla ot_fases, manteniendo el orden de las fases.
  - [ ] Calcular y guardar la fecha de vencimiento de la primera fase, sumando el valor de tiempo_estimado al momento en que había ingresado a la cola.
  - [ ] La primera fase de la OT generada debe ser asignada al operario que le corresponda, con estado="EN_COLA".
  - [ ] La no aprobación no debe disparar ninguna acción automática adicional; se supone que llega una nueva solicitud para recotizar.

#### Tarea 2.3. [BE] feat: generar endpoints de consulta para las cotizaciones (HU-1.3 Cotizaciones derivadas / HU-2.1 Generar endpoints / HU-3.3 Vencimiento)

- **Asignado:** Abel
- **Objetivo / Contexto:** Implementar endpoints para que el vendedor pueda consultar las cotizaciones que arme el jefe de producción. Estos incluyen su lectura y actualización (aprobar o no aprobar). (¡Cuestión para resolver! En frontend se habían definido endpoints de aprobar y rechazar cotizaciones, pero también se definió un endpoint `PUT /api/cotizaciones/{id}` para "tomar la respuesta del cliente". Creería que este endpoint queda redundante al definir ambas respuestas disponibles, pero queda documentado en esta descripción para definir exactamente si amerita inclusión.)
- **Criterios de aceptación:**
  - [ ] Incorporación de endpoint `GET /api/cotizaciones` para la lectura de cotizaciones.
  - [ ] Debe permitir observar las fases, tiempos y precio final.
  - [ ] El endpoint de lectura es accesible por el Vendedor y por el Jefe de producción.

#### Tarea 2.4. [BE] feat: generar endpoints de respuesta a las cotizaciones (HU-1.3 Cotizaciones derivadas / HU-2.1 Generar endpoints / HU-3.3 Vencimiento)

- **Asignado:** Lisandro
- **Objetivo / Contexto:** Implementar endpoints para que el Vendedor pueda aprobar o rechazar las cotizaciones que lleguen. (¡Cuestión para resolver! En frontend se habían definido endpoints de aprobar y rechazar cotizaciones, pero también se definió un endpoint `PUT /api/cotizaciones/{id}` para "tomar la respuesta del cliente". Creería que este endpoint queda redundante al definir ambas respuestas disponibles, pero queda documentado en esta descripción para definir exactamente si amerita inclusión.)
- **Criterios de aceptación:**
  - [ ] Incorporación de endpoint de actualización `POST /api/cotizaciones/{id}/aprobar` para marcar la respuesta del cliente como aprobada (estado=APROBADA).
  - [ ] Incorporación de endpoint de actualización `POST /api/cotizaciones/{id}/rechazar` para marcar la respuesta del cliente como rechazada (estado=RECHAZADA).
  - [ ] Los endpoints de actualización de la respuesta del cliente son solo accesibles por el Vendedor.
  - [ ] Validar que el rechazo no genere una OT ni una devolución al jefe; si se recotiza, es una solicitud nueva.

### SEMANA 3

#### Tarea 3.1. [BE] feat: generar endpoints para las tareas del operario (HU-3.1 Tareas en ejecución y pendientes)

- **Asignado:** Luis
- **Objetivo / Contexto:** Permitir que cada operario vea las fases que tiene asignadas (y solamente esas fases)
- **Criterios de aprobación:**
  - [ ] Generar endpoint `GET /api/ot-fases` para obtener la lista de fases de las OTs, accesible por los usuarios con rol Operario.
  - [ ] Verificar que el endpoint de obtención de fases solo sea accesible por usuarios con rol Operario, devolviendo un error de autorización en caso contrario (Nota: Jefe de producción tiene acceso, pero su implementación se deja en una tarea aparte).
  - [ ] Filtrar los resultados devolviendo las filas de ot_fases donde el id de operario coincide con el token JWT del usuario actual.

#### Tarea 3.2. [BE] feat: incorporar endpoints de inicio y finalización de fase para los operarios (HU-3.1, HU-3.3, HU-5.4)
  
- **Asignado:** Felipe
- **Objetivo / Contexto:** Los operarios deben tener la capacidad de iniciar y finalizar las fases que les fueron asignadas. Para ello, se deben generar los endpoints `POST /api/ot-fases/{id}/iniciar` y `POST /api/ot-fases/{id}/finalizar`, que permitan al operario marcar el inicio y la finalización de la fase correspondiente.
- **Criterios de aceptación:**
  - [ ] Implementar endpoint `POST /api/ot-fases/{id}/iniciar` para el inicio de una fase por parte del operario asignado.
  - [ ] Verificar que solamente el usuario asignado a la fase pueda iniciar la misma, devolviendo un error de autorización en caso contrario.
  - [ ] Implementar endpoint `POST /api/ot-fases/{id}/finalizar` para la finalización de una fase por parte del operario asignado.
  - [ ] Verificar que solamente el usuario asignado a la fase pueda finalizar la misma, devolviendo un error de autorización en caso contrario.
  - [ ] Al finalizar una fase, verificar si existe una fase siguiente.
  - [ ] Si existe una fase siguiente, se debe pasar con estado "EN_COLA" y calcular su fecha de vencimiento, sumando el tiempo estimado al momento actual.
  - [ ] Si no existe una fase siguiente, cambiar el estado de la OT a EN_CALIDAD, y registrar la fecha en el campo fecha_pase_calidad.

#### Tarea 3.3. [BE] feat: generar endpoints para la reasignación y la vista de planta (HU-2.2 Gestión de planta)

- **Asignado:** Lisandro
- **Objetivo / Contexto:** El jefe de producción debe tener la capacidad de observar el detalle de las fase de OT que están siendo trabajadas, así como también contar con la capacidad de reasignarlas si así lo quisiera. Para cubrir estas necesidades, hay que generar endpoints para el jefe de producción: `GET /api/ot-fases` para acceder a las fases que hay asignadas por operario; y `POST /api/ot-fases/{id}/reasignar` para reasignar una fase a otro operario.
- **Criterios de aceptación:**
  - [ ] Generar endpoint `GET /api/ot-fases` para obtener la lista de fases de las OTs.
  - [ ] Verificar que este endpoint de obtención de fases solo sea accesible por usuarios con rol Jefe de producción (no confundir con configuración para los Operarios).
  - [ ] Verificar que un usuario con rol Jefe de Producción tenga acceso a todas las fases activas de todas las OT.
  - [ ] El jefe de producción debería recibir las fases ordenadas por operario.
  - [ ] Generar endpoint `POST /api/ot-fases/{id}/reasignar` para reasignar una fase a otro operario.
  - [ ] Verificar que el endpoint de reasignación solo sea accesible a usuarios con rol Jefe de producción, devolviendo un error de autorización en caso contrario.
  - [ ] El cuerpo de la solicitud de reasignación debe contener el id del operario al que se desea asignar la fase.
  - [ ] Se debe verificar que el nuevo usuario asignado sea efectivamente de rol Operario, y que esté habilitado a desarrollar la tarea. En caso contrario, se debe devolver un error de validación.
  - [ ] Tener en cuenta que no se borra la fase original, a modo de dejar registro. Esto se hace actualizando el operario_id e insertando un registro en la tabla ot_fase_reasignaciones.

#### Tarea 3.4. [BE] feat: generar endpoints de notas discriminadas (CRUD, HU-2.2 Gestión de planta / HU-2.3 No conformidades / HU-3.4 Notas discriminadas por origen)

- **Asignado:** Abel
- **Objetivo / Contexto:** El jefe de producción debe tener la capacidad de crear, leer, actualizar y eliminar notas relacionadas con las fases de las OTs.
- **Criterios de aceptación:**
  - [ ] Generar endpoint `GET /api/ot-fases/{id}/notas` para consultar las notas en una fase de OT determinada.
  - [ ] El endpoint de consulta de notas debe ser accesible por el Jefe de producción y por el Operario asignado a la fase, devolviendo un error de autorización en caso contrario.
  - [ ] Generar endpoint `POST /api/ot-fases/{id}/notas` para crear una nueva nota en una fase de OT determinada.
  - [ ] El endpoint de creación de notas debe asignar el origen automáticamente utilizando el rol del token JWT. Si no proviene de un rol válido (CALIDAD o JEFE_PRODUCCIÓN), no se permite su uso.

### SEMANA 4

#### Tarea 4.1. [BE] feat: generar endpoints para observar las OTs pendientes de auditoría (HU-4.1 Órdenes terminadas / HU-4.2 Auditoría (checklist))

- **Asignado:** Felipe
- **Objetivo / Contexto:** Implementar un endpoint `GET /api/calidad` que permita al Vendedor acceder a las OTs pendientes de auditoría.
- **Criterios de aceptación:**
  - [ ] Generar endpoint `GET /api/calidad` para obtener la lista de OTs pendientes de auditoría.
  - [ ] Este listado puede obtenerse filtrando las OTs por aquellas donde estado=EN_CALIDAD
  - [ ] Verificar que el endpoint de obtención de OTs pendientes de auditoría solo sea accesible por usuarios con rol Calidad, devolviendo un error de autorización en caso contrario.
  - [ ] Implementar `POST /api/calidad/{id}/checklist` para guardar las respuestas parciales de la checklist. Para cada una se guarda "CUMPLE", "NO_CUMPLE" o "NO_APLICA", mientras que un valor null actúa como un estado "Pendiente". (para mí podríamos mandar todas las respuestas a la vez, pero bueno)

#### Tarea 4.2. [BE] feat: generar endpoints de conformidad para calidad (HU-4.3 Veredicto)

- **Asignado:** Lisandro
- **Objetivo / Contexto:** Desde calidad, las OT completadas deben poder designarse como "conformes" o "no conformes" en función al resultado de su análisis a partir de un checklist de 8 puntos. Para ello, se deben generar los endpoints `POST /api/calidad/{id}/conforme` y `POST /api/calidad/{id}/no-conforme`, que permitan al auditor marcar la OT como conforme o no conforme, respectivamente.
- **Criterios de aceptación:**
  - [ ] Generar endpoint `POST /api/calidad/{id}/conforme` para marcar una OT como conforme según su identificador.
  - [ ] Verificar que el endpoint de marcar como conforme solo se permita sobre OTs que hayan sido terminadas.
  - [ ] Generar endpoint `POST /api/calidad/{id}/no-conforme` para marcar una OT como no conforme según su identificador.
  - [ ] Ambos endpoints solamente pueden ser accedidos por un usuario con rol de Calidad.
  - [ ] El formato del cuerpo enviado al marcar una OT como conforme u no conforme desde calidad es el siguiente: `{ "respuestas": [ { "item_numero": x, "resultado_item": "CUMPLE" | "NO_CUMPLE" | "NO_APLICA", "observaciones": ... | null }, ... ], "resultado": "CONFORME" | "NO_CONFORME", "observaciones_generales": ... }`
  - [ ] Validar el fomrato del cuerpo en el DTO del controlador par asegurar que se captura correctamente.
  - [ ] El formato del cuerpo debe contar con las 7 respuestas establecidas por el equipo, junto con la cabecera que enuncia el resultado final.

#### Tarea 4.3. [BE] feat: generar endpoint de fases de retrabajo (HU-2.3)

- **Asignado:** Luis
- **Objetivo / Contexto:** El Jefe de Producción selecciona las fases a rehacer por una no conformidad.
- **Criterios de aceptación:**
  - [ ] Crear un endpoint `POST /api/ot-fases` para enviar a rehacer fases.
  - [ ] Por cada fase seleccionada, insertar un nuevo registro en `ot_fases`.
  - [ ] Garantizar que los nuevos registros tengan `es_rehacer=TRUE` y se incremente su `ciclo_iteracion`.
  - [ ] Mantener las fases no seleccionadas en estado `TERMINADO`.

#### Tarea 4.4. Establecer OT como entregada (HU-1.4 Despacho / Entrega)

- **Asignado:** Abel
- **Objetivo / Contexto:** Implementar sobre OT un endpoint `POST /api/ordenes-trabajo/{id}/entrega` que permita al Vendedor marcar una OT como entregada, indicando a quién se la entregó, para dejar registro del cierre del trabajo.
- **Criterios de aceptación:**
  - [ ] Crear endpoint `POST /api/ordenes-trabajo/{id}/entrega` para entregar una orden de trabajo según su identificador.
  - [ ] El endpoint debe verificar que la OT esté en estado Despacho. Si no está en ese estado, el sistema no debe permitir realizar la acción.
  - [ ] El endpoint debe ser accedido por un usuario con rol Vendedor, en caso contrario devuelve error de autorización.
  - [ ] El cuerpo de la solicitud y la respuesta deben contener el siguiente formato: `{"receptor_nombre": X} -> { "id", "estado": "ENTREGADA", "fecha_entrega": ...,  "receptor_nombre": X}`, siendo la fecha en formato de fecha ISO 8601.

### SEMANA 5

#### Tarea 5.1. [BE] generar endpoints de expediente (HU-1.2 Buscar órdenes (expediente completo) )

- **Asignado:** Lisandro
- **Objetivo / Contexto:** Implementar un endpoint `GET /api/ordenes-trabajo/{id}/expediente` que devuelva datos acerca de la solicitud, cotización, historial de operaciones por fase, resultado de Calidad y estado de entrega. En otras palabras, lo generado actúa como un reporte completo de la trazabilidad de una orden de trabajo.
- **Criterios de aceptación:**
  - [ ] El endpoint `GET /api/ordenes-trabajo/{id}/expediente` debe aceptar como parámetro el número de OT.
  - [ ] El endpoint debe ser accesible por usuarios con rol Vendedor, Jefe de Producción, Gerente y Calidad, omitiendo así las consultas de parte de operarios.
  - [ ] El sistema debe devolver un objeto JSON con la información completa de la OT.
  - [ ] Dicha información completa debe incluir datos de reasignación (quién la tuvo, cuándo, en qué intento), no solo el estado final.
  - [ ] Las secciones futuras de la OT deben indicarse de manera tal que sean fácilmente reconocibles como vacías/pendientes, nunca con datos inventados.

#### Tarea 5.2. [BE] generar endpoint para dashboard de planta (HU-5.3 Vista global de planta)

- **Asignado:** Abel
- **Objetivo / Contexto:** Implementar un endpoint `GET /api/dashboard/planta` que provea métricas de producción para el gerente, incluyendo OTs pendientes/activas, fases existentes y cuellos de botella.
- **Criterios de aceptación:**
  [ ] Generar endpoint `GET /api/dashboard/planta` que devuelva cuántas OTs hay pendientes/activas, qué fases existen, y dónde se acumulan (cuellos de botella), para detectar problemas de producción.
  [ ] No mostrar métricas de desempeño de operarios individuales; deben ser métricas de la planta en general.
  [ ] Verificar que solo un usuario con rol Gerente pueda acceder a este endpoint, devolviendo un error de autorización en caso contrario.

#### Tarea 5.3. [BE] generar endpoint para el dashboard de Calidad (HU-5.4 Vista global de Calidad)

- **Asignado:** Felipe
- **Objetivo / Contexto:** Implementar un endpoint `GET /api/dashboard/calidad` que muestre indicadores generales sobre la calidad, centrados en el nivel de conformidad de las OT de la planta, sin tener que revisar OT por OT. Este endpoint será accesible para el Gerente, de manera de mejorar su toma de decisiones al respecto.
- **Criterios de aceptación:**
  - Generar endpoint `GET /api/dashboard/calidad`.
  - El endpoint debe devolver un indicador del porcentaje de OTs conformes con respecto a no conformes.
  - El endpoint debe devolver cuántos retrabajos se hicieron por fase. Si hay más de un retrabajo en una misma fase, todos cuentan. (Nota: no confundir retrabajos realizados con no conformidades detectadas en Calidad).
  - El endpoint debe devolver un listado de las auditorías recientes, con el resultado y el tiempo promedio que pasaron las OT en calidad.
  - El tiempo promedio mencionado debe medirse desde que el operario de la última fase marca "terminar" hasta que se tiene el veredicto de Calidad.
