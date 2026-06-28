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
