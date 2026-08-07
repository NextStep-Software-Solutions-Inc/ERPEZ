import api from '@/services/api'

type ApiListResponse<T> =
  | T[]
  | {
      data?: T[] | null
      items?: T[] | null
    }

type ApiEntityResponse<T> =
  | T
  | {
      data?: T | null
    }

export interface OpcrItemRating {
  id: string
  opcrItemId: string
  fyActiveKPIMeasurementId: string
  dimension: string
  selfRating: number | null
  pmtRating?: number | null
  pmtRemark?: string | null
  createdAt?: string
  createdBy?: string | null
}

export interface CreateOrUpdateRatingPayload {
  opcrItemId: string
  fyActiveKPIMeasurementId: string
  selfRating?: number | null
  pmtRating?: number | null
  pmtRemark?: string | null
}

function unwrapListResponse<T>(
  payload: ApiListResponse<T> | null | undefined,
): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray((payload as any)?.data)) return (payload as any).data
  if (Array.isArray((payload as any)?.items)) return (payload as any).items
  return []
}

function unwrapEntityResponse<T>(payload: ApiEntityResponse<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as any).data
  ) {
    return (payload as any).data
  }
  return payload as T
}

/** GET /opcrs/items/:itemId/ratings */
export async function getOpcrItemRatings(
  itemId: string,
): Promise<OpcrItemRating[]> {
  const response = await api.get<ApiListResponse<OpcrItemRating>>(
    `/opcrs/items/${itemId}/ratings`,
  )
  return unwrapListResponse(response.data)
}

/**
 * POST /opcrs/items/:itemId/ratings
 * Creates a new rating record. Used for self-rating (selfRating field).
 * NOTE: The backend returns 400 if a record already exists for the same
 * opcrItemId + fyActiveKPIMeasurementId combination.
 * A PATCH /opcrs/items/:itemId/ratings/:ratingId endpoint is needed
 * for PMT to update existing records (add pmtRating / pmtRemark).
 */
export async function createOrUpdateRating(
  itemId: string,
  payload: CreateOrUpdateRatingPayload,
): Promise<OpcrItemRating> {
  const response = await api.post<ApiEntityResponse<OpcrItemRating>>(
    `/opcrs/items/${itemId}/ratings`,
    payload,
  )
  return unwrapEntityResponse(response.data)
}

/**
 * PUT /opcrs/items/ratings/:ratingId/pmt-review
 * Updates an existing rating record with pmtRating / pmtRemark.
 */
export async function putOpcrItemRatingPmtReview(
  ratingId: string,
  payload: {
    pmtRating?: number | null
    pmtRemark?: string | null
  },
): Promise<any> {
  const response = await api.put<any>(
    `/opcrs/items/ratings/${ratingId}/pmt-review`,
    payload,
  )
  return response.data
}
