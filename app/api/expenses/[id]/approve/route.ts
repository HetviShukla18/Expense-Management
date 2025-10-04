import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { requireSession } from "@/lib/auth"
import { canApprove } from "@/lib/rbac"

async function evaluateRules(sql: any, companyId: string, expenseId: string) {
  const [rule] = await sql /* sql */`
    select * from approval_rules where company_id = ${companyId} limit 1
  `
  if (!rule) {
    // default: require all steps approved
    const [counts] = await sql /* sql */`
      select 
        sum(case when status='APPROVED' then 1 else 0 end)::int as approved,
        count(*)::int as total
      from expense_approvals
      where expense_id = ${expenseId}
    `
    return counts?.approved === counts?.total
  }

  const approvals = await sql /* sql */`
    select a.*, u.role
    from expense_approvals a
    join users u on u.id = a.approver_id
    where a.expense_id = ${expenseId}
  `
  const approved = approvals.filter((a: any) => a.status === "APPROVED")
  if (rule.rule_type === "SPECIFIC") {
    return approved.some((a: any) => a.approver_id === rule.specific_approver_user_id)
  }
  if (rule.rule_type === "PERCENTAGE") {
    const pct = approvals.length ? Math.round((approved.length / approvals.length) * 100) : 0
    return pct >= (rule.percentage || 100)
  }
  const pct = approvals.length ? Math.round((approved.length / approvals.length) * 100) : 0
  return approved.some((a: any) => a.approver_id === rule.specific_approver_user_id) || pct >= (rule.percentage || 100)
}

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession()
  if (!canApprove(session)) return new NextResponse("Forbidden", { status: 403 })
  const sql = getSql()
  const [exp] = await sql /* sql */`
    select * from expenses where id = ${params.id} limit 1
  `
  if (!exp) return new NextResponse("Not found", { status: 404 })

  // approve current user's step
  await sql /* sql */`
    update expense_approvals
    set status = 'APPROVED', acted_at = now()
    where expense_id = ${params.id} and approver_id = ${session.userId} and status = 'PENDING'
  `

  // if any pending steps remain, do not finalize yet
  const [pending] = await sql /* sql */`
    select count(*)::int as cnt
    from expense_approvals
    where expense_id = ${params.id} and status = 'PENDING'
  `
  if (pending?.cnt > 0) {
    return NextResponse.json({ ok: true, finalized: false })
  }

  // else, evaluate rules and possibly finalize
  const isFinal = await evaluateRules(sql, exp.company_id, exp.id)
  if (isFinal) {
    await sql /* sql */`update expenses set status = 'APPROVED' where id = ${exp.id}`
    return NextResponse.json({ ok: true, finalized: true })
  }
  return NextResponse.json({ ok: true, finalized: false })
}
