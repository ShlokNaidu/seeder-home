# Plane Setup Guide

We are using the official release artifacts from GitHub to deploy Plane locally for validation.

## Steps

1. Create a deployment directory and download the official release assets for `v1.3.1`:
   ```bash
   mkdir -p C:/tmp/plane-release
   cd C:/tmp/plane-release
   Invoke-WebRequest -Uri "https://github.com/makeplane/plane/releases/download/v1.3.1/docker-compose.yml" -OutFile "docker-compose.yml"
   Invoke-WebRequest -Uri "https://github.com/makeplane/plane/releases/download/v1.3.1/variables.env" -OutFile ".env"
   ```

2. Modify `.env` to avoid port 80 conflicts and align with our validation configuration (`http://localhost:3000`):
   - Set `LISTEN_HTTP_PORT=3000`
   - Set `WEB_URL=http://${APP_DOMAIN}:3000`
   - Set `CORS_ALLOWED_ORIGINS=http://${APP_DOMAIN}:3000`

3. Start the Docker Compose stack:
   ```bash
   docker compose up -d
   ```