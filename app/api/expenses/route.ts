import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { requireSession } from "@/lib/auth"
import { convertToBase } from "@/lib/currency"

export async function POST(req: NextRequest) {
  const session = await requireSession()
  const { amount, currency, category, date, merchant, description, receiptUrl } = await req.json()
  if (!amount || !currency || !category || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const sql = getSql()
  const [company] = await sql /* sql */`
    select base_currency from companies where id = ${session.companyId}
  `
  const amountBase = await convertToBase(amount, currency, company.base_currency)

  const [exp] = await sql /* sql */`
    insert into expenses (company_id, user_id, amount, currency, amount_base, category, description, expense_date, merchant, receipt_url)
    values (${session.companyId}, ${session.userId}, ${amount}, ${currency}, ${amountBase}, ${category}, ${description ?? null}, ${date}, ${merchant ?? null}, ${receiptUrl ?? null})
    returning id, company_id
  `

  // Build approval chain: manager (if any) -> all FINANCE -> ADMIN (ensure unique, ordered)
  const approverIds: string[] = []

  const [mgr] = await sql /* sql */`
    select manager_id from users where id = ${session.userId} limit 1
  `
  if (mgr?.manager_id) approverIds.push(mgr.manager_id)

  // Avoid enum casting error by comparing as text
  const finance = await sql /* sql */`
    select id from users 
    where company_id = ${session.companyId} 
      and role::text = 'FINANCE'
  `
  for (const f of finance) {
    if (!approverIds.includes(f.id)) approverIds.push(f.id)
  }

  const [admin] = await sql /* sql */`
    select id from users where company_id = ${session.companyId} and role = 'ADMIN' limit 1
  `
  if (admin?.id && !approverIds.includes(admin.id)) approverIds.push(admin.id)

  // Insert approval steps
  let step = 1
  for (const aid of approverIds) {
    await sql /* sql */`
      insert into expense_approvals (expense_id, approver_id, step)
      values (${exp.id}, ${aid}, ${step})
    `
    step++
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const session = await requireSession()
  const scope = new URL(req.url).searchParams.get("scope") // "company" for reports
  const sql = getSql()
  if (scope === "company") {
    const rows = await sql /* sql */`
      select e.*
      from expenses e
      where e.company_id = ${session.companyId}
      order by e.created_at desc
    `
    return NextResponse.json({ items: rows })
  }
  const rows = await sql /* sql */`
    select e.*
    from expenses e
    where e.user_id = ${session.userId}
    order by e.created_at desc
  `
  return NextResponse.json({ items: rows })
}
