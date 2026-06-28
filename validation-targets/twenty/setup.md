# Twenty CRM Setup Guide

We use the official Docker Compose deployment method provided by the Twenty HQ repository.

## Steps

1. Create a deployment directory and download the official configuration files:
   ```bash
   mkdir C:/tmp/twenty-deploy
   cd C:/tmp/twenty-deploy
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/.env.example" -OutFile ".env"
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/docker-compose.yml" -OutFile "docker-compose.yml"
   ```

2. Configure environment variables in `.env`:
   - Set an `ENCRYPTION_KEY` using a Base64 string (e.g., `MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=`)
   - Maintain default port configuration (`3000`) and `SERVER_URL` (`http://localhost:3000`)

3. Start the stack:
   ```bash
   docker compose up -d
   ```