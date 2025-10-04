"use client"

import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { FileText, Loader2, SearchX, CheckCircle, Clock, XCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ExpenseItem = {
  id: string;
  expense_date: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

// Helper to get status badge styles
const getStatusBadge = (status: ExpenseItem['status']) => {
    switch (status) {
        case 'APPROVED':
            return {
                icon: <CheckCircle className="h-4 w-4 text-green-600" />,
                text: "Approved",
                className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
            };
        case 'REJECTED':
            return {
                icon: <XCircle className="h-4 w-4 text-red-600" />,
                text: "Rejected",
                className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
            };
        case 'PENDING':
        default:
            return {
                icon: <Clock className="h-4 w-4 text-yellow-600" />,
                text: "Pending",
                className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
            };
    }
}

export default function MyExpenses() {
  const { data, error } = useSWR("/api/expenses", fetcher)
  const items: ExpenseItem[] = data?.items ?? []
  const isLoading = !data && !error

  return (
    <div className="min-h-screen w-full  dark:from-gray-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto ">
             <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                                My Expenses
                            </CardTitle>
                             <CardDescription className="text-slate-600 dark:text-slate-400">
                                A history of all your submitted expenses.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200/80 dark:border-slate-800/80 hover:bg-transparent">
                                    <TableHead className="pl-6">Date</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="pr-6 text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center p-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                                            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading your expenses...</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center p-12">
                                            <SearchX className="h-12 w-12 text-slate-400 mx-auto" />
                                            <p className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">No Expenses Found</p>
                                            <p className="text-slate-500 dark:text-slate-400">You haven't submitted any expenses yet.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {items.map((e) => {
                                    const statusInfo = getStatusBadge(e.status);
                                    return (
                                        <TableRow key={e.id} className="border-slate-200/50 dark:border-slate-800/50">
                                            <TableCell className="pl-6 font-medium text-slate-700 dark:text-slate-300">{e.expense_date?.slice(0, 10)}</TableCell>
                                            <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{e.merchant}</TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-400">{e.category}</TableCell>
                                            <TableCell className="text-right font-mono text-slate-700 dark:text-slate-300">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: e.currency }).format(e.amount)}
                                            </TableCell>
                                            <TableCell className="pr-6 text-center">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.className}`}>
                                                    {statusInfo.icon}
                                                    {statusInfo.text}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
