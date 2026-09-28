# 🐳 QualityTrack - Docker Setup

## Estructura

- **ms-auth** (8081) - Autenticación y usuarios
- **ms-business** (8082) - Gestión de negocios
- **ms-execution** (8084) - Ejecución de órdenes
- **api-gateway** (8080) - Gateway reactivo enrutando a los 3 MS

## Requisitos

- Docker Desktop instalado
- Variables de entorno configuradas en `.env.docker`
- Maven build exitoso (`mvn clean package -DskipTests`)

## Configuración

### 1. Preparar variables de entorno

```bash
# Copiar y editar
cp .env.docker .env.docker.local

# Editar con tus valores:
# - DB_PASSWORD: Nueva contraseña de Neon
# - JWT_SECRET: Valor seguro aleatorio
# - PRIVATE_KEY: Valor seguro aleatorio
```

### 2. Hacer Maven build (una sola vez)

```bash
cd backend/qualititrack
mvnw.cmd clean package -DskipTests
```

Si faltan archivos target/ en los módulos, Docker no podrá copiar los JARs.

### 3. Buildear imágenes Docker

```bash
cd backend/qualititrack

# Opción A: Dejar que docker-compose buildee automáticamente
# (Esto ocurre cuando ejecutas docker-compose up --build)

# Opción B: Buildear manualmente cada uno
docker build -f ms-auth/Dockerfile -t qualitytrack/ms-auth:latest .
docker build -f ms-business/Dockerfile -t qualitytrack/ms-business:latest .
docker build -f ms-execution/Dockerfile -t qualitytrack/ms-execution:latest .
docker build -f api-gateway/Dockerfile -t qualitytrack/api-gateway:latest .
```

### 4. Levantar servicios con Docker Compose

```bash
cd backend/qualititrack

# Cargar variables de entorno y levantar todo
docker-compose --env-file .env.docker.local up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver estado de servicios
docker-compose ps
```

### 5. Verificar conectividad

```bash
# Health check del gateway
curl http://localhost:8080/actuator/health

# Health check de ms-auth
curl http://localhost:8081/actuator/health

# Health check de ms-business
curl http://localhost:8082/actuator/health

# Health check de ms-execution
curl http://localhost:8084/actuator/health
```

### 6. Probar login a través del gateway

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"password123"}'
```

## Solución de problemas

### "Connection refused" a Neon
Si ves errores de conexión a la BD:

1. Verificar que la password es correcta en Neon:
   https://console.neon.tech

2. Si Neon rechaza con `channel_binding`, remover de la URL:
   ```properties
   # NO: sslmode=require&channel_binding=require
   # SÍ: sslmode=require
   ```
   La URL en application.properties ya debería tenerlo correcto.

### "Container exiting with status 1"
Ver logs con:
```bash
docker-compose logs ms-auth
docker-compose logs api-gateway
```

### Reconstruir desde cero
```bash
docker-compose down -v
docker system prune
docker-compose up --build
```

## Comandos útiles

```bash
# Ver logs de un servicio específico
docker-compose logs ms-auth -f

# Entrar a un contenedor
docker exec -it ms-auth sh

# Detener todo
docker-compose down

# Remover todo (incluyendo volúmenes)
docker-compose down -v

# Reconstruir una sola imagen
docker-compose build --no-cache ms-auth
docker-compose up ms-auth -d
```

## Notas de Seguridad

- ❌ NUNCA commit `.env.docker.local` a GitHub
- ✅ `.env.docker` (ejemplo) sí va al repo
- ✅ En Producción: usar Variables de entorno en la plataforma (Render, Heroku, etc)

## Publicación

Cuando todo funcione localmente, para Render/Cloud:

1. Push a GitHub (sin .env)
2. Conectar repo en Render/plataforma
3. Configurar Variables de Entorno en el panel
4. Deploy automático desde Docker
