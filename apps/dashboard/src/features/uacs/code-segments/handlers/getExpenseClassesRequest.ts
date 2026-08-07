export const getExpenseClassesRequest = {
  endpoint: '/expense-classes',
  key: ({ url }: { url: string }) => [url] as const,
  fetcher: async ({ finalUrl }: { finalUrl: string }) => {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch expense classes: ${response.statusText}`)
    }
    return response.json()
  },
}
