import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Car,
  CarSnapshot,
  Customer,
  CustomerSnapshot,
  Visit,
  VisitStatus,
} from '@/types'

export interface CreateVisitInput {
  plate: string // canonical
  rawPlate: string
  phone: string // canonical E.164
  rawPhone: string
  customerName: string
  make?: string
  model?: string
  color?: string
  year?: number
  summary: string
}

export interface CreateVisitResult {
  visitId: string
}

export async function createVisit(input: CreateVisitInput): Promise<CreateVisitResult> {
  const customerRef = doc(db, 'customers', input.phone)
  const carRef = doc(db, 'cars', input.plate)
  const visitRef = doc(collection(db, 'visits'))

  const [customerSnap, carSnap] = await Promise.all([
    getDoc(customerRef),
    getDoc(carRef),
  ])

  const batch = writeBatch(db)
  const now = serverTimestamp()

  if (customerSnap.exists()) {
    batch.update(customerRef, {
      name: input.customerName || customerSnap.data().name,
      carIds: arrayUnion(input.plate),
      updatedAt: now,
    })
  } else {
    const newCustomer: Partial<Customer> = {
      phone: input.phone,
      rawPhone: input.rawPhone,
      name: input.customerName,
      carIds: [input.plate],
    }
    batch.set(customerRef, {
      ...newCustomer,
      createdAt: now,
      updatedAt: now,
    })
  }

  const carPayload: Partial<Car> = {
    customerId: input.phone,
    ...(input.make ? { make: input.make } : {}),
    ...(input.model ? { model: input.model } : {}),
    ...(input.color ? { color: input.color } : {}),
    ...(input.year ? { year: input.year } : {}),
  }

  if (carSnap.exists()) {
    batch.update(carRef, {
      ...carPayload,
      updatedAt: now,
    })
  } else {
    batch.set(carRef, {
      plate: input.plate,
      rawPlate: input.rawPlate,
      ...carPayload,
      createdAt: now,
      updatedAt: now,
    })
  }

  const carData = (carSnap.exists() ? carSnap.data() : null) as Car | null
  const carSnapshot: CarSnapshot = {
    plate: input.plate,
    rawPlate: input.rawPlate || carData?.rawPlate || input.plate,
    ...(input.make || carData?.make ? { make: input.make ?? carData?.make } : {}),
    ...(input.model || carData?.model ? { model: input.model ?? carData?.model } : {}),
    ...(input.color || carData?.color ? { color: input.color ?? carData?.color } : {}),
  }

  const customerData = (customerSnap.exists()
    ? customerSnap.data()
    : null) as Customer | null
  const customerSnapshot: CustomerSnapshot = {
    name: input.customerName || customerData?.name || '',
    phone: input.phone,
  }

  batch.set(visitRef, {
    carId: input.plate,
    customerId: input.phone,
    status: null,
    summary: input.summary,
    isClosed: false,
    arrivedAt: now,
    closedAt: null,
    updatedAt: now,
    carSnapshot,
    customerSnapshot,
    total: 0,
  })

  await batch.commit()
  return { visitId: visitRef.id }
}

export async function lookupCustomerByPhone(
  phone: string,
): Promise<Customer | null> {
  const snap = await getDoc(doc(db, 'customers', phone))
  return snap.exists() ? (snap.data() as Customer) : null
}

export interface CreateCustomerInput {
  phone: string // canonical E.164
  rawPhone: string
  name: string
  notes?: string
}

export async function createCustomer(input: CreateCustomerInput): Promise<void> {
  const ref = doc(db, 'customers', input.phone)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    throw new Error('Un client avec ce numéro existe déjà.')
  }
  const now = serverTimestamp()
  await setDoc(ref, {
    phone: input.phone,
    rawPhone: input.rawPhone,
    name: input.name,
    ...(input.notes ? { notes: input.notes } : {}),
    carIds: [],
    createdAt: now,
    updatedAt: now,
  })
}

export interface UpdateCustomerPatch {
  name?: string
  notes?: string
}

