"use client"

import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminSettings() {
  const { data, mutate } = useSWR("/api/admin/rules", fetcher)
  const rule = data?.rule
  const [type, setType] = useState<string>(rule?.rule_type || "PERCENTAGE")
  const [percentage, setPercentage] = useState<string>(rule?.percentage?.toString() || "60")
  const [specific, setSpecific] = useState<string>(rule?.specific_approver_user_id || "")

  async function saveRule() {
    const res = await fetch("/api/admin/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ruleType: type,
        percentage: percentage ? Number(percentage) : null,
        specificApproverUserId: specific || null,
      }),
    })
    if (res.ok) mutate()
    else alert("Failed to save rule")
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Approval Rules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Rule Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="SPECIFIC">Specific Approver</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-1 block">Percentage (if applicable)</label>
              <Input placeholder="60" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm mb-1 block">Specific Approver User ID (optional)</label>
            <Input
              placeholder="UUID of CFO or approver"
              value={specific}
              onChange={(e) => setSpecific(e.target.value)}
            />
          </div>
          <Button onClick={saveRule}>Save Rule</Button>
        </CardContent>
      </Card>
    </div>
  )
}
