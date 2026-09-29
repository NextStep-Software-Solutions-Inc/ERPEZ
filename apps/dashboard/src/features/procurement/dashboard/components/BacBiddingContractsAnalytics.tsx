import { BarChart2 } from 'lucide-react'
import { RfqClosingAndAobPanel } from './RfqClosingAndAobPanel'
import { PoFulfillmentDonut } from './PoFulfillmentDonut'
import { ContractLifecycle } from './ContractLifecycle'
import type { AobQueueItem, ContractItem, PoFulfillmentData, RfqStatusItem } from '../types'

interface Props {
  rfqList: Array<RfqStatusItem>
  aobItems: Array<AobQueueItem>
  poFulfillment: PoFulfillmentData | null
  contracts: Array<ContractItem>
  isLoading?: boolean
}

// Count RFQs closing in <= 3 days as "urgent"
function countUrgent(rfqList: Array<RfqStatusItem>): number {
  return rfqList.filter((r) => r.daysRemaining <= 3).length
}

export function BacBiddingContractsAnalytics({
  rfqList,
  aobItems,
  poFulfillment,
  contracts,
  isLoading,
}: Props) {
  const urgentCount = countUrgent(rfqList)

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-5 w-5 text-gray-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          BAC, Bidding &amp; Contracts Analytics
        </h2>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: RFQ Closing + AOB Queue */}
        <RfqClosingAndAobPanel
          rfqList={rfqList}
          aobItems={aobItems}
          urgentCount={urgentCount}
          isLoading={isLoading}
        />

        {/* Center: PO Fulfillment Donut + UACS */}
        <PoFulfillmentDonut data={poFulfillment} isLoading={isLoading} />

        {/* Right: Contract Lifecycle & NTP Status */}
        <ContractLifecycle contracts={contracts} isLoading={isLoading} />
      </div>
    </section>
  )
}
