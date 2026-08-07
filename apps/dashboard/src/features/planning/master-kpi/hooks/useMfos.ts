import { useState, useEffect } from 'react'

/**
 * MFO (Major Final Output) interface
 */
export interface MFO {
  id: string
  name: string
  description?: string
}

/**
 * Hook for fetching and managing MFOs
 * Currently uses mock data, but can be swapped for real API
 */
export function useMfos() {
  const [mfos, setMfos] = useState<MFO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMfos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock MFO data - Replace with actual API call
        // Example: const response = await fetch('/api/mfos')
        // const data = await response.json()

        const mockMfos: MFO[] = [
          {
            id: 'mfo-1',
            name: 'Talent Development Programs',
            description: 'Training and skills development initiatives',
          },
          {
            id: 'mfo-2',
            name: 'Infrastructure Modernization',
            description: 'IT systems and physical infrastructure upgrades',
          },
          {
            id: 'mfo-3',
            name: 'Service Delivery Excellence',
            description: 'Improving customer and stakeholder services',
          },
          {
            id: 'mfo-4',
            name: 'Financial Management & Compliance',
            description: 'Budget execution and regulatory compliance',
          },
          {
            id: 'mfo-5',
            name: 'Strategic Investment Programs',
            description: 'Long-term capability building initiatives',
          },
        ]

        setMfos(mockMfos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch MFOs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMfos()
  }, [])

  return { mfos, isLoading, error }
}

/**
 * Hook to mock getting MFOs - can be used in isolated tests
 */
export function useMfosHandler() {
  const getMfos = async (): Promise<MFO[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return [
      {
        id: 'mfo-1',
        name: 'Talent Development Programs',
        description: 'Training and skills development initiatives',
      },
      {
        id: 'mfo-2',
        name: 'Infrastructure Modernization',
        description: 'IT systems and physical infrastructure upgrades',
      },
      {
        id: 'mfo-3',
        name: 'Service Delivery Excellence',
        description: 'Improving customer and stakeholder services',
      },
      {
        id: 'mfo-4',
        name: 'Financial Management & Compliance',
        description: 'Budget execution and regulatory compliance',
      },
      {
        id: 'mfo-5',
        name: 'Strategic Investment Programs',
        description: 'Long-term capability building initiatives',
      },
    ]
  }

  return { getMfos }
}
