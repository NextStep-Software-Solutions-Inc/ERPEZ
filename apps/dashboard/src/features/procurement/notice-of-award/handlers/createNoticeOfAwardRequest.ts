import {
  createNoticeOfAwardFromBacResolution,
  findApprovedAwardBacResolutionSourceById,
} from '../data/mockNoticeOfAwardData'
import type { CreateNoticeOfAwardPayload } from '../types'

export const createNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards',
  key: null,
  fetcher: async ({ data }: { data: CreateNoticeOfAwardPayload }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const awardSource = findApprovedAwardBacResolutionSourceById(
      data.bacResolutionId,
    )

    if (!awardSource) {
      throw new Error('Approved Award Recommendation BAC Resolution not found.')
    }

    if (awardSource.resolutionType !== 'award-recommendation') {
      throw new Error('Select a BAC Resolution tagged as Award Recommendation.')
    }

    if (
      awardSource.awardedAmount >
      awardSource.linkedConsolidatedPr.approvedBudget
    ) {
      throw new Error(
        'Awarded amount cannot exceed the linked Consolidated PR approved budget.',
      )
    }

    return createNoticeOfAwardFromBacResolution({
      noaNumber: data.noaNumber,
      date: data.date,
      dateBid: data.dateBid,
      description: data.description,
      type: data.type,
      awardSource,
    })
  },
}
