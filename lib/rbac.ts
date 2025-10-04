import type { SessionPayload } from "./auth"

export function canSubmitExpense(session: SessionPayload) {
  return session.role === "EMPLOYEE" || session.role === "MANAGER" || session.role === "ADMIN"
}

export function canApprove(session: SessionPayload) {
  return session.role === "MANAGER" || session.role === "FINANCE" || session.role === "ADMIN"
}

export function isAdmin(session: SessionPayload) {
  return session.role === "ADMIN"
}
