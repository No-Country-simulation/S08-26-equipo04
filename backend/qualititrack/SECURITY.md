# 🔒 Política de Seguridad - QualityTrack

## Variables de Entorno Obligatorias

**NUNCA** commit credentials en Git. Usar variables de entorno para:

### Base de datos (Neon)
```
DB_HOST=your-neon-host.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=generate-new-password-in-neon-console
```

### JWT & Security
```
JWT_SECRET=secret-key-min-32-chars
PRIVATE_KEY=private-key-from-auth0-or-keycloak
USER_GENERATOR=CALIDAD
```

### URLs Microservicios
```
MS_AUTH_URL=http://localhost:8081
MS_BUSINESS_URL=http://localhost:8082
MS_EXECUTION_URL=http://localhost:8084
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Setup Local

1. Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Llenar valores en `.env` (NO SUBIR A GIT):
   ```bash
   # Nunca commitear .env
   git status  # Confirmar .env no aparezca
   ```

3. Usar dotenv en desarrollo:
   - Spring Boot carga desde `.env` automáticamente si está en classpath
   - Usar `springboot4-dotenv` (ya configurado en pom.xml)

## Producción (Render, Heroku, etc)

- ❌ NO copiar `.env` local a producción
- ✅ Configurar variables en el panel de la plataforma (Config Vars, Secrets, etc)
- ✅ Usar Azure Key Vault o AWS Secrets Manager en cloud enterprise

## En caso de compromiso

Si una contraseña se expone:

1. **Neon:** Ir a https://console.neon.tech → Roles → generar nueva password
2. **JWT Secret:** Regenerar en Auth0 o usar UUID nuevo
3. **GitHub:** Si se hizo push accidental:
   ```bash
   git reset --soft HEAD~1  # Revert commit
   git restore .env        # Remover archivo
   git commit --amend      # Commit limpio
   ```

## Verificación

Antes de push a GitHub:
```bash
# Confirmar .env no está tracked
git status | grep ".env"  # Debe estar vacío

# Buscar credenciales en código
grep -r "npg_\|password=\|secret=" src/  # No debe haber matches
```

## Ramas de Trabajo

- `main` - Código producción, 100% limpio
- `develop` - Integración, sin secrets
- `feature/*` - Features nuevas, sin secrets
- ❌ NUNCA secrets en ninguna rama

