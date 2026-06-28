import os
import json

def write_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + "\n")

write_file('apps/test-app/docker-compose.yml', """
version: '3.8'
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: testdb
    ports:
      - "5432:5432"
""")

write_file('apps/test-app/.env', """
DATABASE_URL="postgresql://testuser:testpassword@localhost:5432/testdb?schema=public"
""")

pkg = {
  "name": "@seeder/test-app",
  "version": "0.0.1",
  "private": True,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch src/server/index.ts",
    "dev:client": "vite",
    "build": "tsc && vite build",
    "db:push": "prisma db push",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@hono/node-server": "^1.11.1",
    "@prisma/client": "^5.14.0",
    "hono": "^4.3.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2",
    "prisma": "^5.14.0",
    "tsx": "^4.10.5",
    "vite": "^5.2.0",
    "typescript": "latest"
  }
}

write_file('apps/test-app/package.json', json.dumps(pkg, indent=2))

write_file('apps/test-app/tsconfig.json', json.dumps({
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": True,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": True,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": True,
    "resolveJsonModule": True,
    "isolatedModules": True,
    "noEmit": True,
    "jsx": "react-jsx",
    "strict": True
  },
  "include": ["src"]
}, indent=2))

write_file('apps/test-app/prisma/schema.prisma', """
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  companyId String?
  company   Company? @relation(fields: [companyId], references: [id])
}

model Company {
  id        String    @id @default(uuid())
  name      String
  domain    String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  users     User[]
  projects  Project[]
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
}
""")

write_file('apps/test-app/src/server/index.ts', """
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { cors } from 'hono/cors'

const prisma = new PrismaClient()
const app = new Hono()

app.use('*', cors())

app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()
  // Mock login logic for first test-app boot, creating user if none exists
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({ data: { email, password, name: 'Test User' } })
  }
  if (user.password === password) {
    return c.json({ token: 'fake-jwt-token', user })
  }
  return c.json({ error: 'Invalid credentials' }, 401)
})

app.get('/api/companies', async (c) => c.json(await prisma.company.findMany()))
app.post('/api/companies', async (c) => {
  const data = await c.req.json()
  const company = await prisma.company.create({ data })
  return c.json(company)
})

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
""")

write_file('apps/test-app/vite.config.ts', """
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
""")

write_file('apps/test-app/index.html', """
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
</html>
""")

write_file('apps/test-app/src/client/main.tsx', """
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
""")

write_file('apps/test-app/src/client/App.tsx', """
import React, { useState } from 'react'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('token', data.token)
      setToken(data.token)
    } else {
      alert('Login failed')
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.get('name'), domain: formData.get('domain') })
      })
      if (res.ok) {
          alert('Company Created')
      }
  }

  if (!token) {
    return (
      <div>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input id="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button id="login-button" type="submit">Login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => { localStorage.removeItem('token'); setToken(null) }}>Logout</button>
      
      <h2>Create Company</h2>
      <form onSubmit={handleCreateCompany}>
          <input id="company-name" name="name" placeholder="Company Name" required />
          <input id="company-domain" name="domain" placeholder="Domain" required />
          <button id="create-company-button" type="submit">Create</button>
      </form>
    </div>
  )
}
""")
