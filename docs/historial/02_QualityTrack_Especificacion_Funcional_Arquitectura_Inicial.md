# ****DOCUMENTO DE ESPECIFICACIÓN FUNCIONAL Y ARQUITECTURA DE PRODUCTO****

****Proyecto:**** QualityTrack — Sistema de Trazabilidad Industrial y Expediente Digital  

****Versión:**** 1.0 (MVP) — ****Ciclo de Desarrollo:**** 5 Semanas  

****Fecha:**** 1 de septiembre de 2026

## ****1\. Storytelling de Producto & Contexto de Negocio****

### ****El Problema de Negocio (El Dolor)****

En las PyMEs de mecanizado y transformación industrial por subcontratación (**Make to Order**), la información de un trabajo nace y viaja dispersa. Cuando un cliente emite un pedido, la Orden de Compra queda en un correo del área comercial, el plano impreso viaja en una carpeta física por el taller junto con la pieza, los certificados de colada del acero se guardan en un bibliorato de administración y los controles de calidad se anotan en hojas sueltas.  

Ante una llamada de reclamo, una pieza defectuosa o una ****auditoría ISO 9001****, la empresa pierde horas reconstruyendo el historial de fabricación. Esta falta de trazabilidad centralizada genera errores en planta, pérdida de documentación crítica e incapacidad de demostrar el cumplimiento de normativas de calidad.

### ****La Solución: QualityTrack****

****QualityTrack**** transforma la carpeta física itinerante en un ****Expediente Digital Único de la Orden de Trabajo (OT)****.  

Desde que entra el requerimiento hasta la entrega final, toda la documentación técnica, las operaciones realizadas en planta, los sellos de tiempo y las inspecciones de calidad quedan vinculados a un único código de OT. Con una sola búsqueda en pantalla, cualquier usuario puede auditar el 100% de la historia de la pieza en 5 segundos.

## ****2\. Definición del Mercado Objetivo & Alcance del MVP****

> * ****Sector Objetivo:**** Industria metalmecánica y de transformación de precisión bajo plano.  

> * ****Cliente / Buyer Persona:**** Gerente de Planta, Jefe de Calidad y Responsable de Operaciones en PyMEs Industriales (15 a 50 empleados).  

> * ****Enfoque Arquitectónico:**** ****Trazabilidad Agnóstica de OT****. El software no procesa catálogos específicos de productos ni fórmulas complejas de inventario; gestiona el **camino crítico** y el expediente documental de cualquier pieza industrial bajo plano.

### ****Criterio de Éxito del Proyecto****

**El proyecto es exitoso si un usuario puede tomar un código de Orden de Trabajo (ej. OT-2026-0001) y, desde una única pantalla (Vista 360°), reconstruir el historial completo de operaciones con sus responsables, sellos de tiempo y visualizar/descargar toda la documentación técnica asociada.**

## ****3\. Modelo de Roles y Permisos (RBAC)****

El sistema maneja dos perfiles de acceso mediante JWT:

> * ****ADMIN\\_CALIDAD:**** Alta de Clientes y OTs, Carga de Documentos Técnicos, Definición de Hoja de Ruta, Aprobación de Calidad / Cierre, Vista 360° y Auditoría.  

> * ****OPERARIO\\_PLANTA:**** Consulta de OTs en Planta, Visualización de Planos PDF, Marca "Inicio/Fin" de Operación.

## ****4\. Análisis Funcional y Requerimientos****

### ****Requerimientos Funcionales (RF)****

#### ****Épica 1: Seguridad y Autenticación****

> * ****RF-1.1:**** Inicio de sesión mediante credenciales (email y contraseña) con generación de token JWT.  

> * ****RF-1.2:**** Control de acceso en endpoints backend y rutas frontend según rol (ADMIN\\_CALIDAD o OPERARIO\\_PLANTA).

#### ****Épica 2: Gestión de Clientes y Orden de Trabajo (OT)****

> * ****RF-2.1:**** Gestión de Clientes Industriales (Alta de Razón Social, CUIT, Email, Teléfono).  

> * ****RF-2.2:**** Alta de Orden de Trabajo vinculada a un cliente, especificando: Descripción de la pieza, Cantidad de unidades y Fecha comprometida de entrega.  

