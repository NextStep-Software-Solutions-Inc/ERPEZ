export type CreateFundSourceType = {
  name: string
  code: string
  type: string
  isActive: boolean
}

export type FundSource = CreateFundSourceType & {
  id: string
}
