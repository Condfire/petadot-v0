import DashboardRedirector from "./dashboard-redirector"

export default async function DashboardPage() {
  return (
    <>
      <DashboardRedirector />
      <main>
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard!</p>
      </main>
    </>
  )
}
