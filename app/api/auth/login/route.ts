import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { createSession, verifyPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const sql = getSql()
  const rows = await sql /* sql */`
    select id, email, password_hash, role, company_id
    from users
    where email = ${email}
    limit 1
  `
  const user = rows[0]
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  await createSession({ userId: user.id, email: user.email, role: user.role, companyId: user.company_id })
  return NextResponse.json({ ok: true,user:user })
}
