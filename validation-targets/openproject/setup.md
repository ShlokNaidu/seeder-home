# OpenProject Setup Guide

We use the official OpenProject All-in-One (AIO) Docker container for testing and evaluation.

## Steps

1. Create a deployment directory and `docker-compose.yml`:
   ```bash
   mkdir C:/tmp/openproject
   cd C:/tmp/openproject
   ```

2. Save the following configuration as `docker-compose.yml`:
   ```yaml
   version: '3.7'
   services:
     openproject:
       image: openproject/community:14
       container_name: openproject
       ports:
         - "3000:80"
       environment:
         - OPENPROJECT_SECRET_KEY_BASE=secret
         - OPENPROJECT_HOST__NAME=localhost:3000
         - OPENPROJECT_HTTPS=false
       volumes:
         - pgdata:/var/openproject/pgdata
         - assets:/var/openproject/assets
   volumes:
     pgdata:
     assets:
   ```

3. Start the stack:
   ```bash
   docker compose up -d
   ```
