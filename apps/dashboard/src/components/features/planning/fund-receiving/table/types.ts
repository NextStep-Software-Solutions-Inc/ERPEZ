export type FundReceiving = {
  id: string
  fundSourceId: string
  amount: number | string | undefined
  utilizedAmount: number
  remainingBalance: number
  description?: string | undefined
  receivedDate: string
}

export type FundReceivingDetails = FundReceiving & {
  description?: string
  amount: number
  remainingBalance: number
}
