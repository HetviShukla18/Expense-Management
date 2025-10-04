import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { fetchCountryCurrency } from "@/lib/currency"
import { createSession, hashPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { companyName, countryCode, email, password } = await req.json()
  if (!companyName || !countryCode || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const sql = getSql()

  // Determine base currency
  const baseCurrency = await fetchCountryCurrency(countryCode).catch(() => "USD")

  // Create company + admin user
  const [company] = await sql /* sql */`
    insert into companies (name, country_code, base_currency)
    values (${companyName}, ${countryCode}, ${baseCurrency})
    returning id, base_currency
  `
  const pwd = await hashPassword(password)
  const [user] = await sql /* sql */`
    insert into users (company_id, email, password_hash, role)
    values (${company.id}, ${email}, ${pwd}, 'ADMIN')
    returning id, email, role, company_id
  `
  await createSession({ userId: user.id, email: user.email, role: user.role, companyId: user.company_id })
  return NextResponse.json({ ok: true })
}
