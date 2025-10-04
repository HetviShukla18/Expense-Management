"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { da } from "date-fns/locale"

// Helper component for Mail icon
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

// Helper component for Lock icon
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        console.log(data.user);
        
        if (data.ok) {
            if (data.user) {
              console.log(data.user);
              
                localStorage.setItem("user", JSON.stringify(data.user))
            }
            window.location.href = "/dashboard";
        } else {
            setError(data.message || "An unexpected error occurred.")
        }
    } catch (err) {
        setError("Failed to connect to the server. Please try again.")
    } finally {
        setLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 px-4 py-12">
      <div className="w-full max-w-lg mx-auto">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader className="text-center space-y-2 pt-8">
            <CardTitle className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
              Sign in to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
                <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 text-base rounded-lg focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                 <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 h-12 text-base rounded-lg focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500 dark:text-red-400 animate-in fade-in-0 duration-300 text-center">
                    {error}
                </p>
              )}

              <Button disabled={loading} className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-transform transform hover:scale-105 rounded-lg" type="submit">
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 text-base">
            <p className="text-slate-600 dark:text-slate-400">New company?</p>
            <a 
              className="ml-2 font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500 transition-all hover:underline" 
              href="/signup"
            >
              Sign up
            </a>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

