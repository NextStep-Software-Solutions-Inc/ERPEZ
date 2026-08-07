import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FileCheck } from 'lucide-react'
import type { ContractItem, ContractStatus } from '../types'
import { cn } from '@/lib/utils'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface Props {
  contracts: ContractItem[]
  isLoading?: boolean
}

const statusConfig: Record<ContractStatus, { label: string; className: string }> = {
  awaiting_ntp:  { label: 'Awaiting NTP',  className: 'bg-gray-100 text-gray-600 border-gray-300' },
  ntp_issued:    { label: 'NTP Issued',    className: 'bg-blue-100 text-blue-700 border-blue-300' },
  ongoing:       { label: 'Ongoing',       className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  for_renewal:   { label: 'For Renewal',   className: 'bg-amber-100 text-amber-700 border-amber-300' },
}

const progressColor: Record<ContractStatus, string> = {
  awaiting_ntp:  '[&>div]:bg-gray-300',
  ntp_issued:    '[&>div]:bg-blue-500',
  ongoing:       '[&>div]:bg-emerald-500',
  for_renewal:   '[&>div]:bg-amber-500',
}



function ContractRow({ contract }: { contract: ContractItem }) {
  const status = statusConfig[contract.status]
  const bar = progressColor[contract.status]

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        {/* Left: contract info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-gray-400 font-mono shrink-0">{contract.contractNo}</span>
          </div>
          <p className="text-xs font-bold text-gray-800 truncate leading-snug mt-0.5">{contract.title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
            {formatCurrencyAbbr(contract.amount)}&nbsp;&middot;&nbsp;
            {contract.procurementMode}&nbsp;&middot;&nbsp;
            {contract.contractorName}
          </p>
        </div>

        {/* Right: status badge */}
        <Badge
          variant="outline"
          className={cn('text-[10px] font-semibold border shrink-0 mt-0.5', status.className)}
        >
          {status.label}
        </Badge>
      </div>

      {/* Progress bar */}
      <Progress
        value={contract.progressPercent}
        className={cn('h-1.5', bar)}
      />
    </div>
  )
}

function Skeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="py-3 space-y-2 border-b border-gray-100">
            <div className="flex justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-3.5 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-2.5 w-40 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse shrink-0" />
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ContractLifecycle({ contracts, isLoading }: Props) {
  if (isLoading) return <Skeleton />

  const activeCount = contracts.filter(
    (c) => c.status === 'ongoing' || c.status === 'ntp_issued',
  ).length

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-semibold">Contract Lifecycle &amp; NTP Status</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 border-emerald-300 bg-emerald-50">
            {activeCount} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {contracts.map((c) => (
          <ContractRow key={c.id} contract={c} />
        ))}
      </CardContent>
    </Card>
  )
}

