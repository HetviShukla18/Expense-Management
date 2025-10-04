import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import ApprovalsList from "@/components/approvals-list"

export default async function ApprovalsPage() {
  const session = await getSession()
  if (!session) {
    return <meta httpEquiv="refresh" content="0; url=/login" />
  }
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-background px-0 py-0">
        <ApprovalsList />
      </main>
    </>
  )
}
