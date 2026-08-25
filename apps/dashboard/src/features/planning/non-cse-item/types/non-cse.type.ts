export type NONCSEItem = {
    id: string
    name?: string
    description?: string
    uomId?: string
    uomName?: string
    procurementCategoryId?: string
    procurementCategoryName?: string
    itemRequestId?: string
    productCode?: string
    currentPrice?: number
    remarks?: string
    createdAt: string
    createdBy?: string
}

export type NONCSEItemDetails = NONCSEItem & {

}