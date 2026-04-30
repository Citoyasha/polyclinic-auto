import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { FieldLabel } from '@/components/Eyebrow'
import { normalizePhone, normalizePlate } from '@/lib/normalize'
import {
  createVisit,
  lookupCarByPlate,
  lookupCustomerByPhone,
} from '@/lib/mutations'
import type { Car, Customer } from '@/types'

interface FormValues {
  plate: string
  phone: string
  name: string
  make: string
  model: string
  color: string
  year: string
  summary: string
}

const DEFAULTS: FormValues = {
  plate: '',
  phone: '',
  name: '',
  make: '',
  model: '',
  color: '',
  year: '',
  summary: '',
}

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export interface NewVisitFormProps {
  onCancel: () => void
  onCreated: (visitId: string) => void
}

export function NewVisitForm({ onCancel, onCreated }: NewVisitFormProps) {
  const navigate = useNavigate()
  const { register, watch, setValue, getValues, handleSubmit, reset, setFocus } =
    useForm<FormValues>({ defaultValues: DEFAULTS })
  const [existingCar, setExistingCar] = useState<Car | null>(null)
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null)
  const [plateChecking, setPlateChecking] = useState(false)
  const [phoneChecking, setPhoneChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const plate = watch('plate')
  const phone = watch('phone')
  const name = watch('name')
  const summary = watch('summary')

  useEffect(() => {
    setFocus('plate')
  }, [setFocus])

  const showPhone = plate.trim().length > 0 && !existingCar
  const showNewCustomerName =
    !existingCar && !existingCustomer && phone.trim().length > 0
  const showCarFields =
    !existingCar && (existingCustomer !== null || (showNewCustomerName && name.trim().length > 0))
  const showSummary =
    existingCar !== null || existingCustomer !== null || (showCarFields && name.trim().length > 0)

  const onPlateBlur = async () => {
    const raw = getValues('plate').trim()
    if (!raw) return
    const canonical = normalizePlate(raw)
    setPlateChecking(true)
    try {
      const car = await lookupCarByPlate(canonical)
      if (car) {
        setExistingCar(car)
        if (car.customerId) {
          const customer = await lookupCustomerByPhone(car.customerId)
          if (customer) {
            setExistingCustomer(customer)
            setValue('phone', customer.rawPhone || customer.phone)
            setValue('name', customer.name)
          }
        }
        setValue('make', car.make ?? '')
        setValue('model', car.model ?? '')
        setValue('color', car.color ?? '')
        setValue('year', car.year ? String(car.year) : '')
      } else {
        setExistingCar(null)
      }
    } catch (err) {
      console.error('plate lookup', err)
    } finally {
      setPlateChecking(false)
    }
  }

  const onPhoneBlur = async () => {
    const raw = getValues('phone').trim()
    if (!raw) return
    const canonical = normalizePhone(raw)
    if (!canonical) {
      toast.error('Numéro invalide.')
      return
    }
    setPhoneChecking(true)
    try {
      const customer = await lookupCustomerByPhone(canonical)
      if (customer) {
        setExistingCustomer(customer)
        setValue('name', customer.name)
      } else {
        setExistingCustomer(null)
      }
    } catch (err) {
      console.error('phone lookup', err)
    } finally {
      setPhoneChecking(false)
    }
  }

  const canSubmit =
    plate.trim().length > 0 && summary.trim().length > 0 && !submitting

  const onSubmit = handleSubmit(async (values) => {
    const canonicalPlate = normalizePlate(values.plate)
    if (!canonicalPlate) {
      toast.error('Plaque invalide.')
      return
    }

    let canonicalPhone: string | null = null
    if (existingCar) {
      canonicalPhone = existingCar.customerId
    } else {
      canonicalPhone = normalizePhone(values.phone)
      if (!canonicalPhone) {
        toast.error('Numéro de téléphone invalide.')
        return
      }
    }

    const customerName = values.name.trim() || existingCustomer?.name || ''
    if (!customerName) {
      toast.error('Nom du client requis.')
      return
    }

    if (
      existingCar &&
      existingCar.rawPlate &&
      existingCar.rawPlate !== values.plate.trim()
    ) {
      const ok = window.confirm(
        `Cette plaque existe déjà comme « ${existingCar.rawPlate} ». Continuer ?`,
      )
      if (!ok) return
    }

    const yearNum = values.year ? parseInt(values.year, 10) : undefined

    setSubmitting(true)
    try {
      const { visitId } = await createVisit({
        plate: canonicalPlate,
        rawPlate: values.plate.trim(),
        phone: canonicalPhone,
        rawPhone: values.phone.trim() || existingCustomer?.rawPhone || canonicalPhone,
        customerName,
        make: values.make.trim() || undefined,
        model: values.model.trim() || undefined,
        color: values.color.trim() || undefined,
        year: Number.isFinite(yearNum) ? yearNum : undefined,
        summary: values.summary.trim(),
      })
      reset(DEFAULTS)
      setExistingCar(null)
      setExistingCustomer(null)
      onCreated(visitId)
      navigate(`/voiture/${encodeURIComponent(canonicalPlate)}`)
    } catch (err) {
      console.error('createVisit', err)
      toast.error('Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="px-6 pb-6 pt-5">
      <Field>
        <FieldLabel>Plaque</FieldLabel>
        <input
          {...register('plate', { onBlur: onPlateBlur })}
          autoComplete="off"
          autoCapitalize="characters"
          dir="auto"
          placeholder="123 TUN 4567"
          className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-3 font-mono text-[20px] font-semibold tracking-[1px] text-fg outline-none focus:border-accent"
        />
        {plateChecking && <Hint>Recherche…</Hint>}
        {existingCar && (
          <KnownBanner>
            <b>Voiture connue :</b>{' '}
            {[existingCar.make, existingCar.model, existingCar.color]
              .filter(Boolean)
              .join(' ')}
            {existingCustomer ? ` · ${existingCustomer.name}` : ''}
          </KnownBanner>
        )}
      </Field>

      {showPhone && (
        <Field>
          <FieldLabel>Téléphone client</FieldLabel>
          <div className="flex items-center rounded-[10px] border border-border bg-surface focus-within:border-accent">
            <span className="py-2.5 pl-3 font-mono text-[14.5px] text-fg-muted">
              +216
            </span>
            <input
              type="tel"
              inputMode="tel"
              {...register('phone', { onBlur: onPhoneBlur })}
              placeholder="22 481 902"
              autoComplete="off"
              className="flex-1 border-0 bg-transparent px-3 py-2.5 text-[14.5px] text-fg outline-none"
            />
          </div>
          {phoneChecking && <Hint>Recherche…</Hint>}
          {existingCustomer && !existingCar && (
            <KnownBanner>
              <b>Client connu :</b> {existingCustomer.name}
            </KnownBanner>
          )}
        </Field>
      )}

      {showNewCustomerName && (
        <Field>
          <FieldLabel>Nom du client</FieldLabel>
          <input
            {...register('name')}
            placeholder="Mohamed Ben Ali"
            dir="auto"
            autoComplete="off"
            className={inputCls}
          />
        </Field>
      )}

      {showCarFields && (
        <div className="mb-3.5 grid grid-cols-2 gap-2.5">
          <Field embed>
            <FieldLabel>Marque</FieldLabel>
            <input {...register('make')} placeholder="Renault" className={inputCls} />
          </Field>
          <Field embed>
            <FieldLabel>Modèle</FieldLabel>
            <input {...register('model')} placeholder="Clio" className={inputCls} />
          </Field>
          <Field embed>
            <FieldLabel>Couleur</FieldLabel>
            <input {...register('color')} placeholder="Rouge" className={inputCls} />
          </Field>
          <Field embed>
            <FieldLabel>Année</FieldLabel>
            <input
              type="number"
              inputMode="numeric"
              {...register('year')}
              placeholder="2015"
              className={inputCls}
            />
          </Field>
        </div>
      )}

      {showSummary && (
        <Field>
          <FieldLabel>Résumé</FieldLabel>
          <textarea
            {...register('summary')}
            rows={3}
            dir="auto"
            placeholder="Que faut-il faire ?"
            className={`${inputCls} min-h-[90px] resize-none leading-[1.5]`}
          />
        </Field>
      )}

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-[14.5px] font-semibold text-fg"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex flex-1 items-center justify-center rounded-xl bg-accent px-4 py-3 text-[14.5px] font-semibold text-on-accent disabled:bg-border disabled:text-fg-muted"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Créer la visite'}
        </button>
      </div>
    </form>
  )
}

function Field({
  children,
  embed,
}: {
  children: React.ReactNode
  embed?: boolean
}) {
  return <div className={embed ? '' : 'mb-3.5'}>{children}</div>
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[12px] text-fg-muted">
      <Loader2 size={12} className="animate-spin" />
      {children}
    </p>
  )
}

function KnownBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-2 flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-[13px] leading-[1.4]"
      style={{ background: 'var(--color-accent-soft)' }}
    >
      <Check size={16} strokeWidth={2.2} className="flex-none text-accent" />
      <span className="text-fg" dir="auto">
        {children}
      </span>
    </div>
  )
}
