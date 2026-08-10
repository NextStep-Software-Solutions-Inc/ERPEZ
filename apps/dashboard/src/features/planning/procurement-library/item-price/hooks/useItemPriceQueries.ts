import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { createItemPriceRequest } from '../handlers/createItemPriceRequest'
import { deleteItemPriceRequest } from '../handlers/deleteItemPriceRequest'
import { getItemPriceRequest } from '../handlers/getItemPriceRequest'
import { getItemPricesRequest } from '../handlers/getItemPricesRequest'
import { updateItemPriceRequest } from '../handlers/updateItemPriceRequest'
import type {
  CreateItemPricePayload,
  ItemPrice,
  ItemPriceListItem,
  ItemPriceQueryParams,
  UpdateItemPricePayload,
} from '../types'

const useItemPricesQuery = createQueryHookFromTemplate(getItemPricesRequest)
const useItemPriceQuery = createQueryHookFromTemplate(getItemPriceRequest)
const useCreateItemPriceMutation = createMutationHookFromTemplate(
  createItemPriceRequest,
)
const useUpdateItemPriceMutation = createMutationHookFromTemplate(
  updateItemPriceRequest,
)
const useDeleteItemPriceMutation = createMutationHookFromTemplate(
  deleteItemPriceRequest,
)

const invalidateItemPriceQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' &&
      query.queryKey[0].startsWith('/item-price'),
  })
}

export function useItemPrices(queryParams: ItemPriceQueryParams = {}) {
  const query = useItemPricesQuery({
    pathParams: {},
    queryParams,
  })

  const responseData = query.data as
    | Array<ItemPriceListItem>
    | { data?: Array<ItemPriceListItem> }
    | null
    | undefined

  const itemPrices = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : []

  return {
    ...query,
    itemPrices,
  }
}

export function useItemPrice(itemPriceId: string) {
  const query = useItemPriceQuery({
    pathParams: { id: itemPriceId },
    queryParams: {},
  })

  return {
    ...query,
    itemPrice: (query.data ?? null) as ItemPrice | null,
  }
}

export function useCreateItemPrice() {
  const mutation = useCreateItemPriceMutation()
  const queryClient = useQueryClient()

  const createItemPrice = async (payload: CreateItemPricePayload) => {
    const result = await mutation.mutateAsync({
      pathParams: {},
      payload,
    })

    await invalidateItemPriceQueries(queryClient)
    return result
  }

  return {
    createItemPrice,
    isPending: mutation.isPending,
  }
}

export function useUpdateItemPrice() {
  const mutation = useUpdateItemPriceMutation()
  const queryClient = useQueryClient()

  const updateItemPrice = async (
    itemPriceId: string,
    payload: UpdateItemPricePayload,
  ) => {
    const result = await mutation.mutateAsync({
      pathParams: { id: itemPriceId },
      payload,
    })

    await invalidateItemPriceQueries(queryClient)
    return result
  }

  return {
    updateItemPrice,
    isPending: mutation.isPending,
  }
}

export function useDeleteItemPrice() {
  const mutation = useDeleteItemPriceMutation()
  const queryClient = useQueryClient()

  const deleteItemPrice = async (itemPriceId: string) => {
    const result = await mutation.mutateAsync({
      pathParams: { id: itemPriceId },
    })

    await invalidateItemPriceQueries(queryClient)
    return result
  }

  return {
    deleteItemPrice,
    isPending: mutation.isPending,
  }
}
