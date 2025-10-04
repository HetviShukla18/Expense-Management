"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckSquare, XCircle, Loader2, Inbox, Image as ImageIcon, X } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ApprovalItem = {
  id: string
  step: number
  merchant: string
  category: string
  amount: number
  currency: string
  submitter_email: string
  receiptUrl?: string // 👈 add this if your API returns image/pdf URL
}

export default function ApprovalsList() {
  const { data, error, mutate } = useSWR("/api/approvals", fetcher, { refreshInterval: 5000 })
  const items: ApprovalItem[] = data?.items ?? []
  const isLoading = !data && !error

  const [actingOn, setActingOn] = useState<Record<string, boolean>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  // 👇 Receipt preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function act(id: string, action: "approve" | "reject") {
    setActingOn((prev) => ({ ...prev, [id]: true }))
    setActionError(null)

    try {
      const res = await fetch(`/api/expenses/${id}/${action}`, { method: "POST" })
      if (res.ok) {
        mutate()
      } else {
        const errorData = await res.json().catch(() => null)
        setActionError(errorData?.message || `Failed to ${action} the request.`)
      }
    } catch {
      setActionError("A network error occurred. Please try again.")
    } finally {
      setActingOn((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-500">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                  Pending Approvals
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Review and act on submitted expense reports.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 grid gap-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                  Loading approvals...
                </p>
              </div>
            )}
            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Inbox className="h-12 w-12 text-slate-400" />
                <p className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">
                  All caught up!
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  There are no pending approvals.
                </p>
              </div>
            )}
            {actionError && (
              <p className="text-sm text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-center">
                {actionError}
              </p>
            )}

            {items.map((e: ApprovalItem) => {
              const isActing = actingOn[e.id]
              return (
                <div
                  key={e.id}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-blue-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-lg p-4"
                >
                  <div className="sm:col-span-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {e.merchant} -{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: e.currency,
                        }).format(e.amount)}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Submitted by {e.submitter_email} for "{e.category}" (Step {e.step})
                    </p>

                    {/* 👇 View Receipt button */}
                    {e.receiptUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        onClick={() => setPreviewUrl(e.receiptUrl!)}
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Receipt
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={() => act(e.id, "reject")}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-500/70 dark:text-red-500/90 dark:hover:bg-red-900/30 w-full sm:w-auto"
                      disabled={isActing}
                    >
                      {isActing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => act(e.id, "approve")}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 w-full sm:w-auto"
                      disabled={isActing}
                    >
                      {isActing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckSquare className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* 👇 Receipt Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 text-slate-600 dark:text-slate-300 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </Button>

            {previewUrl.endsWith(".pdf") ? (
              <iframe
                src={previewUrl}
                className="w-full h-[80vh] rounded-lg"
                title="Receipt PDF"
              ></iframe>
            ) : (
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="w-full h-[80vh] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
