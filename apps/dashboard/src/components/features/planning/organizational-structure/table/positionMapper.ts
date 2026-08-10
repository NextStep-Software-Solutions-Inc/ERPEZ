import type { Position as MockPosition } from '@/services/mock/positions'
import type { Position as TablePosition } from '@/components/features/planning/organizational-structure/table/types'

/**
 * Maps a mock Position (with government-specific fields) to a table Position (simplified)
 * Keeps both types separate for cleaner architecture
 */
export function mapMockPositionToTablePosition(mockPosition: MockPosition): TablePosition {
  return {
    id: mockPosition.id,
    title: mockPosition.title,
    code: mockPosition.code,
    orgUnitId: mockPosition.orgUnitId,
    description: undefined,
    salaryGrade: mockPosition.salaryGrade,
    status: mockPosition.status === 'filled' ? 'active' : 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Maps an array of mock positions to table positions
 */
export function mapMockPositionsToTablePositions(
  mockPositions: MockPosition[]
): TablePosition[] {
  return mockPositions.map(mapMockPositionToTablePosition)
}
