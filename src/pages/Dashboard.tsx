import { useAuth } from "@/auth/AuthContext";

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <div className="dashboard-user">
          <span>{user?.displayName ?? user?.username}</span>
          <button onClick={logout}>Sign Out</button>
        </div>
      </header>
      <main>
        <p>You are authenticated. Add your app content here.</p>
      </main>
    </div>
  );
}
