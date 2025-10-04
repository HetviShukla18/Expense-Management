// /app/api/auth/logout/route.ts (Next.js App Router)
import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
  // clear auth cookies here, e.g.:
  res.cookies.set("auth", "", { path: "/", httpOnly: true, secure: true, sameSite: "lax", expires: new Date(0) })
  return res
}
