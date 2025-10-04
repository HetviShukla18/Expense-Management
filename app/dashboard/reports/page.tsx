import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import Reports from "@/components/reports"

export default async function ReportsPage() {
  const session = await getSession()
  if (!session) {
    return <meta httpEquiv="refresh" content="0; url=/login" />
  }
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Reports />
      </main>
    </>
  )
}
