import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminPage() {
  const session = await getSession()
  if (!session) {
    return <meta httpEquiv="refresh" content="0; url=/login" />
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-background px-0 py-0">
        <AdminDashboard />
      </main>
    </>
  )
}
