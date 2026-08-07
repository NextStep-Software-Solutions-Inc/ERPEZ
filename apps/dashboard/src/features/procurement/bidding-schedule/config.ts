// Runtime toggle — mock handlers are only active outside production.
export const USE_MOCK_BIDDING_SCHEDULE: boolean =
  import.meta.env.MODE !== 'production'
