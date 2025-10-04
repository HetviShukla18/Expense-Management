"use client"

import useSWR from "swr"
import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import AdminSettings from "@/components/admin-settings"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminDashboard() {
  const { data, mutate } = useSWR("/api/admin/users", fetcher)
  const users = data?.users ?? []
  const managers = data?.managers ?? []

  // Create user form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("EMPLOYEE")
  const [managerId, setManagerId] = useState<string>("none")

  async function createUser() {
    if (!email || !password) return
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, managerId: managerId === "none" ? null : managerId }),
    })
    if (res.ok) {
      setEmail("")
      setPassword("")
      setRole("EMPLOYEE")
      setManagerId("none")
      mutate()
    } else {
      alert("Failed to create user")
    }
  }

  // Inline editing for existing users
  const [editing, setEditing] = useState<Record<string, { role: string; managerId: string }>>({})
  const editVals = useMemo(() => {
    const map: Record<string, { role: string; managerId: string }> = {}
    for (const u of users) map[u.id] = { role: u.role, managerId: u.manager_id ?? "none" }
    return map
  }, [users])

  async function saveUser(id: string) {
    const vals = editing[id] ?? editVals[id]
    const payload = { ...vals, managerId: vals.managerId === "none" ? null : vals.managerId }
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
      alert("Failed to save")
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add User</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </div>
            <div>
              <label className="text-sm mb-1 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-1 block">Manager (optional)</label>
              <Select value={managerId} onValueChange={(v) => setManagerId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {managers.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.email} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={createUser}>Create User</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {users.length === 0 && <p className="text-muted-foreground">No users yet.</p>}
          {users.map((u: any) => {
            const vals = editing[u.id] ?? editVals[u.id]
            return (
              <div key={u.id} className="grid md:grid-cols-4 gap-2 items-center border rounded-md p-3">
                <div className="text-sm">
                  <div className="font-medium">{u.email}</div>
                  <div className="text-muted-foreground text-xs">{u.id}</div>
                </div>
                <div>
                  <label className="text-xs mb-1 block">Role</label>
                  <Select
                    value={vals.role}
                    onValueChange={(v) =>
                      setEditing((prev) => ({ ...prev, [u.id]: { ...(prev[u.id] ?? vals), role: v } }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs mb-1 block">Manager</label>
                  <Select
                    value={vals.managerId}
                    onValueChange={(v) =>
                      setEditing((prev) => ({ ...prev, [u.id]: { ...(prev[u.id] ?? vals), managerId: v } }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {managers.map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.email} ({m.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => saveUser(u.id)}>
                    Save
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <AdminSettings />
    </div>
  )
}
