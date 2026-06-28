# Outline Setup Guide

We use a custom standalone `docker-compose.yml` to deploy Outline with a dummy OIDC setup because Outline requires an external OAuth provider and does not support local username/password authentication natively.

## Steps

1. Create a deployment directory and `docker-compose-standalone.yml`:
   ```bash
   mkdir C:/tmp/outline
   cd C:/tmp/outline
   ```

2. Save the custom docker compose as `docker-compose-standalone.yml`.

3. Start the stack:
   ```bash
   docker compose -f docker-compose-standalone.yml up -d
   ```
