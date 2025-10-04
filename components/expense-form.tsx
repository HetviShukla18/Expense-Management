"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { DollarSign, Calendar, Building, FileText, UploadCloud, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
// import Tesseract from "tesseract.js" // This line is removed to fix the error

// Custom Toast component
const Toast = ({ message, type, onDismiss }: { message: string, type: 'success' | 'error', onDismiss: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg animate-in fade-in-0 slide-in-from-top-5 duration-500 ${type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
            {type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
            <span>{message}</span>
        </div>
    );
};


export default function ExpenseComposer() {
  const [file, setFile] = useState<File | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")
  const [category, setCategory] = useState<string>("Meals")
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [merchant, setMerchant] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [currencies, setCurrencies] = useState<string[]>([])
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)


  // Common categories
  const categories = ["Meals", "Travel", "Accommodation", "Office Supplies", "Transportation", "Entertainment", "Utilities", "Software", "Others"]

  // Load Tesseract.js script dynamically
  useEffect(() => {
    const scriptId = 'tesseract-script';
    if (document.getElementById(scriptId)) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) document.head.removeChild(existingScript);
    };
  }, []);

  // Fetch currencies
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=currencies")
        const data = await res.json()
        const unique = new Set<string>()
        data.forEach((country: any) => {
          if (country.currencies) {
            Object.keys(country.currencies).forEach((c) => unique.add(c))
          }
        })
        setCurrencies(Array.from(unique).sort())
      } catch {
        setCurrencies(["USD", "EUR", "INR", "GBP", "JPY"])
      }
    }
    fetchCurrencies()
  }, [])

  // OCR extraction
  async function runOCR(f: File) {
    // @ts-ignore
    if (typeof window.Tesseract === 'undefined') {
        setToast({ message: "OCR library is loading, please try again in a moment.", type: 'error' });
        return;
    }
    setOcrLoading(true)
    try {
        // @ts-ignore
        const { data } = await window.Tesseract.recognize(f, "eng", {
            logger: (m: any) => console.log(m) 
        });
        const text = data.text || ""
        if (!amount) {
            const amtMatch = text.match(/(\d+[.,]\d{2})/)
            if (amtMatch) setAmount(amtMatch[1].replace(",", "."))
        }
        if (!date || date === new Date().toISOString().slice(0, 10)) {
            const dateMatch = text.match(/(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})|(\w+\s\d{1,2},?\s\d{4})/);
            if (dateMatch) {
                try {
                    setDate(new Date(dateMatch[0].replace(/\//g, '-')).toISOString().slice(0, 10));
                } catch(e) { /* ignore invalid dates */ }
            }
        }
        if (!merchant) {
            const merchMatch = text.split("\n").find((l: { trim: () => { (): any; new(): any; length: number } }) => l.trim().length > 3)
            if (merchMatch) setMerchant(merchMatch.trim())
        }
        setToast({ message: "Receipt scanned successfully!", type: 'success' });
    } catch (error) {
        setToast({ message: "OCR failed to extract data.", type: 'error' });
    } finally {
        setOcrLoading(false)
    }
  }

  // Upload receipt
  async function uploadReceipt() {
    if (!file) return null
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: form })
    if (!res.ok) throw new Error("Receipt upload failed.")
    const data = await res.json()
    return data.url as string
  }

  // Submit form
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setToast(null)
    try {
      const receiptUrl = await uploadReceipt()
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          category,
          date,
          merchant,
          description,
          receiptUrl,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to submit expense.")
      }
      setFile(null); setAmount(""); setMerchant(""); setDescription("");
      setToast({ message: "Expense submitted successfully!", type: 'success' })
    } catch (err: any) {
        setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full  dark:from-gray-900 dark:to-slate-800 p-4 sm:p-6 md:p-8">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        <div className="max-w-4xl mx-auto">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-500">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                                Submit Expense
                            </CardTitle>
                             <CardDescription className="text-slate-600 dark:text-slate-400">
                                Fill out the details below or upload a receipt to get started.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={onSubmit} className="grid gap-6">
                        
                        {/* Receipt Upload */}
                        <div className="space-y-2">
                             <Label>Receipt</Label>
                             <label htmlFor="receipt-upload" className="group cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {ocrLoading ? (<Loader2 className="h-8 w-8 text-blue-500 animate-spin" />) : (<UploadCloud className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400 group-hover:text-blue-600" />)}
                                    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
                                        {file ? <span className="font-semibold text-green-600">{file.name}</span> : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, PDF (MAX. 5MB)</p>
                                </div>
                                <Input id="receipt-upload" type="file" className="hidden" accept="image/*,application/pdf"
                                    onChange={async (e) => {
                                        const f = e.target.files?.[0] || null
                                        setFile(f)
                                        if (f) await runOCR(f)
                                    }}
                                />
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Amount & Currency */}
                             <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <div className="relative">
                                        {/* <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> */}
                                        <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="pl-10 h-12 text-base rounded-lg"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="h-12 text-base rounded-lg"><SelectValue/></SelectTrigger>
                                        <SelectContent className="max-h-72"><>
                                            {currencies.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                                        </></SelectContent>
                                    </Select>
                                </div>
                             </div>

                             {/* Merchant */}
                             <div className="space-y-2">
                                <Label htmlFor="merchant">Merchant</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input id="merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Starbucks" className="pl-10 h-12 text-base rounded-lg"/>
                                </div>
                             </div>

                            {/* Category & Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-12 text-base rounded-lg"><SelectValue/></SelectTrigger>
                                        <SelectContent><>
                                            {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                                        </></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <div className="relative">
                                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                         <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10 h-12 text-base rounded-lg"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                             <Label htmlFor="description">Description</Label>
                             <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes about the expense (e.g. client lunch with John Doe)" className="text-base rounded-lg"/>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button disabled={loading || ocrLoading} type="submit" className="h-12 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-transform transform hover:scale-105 rounded-lg">
                                {loading ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Submitting...</>) : "Submit Expense"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
