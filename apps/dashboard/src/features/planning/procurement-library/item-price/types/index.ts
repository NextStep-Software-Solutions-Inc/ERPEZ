export type ItemPriceListItem = {
  id: string
  unitPrice: number
  procurementItemId: string
  procurementItemName: string | null
  fiscalYearId: string
  fiscalYearYear: string | null
  createdAt: string
  updatedAt: string | null
}

export type ItemPriceProcurementItem = {
  id: string
  name: string | null
  specifications: string | null
  type: string | null
  productCode: string | null
}

export type ItemPriceFiscalYear = {
  id: string
  year: string | null
}

export type ItemPrice = ItemPriceListItem & {
  procurementItem?: ItemPriceProcurementItem | null
  fiscalYear?: ItemPriceFiscalYear | null
}

export type CreateItemPricePayload = {
  procurementItemId: string
  fiscalYearId: string
  unitPrice: number
}

export type UpdateItemPricePayload = {
  procurementItemId: string
  fiscalYearId: string
  unitPrice: number
}

export type ItemPriceQueryParams = {
  search?: string
  fiscalYearId?: string
  procurementItemId?: string
  page?: number
  pageSize?: number
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'unitPrice'
    | 'procurementItemName'
    | 'fiscalYearYear'
  sortDir?: 'asc' | 'desc'
}

export type ItemPriceComparison = {
  id: string
  previousPrice: number
  currentPrice: number
  changedAt: string
  percentageChange: number
}