> * ****RF-2.3:**** Generación automática de código unívoco correlativo (OT-YYYY-XXXX).  

> * ****RF-2.4:**** Control de estados globales de la OT: Borrador ➔ En Proceso ➔ En Control de Calidad ➔ Finalizada / Detenida.

#### ****Épica 3: Expediente Digital y Documentación Técnica****

> * ****RF-3.1:**** Carga de archivos adjuntos vinculados a la OT categorizados en:  

  * Plano Técnico (.pdf, .png, .jpg).  

  * Orden de Compra del Cliente (.pdf).  

  * Certificado de Materia Prima / Colada (.pdf).  

  * Reporte de Control de Calidad (.pdf, .png).  

> * ****RF-3.2:**** Descarga y visualización directa de documentos desde la plataforma.

#### ****Épica 4: Hoja de Ruta y Trazabilidad Operativa****

> * ****RF-4.1:**** Configuración de la Hoja de Ruta (secuencia de pasos de mecanizado) para la OT.  

> * ****RF-4.2:**** Registro de ejecución en planta: botones directos "Iniciar Operación" y "Completar Operación".  

> * ****RF-4.3:**** Captura automática en segundo plano de: operario\\_id, fecha\\_hora\\_inicio y fecha\\_hora\\_fin.  

> * ****RF-4.4:**** Cálculo automático de la duración operativa por paso y del acumulado total de la OT.  

> * ****RF-4.5:**** Módulo de inspección final de Calidad: registro de estado Aprobado o No Conforme con observaciones.

#### ****Épica 5: Buscador Centralizado y Expediente Digital 360° (Core MVP)****

> * ****RF-5.1:**** Buscador por código de OT, Razón Social del cliente o nombre de la pieza.  

> * ****RF-5.2:**** Panel Dashboard 360° que renderiza en una sola vista:  

  1. Datos consolidados de cabecera.  

  2. Repositorio de documentos adjuntos con botones de descarga.  

  3. Timeline cromático con el historial de operaciones, responsables y tiempos transcurridos.

## ****5\. Backlog de User Stories y Criterios de Aceptación (Gherkin)****

### ****US-1.1: Autenticación de Usuarios****

> * ****Como:**** Usuario del sistema.  

> * ****Quiero:**** Iniciar sesión con email y contraseña.  

> * ****Para:**** Acceder a las funciones según mi perfil de trabajo.  

> * ****Criterios de Aceptación:****  

  * ****Dado**** que el usuario ingresa sus credenciales válidas, ****cuando**** hace clic en "Iniciar Sesión", ****entonces**** el sistema responde con HTTP 200, entrega un JWT y lo redirige a su panel principal.  

  * ****Dado**** que se ingresan datos erróneos, ****cuando**** envía el formulario, ****entonces**** el sistema muestra el mensaje "Credenciales inválidas" sin revelar la causa exacta.

### ****US-2.2: Alta de Orden de Trabajo****

> * ****Como:**** Usuario con rol ADMIN\\_CALIDAD.  

> * ****Quiero:**** Dar de alta una nueva OT seleccionando un cliente e ingresando la especificación del pedido.  

> * ****Para:**** Dar inicio al ciclo de fabricación.  

> * ****Criterios de Aceptación:****  

  * ****Dado**** que el usuario completa cliente, descripción de pieza, cantidad y fecha, ****cuando**** confirma la creación, ****entonces**** el sistema genera un ID tipo OT-2026-0001 y asigna el estado Borrador.

### ****US-3.1: Carga de Documentación al Expediente****

> * ****Como:**** Usuario con rol ADMIN\\_CALIDAD.  

> * ****Quiero:**** Adjuntar archivos de hasta 10 MB categorizados por tipo a la OT.  

> * ****Para:**** Centralizar la documentación en el expediente.  

> * ****Criterios de Aceptación:****  

  * ****Dado**** una OT seleccionada, ****cuando**** el usuario sube un archivo .pdf o .png y selecciona "Plano Técnico", ****entonces**** el documento queda guardado y visible en el expediente.  

  * ****Dado**** un archivo .exe o mayor a 10 MB, ****cuando**** el usuario intenta subirlo, ****entonces**** la interfaz bloquea la carga con un mensaje de validación.

