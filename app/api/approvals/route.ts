import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { requireSession } from "@/lib/auth"
import { canApprove } from "@/lib/rbac"
import { log } from "console"

export async function GET() {
  const session = await requireSession()
  if (!canApprove(session)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const sql = getSql()
  const result = await sql/* sql */`
    SELECT 
      e.id,
      e.amount,
      e.currency,
      e.category,
      e.merchant,
      e.status,
      e.receipt_url,  -- 👈 include receipt URL here
      u.email AS submitter_email,
      a.step
    FROM expense_approvals a
    JOIN expenses e ON e.id = a.expense_id
    JOIN users u ON u.id = e.user_id
    WHERE a.approver_id = ${session.userId}
      AND a.status = 'PENDING'
      AND e.status = 'PENDING'
      AND a.step = (
        SELECT MIN(step)
        FROM expense_approvals 
        WHERE expense_id = e.id AND status = 'PENDING'
      )
    ORDER BY a.step ASC, e.created_at ASC
  `
  console.log(result);
  
  // Ensure we get the correct array of rows
  const rows = Array.isArray(result) ? result : result.rows ?? result;
  console.log(rows)
  const items = rows.map((r: any) => ({
    id: r.id,
    amount: r.amount,
    currency: r.currency,
    category: r.category,
    merchant: r.merchant,
    status: r.status,
    submitter_email: r.submitter_email,
    step: r.step,
    receiptUrl: r.receipt_url || null, // 👈 safe field name for frontend
  }))

  return NextResponse.json({ items })
}
