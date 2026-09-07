# Esquema alternativo (Semana 0)

El siguiente esquema fue desarrollado en dbdiagram.io, basado en el documento compartido elaborado por el equipo de backend para la semana 0, con el fin de facilitar la discusión del esquema de base de datos elaborado hasta el momento con el grupo. Este fue elaborado en paralelo al esquema v2 cerrado (contenido en "docs/datos/QualityTrack-Esquema-Base-Datos-v2.md") que finalmente será utilizado en el resto del desarrollo.

Vale la pena recalcar que **no ha sido utilizado como fuente para el código elaborado hasta el momento**. El código elaborado utilizará como fuente al esquema v2, como fue planificado.

## Comparación

Ya que fue solicitado, se presenta a continuación, una comparación entre los diagramas de la propuesta paralela y el esquema v2:

- **Estructura del Checklist de Calidad:** El diagrama paralelo agrupa el checklist en una única tabla (calidad checklist), asignando una columna booleana independiente a cada ítem. En contraste, el esquema v2 utiliza una relación de uno a muchos a través de la tabla auditoria_checklist_respuestas, donde cada ítem permite tres valores específicos: CUMPLE, NO_CUMPLE y NO_APLICA.
- **Nomenclatura de Tablas y Estados:** El esquema no adoptado define sus tablas en singular (ej. cliente, fase, cotizacion) y establece tipos Enum estrictos para los estados. El v2 consolida el uso de plurales (ej. clientes, fases_catalogo) y maneja los estados internamente con campos de texto y constraints.  
- **Tiempos Estándar de Fase:** La propuesta paralela incluye el campo tiempo estandar dentro de la propia entidad fase. El modelo v2 remueve este concepto del catálogo, haciendo que el tiempo estimado (tiempo_estimado_minutos) se defina directamente en cotizacion_fases de manera individual para cada pedido.
- **Entidades y Relaciones no contempladas en dbdiagram:** El esquema v2 incorpora varias entidades de negocio y trazabilidad que no estaban presentes en el diagrama original:
  - *fase_operarios_habilitados* para vincular qué operarios están cualificados para cada fase.
  - *ot_fase_reasignaciones* para llevar el historial de cambios de operario por balanceo de carga.
  - *ot_notas* para separar y clasificar las notas por origen (Jefe de Producción o Calidad).
  - Variables de iteración y retrabajo (es_rehacer y ciclo_iteracion) dentro de la tabla ot_fases.

La comparación revela diferencias que no son particularmente relevantes, más relacionadas a cuestiones de diseño. Teniendo en cuenta esto, se continuará utilizando el esquema v2 como fuente para el desarrollo, sin cambios relacionados a estas.
