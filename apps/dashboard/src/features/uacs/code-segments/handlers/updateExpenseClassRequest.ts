import type { UpdateExpenseClassPayload } from '../types/expenseClassTypes'

export const updateExpenseClassRequest = {
  endpoint: '/expense-classes/{id}',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({ finalUrl, payload }: { finalUrl: string; payload: UpdateExpenseClassPayload }) => {
    const response = await fetch(finalUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error(`Failed to update expense class: ${response.statusText}`)
    }
    return response.json()
  },
}
