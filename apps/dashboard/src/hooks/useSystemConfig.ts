/**
 * System Configuration Hook
 * Provides access to global system settings like IS_MULTI_SITE
 */

interface SystemConfig {
  IS_MULTI_SITE: boolean
  DEFAULT_CLUSTER_ID: string
  DEFAULT_CLUSTER_NAME: string
}

// Default configuration - can be overridden from environment or API
const DEFAULT_CONFIG: SystemConfig = {
  IS_MULTI_SITE: false, // Single-site is default
  DEFAULT_CLUSTER_ID: '1',
  DEFAULT_CLUSTER_NAME: 'Main Agency',
}

/**
 * Mock system configuration retrieval
 * In production, this would fetch from an API or environment variables
 */
export function useSystemConfig(): SystemConfig {
  // TODO: Replace with actual API call to fetch system configuration
  // const { data: config } = useQuery({
  //   queryKey: ['system-config'],
  //   queryFn: () => fetch('/api/system-config').then(r => r.json()),
  // })
  // return config || DEFAULT_CONFIG

  return DEFAULT_CONFIG
}

/**
 * Get IS_MULTI_SITE flag
 */
export function useIsMultiSite(): boolean {
  const config = useSystemConfig()
  return config.IS_MULTI_SITE
}

/**
 * Get default cluster configuration
 */
export function useDefaultCluster(): { id: string; name: string } {
  const config = useSystemConfig()
  return {
    id: config.DEFAULT_CLUSTER_ID,
    name: config.DEFAULT_CLUSTER_NAME,
  }
}
