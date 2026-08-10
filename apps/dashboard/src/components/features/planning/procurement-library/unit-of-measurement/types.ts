/**
 * API-aligned types for Unit of Measurement
 * These match the backend API contract exactly.
 */

export interface UOMApiItem {
  id: string
  name: string | null
  code: string | null
  description: string | null
  conversionFactor: number | null
  isActive: boolean
  parentId: string | null
  parentName: string | null
  createdAt: string
  updatedAt: string | null
}

export interface CreateUOMPayload {
  name: string | null
  code: string | null
  conversionFactor: number | null
  parentId: string | null
}

export interface UpdateUOMPayload {
  name: string | null
  code: string | null
  conversionFactor: number | null
  parentId: string | null
}
