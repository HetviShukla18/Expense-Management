import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { hashPassword, requireSession } from "@/lib/auth"
import { isAdmin } from "@/lib/rbac"

export async function GET() {
  const s = await requireSession()
  if (!isAdmin(s)) return new NextResponse("Forbidden", { status: 403 })
  const sql = getSql()
  const rows = await sql /* sql */`
    select id, email, role, manager_id
    from users
    where company_id = ${s.companyId}
    order by created_at asc
  `
  // also include manager candidates list (MANAGER or ADMIN)
  const managers = await sql /* sql */`
    select id, email, role
    from users
    where company_id = ${s.companyId} and role in ('MANAGER','ADMIN')
    order by email asc
  `
  return NextResponse.json({ users: rows, managers })
}

export async function POST(req: NextRequest) {
  const s = await requireSession()
  if (!isAdmin(s)) return new NextResponse("Forbidden", { status: 403 })
  const { email, password, role, managerId } = await req.json()
  if (!email || !password || !role) return NextResponse.json({ error: "Missing" }, { status: 400 })

  const allowedRoles = ["EMPLOYEE", "MANAGER", "FINANCE", "ADMIN"] as const
  if (!allowedRoles.includes(role)) {
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

  const pwd = await hashPassword(password)

  // Validate manager belongs to same company (if provided)
  let mgrId: string | null = null
  if (managerId) {
    const [mgr] = await sql /* sql */`
      select id from users where id = ${managerId} and company_id = ${s.companyId} limit 1
    `
    mgrId = mgr?.id ?? null
  }

  const [user] = await sql /* sql */`
    insert into users (company_id, email, password_hash, role, manager_id)
    values (${s.companyId}, ${email}, ${pwd}, ${role}, ${mgrId})
    returning id, email, role, manager_id
  `
  return NextResponse.json({ user })
}
