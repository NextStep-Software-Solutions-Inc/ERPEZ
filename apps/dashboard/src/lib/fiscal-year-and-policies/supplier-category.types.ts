export interface SupplierCategory {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export interface SupplierCategoryFormData {
  name: string
  description?: string | null
}
