# Especificación técnica de Backend (Lisandro) — propuesta paralela

Este documento es la propuesta técnica de backend que armó Lisandro en paralelo a `docs/backend/Especificacion-Tecnica.md` (la base de Felipe) y al Esquema v2. Se archiva acá tal cual, sin modificar, por Issue [#4](https://github.com/No-Country-simulation/S08-26-equipo04/issues/4).

El propio documento aclara en su sección 2 que su fuente funcional es la **Especificación Funcional · Versión 1** — es anterior al Esquema v2 (`docs/datos/QualityTrack-Esquema-Base-Datos-v2.md`) y a varias correcciones que se incorporaron en la v2 después.

## Qué se reusó en `docs/backend/Especificacion-Tecnica.md`

- **Estructura del proyecto** (sus secciones 6 y 7): el árbol de carpetas y la organización por módulo `controller/service/repository/entity/dto/mapper` — se adaptó solo para que los nombres de módulo calcen con las tablas del Esquema v2.
- **Diagrama de arquitectura** (su sección 4): React → HTTP/JSON → Spring Boot → Spring Data JPA / Spring Security / Bean Validation → PostgreSQL — se pasó a mermaid para consistencia con el resto del repo.
- **Manejo de excepciones** (su sección 29): las categorías de error (recurso no encontrado, datos inválidos, conflicto de estado, acceso no autorizado, errores internos) — se mapearon a los mismos códigos HTTP que ya documentó Frontend.

## Qué no se reusó, y por qué

- **Modelo de estados (sección 13).** Usa valores distintos a los del Esquema v2 en las cuatro entidades — por ejemplo, Solicitud tiene `CREADA / COTIZACION_ENVIADA / ACEPTADA / RECHAZADA` acá, contra `PENDIENTE_COTIZACION / COTIZADA` en el v2; la OT agrega `COMPLETADA` y `CANCELADA`, que no existen en el v2. El documento final referencia directamente al Esquema v2 en vez de redefinir estados.
- **Contratos de API (secciones 19 a 26).** No coinciden con el contrato ya cerrado entre Backend y Frontend (`docs/frontend/Especificacion-Tecnica.md`) en varios puntos: CRUD completo de `/api/usuarios` y `/api/clientes` que Frontend no consume así, un paso `/despacho` separado de `/entrega` que Frontend resuelve con un solo endpoint, un endpoint `/asignar` además de `/reasignar` que tampoco está en el contrato de Frontend.
- **Alta de operarios por el Gerente (sección 12).** Corresponde a HU-5.2, eliminada en la Especificación Funcional v2 — los usuarios se cargan directo en la base por el equipo de desarrollo (D9 del Esquema v2); el Gerente solo los consulta y les asigna fases.

Ninguna de estas diferencias es un error del documento — reflejan que fue escrito contra la v1, antes de que el equipo cerrara las correcciones de la v2. Se deja documentado acá para que quede claro por qué el documento vigente diverge en esos puntos, no por descuido sino porque el Esquema v2 y el contrato de Frontend ya resolvieron esas mismas decisiones de otra forma.