### ****US-4.2: Registro de Avance en Planta****

> * ****Como:**** Operario de Planta o Administración.  

> * ****Quiero:**** Hacer clic en "Iniciar" y "Completar" en cada paso de la Hoja de Ruta.  

> * ****Para:**** Dejar constancia de la ejecución sin cargar datos manualmente.  

> * ****Criterios de Aceptación:****  

  * ****Dado**** una operación en estado Pendiente, ****cuando**** se presiona "Iniciar Operación", ****entonces**** el estado cambia a En Curso y el backend guarda el timestamp exacto del servidor.  

  * ****Dado**** una operación En Curso, ****cuando**** se presiona "Completar Operación", ****entonces**** el estado pasa a Finalizada y habilita secuencialmente la siguiente operación.

### ****US-5.2: Consulta del Expediente Digital 360° (Vista Auditoría)****

> * ****Como:**** Auditor / Gerente de Planta.  

> * ****Quiero:**** Visualizar la pantalla de Expediente 360° al ingresar un código de OT.  

> * ****Para:**** Reconstruir la historia completa de fabricación en una sola vista.  

> * ****Criterios de Aceptación:****  

  * ****Dado**** un código de OT válido ingresado en el buscador, ****cuando**** el sistema carga la vista, ****entonces**** despliega en pantalla única: los datos de cliente, el visor/descarga de todos sus documentos adjuntos y el timeline con operarios y tiempos consumidos.

## ****6\. Flujo del Sistema End-to-End (E2E)****

> 1. ****\[ADMIN\\]**** Inicia sesión con rol ADMIN\\_CALIDAD.  

> 2. ****\[CLIENTE\\]**** Crea el cliente industrial: "Mecanizados Metalúrgicos S.A.".  

> 3. ****\[OT\\]**** Genera la orden "OT-2026-0001" (Pieza: "Eje Motriz Principal" \- Cantidad: 10).  

> 4. ****\[EXPEDIENTE\\]**** Adjunta los documentos de prueba:  

   * Plano\\_Eje\\_Motriz.pdf (Categoría: Plano Técnico)  

   * OC\\_Cliente\\_902.pdf (Categoría: Orden de Compra)  

   * Certificado\\_Acero\\_AISI4140.pdf (Categoría: Certificado de Material)  

> 5. ****\[HOJA DE RUTA\\]**** Configura la secuencia de planta:  

   1. Corte de Material  

   2. Torneado CNC  

   3. Control de Calidad  

> 6. ****\[PLANTA\\]**** Cambia de rol o usa el panel de planta:  

   * Inicia y Completa "Corte de Material" (Registra tiempo y operario).  

   * Inicia y Completa "Torneado CNC" (Registra tiempo y operario).  

> 7. ****\[CALIDAD\\]**** Aprueba la etapa "Control de Calidad" y cierra la OT.  

> 8. ****\[AUDITORÍA 360°\\]**** Ingresa a la barra de búsqueda "OT-2026-0001" y demuestra la reconstrucción total del expediente.

## ****7\. Arquitectura de Datos Unificada (Core Schema)****

\| Entidad | Clave Primaria (PK) | Atributos Principales | Relaciones   |

\| :---- | :---- | :---- | :---- |

\| ****CLIENTE**** | id\\_cliente | razon\\_social, cuit, email, telefono | 1\:N con ORDEN\\_TRABAJO |

\| ****ORDEN\\_TRABAJO**** | id\\_ot | codigo\\_ot (UQ), descripcion\\_pieza, cantidad, fecha\\_entrega, estado\\_global | FK id\\_cliente, 1\:N con DOCUMENTO\\_EXP, 1\:N con HOJA\\_RUTA\\_OPERACION |

\| ****DOCUMENTO\\_EXP**** | id\\_documento | tipo\\_documento, url\\_archivo, fecha\\_carga | FK id\\_ot |

\| ****HOJA\\_RUTA\\_OPERACION**** | id\\_operacion | nombre\\_paso, orden\\_secuencia, estado\\_paso, fecha\\_hora\\_inicio, fecha\\_hora\\_fin, operario\\_nombre | FK id\\_ot |

