import type { CreateExpenseClassPayload } from '../types/expenseClassTypes'

export const createExpenseClassRequest = {
  endpoint: '/expense-classes',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({ finalUrl, payload }: { finalUrl: string; payload: CreateExpenseClassPayload }) => {
    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error(`Failed to create expense class: ${response.statusText}`)
    }
    return response.json()
  },
}
