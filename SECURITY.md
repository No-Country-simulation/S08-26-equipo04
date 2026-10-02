# Política de seguridad

## Reportar una vulnerabilidad

No abras un issue público. Usá **Security → Report a vulnerability** en este repositorio (reporte privado de GitHub).

## Manejo de secretos

- Ninguna credencial se versiona. Todos los valores sensibles se leen de variables de entorno (`${VAR}`) en los `application.properties`.
- Para desarrollo se usa un archivo `.env` local (cargado con spring-dotenv) creado a partir de `backend/qualititrack/.env.example`. `.env`, `application-*.properties`, `*.pem` y `*.key` están en `.gitignore`, y `.env` también en `.dockerignore`.
- En producción las variables se configuran en el panel del proveedor (por ejemplo, Render).
- Si una credencial se expone, se rota en el proveedor (Neon, `JWT_SECRET`) antes de cualquier otra acción. Rotar invalida el valor filtrado aunque siga en el historial de git.

## Variables por servicio

| Servicio | Variables |
|---|---|
| ms-auth | `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_EXPIRATION_MINUTES` |
| ms-business | `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_ISSUER` |
| ms-execution | `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_ISSUER` |
| api-gateway | `MS_AUTH_URL`, `MS_BUSINESS_URL`, `MS_EXECUTION_URL`, `CORS_ALLOWED_ORIGINS`, `PORT` |

## Medidas implementadas

- Contraseñas hasheadas con BCrypt; los usuarios inactivos no pueden autenticarse.
- JWT firmados con HMAC256, con emisor, expiración configurable (30 minutos por defecto) e identificador único.
- API stateless: sin sesiones y con CSRF deshabilitado al no usar cookies.
- Autorización por rol en cada endpoint con `@PreAuthorize`.
- El registro público solo crea usuarios `OPERARIO`; los demás roles los asigna un `GERENTE`.
- Los logs no registran contraseñas, hashes ni tokens. Los errores internos devuelven un mensaje genérico.
