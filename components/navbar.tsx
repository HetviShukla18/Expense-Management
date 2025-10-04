"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/approvals", label: "Approvals" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/admin", label: "Admin", role: "Admin" }, // add role restriction
]

export function Navbar() {
  const pathname = usePathname()
  const [role, setRole] = useState(null)

  useEffect(() => {
    // Example: assuming user role is stored in localStorage/session after login
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setRole(user.role)
  }, [])

  return (
    <header className="border-b bg-card">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold">
          Expense Manager
        </Link>
        <nav className="flex items-center gap-4">
          {links
            .filter((l) => !l.role || l.role === role) // show only if no role restriction OR role matches
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm ${
                  pathname.startsWith(l.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                } hover:text-primary`}
              >
                {l.label}
              </Link>
            ))}
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </nav>
      </div>
    </header>
  )
}
