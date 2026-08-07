import { findNoticeOfAward } from '../data/mockNoticeOfAwardData'

export const getNoticeOfAwardRequest = {
  endpoint: '/notice-of-awards/:id',
  key: null,
  fetcher: async ({ noaId }: { noaId: string }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    const noticeOfAward = findNoticeOfAward(noaId)

    if (!noticeOfAward) {
      throw new Error('Notice of Award not found.')
    }

    return noticeOfAward
  },
}
