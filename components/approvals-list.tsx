"use client"

import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ApprovalsList() {
  const { data, mutate } = useSWR("/api/approvals", fetcher, { refreshInterval: 2000 })
  const items = data?.items ?? []

  async function act(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/expenses/${id}/${action}`, { method: "POST" })
    if (res.ok) mutate()
    else alert("Failed to act")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.length === 0 && <p className="text-muted-foreground">No pending approvals.</p>}
        {items.map((e: any) => (
          <div key={e.id} className="flex items-center justify-between border rounded-md p-3">
            <div className="text-sm">
              <div className="font-medium">
                Step {e.step}: {e.merchant} • {e.category}
              </div>
              <div className="text-muted-foreground">
                {e.amount} {e.currency} — submitted by {e.submitter_email}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => act(e.id, "reject")} variant="destructive">
                Reject
              </Button>
              <Button size="sm" onClick={() => act(e.id, "approve")}>
                Approve
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
