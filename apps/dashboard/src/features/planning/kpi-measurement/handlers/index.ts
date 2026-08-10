import type {
  Indicator,
  IndicatorFormValues,
  KpiWithIndicators,
} from '../types'

/**
 * Mock database for indicators
 * In a real app, this would come from a backend API
 */
let mockIndicatorsDatabase: Indicator[] = []

/**
 * Fetch KPIs with their indicators
 * Uses mock data from master-kpi feature
 */
export const getKpiWithIndicatorsHandler = async (filters?: {
  search?: string
  status?: string
}): Promise<{ data: KpiWithIndicators[]; total: number }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Import mock KPI data from master-kpi
  // For now, using basic structure. In production, fetch from actual KPI handler
  const mockKpis = [
    {
      id: 'kpi-001',
      code: 'KPI-001',
      name: 'Customer Satisfaction',
      description: 'Measure overall customer satisfaction levels',
      operationalDefinition:
        'Percentage of customers rating satisfaction 4 or above',
    },
    {
      id: 'kpi-002',
      code: 'KPI-002',
      name: 'Process Efficiency',
      description: 'Monitor operational process efficiency',
      operationalDefinition: 'Ratio of actual output to standard output',
    },
    {
      id: 'kpi-003',
      code: 'KPI-003',
      name: 'Quality Rate',
      description: 'Track quality of deliverables',
      operationalDefinition: 'Percentage of defect-free outputs',
    },
  ]

  // Combine KPIs with their indicators
  const kpisWithIndicators: KpiWithIndicators[] = mockKpis.map((kpi) => ({
    ...kpi,
    indicators: mockIndicatorsDatabase.filter((ind) => ind.kpiId === kpi.id),
  }))

  // Apply filters if provided
  let filtered = kpisWithIndicators
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (kpi) =>
        kpi.code.toLowerCase().includes(searchLower) ||
        kpi.name.toLowerCase().includes(searchLower) ||
        kpi.description?.toLowerCase().includes(searchLower),
    )
  }

  return {
    data: filtered,
    total: filtered.length,
  }
}

/**
 * Fetch a single KPI with its indicators
 */
export const getKpiByIdWithIndicatorsHandler = async (
  kpiId: string,
): Promise<KpiWithIndicators | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const mockKpis: Record<string, KpiWithIndicators> = {
    'kpi-001': {
      id: 'kpi-001',
      code: 'KPI-001',
      name: 'Customer Satisfaction',
      description: 'Measure overall customer satisfaction levels',
      operationalDefinition:
        'Percentage of customers rating satisfaction 4 or above',
      indicators: [],
    },
    'kpi-002': {
      id: 'kpi-002',
      code: 'KPI-002',
      name: 'Process Efficiency',
      description: 'Monitor operational process efficiency',
      operationalDefinition: 'Ratio of actual output to standard output',
      indicators: [],
    },
    'kpi-003': {
      id: 'kpi-003',
      code: 'KPI-003',
      name: 'Quality Rate',
      description: 'Track quality of deliverables',
      operationalDefinition: 'Percentage of defect-free outputs',
      indicators: [],
    },
  }

  const kpi = mockKpis[kpiId]
  if (!kpi) return null

  return {
    ...kpi,
    indicators: mockIndicatorsDatabase.filter((ind) => ind.kpiId === kpiId),
  }
}

/**
 * Fetch indicators for a specific KPI
 */
export const getIndicatorsForKpiHandler = async (
  kpiId: string,
  filters?: { search?: string },
): Promise<{ data: Indicator[]; total: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  let indicators = mockIndicatorsDatabase.filter((ind) => ind.kpiId === kpiId)

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    indicators = indicators.filter(
      (ind) =>
        ind.code.toLowerCase().includes(searchLower) ||
        ind.name.toLowerCase().includes(searchLower) ||
        ind.description.toLowerCase().includes(searchLower),
    )
  }

  return {
    data: indicators,
    total: indicators.length,
  }
}

/**
 * Create a new indicator for a KPI
 */
export const createIndicatorHandler = async (
  kpiId: string,
  data: IndicatorFormValues,
): Promise<Indicator> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Validate required fields
  if (!data.code || !data.name || !data.description) {
    throw new Error('Missing required fields')
  }

  if (data.dimensions.length === 0) {
    throw new Error('At least one dimension is required')
  }

  if (data.mov.length === 0) {
    throw new Error('At least one means of verification is required')
  }

  if (data.ratingScaleTemplateIds.length === 0) {
    throw new Error('At least one rating scale template is required')
  }

  // Check for duplicate code within KPI
  const isDuplicate = mockIndicatorsDatabase.some(
    (ind) =>
      ind.kpiId === kpiId && ind.code.toLowerCase() === data.code.toLowerCase(),
  )

  if (isDuplicate) {
    throw new Error(`Code "${data.code}" already exists for this KPI`)
  }

  const newIndicator: Indicator = {
    id: `indicator-${Date.now()}`,
    kpiId,
    code: data.code,
    name: data.name,
    description: data.description,
    dimensions: data.dimensions,
    mov: data.mov,
    ratingScaleTemplateIds: data.ratingScaleTemplateIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockIndicatorsDatabase.push(newIndicator)
  return newIndicator
}

/**
 * Update an existing indicator
 */
export const updateIndicatorHandler = async (
  indicatorId: string,
  data: IndicatorFormValues,
): Promise<Indicator> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const index = mockIndicatorsDatabase.findIndex(
    (ind) => ind.id === indicatorId,
  )
  if (index === -1) {
    throw new Error(`Indicator with ID "${indicatorId}" not found`)
  }

  const indicator = mockIndicatorsDatabase[index]

  // Check for duplicate code within same KPI (excluding current indicator)
  const isDuplicate = mockIndicatorsDatabase.some(
    (ind) =>
      ind.id !== indicatorId &&
      ind.kpiId === indicator.kpiId &&
      ind.code.toLowerCase() === data.code.toLowerCase(),
  )

  if (isDuplicate) {
    throw new Error(`Code "${data.code}" already exists for this KPI`)
  }

  const updatedIndicator: Indicator = {
    ...indicator,
    code: data.code,
    name: data.name,
    description: data.description,
    dimensions: data.dimensions,
    mov: data.mov,
    ratingScaleTemplateIds: data.ratingScaleTemplateIds,
    updatedAt: new Date().toISOString(),
  }

  mockIndicatorsDatabase[index] = updatedIndicator
  return updatedIndicator
}

/**
 * Delete an indicator
 */
export const deleteIndicatorHandler = async (
  indicatorId: string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const index = mockIndicatorsDatabase.findIndex(
    (ind) => ind.id === indicatorId,
  )
  if (index === -1) {
    throw new Error(`Indicator with ID "${indicatorId}" not found`)
  }

  mockIndicatorsDatabase.splice(index, 1)
}

/**
 * Get all available KPIs (simplified list for KPI selector)
 */
export const getAvailableKpisHandler = async (): Promise<
  Array<{ id: string; code: string; name: string; indicatorCount: number }>
> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const mockKpis = [
    {
      id: 'kpi-001',
      code: 'KPI-001',
      name: 'Customer Satisfaction',
    },
    {
      id: 'kpi-002',
      code: 'KPI-002',
      name: 'Process Efficiency',
    },
    {
      id: 'kpi-003',
      code: 'KPI-003',
      name: 'Quality Rate',
    },
  ]

  return mockKpis.map((kpi) => ({
    ...kpi,
    indicatorCount: mockIndicatorsDatabase.filter((ind) => ind.kpiId === kpi.id)
      .length,
  }))
}
