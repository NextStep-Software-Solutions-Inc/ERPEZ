import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Gavel,
  Award,
  ShoppingCart,
  ChevronRight,
  AlertCircle,
  GitFork,
} from 'lucide-react'
import type { FunnelStage, FunnelSubItem } from '../types'
import { cn } from '@/lib/utils'

interface Props {
  stages: FunnelStage[]
  isLoading?: boolean
}

const stageIcons: Record<string, React.ElementType> = {
  requests: FileText,
  bidding:  Gavel,
  award:    Award,
  ordering: ShoppingCart,
}

function SubItem({ item }: { item: FunnelSubItem }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-gray-600 truncate">{item.label}</span>
      <div className="flex items-center gap-1 shrink-0">
        {item.isStalled && (
          <AlertCircle className="h-3 w-3 text-red-500" />
        )}
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-bold h-5 min-w-[2rem] justify-center',
            item.isStalled
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-gray-50 text-gray-700 border-gray-200',
          )}
        >
          {item.count}
        </Badge>
      </div>
    </div>
  )
}

function FunnelStageCard({ stage }: { stage: FunnelStage }) {
  const Icon = stageIcons[stage.id] ?? GitFork
  const stalledCount = stage.subItems.filter((s) => s.isStalled).length

  return (
    <div className={cn('flex-1 rounded-2xl border-2 p-4 space-y-3', stage.bgColor, stage.borderColor)}>
      {/* Stage header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${stage.color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: stage.color }} />
          </div>
          <span className="text-xs font-black tracking-widest uppercase" style={{ color: stage.color }}>
            {stage.label}
          </span>
        </div>
        {stalledCount > 0 && (
          <Badge className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold gap-1">
            <AlertCircle className="h-2.5 w-2.5" />
            {stalledCount} stalled
          </Badge>
        )}
      </div>

      {/* Total count */}
      <div>
        <span className="text-4xl font-black" style={{ color: stage.color }}>
          {stage.totalCount}
        </span>
        <span className="text-xs text-gray-500 ml-1.5">items</span>
      </div>

      {/* Divider */}
      <div className="border-t border-current opacity-10" />

      {/* Sub-items */}
      <div className="divide-y divide-current divide-opacity-10">
        {stage.subItems.map((item) => (
          <SubItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  )
}

function FunnelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-64 bg-gray-100 rounded animate-pulse mt-1" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-2xl bg-gray-100 h-44 animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProcurementFunnel({ stages, isLoading }: Props) {
  if (isLoading || stages.length === 0) return <FunnelSkeleton />

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <GitFork className="h-5 w-5 text-gray-500" />
          <div>
            <CardTitle className="text-base">Procurement Pipeline</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              End-to-end procurement lifecycle: PR → RFQ → BAC → Award → PO/NTP
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-stretch gap-2">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col lg:flex-row items-stretch gap-2 flex-1">
              <FunnelStageCard stage={stage} />
              {index < stages.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-gray-300 shrink-0">
                  <ChevronRight className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
