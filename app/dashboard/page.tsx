import { getSession } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import ExpenseComposer from "@/components/expense-form"
import MyExpenses from "@/components/my-expenses-table"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
        <p className="text-muted-foreground text-lg">Redirecting to login...</p>
        <meta httpEquiv="refresh" content="0; url=/login" />
      </main>
    )
  }

  const NAV_HEIGHT = "4rem" // adjust if Navbar height differs

  return (
    <>
      <Navbar />
      <main
        className={`h-[calc(100vh-${NAV_HEIGHT})] w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800`}
      >
        {/* Fullscreen two-column layout */}
        <div className="grid h-full w-full grid-cols-1  lg:grid-cols-2">
          {/* Expense Form */}
          <section className="h-full w-full p-6 ">
            <ExpenseComposer />
          </section>

          {/* Expenses Table */}
          <section className="h-full w-full p-6">
            <MyExpenses />
          </section>
        </div>
      </main>
    </>
  )
}
