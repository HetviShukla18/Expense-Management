import { type NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/auth"
import { isAdmin } from "@/lib/rbac"
import { getSql } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await requireSession()
  if (!isAdmin(s)) return new NextResponse("Forbidden", { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { role, managerId } = body as { role?: string; managerId?: string | null }

  const allowedRoles = ["EMPLOYEE", "MANAGER", "FINANCE", "ADMIN"] as const
  if (role && !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const sql = getSql()

  if (role === "FINANCE") {
    const [exists] = await sql /* sql */`
      select 1
      from pg_type t
      join pg_enum e on e.enumtypid = t.oid
      where t.typname = 'user_role' and e.enumlabel = 'FINANCE'
      limit 1
    `
    if (!exists) {
      return NextResponse.json(
        {
          error:
            "FINANCE role is not enabled in the database. Please run scripts/003_add_finance_role_safe.sql and try again.",
        },
        { status: 400 },
      )
    }
  }

  // ensure target user is in same company
  const [u] = await sql /* sql */`
    select id from users where id = ${params.id} and company_id = ${s.companyId} limit 1
  `
  if (!u) return new NextResponse("Not found", { status: 404 })

  let mgrId: string | null | undefined = undefined
  if (body.hasOwnProperty("managerId")) {
    if (!managerId) {
      mgrId = null
    } else {
      const [mgr] = await sql /* sql */`
        select id from users where id = ${managerId} and company_id = ${s.companyId} limit 1
      `
      mgrId = mgr?.id ?? null
    }
  }

  await sql /* sql */`
    update users
    set 
      role = coalesce(${role as any}, role),
      manager_id = ${mgrId === undefined ? (null as any) : mgrId}
    where id = ${params.id}
  `
  return NextResponse.json({ ok: true })
}
