# Appsmith Setup Guide

We use the official Docker Compose deployment method provided in the Appsmith documentation.

## Steps

1. Create a deployment directory and `docker-compose.yml`:
   ```bash
   mkdir C:/tmp/appsmith
   cd C:/tmp/appsmith
   ```

2. Save the following configuration as `docker-compose.yml`:
   ```yaml
   version: "3"
   services:
     appsmith:
       image: index.docker.io/appsmith/appsmith-ce:latest
       container_name: appsmith
       ports:
         - "3000:80"
       volumes:
         - ./stacks:/appsmith-stacks
       restart: unless-stopped
   ```

3. Start the stack:
   ```bash
   docker compose up -d
   ```
