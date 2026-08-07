/**
 * Rating Scale Template API Handlers & Mock Data
 */

import {
  RatingScaleTemplate,
  type RatingLevel,
  RatingScaleTemplateFormValues,
  DEFAULT_RATING_SCALES,
  ScaleType,
} from '../types'

export * from './hooks'

const clearRatingLevelRanges = (
  level: RatingLevel,
  isFixed: boolean,
): RatingLevel =>
  isFixed ? { ...level, minRange: undefined, maxRange: undefined } : level

/**
 * Mock database including defaults and custom templates
 */
export const mockRatingScaleDatabase: RatingScaleTemplate[] = [
  ...DEFAULT_RATING_SCALES, // Custom template examples
  {
    id: 'marketing-kpi-scale',
    name: 'Marketing KPI Scale',
    description:
      'Specifically designed for marketing campaign performance evaluation. Tracks conversion metrics and engagement levels.',
    scaleType: ScaleType.FIXED,
    rating5: { rating: 5, description: 'Exceeds target by 20% or more' },
    rating4: { rating: 4, description: 'Exceeds target by 10-19%' },
    rating3: { rating: 3, description: 'Meets target (±5%)' },
    rating2: { rating: 2, description: 'Below target by 10-20%' },
    rating1: { rating: 1, description: 'Below target by more than 20%' },
    isDefault: false,
    isReadOnly: false,
    author: 'Sarah Johnson',
    usageCount: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'customer-service-scale',
    name: 'Customer Service Excellence Scale',
    description:
      'Evaluates customer service representatives based on response time, resolution quality, and customer satisfaction scores.',
    scaleType: ScaleType.FIXED,
    rating5: {
      rating: 5,
      description: 'Outstanding - <2min response, 95%+ satisfaction',
    },
    rating4: {
      rating: 4,
      description: 'Excellent - <5min response, 85-94% satisfaction',
    },
    rating3: {
      rating: 3,
      description: 'Good - <10min response, 75-84% satisfaction',
    },
    rating2: {
      rating: 2,
      description: 'Fair - <20min response, 65-74% satisfaction',
    },
    rating1: {
      rating: 1,
      description: 'Poor - >20min response, <65% satisfaction',
    },
    isDefault: false,
    isReadOnly: false,
    author: 'Michael Chen',
    usageCount: 8,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'project-delivery-scale',
    name: 'Project Delivery Assessment',
    description:
      'Comprehensive scale for evaluating project completion quality, budget adherence, and team coordination.',
    scaleType: ScaleType.FIXED,
    rating5: {
      rating: 5,
      description: 'On-time, on-budget, exceeds quality standards',
    },
    rating4: {
      rating: 4,
      description: '5% delay, within budget, meets quality standards',
    },
    rating3: {
      rating: 3,
      description: '10% delay, 5% over budget, acceptable quality',
    },
    rating2: {
      rating: 2,
      description: '20% delay, 15% over budget, some quality issues',
    },
    rating1: {
      rating: 1,
      description: '>20% delay, >15% over budget, significant quality issues',
    },
    isDefault: false,
    isReadOnly: false,
    author: 'Emily Rodriguez',
    usageCount: 3,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Handler: Get all rating scale templates
 */
export async function getRatingScaleTemplatesHandler(filters?: {
  scaleType?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  let results = [...mockRatingScaleDatabase]

  // Apply filters
  if (filters?.scaleType) {
    results = results.filter((t) => t.scaleType === filters.scaleType)
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    results = results.filter((t) => t.name.toLowerCase().includes(searchLower))
  }

  // Separate presets and custom templates
  const presets = results.filter((t) => t.isDefault)
  const custom = results.filter((t) => !t.isDefault)

  // Apply pagination
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 10
  const startIndex = (page - 1) * pageSize
  const paginatedResults = results.slice(startIndex, startIndex + pageSize)

  return {
    data: paginatedResults,
    pageNumber: page,
    pageSize: pageSize,
    totalPageNumber: Math.ceil(results.length / pageSize),
    totalRows: results.length,
    presets,
    custom,
  }
}

/**
 * Handler: Get single template by ID
 */
export async function getRatingScaleTemplateByIdHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const template = mockRatingScaleDatabase.find((t) => t.id === id)
  if (!template) throw new Error(`Template with ID ${id} not found`)
  return template
}

/**
 * Handler: Get all preset templates
 */
export async function getPresetTemplatesHandler() {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockRatingScaleDatabase.filter((t) => t.isDefault)
}

/**
 * Handler: Create rating scale template
 */
export async function createRatingScaleTemplateHandler(
  data: RatingScaleTemplateFormValues,
) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Validation
  if (!data.name) throw new Error('Template name is required')
  if (mockRatingScaleDatabase.some((t) => t.name === data.name)) {
    throw new Error(`Template with name "${data.name}" already exists`)
  }

  const newTemplate: RatingScaleTemplate = {
    id: `template-${Math.random().toString(36).substring(7)}`,
    name: data.name,
    description: data.description,
    scaleType: data.scaleType,
    rating5: data.rating5,
    rating4: data.rating4,
    rating3: data.rating3,
    rating2: data.rating2,
    rating1: data.rating1,
    isDefault: false,
    isReadOnly: false,
    author: 'Current User',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockRatingScaleDatabase.push(newTemplate)
  return newTemplate
}

/**
 * Handler: Update rating scale template
 */
export async function updateRatingScaleTemplateHandler(
  id: string,
  data: RatingScaleTemplateFormValues,
) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const templateIndex = mockRatingScaleDatabase.findIndex((t) => t.id === id)
  if (templateIndex === -1) throw new Error(`Template with ID ${id} not found`)

  const template = mockRatingScaleDatabase[templateIndex]
  if (template.isReadOnly) {
    throw new Error('Cannot edit preset/default templates')
  }

  const isFixed = data.scaleType === ScaleType.FIXED
  const updatedTemplate: RatingScaleTemplate = {
    ...template,
    ...data,
    rating5: clearRatingLevelRanges(data.rating5, isFixed),
    rating4: clearRatingLevelRanges(data.rating4, isFixed),
    rating3: clearRatingLevelRanges(data.rating3, isFixed),
    rating2: clearRatingLevelRanges(data.rating2, isFixed),
    rating1: clearRatingLevelRanges(data.rating1, isFixed),
    updatedAt: new Date().toISOString(),
  }

  mockRatingScaleDatabase[templateIndex] = updatedTemplate
  return updatedTemplate
}

/**
 * Handler: Delete rating scale template
 */
export async function deleteRatingScaleTemplateHandler(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const templateIndex = mockRatingScaleDatabase.findIndex((t) => t.id === id)
  if (templateIndex === -1) throw new Error(`Template with ID ${id} not found`)

  const template = mockRatingScaleDatabase[templateIndex]
  if (template.isReadOnly) {
    throw new Error('Cannot delete preset/default templates')
  }

  // TODO: Check if template is used in Success Indicators
  // For now, allow deletion

  const deletedTemplate = mockRatingScaleDatabase[templateIndex]
  mockRatingScaleDatabase.splice(templateIndex, 1)
  return deletedTemplate
}
