import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatTND(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} TND`
}

export function formatDate(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: fr })
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { locale: fr, addSuffix: true })
}
