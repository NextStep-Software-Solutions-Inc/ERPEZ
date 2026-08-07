import { faker } from '@faker-js/faker'
import type {
  FundReceiving,
  FundReceivingDetails,
  FundSource,
  FundSourceDetails,
} from '@/components/features/planning/fund-source/table/types'

const range = (len: number) => {
  const arr: Array<number> = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const fundSourceNames = [
  'National Budget',
  'International Grants',
  'Bilateral Aid',
  'Multilateral Funds',
  'Private Donations',
  'Development Partner Funds',
  'Regional Funds',
  'Capacity Building Funds',
  'Technical Assistance',
  'Emergency Relief Fund',
]

const createFakeFundSource = (
  depth: number = 0,
  parentId: string | null = null,
): FundSource => ({
  id: faker.string.uuid(),
  parentId,
  name: faker.helpers.arrayElement(fundSourceNames),
  code: faker.string.alphanumeric(4).toUpperCase(),
  type: faker.helpers.arrayElement(['Grant', 'Foreign'] as const),
  isActive: faker.datatype.boolean({ probability: 0.85 }),
})

const createFakeFundSourceDetails = (
  depth: number = 0,
  parentId: string | null = null,
): FundSourceDetails => ({
  ...createFakeFundSource(depth, parentId),
  description: faker.lorem.sentence(),
})

export function makeFakeFundSources(count: number = 20): Array<FundSource> {
  return range(count).map(() => createFakeFundSource())
}

export function makeFakeFundSourcesWithDetails(
  count: number = 20,
): Array<FundSourceDetails> {
  return range(count).map(() => createFakeFundSourceDetails())
}

export function makeFakeFundSourcesHierarchical(
  count: number = 20,
): Array<FundSource> {
  const sources: Array<FundSource> = []
  const parentCount = Math.ceil(count * 0.3)

  // Create parent fund sources
  const parents = range(parentCount).map(() => createFakeFundSource(0, null))
  sources.push(...parents)

  // Create child fund sources
  const childCount = count - parentCount
  range(childCount).forEach(() => {
    const parentId = faker.helpers.arrayElement(parents).id
    sources.push(createFakeFundSource(1, parentId))
  })

  return sources
}

export const fakeFundSources = makeFakeFundSources(25)
export const fakeFundSourcesWithDetails = makeFakeFundSourcesWithDetails(25)
export const fakeFundSourcesHierarchical = makeFakeFundSourcesHierarchical(25)

// Fund Receiving data generators
const createFakeFundReceiving = (fundSources: Array<FundSource>): FundReceiving => {
  const fundSource = faker.helpers.arrayElement(fundSources)
  return {
    id: faker.string.uuid(),
    fundSourceId: fundSource.id,
    amount: faker.number.float({ min: 1000, max: 1000000, precision: 0.01 }),
    fundSourceName: fundSource.name,
    fundSourceCode: fundSource.code,
    fundSourceIsActive: fundSource.isActive,
  }
}

const createFakeFundReceivingDetails = (
  fundSources: Array<FundSource>,
): FundReceivingDetails => ({
  ...createFakeFundReceiving(fundSources),
  description: faker.lorem.sentence(),
})

export function makeFakeFundReceiving(
  count: number = 20,
  fundSources?: Array<FundSource>,
): Array<FundReceiving> {
  const sources = fundSources || makeFakeFundSources(10)
  return range(count).map(() => createFakeFundReceiving(sources))
}

export function makeFakeFundReceivingWithDetails(
  count: number = 20,
  fundSources?: Array<FundSource>,
): Array<FundReceivingDetails> {
  const sources = fundSources || makeFakeFundSources(10)
  return range(count).map(() => createFakeFundReceivingDetails(sources))
}

export const fakeFundReceiving = makeFakeFundReceiving(25)
export const fakeFundReceivingWithDetails = makeFakeFundReceivingWithDetails(25)
