# QualityTrack · Docker

## Servicios

| Servicio | Puerto | Imagen |
|---|---|---|
| api-gateway | 8080 | `api-gateway/Dockerfile` |
| ms-auth | 8081 | `ms-auth/Dockerfile` |
| ms-business | 8082 | `ms-business/Dockerfile` |
| ms-execution | 8084 | `ms-execution/Dockerfile` |

Cada Dockerfile es multi-stage: compila el módulo con Maven (`-pl <módulo> -am`, que incluye ms-common) y ejecuta el JAR sobre `eclipse-temurin:21-jre-alpine`. No hace falta compilar antes en la máquina local.

## Levantar el entorno

```bash
cd backend/qualititrack
cp .env.example .env          # completar los valores
docker compose up --build -d
docker compose ps
docker compose logs -f ms-auth
```

El orden de arranque lo controlan los healthchecks (`/actuator/health`): ms-business, ms-execution y el gateway esperan a que ms-auth esté sano.

## Verificar

```bash
curl http://localhost:8080/actuator/health

curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<email>","password":"<password>"}'
```

## Comandos útiles

```bash
docker compose down                      # detener
docker compose build --no-cache ms-auth  # reconstruir una imagen
docker compose up -d ms-auth             # levantar un servicio
docker exec -it ms-auth sh               # entrar a un contenedor
```

## Notas

- El archivo `.env` está en `.gitignore` y en `.dockerignore`: no se sube al repo ni se copia a las imágenes. Las variables llegan a los contenedores con `env_file`.
- En producción (Render u otra plataforma), configurar las variables en el panel del proveedor.
- Si Neon rechaza la conexión por `channel_binding`, quitar ese parámetro de la URL JDBC en los `application.properties`.
