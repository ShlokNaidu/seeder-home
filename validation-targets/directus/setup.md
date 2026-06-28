# Directus Deployment Setup

Used the official docker-compose configuration.

```yaml
version: '3.8'

services:
  directus:
    image: directus/directus:latest
    ports:
      - 8055:8055
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
      - ./database:/directus/database
    environment:
      KEY: 'data-seeder-directus-key-1234'
      SECRET: 'data-seeder-directus-secret-1234'
      DB_CLIENT: 'sqlite3'
      DB_FILENAME: '/directus/database/data.db'
      ADMIN_EMAIL: 'admin@example.com'
      ADMIN_PASSWORD: 'password123'
```

Launched via `docker-compose up -d`. Bootstrapped instantly via environment variables.