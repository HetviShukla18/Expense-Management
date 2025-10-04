"use client"

import useSWR from "swr"
import { useState, useMemo } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UserPlus, Save, Users, Loader2, Settings } from "lucide-react"

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Mock AdminSettings component
const AdminSettings = () => {
  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Admin Settings
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Global configurations for the application.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 dark:text-slate-400 text-center py-6">
          Advanced settings will be available here.
        </p>
      </CardContent>
    </Card>
  )
}

// Type definitions
type User = {
  id: string
  email: string
  role: string
  manager_id?: string | null
}

type Manager = {
  id: string
  email: string
}

export default function AdminDashboard() {
  const { data, error, mutate } = useSWR("/api/admin/users", fetcher)
  const users: User[] = data?.users ?? []
  const managers: Manager[] = data?.managers ?? []
  const isLoading = !data && !error

  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("EMPLOYEE")
  const [managerId, setManagerId] = useState("none")

  async function createUser() {
    if (!email || !password) return
    setIsCreating(true)
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role,
        managerId: managerId === "none" ? null : managerId,
      }),
    })
    if (res.ok) {
      setEmail("")
      setPassword("")
      setRole("EMPLOYEE")
      setManagerId("none")
      mutate()
    } else {
      console.error("❌ Failed to create user")
      // In a real app, you'd set an error state here
    }
    setIsCreating(false)
  }

  const [editing, setEditing] = useState<
    Record<string, { role: string; managerId: string }>
  >({})

  const editVals = useMemo(() => {
    const map: Record<string, { role: string; managerId: string }> = {}
    for (const u of users) {
      map[u.id] = { role: u.role, managerId: u.manager_id ?? "none" }
    }
    return map
  }, [users])

  async function saveUser(id: string) {
    setIsSaving((prev) => ({ ...prev, [id]: true }))
    const vals = editing[id] ?? editVals[id]
    const payload = {
      ...vals,
      managerId: vals.managerId === "none" ? null : vals.managerId,
    }
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setEditing((prev) => {
        const n = { ...prev }
        delete n[id]
        return n
      })
      mutate()
    } else {
      console.error("❌ Failed to save user")
    }
    setIsSaving((prev) => ({ ...prev, [id]: false }))
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto grid gap-8">
        {/* Add User Card */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader>
             <div className="flex items-center gap-4">
               <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                 <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
               </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                  Add New User
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Provision a new account for your company.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="email-add" className="text-slate-700 dark:text-slate-300">Email</Label>
                    <Input
                        id="email-add"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="h-12 text-base rounded-lg focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-add" className="text-slate-700 dark:text-slate-300">Password</Label>
                    <Input
                        id="password-add"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 text-base rounded-lg focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-12 text-base rounded-lg focus:ring-2 focus:ring-blue-500/50">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="FINANCE">Finance</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Manager (optional)</Label>
                    <Select value={managerId} onValueChange={setManagerId}>
                        <SelectTrigger className="h-12 text-base rounded-lg focus:ring-2 focus:ring-blue-500/50">
                            <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {managers.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    {m.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={createUser} disabled={isCreating} className="h-12 px-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-transform transform hover:scale-105 rounded-lg">
                    {isCreating ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Creating...</>) : "Create User"}
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manage Users */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-500" style={{animationDelay: "100ms"}}>
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                  Manage Users
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Edit roles and reporting lines for existing users.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 grid gap-4">
            {isLoading && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            )}
            {!isLoading && users.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-center py-6">
                No users have been added yet.
              </p>
            )}

            {users.map((u) => {
              const vals = editing[u.id] ?? editVals[u.id]
              const isUserSaving = isSaving[u.id]

              return (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center bg-blue-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-lg p-4">
                  <div className="md:col-span-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{u.email}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{u.id}</p>
                  </div>

                  <div className="md:col-span-3">
                    <Select value={vals.role} onValueChange={(v) => setEditing((prev) => ({...prev, [u.id]: { ...(prev[u.id] ?? vals), role: v }}))}>
                      <SelectTrigger className="h-10 bg-white dark:bg-slate-800"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3">
                    <Select value={vals.managerId} onValueChange={(v) => setEditing((prev) => ({...prev, [u.id]: { ...(prev[u.id] ?? vals), managerId: v }}))}>
                      <SelectTrigger className="h-10 bg-white dark:bg-slate-800"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {managers.map((m) => (<SelectItem key={m.id} value={m.id}>{m.email}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end md:col-span-1">
                    <Button size="sm" onClick={() => saveUser(u.id)} disabled={isUserSaving} className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white w-full md:w-auto h-10 px-4">
                      {isUserSaving ? ( <Loader2 className="h-4 w-4 animate-spin" />) : (<Save className="h-4 w-4" />)}
                      <span className="ml-2 hidden sm:inline">{isUserSaving ? "Saving..." : "Save"}</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Settings */}
        {/* <div className="animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: "200ms" }}>
          <AdminSettings />
        </div> */}
      </div>
    </div>
  )
}
