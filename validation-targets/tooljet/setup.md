# ToolJet Setup Guide

We use the official internal Docker Compose deployment from ToolJet's repository.

## Steps

1. Create a deployment directory and get the files:
   ```bash
   mkdir C:/tmp/tooljet-deploy
   cd C:/tmp/tooljet-deploy
   git clone --depth 1 https://github.com/ToolJet/ToolJet.git .
   mkdir C:/tmp/tooljet-deploy-final
   cp C:/tmp/tooljet-deploy/deploy/docker/* C:/tmp/tooljet-deploy-final/
   cd C:/tmp/tooljet-deploy-final
   ```

2. Create an `.env` file with secure random secrets:
   - Generate `LOCKBOX_MASTER_KEY`, `SECRET_KEY_BASE`, `PGRST_JWT_SECRET`
   - Set `TOOLJET_HOST=http://localhost:3000`
   - Set Postgres and PostgREST variables as required.

3. Update `docker-compose-db.yaml` to map port `3000:80` for the `tooljet` service.

4. Start the stack:
   ```bash
   docker compose -f docker-compose-db.yaml up -d
   ```
