import type { PurchaseRequest } from '../types'

type TorCategoryLike = {
  name?: string | null
  torRequired?: boolean | null
  isHighlyTechnicalGoodsServices?: boolean | null
}

const LEGACY_TOR_CATEGORY_NAMES = new Set([
  'consulting services',
  'it infrastructure',
  'security services',
])

function normalizeCategoryName(name?: string | null) {
  return name?.trim().toLowerCase() ?? ''
}

export function categoryRequiresTorAttachment(
  category?: TorCategoryLike | null,
) {
  if (!category) {
    return false
  }

  const categoryName = normalizeCategoryName(category.name)

  return Boolean(
    category.torRequired ||
      category.isHighlyTechnicalGoodsServices ||
      LEGACY_TOR_CATEGORY_NAMES.has(categoryName),
  )
}

export function purchaseRequestRequiresTor(
  purchaseRequest: Pick<PurchaseRequest, 'headerDetails'>,
) {
  return categoryRequiresTorAttachment({
    name: purchaseRequest.headerDetails.procurementCategoryName,
    torRequired: purchaseRequest.headerDetails.torRequired,
    isHighlyTechnicalGoodsServices:
      purchaseRequest.headerDetails.isHighlyTechnicalGoodsServices,
  })
}