## ****8\. Estrategia de Calidad y Matriz de Casos de Prueba (QA)****

\| ID Caso | Módulo | Título de la Prueba | Pasos de Ejecución | Resultado Esperado | Prioridad   |

\| :---- | :---- | :---- | :---- | :---- | :---- |

\| ****CP-01**** | Seguridad | Bloqueo de rutas protegidas | Intentar consumir la API de creación de OT sin token JWT. | Respuesta HTTP 401 Unauthorized. | ****Bloqueante**** |

\| ****CP-02**** | OT | Generación de Código Único | Crear dos OTs consecutivas para el mismo cliente. | Códigos autogenerados correlativos e irrepetibles (OT-001, OT-002). | ****Alta**** |

\| ****CP-03**** | Adjuntos | Subida de archivos válidos | Adjuntar un PDF de 2 MB como "Certificado de Colada". | Archivo persistido con enlace de descarga funcional en la vista OT. | ****Bloqueante**** |

\| ****CP-04**** | Adjuntos | Validación de extensión | Intentar adjuntar un archivo .exe o .zip. | El sistema rechaza la subida con alerta en pantalla. | ****Media**** |

\| ****CP-05**** | Planta | Marcas de tiempo en Hoja de Ruta | Presionar "Iniciar" y luego "Completar" en una operación. | Cálculo del tiempo transcurrido correcto y estado actualizado a Finalizado. | ****Bloqueante**** |

\| ****CP-06**** | Auditoría | Consulta Expediente 360° | Buscar la OT creada en la pantalla de trazabilidad. | Muestra datos de cliente, documentos para descargar e historial de tiempo sin fallos. | ****Bloqueante**** |

## ****9\. Cronograma de Ejecución (Plan de 5 Semanas)****

> * ****SEMANA 1:**** Arquitectura, Auth JWT, Modelo DB y CRUD Cliente/OT.  

> * ****SEMANA 2:**** Módulo de Carga/Descarga de Archivos y Frontend UI Base.  

> * ****SEMANA 3:**** Lógica de Hoja de Ruta, Timestamps de Planta y Paneles Operarios.  

> * ****SEMANA 4:**** Desarrollo del Buscador 360° de Trazabilidad e Integración E2E.  

> * ****SEMANA 5:**** Testing de Regresión, Corrección de Bugs, Datos Mock y Ensayo de la Demo.

---

## 10. Relación con la investigación inicial y documentación vigente

Este documento debe leerse como una **especificación inicial de producto**, construida sobre los hallazgos y propuestas de la investigación **"Macro sistema software MVP"**.

La investigación inicial permitió identificar el problema central de la dispersión de información industrial y plantear la idea de un **Expediente Único de la Orden de Trabajo**, junto con documentación, operaciones, responsables, tiempos y consulta integral. También permitió evolucionar desde una posible solución específica para una industria de **aberturas** hacia un enfoque más general de **trazabilidad agnóstica de OT**.

Durante las etapas posteriores, el producto fue refinado funcional y técnicamente. Por ese motivo, algunas definiciones de este documento —incluyendo determinados roles, estados, historias de usuario, responsabilidades y comportamientos— pueden diferir de la versión vigente. Estas diferencias representan la **evolución del producto** y no deben interpretarse como errores que deban corregirse dentro de este documento histórico.

### Fuentes documentales por etapa

| Etapa | Documento | Función |
|---|---|---|
| Investigación inicial | **Macro sistema software MVP** | Relevamiento del dominio, problema, hipótesis y alternativas de producto. |
| Definición inicial | **QualityTrack — Especificación Funcional y Arquitectura de Producto** | Primera formalización del producto, MVP, flujo E2E, arquitectura conceptual y pruebas iniciales. |
| Definición vigente | **PRD V2** | Fuente funcional vigente del producto. |
| Definición vigente | **Backlog V2** | User Stories y criterios de aceptación vigentes. |
| Modelo vigente | **Esquema de Base de Datos V2** | Modelo de datos y estados persistidos vigentes. |

> **Nota:** la existencia de definiciones diferentes entre esta especificación inicial y la documentación V2 es esperable porque el producto fue refinado durante el proceso de desarrollo. La documentación vigente es la que determina el comportamiento actual de QualityTrack.
