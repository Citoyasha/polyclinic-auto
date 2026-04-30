import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { FieldLabel } from '@/components/Eyebrow'
import { PlateInput, isValidTunisianPlate } from '@/components/PlateInput'
import {
  lookupCarByPlate,
  migrateCarPlate,
  updateCar,
  type UpdateCarPatch,
} from '@/lib/mutations'
import { normalizePlate } from '@/lib/normalize'
import type { Car } from '@/types'

const inputCls =
  'w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[14.5px] text-fg outline-none focus:border-accent'

export function EditCarSheet({
  open,
  onOpenChange,
  car,
  onMigrated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  car: Car | null
  onMigrated: (newPlate: string) => void
}) {
  const [plate, setPlate] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [year, setYear] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open && car) {
      setPlate(car.rawPlate || car.plate)
      setMake(car.make ?? '')
      setModel(car.model ?? '')
      setColor(car.color ?? '')
      setYear(car.year ? String(car.year) : '')
    }
  }, [open, car])

  const submit = async () => {
    if (!car) return
    if (!isValidTunisianPlate(plate)) {
      toast.error('Plaque incomplète : 3 chiffres + TUN + 4 chiffres.')
      return
    }
    const newCanonical = normalizePlate(plate)
    const newRawPlate = plate.trim()
    const yearNum = year.trim() ? parseInt(year, 10) : undefined
    const patch: UpdateCarPatch = {
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      color: color.trim() || undefined,
      year: Number.isFinite(yearNum) ? yearNum : null,
    }

    setBusy(true)
    try {
      if (newCanonical === car.plate) {
        await updateCar(car.plate, { ...patch, rawPlate: newRawPlate })
        toast.success('Voiture mise à jour')
        onOpenChange(false)
        return
      }
      // Plate migration
      const collision = await lookupCarByPlate(newCanonical)
      if (collision) {
        toast.error('Cette plaque est déjà enregistrée pour une autre voiture.')
        return
      }
      await migrateCarPlate(car.plate, newCanonical, newRawPlate, patch)
      toast.success('Plaque modifiée')
      onOpenChange(false)
      onMigrated(newCanonical)
    } catch (err) {
      console.error('updateCar', err)
      const msg = err instanceof Error ? err.message : 'Erreur de synchronisation'
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Modifier la voiture">
        <div className="px-6 pb-6 pt-2">
          <div className="mb-3.5">
            <FieldLabel>Plaque</FieldLabel>
            <PlateInput value={plate} onChange={setPlate} disabled={busy} />
          </div>

          <div className="mb-3.5 grid grid-cols-2 gap-2.5">
            <div>
              <FieldLabel>Marque</FieldLabel>
              <input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Renault"
                autoComplete="off"
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel>Modèle</FieldLabel>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Clio"
                autoComplete="off"
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel>Couleur</FieldLabel>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Rouge"
                autoComplete="off"
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel>Année</FieldLabel>
              <input
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2015"
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="flex-1 rounded-[10px] border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-fg"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="flex flex-1 items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-[14px] font-semibold text-on-accent disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
