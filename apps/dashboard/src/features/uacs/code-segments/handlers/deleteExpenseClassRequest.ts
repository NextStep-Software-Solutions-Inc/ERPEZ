export const deleteExpenseClassRequest = {
  endpoint: '/expense-classes/{id}',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({ finalUrl }: { finalUrl: string }) => {
    const response = await fetch(finalUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to delete expense class: ${response.statusText}`)
    }
    return response.json()
  },
}
