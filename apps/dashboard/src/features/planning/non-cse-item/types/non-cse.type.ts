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
    imageURL?: string
    imageUrl?: string
    availableStock?: number
    stockOnHand?: number
    remarks?: string
    type?: string
    createdAt: string
    createdBy?: string
}

export type NONCSEItemDetails = NONCSEItem & {

}