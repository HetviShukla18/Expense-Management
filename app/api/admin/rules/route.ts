import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { requireSession } from "@/lib/auth"
import { isAdmin } from "@/lib/rbac"

export async function GET() {
  const s = await requireSession()
  const sql = getSql()
  const [rule] = await sql /* sql */`
    select * from approval_rules where company_id = ${s.companyId} limit 1
  `
  return NextResponse.json({ rule: rule ?? null })
}

export async function POST(req: NextRequest) {
  const s = await requireSession()
  if (!isAdmin(s)) return new NextResponse("Forbidden", { status: 403 })
  const { ruleType, percentage, specificApproverUserId } = await req.json()
  const sql = getSql()
  const existing = await sql /* sql */`
    select id from approval_rules where company_id = ${s.companyId} limit 1
  `
  if (existing[0]?.id) {
    await sql /* sql */`
      update approval_rules
      set rule_type = ${ruleType}, percentage = ${percentage}, specific_approver_user_id = ${specificApproverUserId}
      where id = ${existing[0].id}
    `
  } else {
    await sql /* sql */`
      insert into approval_rules (company_id, rule_type, percentage, specific_approver_user_id)
      values (${s.companyId}, ${ruleType}, ${percentage}, ${specificApproverUserId})
    `
  }
  return NextResponse.json({ ok: true })
}
