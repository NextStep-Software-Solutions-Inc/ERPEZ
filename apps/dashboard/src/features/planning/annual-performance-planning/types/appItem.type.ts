import { ProcurementMode } from "@/lib/fiscal-year-and-policies/procurement-threshold.types"
import { BidEvaluationCriteria, ProcurementStrategy } from "../../app-consolidation/types"
import { PPMPItem } from "../../ppmp/types"
import { FundSource } from "@/components/features/planning/fund-source"
import { Office } from "@/components/features/planning/office"

export type APPItem = {
    id: string
    appId: string
    ppmpItemId: string

    ppmpItemName?: string

    procurementModeId: string
    procurementModeName?: string

    fundSourceId: string
    fundSourceName?: string

    officeId: string
    officeName?: string

    papCode?: string
    remarks?: string

    isEarlyProcurementActivity: boolean
    isOutsourced: boolean

    bidEvaluationCriteria: BidEvaluationCriteria
    procurementStrategies?: ProcurementStrategy[]

    createdAt: string
    createdBy?: string

    updatedAt?: string
    updatedBy?: string

    effectiveStartOfProcurement?: string
    effectiveEndOfProcurement?: string

    startOfProcurementOverride?: string
    endOfProcurementOverride?: string

    estimatedBudgetOverride?: number

    originalPPMPBudget: number
    effectiveABC: number

    isABCOverridden: boolean
    isStartProcurementOverridden: boolean
    isEndProcurementOverridden: boolean

    isNew: boolean
    isRevised: boolean

    APP: {
        id: string
        appNumber?: string
        name?: string
    }
    PPMPItem: PPMPItem
    ProcurementMode: ProcurementMode
    FundSource: FundSource
    Office: Office

    Schedules?: APPItemScheduleReference[]
}

export type APPItemScheduleReference = {
    id: string
    procurementActivityTypeId: string
    procurementActivityTypeName?: string
    scheduledDate?: string
    customDateText?: string
} 