import { getNoticeOfAwardDatabase } from '../data/mockNoticeOfAwardData'

export const getNoticeOfAwardsRequest = {
  endpoint: '/notice-of-awards',
  key: null,
  fetcher: async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))

    return getNoticeOfAwardDatabase()
  },
}