export async function updateCustomer(
  phone: string,
  patch: UpdateCustomerPatch,
): Promise<void> {
  await updateDoc(doc(db, 'customers', phone), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function lookupCarByPlate(plate: string): Promise<Car | null> {
  const snap = await getDoc(doc(db, 'cars', plate))
  return snap.exists() ? (snap.data() as Car) : null
}

export async function setVisitStatus(
  visitId: string,
  status: VisitStatus,
): Promise<void> {
  const isTerminated = status === 'termine'
  await updateDoc(doc(db, 'visits', visitId), {
    status: status ?? null,
    isClosed: isTerminated,
    closedAt: isTerminated ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  })
}

export async function setVisitSummary(
  visitId: string,
  summary: string,
): Promise<void> {
  await updateDoc(doc(db, 'visits', visitId), {
    summary,
    updatedAt: serverTimestamp(),
  })
}

export interface AddTaskInput {
  visitId: string
  description: string
  order: number
  nextTotal: number
}

export async function addTask(input: AddTaskInput): Promise<string> {
  const tasksRef = collection(db, 'visits', input.visitId, 'tasks')
  const ref = await addDoc(tasksRef, {
    description: input.description,
    isDone: false,
    price: 0,
    order: input.order,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'visits', input.visitId), {
    total: input.nextTotal,
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export interface UpdateTaskPatch {
  description?: string
  notes?: string
  price?: number
  isDone?: boolean
}

export async function updateTask(
  visitId: string,
  taskId: string,
  patch: UpdateTaskPatch,
  nextTotal: number,
): Promise<void> {
  const batch = writeBatch(db)
  batch.update(
    doc(db, 'visits', visitId, 'tasks', taskId),
    patch as Record<string, unknown>,
  )
  batch.update(doc(db, 'visits', visitId), {
    total: nextTotal,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function deleteTask(
  visitId: string,
  taskId: string,
  nextTotal: number,
): Promise<void> {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'visits', visitId, 'tasks', taskId))
  batch.update(doc(db, 'visits', visitId), {
    total: nextTotal,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export interface AddLineItemInput {
  visitId: string
  description: string
  quantity: number
  unitPrice: number
  order: number
  nextTotal: number
}

export async function addLineItem(input: AddLineItemInput): Promise<string> {
  const lineItemsRef = collection(db, 'visits', input.visitId, 'lineItems')
  const total = input.quantity * input.unitPrice
  const ref = await addDoc(lineItemsRef, {
    description: input.description,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    total,
    order: input.order,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'visits', input.visitId), {
    total: input.nextTotal,
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export interface UpdateLineItemPatch {
  description?: string
  quantity?: number
  unitPrice?: number
  total?: number
}

export async function updateLineItem(
  visitId: string,
  lineItemId: string,
  patch: UpdateLineItemPatch,
  nextTotal: number,
): Promise<void> {
  const batch = writeBatch(db)
  batch.update(
    doc(db, 'visits', visitId, 'lineItems', lineItemId),
    patch as Record<string, unknown>,
  )
  batch.update(doc(db, 'visits', visitId), {
    total: nextTotal,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function deleteLineItem(
  visitId: string,
  lineItemId: string,
  nextTotal: number,
): Promise<void> {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'visits', visitId, 'lineItems', lineItemId))
  batch.update(doc(db, 'visits', visitId), {
    total: nextTotal,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export interface AddPhotoInput {
  visitId: string
  url: string
  publicId: string
  tag: 'avant' | 'apres'
  width: number
  height: number
  sizeBytes: number
}

export async function addPhoto(input: AddPhotoInput): Promise<string> {
  const photosRef = collection(db, 'visits', input.visitId, 'photos')
  const ref = await addDoc(photosRef, {
    url: input.url,
    publicId: input.publicId,
    tag: input.tag,
    width: input.width,
    height: input.height,
    sizeBytes: input.sizeBytes,
    uploadedAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'visits', input.visitId), {
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePhotoTag(
  visitId: string,
  photoId: string,
  tag: 'avant' | 'apres',
): Promise<void> {
  await updateDoc(doc(db, 'visits', visitId, 'photos', photoId), { tag })
  await updateDoc(doc(db, 'visits', visitId), {
    updatedAt: serverTimestamp(),
  })
}

// TODO: also delete the asset on Cloudinary. Requires a Cloud Function with
// the API secret — can't be done from the browser. Currently the asset is
// orphaned in Cloudinary; harmless at our scale but should be cleaned up.
export async function deletePhoto(
  visitId: string,
  photoId: string,
): Promise<void> {
  await deleteDoc(doc(db, 'visits', visitId, 'photos', photoId))
  await updateDoc(doc(db, 'visits', visitId), {
    updatedAt: serverTimestamp(),
  })
}

export interface CreateInventoryItemInput {
  name: string
  type: 'piece' | 'fluide'
  unit: string
  initialStock: number
  lowStockThreshold: number
}

export async function createInventoryItem(
  input: CreateInventoryItemInput,
  userEmail = '',
): Promise<string> {
  const ref = doc(collection(db, 'inventory'))
  const now = serverTimestamp()
  const batch = writeBatch(db)
  batch.set(ref, {
    name: input.name,
    type: input.type,
    unit: input.unit,
    currentStock: input.initialStock,
    lowStockThreshold: input.lowStockThreshold,
    createdAt: now,
    updatedAt: now,
  })
  if (input.initialStock !== 0) {
    const movRef = doc(collection(db, 'inventoryMovements'))
    batch.set(movRef, {
      itemId: ref.id,
      delta: input.initialStock,
      note: 'Stock initial',
      createdAt: now,
      userEmail,
    })
  }
  await batch.commit()
  return ref.id
}

export interface UpdateInventoryItemPatch {
  name?: string
  unit?: string
  lowStockThreshold?: number
}

export async function updateInventoryItem(
  itemId: string,
  patch: UpdateInventoryItemPatch,
): Promise<void> {
  await updateDoc(doc(db, 'inventory', itemId), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'inventory', itemId))
}

export interface AdjustStockInput {
  itemId: string
  delta: number
  currentStock: number
  note?: string
  userEmail?: string
}

export async function adjustStock(input: AdjustStockInput): Promise<void> {
  const batch = writeBatch(db)
  const itemRef = doc(db, 'inventory', input.itemId)
  const movRef = doc(collection(db, 'inventoryMovements'))
  const next = input.currentStock + input.delta
  batch.update(itemRef, {
    currentStock: next,
    updatedAt: serverTimestamp(),
  })
  batch.set(movRef, {
    itemId: input.itemId,
    delta: input.delta,
    ...(input.note?.trim() ? { note: input.note.trim() } : {}),
    createdAt: serverTimestamp(),
    userEmail: input.userEmail ?? '',
  })
  await batch.commit()
}

// ---- User profile (mirrors Firebase Auth into Firestore for the upcoming
// assignee picker; everyone has full access for now per the spec) ----

export async function upsertUserProfile(input: {
  uid: string
  email: string
  displayName?: string
}): Promise<void> {
  await setDoc(
    doc(db, 'users', input.uid),
    {
      uid: input.uid,
      email: input.email,
      ...(input.displayName ? { displayName: input.displayName } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function updateUserProfile(
  uid: string,
  displayName: string,
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    { displayName, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

// ---- Car edit / migrate / cascade-delete ----

export interface UpdateCarPatch {
  rawPlate?: string
  make?: string
  model?: string
  color?: string
  year?: number | null
}

function pruneCarPatch(patch: UpdateCarPatch): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (patch.rawPlate !== undefined) out.rawPlate = patch.rawPlate
  if (patch.make !== undefined) out.make = patch.make
  if (patch.model !== undefined) out.model = patch.model
  if (patch.color !== undefined) out.color = patch.color
  if (patch.year !== undefined) out.year = patch.year
  return out
}

function snapshotPatchFromCar(patch: UpdateCarPatch): Partial<CarSnapshot> {
  // Only the fields that exist on CarSnapshot — year is not on the snapshot.
  const out: Partial<CarSnapshot> = {}
  if (patch.rawPlate !== undefined) out.rawPlate = patch.rawPlate
  if (patch.make !== undefined) out.make = patch.make
  if (patch.model !== undefined) out.model = patch.model
  if (patch.color !== undefined) out.color = patch.color
  return out
}

export async function updateCar(
  plate: string,
  patch: UpdateCarPatch,
): Promise<void> {
  const carRef = doc(db, 'cars', plate)
  const visitsSnap = await getDocs(
    query(collection(db, 'visits'), where('carId', '==', plate)),
  )
  const carPatch = pruneCarPatch(patch)
  const snapPatch = snapshotPatchFromCar(patch)
  const batch = writeBatch(db)
  batch.update(carRef, { ...carPatch, updatedAt: serverTimestamp() })
  if (Object.keys(snapPatch).length > 0) {
    visitsSnap.docs.forEach((v) => {
      const existing = (v.data() as Visit).carSnapshot ?? ({} as CarSnapshot)
      batch.update(v.ref, {
        carSnapshot: { ...existing, ...snapPatch },
        updatedAt: serverTimestamp(),
      })
    })
  }
  await batch.commit()
}

export async function migrateCarPlate(
  oldPlate: string,
  newPlate: string,
  newRawPlate: string,
  patch: UpdateCarPatch = {},
): Promise<void> {
  if (oldPlate === newPlate) {
    return updateCar(oldPlate, { ...patch, rawPlate: newRawPlate })
  }

  const [oldSnap, newSnap, visitsSnap] = await Promise.all([
    getDoc(doc(db, 'cars', oldPlate)),
    getDoc(doc(db, 'cars', newPlate)),
    getDocs(query(collection(db, 'visits'), where('carId', '==', oldPlate))),
  ])

  if (!oldSnap.exists()) {
    throw new Error('Voiture introuvable.')
  }
  if (newSnap.exists()) {
    throw new Error('Cette plaque est déjà enregistrée pour une autre voiture.')
  }

  const oldCar = oldSnap.data() as Car
  const customerRef = doc(db, 'customers', oldCar.customerId)
  const customerSnap = await getDoc(customerRef)
  const carIds: string[] =
    (customerSnap.exists() ? (customerSnap.data() as Customer).carIds : []) ?? []
  const nextCarIds = [
    ...carIds.filter((p) => p !== oldPlate),
    newPlate,
  ]

  const batch = writeBatch(db)

  // 1. Create new car doc
  const merged: Record<string, unknown> = {
    ...oldCar,
    plate: newPlate,
    rawPlate: newRawPlate,
    ...pruneCarPatch(patch),
    updatedAt: serverTimestamp(),
  }
  // createdAt is preserved from oldCar (Timestamp) so the doc keeps its history
  batch.set(doc(db, 'cars', newPlate), merged)

  // 2. Update every visit's carId + carSnapshot
  const snapPatch = snapshotPatchFromCar(patch)
  visitsSnap.docs.forEach((v) => {
    const existing = (v.data() as Visit).carSnapshot ?? ({} as CarSnapshot)
    batch.update(v.ref, {
      carId: newPlate,
      carSnapshot: {
        ...existing,
        ...snapPatch,
        plate: newPlate,
        rawPlate: newRawPlate,
      },
      updatedAt: serverTimestamp(),
    })
  })

  // 3. Update customer's carIds (replace old with new)
  if (customerSnap.exists()) {
    batch.update(customerRef, {
      carIds: nextCarIds,
      updatedAt: serverTimestamp(),
    })
  }

  // 4. Delete the old car doc
  batch.delete(doc(db, 'cars', oldPlate))

  await batch.commit()
}

// Cascade-delete a car: removes its Firestore docs (car + visits + every
// visit's tasks/lineItems/photos subdocs) and detaches the customer.
// Cloudinary photo assets are intentionally left orphaned — see the TODO at
// `deletePhoto`. At our scale (~80 cars/month) the storage leak is negligible.
export async function deleteCar(plate: string): Promise<void> {
  const [carSnap, visitsSnap] = await Promise.all([
    getDoc(doc(db, 'cars', plate)),
    getDocs(query(collection(db, 'visits'), where('carId', '==', plate))),
  ])
  if (!carSnap.exists()) {
    throw new Error('Voiture introuvable.')
  }
  const customerId = (carSnap.data() as Car).customerId

  // Fetch every subcollection in parallel for each visit.
  const subDocs = await Promise.all(
    visitsSnap.docs.map((v) =>
      Promise.all([
        getDocs(collection(db, 'visits', v.id, 'tasks')),
        getDocs(collection(db, 'visits', v.id, 'lineItems')),
        getDocs(collection(db, 'visits', v.id, 'photos')),
      ]),
    ),
  )

  const batch = writeBatch(db)
  visitsSnap.docs.forEach((v, i) => {
    const [tasks, lineItems, photos] = subDocs[i]
    tasks.docs.forEach((d) => batch.delete(d.ref))
    lineItems.docs.forEach((d) => batch.delete(d.ref))
    photos.docs.forEach((d) => batch.delete(d.ref))
    batch.delete(v.ref)
  })

  if (customerId) {
    const customerRef = doc(db, 'customers', customerId)
    const customerSnap = await getDoc(customerRef)
    if (customerSnap.exists()) {
      const carIds: string[] =
        (customerSnap.data() as Customer).carIds ?? []
      batch.update(customerRef, {
        carIds: carIds.filter((p) => p !== plate),
        updatedAt: serverTimestamp(),
      })
    }
  }

  batch.delete(doc(db, 'cars', plate))
  await batch.commit()
}
