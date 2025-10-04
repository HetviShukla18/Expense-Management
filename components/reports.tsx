"use client"

import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Reports() {
  const { data } = useSWR("/api/expenses?scope=company", fetcher)
  const items = data?.items ?? []

  // Build monthly totals in base currency
  const monthMap = new Map<string, number>()
  const categoryMap = new Map<string, number>()
  items.forEach((e: any) => {
    const month = (e.expense_date || "").slice(0, 7)
    monthMap.set(month, (monthMap.get(month) || 0) + Number(e.amount_base || 0))
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + Number(e.amount_base || 0))
  })
  const monthly = Array.from(monthMap.entries()).map(([name, total]) => ({ name, total }))
  const byCategory = Array.from(categoryMap.entries()).map(([name, total]) => ({ name, total }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spend (Base)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="oklch(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>By Category (Base)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="oklch(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
