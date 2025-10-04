import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { requireSession } from "@/lib/auth"
import { canApprove } from "@/lib/rbac"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession()
  if (!canApprove(session)) return new NextResponse("Forbidden", { status: 403 })
  const { comment } = await req.json().catch(() => ({}))
  const sql = getSql()
  await sql /* sql */`
    update expense_approvals
    set status = 'REJECTED', comment = ${comment ?? null}, acted_at = now()
    where expense_id = ${params.id} and approver_id = ${session.userId} and status = 'PENDING'
  `
  await sql /* sql */`update expenses set status = 'REJECTED' where id = ${params.id}`
  return NextResponse.json({ ok: true })
}
