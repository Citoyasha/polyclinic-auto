import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Car,
  CarSnapshot,
  Customer,
  CustomerSnapshot,
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

export async function lookupCarByPlate(plate: string): Promise<Car | null> {
  const snap = await getDoc(doc(db, 'cars', plate))
  return snap.exists() ? (snap.data() as Car) : null
}

export async function setVisitStatus(
  visitId: string,
  status: VisitStatus,
): Promise<void> {
  await updateDoc(doc(db, 'visits', visitId), {
    status: status ?? null,
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
