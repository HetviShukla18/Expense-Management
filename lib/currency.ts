export async function fetchCountryCurrency(countryCode: string) {
  const res = await fetch(`https://restcountries.com/v3.1/all?fields=name,currencies,cca2`, { cache: "no-store" })
  const data = (await res.json()) as Array<{ name: any; currencies: Record<string, any>; cca2: string }>
  const country = data.find((c) => c.cca2 === countryCode.toUpperCase())
  if (!country) throw new Error("Invalid country code")
  const currencyCode = Object.keys(country.currencies ?? {})[0] || "USD"
  return currencyCode
}

export async function convertToBase(amount: number, fromCurrency: string, baseCurrency: string) {
  if (fromCurrency === baseCurrency) return amount
  const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, { cache: "no-store" })
  const data = await res.json()
  const rate = data.rates?.[fromCurrency]
  if (!rate) throw new Error("Unsupported currency")
  // Convert from "from" to base: amount_base = amount / rate_from_to_base
  return Number((amount / rate).toFixed(2))
}
