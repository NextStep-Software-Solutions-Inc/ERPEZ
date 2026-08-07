import {
  ScaleType,
  type RatingLevel,
  type RatingScaleTemplate,
  type RatingScaleTemplateFormValues,
  type RatingScaleTemplateResponse,
  type RatingScaleLevelRequest,
  type CreateRatingScaleTemplatePayload,
  type UpdateRatingScaleTemplatePayload,
} from './types'

const ratingOrder = [5, 4, 3, 2, 1] as const

const toNullableString = (value: string | undefined) => {
  const normalizedValue = value?.trim()
  return normalizedValue ? normalizedValue : null
}

const mapLevelFromResponse = (
  template: RatingScaleTemplateResponse,
  rating: RatingLevel['rating'],
): RatingLevel => {
  const levels = template.ratingScaleLevels || template.RatingScaleLevels
  const level = levels?.find(
    (item) => item.ratingValue === rating,
  )

  return {
    rating,
    description: level?.description ?? '',
    minRange: level?.minValue ?? undefined,
    maxRange: level?.maxValue ?? undefined,
  }
}

const mapLevelToRequest = (
  level: RatingLevel,
  isFixed: boolean,
): RatingScaleLevelRequest => ({
  ratingValue: level.rating,
  description: level.description.trim(),
  minValue: isFixed ? null : (level.minRange ?? null),
  maxValue: isFixed ? null : (level.maxRange ?? null),
})

export const mapRatingScaleTemplateResponse = (
  template: RatingScaleTemplateResponse,
): RatingScaleTemplate => ({
  id: template.id,
  name: template.name ?? '',
  description: template.description ?? undefined,
  scaleType: template.isFixed ? ScaleType.FIXED : ScaleType.NON_FIXED,
  generalRatingScaleId: template.generalRatingScaleId ?? undefined,
  rating5: mapLevelFromResponse(template, 5),
  rating4: mapLevelFromResponse(template, 4),
  rating3: mapLevelFromResponse(template, 3),
  rating2: mapLevelFromResponse(template, 2),
  rating1: mapLevelFromResponse(template, 1),
  isDefault: template.isDefault,
  isReadOnly: template.isDefault,
  author: template.createdBy ?? undefined,
  usageCount: template.usageCount ?? undefined,
  createdAt: template.createdAt,
  updatedAt: template.updatedAt ?? template.createdAt,
})

export const mapRatingScaleTemplateResponses = (
  templates: RatingScaleTemplateResponse[] | null | undefined,
) => (templates ?? []).map(mapRatingScaleTemplateResponse)

export const mapTemplateFormValuesToCreatePayload = (
  values: RatingScaleTemplateFormValues,
): CreateRatingScaleTemplatePayload => {
  const isFixed = values.scaleType === ScaleType.FIXED

  return {
    name: values.name.trim(),
    description: toNullableString(values.description),
    isFixed,
    isDefault: false,
    generalRatingScaleId: null,
    ratingScaleLevels: ratingOrder.map((rating) =>
      mapLevelToRequest(values[`rating${rating}` as const], isFixed),
    ),
  }
}

export const mapTemplateFormValuesToUpdatePayload = (
  values: RatingScaleTemplateFormValues,
  isDefault = false,
): UpdateRatingScaleTemplatePayload => {
  const isFixed = values.scaleType === ScaleType.FIXED
  return {
    name: values.name.trim(),
    description: toNullableString(values.description),
    isFixed,
    isDefault,
    ratingScaleLevels: ratingOrder.map((rating) =>
      mapLevelToRequest(values[`rating${rating}` as const], isFixed),
    ),
  }
}
