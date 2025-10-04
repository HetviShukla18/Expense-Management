"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import Tesseract from "tesseract.js"

export default function ExpenseComposer() {
  const [file, setFile] = useState<File | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")
  const [category, setCategory] = useState<string>("Meals")
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [merchant, setMerchant] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [currencies, setCurrencies] = useState<string[]>([])

  // 📘 Common categories (you can expand as needed)
  const categories = [
    "Meals",
    "Travel",
    "Accommodation",
    "Office Supplies",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Software",
    "Others",
  ]

  // 🔄 Fetch full list of world currencies
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=currencies"
        )
        const data = await res.json()
        const unique = new Set<string>()
        data.forEach((country: any) => {
          if (country.currencies) {
            Object.keys(country.currencies).forEach((c) => unique.add(c))
          }
        })
        setCurrencies(Array.from(unique).sort())
      } catch {
        // fallback if API fails
        setCurrencies(["USD", "EUR", "INR", "GBP", "JPY"])
      }
    }
    fetchCurrencies()
  }, [])

  // 🧠 OCR extraction
  async function runOCR(f: File) {
    const { data } = await Tesseract.recognize(f, "eng")
    const text = data.text || ""
    const amtMatch = text.match(/(\d+[.,]\d{2})/)
    if (amtMatch && !amount) setAmount(amtMatch[1].replace(",", "."))
    const dateMatch = text.match(
      /(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})/
    )
    if (dateMatch && !date) setDate(dateMatch[0].replace(/\//g, "-"))
    const merchMatch = text.split("\n").find((l) => l.trim().length > 3)
    if (merchMatch && !merchant) setMerchant(merchMatch.trim())
  }

  async function uploadReceipt() {
    if (!file) return null
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: form })
    if (!res.ok) throw new Error("Upload failed")
    const data = await res.json()
    return data.url as string
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
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
      if (!res.ok) throw new Error("Failed to submit expense")
      // reset
      setFile(null)
      setAmount("")
      setMerchant("")
      setDescription("")
      alert("Expense submitted!")
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 💵 Amount */}
            <div>
              <Label>Amount</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* 🌍 Currency Dropdown */}
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-72 overflow-auto">
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 🧾 Category Dropdown */}
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 📅 Date */}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* 🏪 Merchant */}
          <div className="grid gap-2">
            <Label>Merchant</Label>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Merchant name"
            />
          </div>

          {/* 📝 Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          {/* 📸 Receipt Upload */}
          <div className="grid gap-2">
            <Label>Receipt</Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={async (e) => {
                const f = e.target.files?.[0] || null
                setFile(f)
                if (f) await runOCR(f)
              }}
            />
          </div>

          <Button disabled={loading}>
            {loading ? "Submitting..." : "Submit Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
