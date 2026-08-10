/**
 * Handler for concurrent submission of period-based budget allocations
 */

export interface SubmissionResult {
  success: boolean
  period: string
  budget: number
  error?: string
}

export interface ConcurrentSubmissionOutcome {
  succeeded: SubmissionResult[]
  failed: SubmissionResult[]
  total: number
  successCount: number
  failureCount: number
}

/**
 * Submit period-based line item budget details concurrently
 * Uses Promise.allSettled to handle partial failures
 */
export async function submitConcurrentPeriodAllocations(
  submitFn: (period: { period: string; payload: any }) => Promise<void>,
  periods: Array<{ period: string; payload: any }>,
): Promise<ConcurrentSubmissionOutcome> {
  const promises = periods.map((p) =>
    submitFn(p)
      .then(() => ({
        success: true,
        period: p.period,
        budget: p.payload.budget,
      }))
      .catch((error) => ({
        success: false,
        period: p.period,
        budget: p.payload.budget,
        error: error instanceof Error ? error.message : 'Unknown error',
      })),
  )

  const results = await Promise.allSettled(promises)

  const succeeded: SubmissionResult[] = []
  const failed: SubmissionResult[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        succeeded.push(result.value)
      } else {
        failed.push(result.value)
      }
    } else {
      failed.push({
        success: false,
        period: periods[index].period,
        budget: periods[index].payload.budget,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : 'Request failed',
      })
    }
  })

  return {
    succeeded,
    failed,
    total: periods.length,
    successCount: succeeded.length,
    failureCount: failed.length,
  }
}

/**
 * Generate submission summary message
 */
export function generateSubmissionSummary(
  outcome: ConcurrentSubmissionOutcome,
): string {
  if (outcome.failureCount === 0) {
    return `Successfully created ${outcome.successCount} budget allocation(s).`
  }

  if (outcome.successCount === 0) {
    return `Failed to create all allocations. ${outcome.failed.map((f) => `${f.period}: ${f.error}`).join(', ')}`
  }

  const failedPeriods = outcome.failed.map((f) => f.period).join(', ')
  return `Created ${outcome.successCount} of ${outcome.total} allocations. Failed: ${failedPeriods}`
}
