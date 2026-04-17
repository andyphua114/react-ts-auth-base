import { useAuth } from '@/auth/AuthContext'

export function Dashboard() {
  const { logout } = useAuth()

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <button onClick={logout}>Sign Out</button>
      </header>
      <main>
        <p>You are authenticated. Add your app content here.</p>
      </main>
    </div>
  )
}
