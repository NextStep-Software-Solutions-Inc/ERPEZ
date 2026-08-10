/**
 * OPCR item within a consolidation
 */
export type OPCRConsolidationItem = {
  id: string
  name?: string
  code?: string
  officeId: string
  officeName?: string
}

export type OPCRConsolidate = {
  id: string
  name?: string
  fiscalYearId: string
  fiscalyear: number
  opcrCount: number
  createdDate: string
}

/**
 * Detailed response from /opcr-consolidations/:id endpoint
 */
export type OPCRConsolidateDetails = {
  id: string
  name?: string
  fiscalYearId: string
  fiscalYear: number
  opcRs?: OPCRConsolidationItem[]
  createdDate: string
}
