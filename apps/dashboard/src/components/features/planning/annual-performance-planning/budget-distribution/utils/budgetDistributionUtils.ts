/**
 * Budget Distribution business logic handlers
 */

import type { BudgetAllocation } from '../mocks'

interface UseBudgetDistributionHandlersProps {
  allocations: BudgetAllocation[]
  setAllocations: (allocations: BudgetAllocation[]) => void
}

export function useBudgetDistributionHandlers({
  allocations,
  setAllocations,
}: UseBudgetDistributionHandlersProps) {
  const updateAllocation = (
    allocationId: string,
    updates: Partial<BudgetAllocation>
  ) => {
    setAllocations(
      allocations.map((a) =>
        a.id === allocationId ? { ...a, ...updates } : a
      )
    )
  }

  const deleteAllocation = (allocationId: string) => {
    setAllocations(allocations.filter((a) => a.id !== allocationId))
  }

  const toggleLock = (allocationId: string) => {
    const allocation = allocations.find((a) => a.id === allocationId)
    if (allocation) {
      updateAllocation(allocationId, {
        isLocked: !allocation.isLocked,
      })
    }
  }

  const updateAllocationStatus = (
    allocationId: string,
    status: 'pending' | 'allocated' | 'approved'
  ) => {
    updateAllocation(allocationId, { status })
  }

  const calculatePercentageOfTotal = (
    allocatedBudget: number,
    totalBudget: number
  ): number => {
    return totalBudget > 0 ? (allocatedBudget / totalBudget) * 100 : 0
  }

  const calculateQuarterlyDistribution = (
    allocatedBudget: number
  ) => {
    const quarterAmount = allocatedBudget / 4
    return {
      q1: quarterAmount,
      q2: quarterAmount,
      q3: quarterAmount,
      q4: quarterAmount,
    }
  }

  return {
    updateAllocation,
    deleteAllocation,
    toggleLock,
    updateAllocationStatus,
    calculatePercentageOfTotal,
    calculateQuarterlyDistribution,
  }
}
