/**
 * Performance Measuring Scale API Handlers & Mock Data
 */

export { syncKpiMeasurementsRequest } from './syncKpiMeasurementsRequest'
export { deleteKpiMeasurementRequest } from './deleteKpiMeasurementRequest'
export { getKpiMeasurementRequest } from './getKpiMeasurementRequest'
export { getKpiMeasurementsRequest } from './getKpiMeasurementsRequest'
export { updateKpiMeasurementRequest } from './updateKpiMeasurementRequest'

import { IndicatorDimension } from '../types'
import type {
  PerformanceMeasuringScale,
  PerformanceMeasuringScaleBuilderFormValues,
  PerformanceMeasuringScaleRowFormValues,
} from '../types/performance-measuring-scale.types'
import { mockKpiDatabase } from '@/features/planning/master-kpi/handlers'

/**
 * Mock database for performance measuring scales
 */
export const mockPerformanceMeasuringScaleDatabase: PerformanceMeasuringScale[] =
  [
    {
      id: 'si-1',
      name: 'Trainee Completion Rate',
      masterKPIId: 'kpi-1',
      statement: 'At least 80% of trainees complete training program',
      dimensions: [IndicatorDimension.EFFICIENCY],
      mov: ['Training attendance records', 'Completion certificates'],
      templateId: 'efficiency-scale',
      customRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'si-2',
      name: 'Program Satisfaction Score',
      masterKPIId: 'kpi-1',
      statement:
        'Training participants rate program satisfaction at 4+ out of 5',
      dimensions: [IndicatorDimension.QUALITY],
      mov: ['Post-training evaluation forms', 'Participant feedback'],
      templateId: 'accuracy-scale',
      customRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'si-3',
      name: 'Timely Training Delivery',
      masterKPIId: 'kpi-1',
      statement: '100% of training sessions delivered as scheduled',
      dimensions: [IndicatorDimension.TIMELINESS],
      mov: ['Training schedule log', 'Incident reports'],
      templateId: 'timeliness-scale',
      customRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'si-4',
      name: 'Enrollment Update Efficiency',
      masterKPIId: 'kpi-3',
      statement: 'Enrollment records updated within 5 days of registration',
      dimensions: [IndicatorDimension.EFFICIENCY],
      mov: ['Enrollment records', 'Registration forms'],
      templateId: 'efficiency-scale',
      customRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'si-5',
      name: 'Quality Audit Compliance',
      masterKPIId: 'kpi-3',
      statement: 'Quality audit reports show 95% compliance with standards',
      dimensions: [
        IndicatorDimension.EFFICIENCY,
        IndicatorDimension.EFFICIENCY,
      ],
      mov: ['Completion certificates', 'Training logs'],
      templateId: 'accuracy-scale',
      customRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'si-6',
      name: 'Enrollment Form Submission',
      masterKPIId: 'kpi-4',
      statement:
        'Enrollment forms received from at least 90% of target participants',
      dimensions: [IndicatorDimension.EFFICIENCY],
      mov: ['Enrollment forms', 'Participant lists'],
      templateId: 'efficiency-scale',
      customRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'si-7',
      name: 'Assessment Score Improvement',
      masterKPIId: 'kpi-4',
      statement:
        'Pre and post-training assessment scores improve by 50% or more',
      dimensions: [IndicatorDimension.EFFICIENCY],
      mov: [
        'Pre-training assessments',
        'Post-training assessments',
        'Feedback surveys',
      ],
      templateId: 'accuracy-scale',
      customRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

/**
 * Handler: Get performance measuring scales with optional filters
 * Supports multi-KPI filtering and sorting
 */
export async function getPerformanceMeasuringScalesHandler(filters?: {
  masterKpiIds?: string[]
  dimension?: string
  templateId?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  let results = [...mockPerformanceMeasuringScaleDatabase]

  // Apply filters
  if (filters?.masterKpiIds && filters.masterKpiIds.length > 0) {
    results = results.filter((si) =>
      filters.masterKpiIds!.includes(si.masterKPIId),
    )
  }

  if (filters?.dimension) {
    results = results.filter((si) =>
      si.dimensions.includes(filters.dimension as IndicatorDimension),
    )
  }

  if (filters?.templateId) {
    results = results.filter((si) => si.templateId === filters.templateId)
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    results = results.filter((si) => {
      const nameMatch = si.name.toLowerCase().includes(searchLower)
      const statementMatch = si.statement.toLowerCase().includes(searchLower)
      const movMatch = si.mov.some((mov) =>
        mov.toLowerCase().includes(searchLower),
      )
      return nameMatch || statementMatch || movMatch
    })
  }

  // Sort by Master KPI name, then by name alphabetically
  results.sort((a, b) => {
    // Get KPI names for sorting
    const kpiA = mockKpiDatabase.find((k) => k.id === a.masterKPIId)?.name || ''
    const kpiB = mockKpiDatabase.find((k) => k.id === b.masterKPIId)?.name || ''

    const kpiCompare = kpiA.localeCompare(kpiB)
    if (kpiCompare !== 0) return kpiCompare
    return a.name.localeCompare(b.name)
  })

  // Apply pagination
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 12
  const startIndex = (page - 1) * pageSize
  const paginatedResults = results.slice(startIndex, startIndex + pageSize)

  return {
    data: paginatedResults,
    pageNumber: page,
    pageSize: pageSize,
    totalPageNumber: Math.ceil(results.length / pageSize),
    totalRows: results.length,
  }
}

/**
 * Handler: Get single performance measuring scale by ID
 */
export async function getPerformanceMeasuringScaleByIdHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const scale = mockPerformanceMeasuringScaleDatabase.find((si) => si.id === id)
  if (!scale)
    throw new Error(`Performance Measuring Scale with ID ${id} not found`)
  return scale
}

/**
 * Handler: Create performance measuring scale
 */
export async function createPerformanceMeasuringScaleHandler(
  masterKPIId: string,
  data: PerformanceMeasuringScaleRowFormValues,
) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Validation
  if (!masterKPIId) throw new Error('Master KPI ID is required')
  if (!data.name) throw new Error('Scale name is required')
  if (data.dimensions.length === 0) {
    throw new Error('At least one dimension must be selected')
  }

  const newScale: PerformanceMeasuringScale = {
    id: `si-${Math.random().toString(36).substring(7)}`,
    masterKPIId: masterKPIId,
    name: data.name,
    statement: data.statement,
    dimensions: data.dimensions,
    mov: data.mov,
    templateId: data.templateId,
    customRating: data.useCustomRating ? data.customRating || null : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return newScale
}

/**
 * Handler: Update performance measuring scale
 */
export async function updatePerformanceMeasuringScaleHandler(
  id: string,
  data: PerformanceMeasuringScaleRowFormValues,
) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const scaleIndex = mockPerformanceMeasuringScaleDatabase.findIndex(
    (si) => si.id === id,
  )
  if (scaleIndex === -1) {
    throw new Error(`Performance Measuring Scale with ID ${id} not found`)
  }

  const updatedScale: PerformanceMeasuringScale = {
    ...mockPerformanceMeasuringScaleDatabase[scaleIndex],
    name: data.name,
    statement: data.statement,
    dimensions: data.dimensions,
    mov: data.mov,
    templateId: data.templateId,
    customRating: data.useCustomRating ? data.customRating || null : null,
    updatedAt: new Date().toISOString(),
  }

  mockPerformanceMeasuringScaleDatabase[scaleIndex] = updatedScale
  return updatedScale
}

/**
 * Handler: Bulk create/update scales for a Master KPI
 */
export async function bulkCreatePerformanceMeasuringScalesHandler(
  data: PerformanceMeasuringScaleBuilderFormValues,
) {
  await new Promise((resolve) => setTimeout(resolve, 700))

  const { masterKPIId, scales } = data

  if (!masterKPIId) throw new Error('Master KPI ID is required')
  if (scales.length === 0) throw new Error('At least one scale is required')

  // Remove existing scales for this KPI (or update them)
  const existingIndices = mockPerformanceMeasuringScaleDatabase
    .map((si, idx) => (si.masterKPIId === masterKPIId ? idx : -1))
    .filter((idx) => idx !== -1)

  // Create new scales
  const createdScales: PerformanceMeasuringScale[] = scales.map(
    (scale: PerformanceMeasuringScaleRowFormValues) => ({
      id: `si-${Math.random().toString(36).substring(7)}`,
      masterKPIId,
      name: scale.name,
      statement: scale.statement,
      dimensions: scale.dimensions,
      mov: scale.mov,
      templateId: scale.templateId,
      customRating: scale.useCustomRating ? scale.customRating || null : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  )

  // Remove old scales
  for (let i = existingIndices.length - 1; i >= 0; i--) {
    mockPerformanceMeasuringScaleDatabase.splice(existingIndices[i], 1)
  }

  // Add new scales
  mockPerformanceMeasuringScaleDatabase.push(...createdScales)

  return createdScales
}

/**
 * Handler: Delete performance measuring scale
 */
export async function deletePerformanceMeasuringScaleHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const scaleIndex = mockPerformanceMeasuringScaleDatabase.findIndex(
    (si) => si.id === id,
  )
  if (scaleIndex === -1) {
    throw new Error(`Performance Measuring Scale with ID ${id} not found`)
  }

  const deletedScale = mockPerformanceMeasuringScaleDatabase[scaleIndex]
  mockPerformanceMeasuringScaleDatabase.splice(scaleIndex, 1)
  return deletedScale
}
