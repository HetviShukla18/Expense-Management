"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/approvals", label: "Approvals" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/admin", label: "Admin", role: "ADMIN" }, // role restriction
]

export function Navbar() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    console.log("user from storage:", user.role)
    setRole(user.role)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md">
      <div className="mx-auto w-full max-w-7xl px-8 py-5 flex items-center justify-between">
        
        {/* Brand */}
        <Link
          href="/dashboard"
          className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
        >
          Expense Manager
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {links
            .filter((l) => !l.role || l.role === role)
            .map((l) => {
              const isActive =
                l.href === "/dashboard"
                  ? pathname === "/dashboard" // exact match for dashboard
                  : pathname.startsWith(l.href) // partial match for others

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-lg font-semibold transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300"
                  } hover:text-blue-600 dark:hover:text-blue-400`}
                >
                  {l.label}
                  {isActive && (
                    <span className="absolute left-0 -bottom-1 h-[3px] w-full bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  )}
                </Link>
              )
            })}

          {/* Logout */}
          <form action="/api/auth/logout" method="post">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="ml-2 px-5 py-2 text-lg font-medium rounded-lg border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Logout
            </Button>
          </form>
        </nav>
      </div>
    </header>
  )
}
