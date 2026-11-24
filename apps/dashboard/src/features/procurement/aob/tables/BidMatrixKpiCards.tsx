import React from 'react'
import { Badge } from '@/components/ui/badge'
import { TrendingDown } from 'lucide-react'

export interface BidMatrixKpiCardsProps {
  totalItems: number
  totalABC: number
  responsiveBids: number
  totalSuppliers: number
  winnerCount: number
  allAwarded: boolean
  pendingCount: number
  uniqueWinningSuppliersCount: number
  winningSuppliersSubtitle: string
  totalAwardAmount: number
  totalAwardedABC: number
  totalSavings: number
  totalSavingsPercent: number
}

function formatPHP(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '—'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function BidMatrixKpiCards({
  totalItems,
  totalABC,
  responsiveBids,
  totalSuppliers,
  winnerCount,
  allAwarded,
  pendingCount,
  uniqueWinningSuppliersCount,
  winningSuppliersSubtitle,
  totalAwardAmount,
  totalAwardedABC,
  totalSavings,
  totalSavingsPercent,
}: BidMatrixKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* 1. Total Line Items & ABC Budget */}
      <div className="p-4 bg-blue-50/70 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50 flex flex-col justify-between h-full">
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Total Line Items
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {totalItems}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Total ABC: {formatPHP(totalABC)}
        </div>
      </div>

      {/* 2. Items Awarded */}
      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between h-full">
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Items Awarded
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {winnerCount} of {totalItems}
          </div>
        </div>
        <div className="mt-2">
          {allAwarded ? (
            <Badge variant="soft" className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
              100% Completed
            </Badge>
          ) : (
            <Badge variant="soft" className="bg-amber-100 text-amber-800 text-[10px] font-semibold">
              {pendingCount} Pending Award
            </Badge>
          )}
        </div>
      </div>

      {/* 3. Winning Suppliers */}
      <div className="p-4 bg-purple-50/70 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900/50 flex flex-col justify-between h-full">
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Winning Suppliers
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            {uniqueWinningSuppliersCount || totalSuppliers}
          </div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate" title={winningSuppliersSubtitle}>
          {winningSuppliersSubtitle || `${totalSuppliers} participating suppliers`}
        </div>
      </div>

      {/* 4. Total Award Amount & Savings */}
      <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50 flex flex-col justify-between h-full">
        <div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Total Award Amount
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {formatPHP(totalAwardAmount)}
          </div>
        </div>
        {totalAwardedABC > 0 && totalAwardAmount > 0 ? (
          <div className={`text-xs font-semibold ${totalSavings >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} flex items-center gap-1 mt-2`}>
            <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Savings: {totalSavings >= 0 ? '' : '-'}{formatPHP(Math.abs(totalSavings))} ({totalSavingsPercent.toFixed(1)}% vs ABC)
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground mt-2">Awaiting winner selection</div>
        )}
      </div>
    </div>
  )
}
