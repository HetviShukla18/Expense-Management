"use client"

import { ArrowRight, BarChart2, CheckCircle, FileText } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  // We'll default to the logged-out view in this environment,
  // as session cannot be checked server-side here.
  const [session, setSession] = useState(false)

  // This is a mock redirect for demonstration.
  // In a real Next.js app, the initial server-side check would handle this.
  useEffect(() => {
    // To test the redirect, you can manually set session to true
    // For example: setSession(true);
    if (session) {
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    }
  }, [session])

  if (session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 p-4">
        <div className="text-center animate-in fade-in-0 zoom-in-95 duration-500">
           <svg className="mx-auto h-16 w-16 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200 sm:text-4xl">
            You're Signed In!
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Redirecting you to your dashboard now...
          </p>
           <div className="mt-8">
                <div role="status">
                    <svg aria-hidden="true" className="inline w-10 h-10 text-slate-200 animate-spin dark:text-slate-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 text-slate-800 dark:text-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-8 text-center animate-in fade-in-0 duration-700">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to <span className="text-blue-600 dark:text-blue-400">Expense Manager</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Submit, approve, and analyze expenses with multi-level workflows, OCR receipt parsing, and real-time currency conversion.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="/login" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Login <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a href="/signup" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg ring-1 ring-slate-300 transition-transform duration-300 hover:scale-105 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
              Create your company
            </a>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-16 sm:py-24">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 text-center">
                <div className="flex flex-col items-center p-6 animate-in fade-in-0 zoom-in-95 duration-500" style={{animationDelay: '200ms'}}>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full">
                        <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">Smart OCR Parsing</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Automatically extract details from your receipts with our intelligent OCR technology.</p>
                </div>
                 <div className="flex flex-col items-center p-6 animate-in fade-in-0 zoom-in-95 duration-500" style={{animationDelay: '400ms'}}>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full">
                        <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">Approval Workflows</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Customize multi-level approval chains to fit your company's unique structure.</p>
                </div>
                 <div className="flex flex-col items-center p-6 animate-in fade-in-0 zoom-in-95 duration-500" style={{animationDelay: '600ms'}}>
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full">
                        <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">Insightful Reports</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Gain a clear view of your company's spending with real-time, detailed reports.</p>
                </div>
            </div>
        </section>
      </div>
    </main>
  )
}
