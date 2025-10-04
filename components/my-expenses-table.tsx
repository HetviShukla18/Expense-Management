"use client"

import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MyExpenses() {
  const { data } = useSWR("/api/expenses", fetcher)
  const items = data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((e: any) => (
              <TableRow key={e.id}>
                <TableCell>{e.expense_date?.slice(0, 10)}</TableCell>
                <TableCell>{e.merchant}</TableCell>
                <TableCell>{e.category}</TableCell>
                <TableCell>{`${e.amount} ${e.currency}`}</TableCell>
                <TableCell>{e.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
