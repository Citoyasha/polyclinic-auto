import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function normalizePlate(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/تونس/g, 'TUN')
    .replace(/\s+/g, '')
}

export function normalizePhone(input: string): string | null {
  const parsed = parsePhoneNumberFromString(input, 'TN')
  if (!parsed || !parsed.isValid()) return null
  return parsed.number
}
