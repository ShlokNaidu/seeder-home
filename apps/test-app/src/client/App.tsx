import React, { useState } from 'react'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

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
          setIsModalOpen(false)
      }
  }

  if (!token) {
    return (
      <div id="login-state">
        <h1>Login</h1>
        <form id="login-form" onSubmit={handleLogin}>
          <input id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input id="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button id="login-button" type="submit">Login</button>
        </form>
      </div>
    )
  }

  return (
    <div id="dashboard-state">
      <h1>Dashboard</h1>
      <button id="logout-button" onClick={() => { localStorage.removeItem('token'); setToken(null) }}>Logout</button>
      
      <button id="open-new-company-modal" onClick={() => setIsModalOpen(true)}>New Company</button>

      {isModalOpen && (
        <div id="company-modal" style={{ border: '1px solid black', padding: '20px', marginTop: '20px' }}>
          <h2>Create Company Modal</h2>
          <form id="create-company-form" onSubmit={handleCreateCompany}>
              <input id="company-name" name="name" placeholder="Company Name" required />
              <input id="company-domain" name="domain" placeholder="Domain" required />
              <button id="submit-company" type="submit">Create</button>
              <button id="cancel-company" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  )
}
