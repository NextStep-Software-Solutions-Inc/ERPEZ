// Procurement Activity Type from API
export type ProcurementActivityType = {
  id: string
  name: string | null
  description: string | null
  minDays: number | null
  maxDays: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

// Payload types for API requests
export type CreateProcurementActivityTypePayload = {
  name: string | null
  description: string | null
  minDays: number | null
  maxDays: number | null
}

export type UpdateProcurementActivityTypePayload = {
  name?: string | null
  description?: string | null
  minDays?: number | null
  maxDays?: number | null
  isActive?: boolean | null
}
