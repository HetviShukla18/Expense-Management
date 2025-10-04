import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { getSql } from "./db"

const AUTH_COOKIE = "ems_session"
const DAY = 60 * 60 * 24

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not set in Project Settings")
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export type SessionPayload = {
  userId: string
  companyId: string
  role: "ADMIN" | "MANAGER" | "EMPLOYEE"
  email: string
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DAY * 7}s`)
    .sign(getAuthSecret())

  ;(await cookies()).set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: DAY * 7,
  })
}

export async function destroySession() {
  (await cookies()).delete(AUTH_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getAuthSecret())
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function requireSession() {
  const s = await getSession()
  if (!s) throw new Response("Unauthorized", { status: 401 })
  return s
}

// Helpers to retrieve user/company
export async function getCurrentUser() {
  const s = await requireSession()
  const sql = getSql()
  const result = await sql /* sql */`
    select id, email, role, company_id, manager_id
    from users
    where id = ${s.userId}
    limit 1
  `
  const user = Array.isArray(result) ? result[0] : (result?.rows?.[0] ?? null)
  return user
}
