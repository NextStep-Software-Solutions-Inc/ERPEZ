import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import type {
  ProcurementPolicyConfig,
  ProcurementMode,
  ProcurementModeThreshold,
} from '@/lib/fiscal-year-and-policies/types'

interface ProcurementPolicyConfigCardProps {
  configs: ProcurementPolicyConfig[]
  modes: ProcurementMode[]
  thresholds: ProcurementModeThreshold[]
  isLoading?: boolean
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (config: ProcurementPolicyConfig) => void
  onDelete: (config: ProcurementPolicyConfig) => void
}

export function ProcurementPolicyConfigCard({
  configs,
  modes,
  thresholds,
  isLoading = false,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: ProcurementPolicyConfigCardProps) {
  const [expandedConfigIds, setExpandedConfigIds] = useState<Set<string>>(
    new Set(),
  )

  const toggleExpand = (configId: string) => {
    setExpandedConfigIds((prev) => {
      const next = new Set(prev)
      if (next.has(configId)) {
        next.delete(configId)
      } else {
        next.add(configId)
      }
      return next
    })
  }

  const getModeById = (modeId: string): ProcurementMode | undefined => {
    return modes.find((m) => m.id === modeId)
  }

  const getThresholdById = (
    thresholdId: string,
  ): ProcurementModeThreshold | undefined => {
    return thresholds.find((t) => t.id === thresholdId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading configurations...</p>
      </div>
    )
  }

  if (configs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          No procurement policy configurations found
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Config Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {configs.map((config) => {
          const mode = getModeById(config.procurementModeId)
          const threshold = getThresholdById(config.procurementModeThresholdId)
          const isExpanded = expandedConfigIds.has(config.id)

          return (
            <Card key={config.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {mode?.name || 'N/A'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mode?.description || 'No description'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(config.id)}
                    className="ml-2"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Amount Range Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Min Amount
                    </p>
                    <p className="text-lg font-semibold">
                      ₱
                      {config.minAmount.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Max Amount
                    </p>
                    <p className="text-lg font-semibold">
                      {config.maxAmount ? (
                        `₱${config.maxAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                      ) : (
                        <Badge variant="outline">Unlimited</Badge>
                      )}
                    </p>
                  </div>
                </div>

                {/* Threshold Range */}
                {threshold && (
                  <div className="p-3 bg-muted rounded-md space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Threshold Boundaries
                    </p>
                    <p className="text-sm">
                      ₱
                      {threshold.minThreshold.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      -{' '}
                      {threshold.maxThreshold
                        ? `₱${threshold.maxThreshold.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        : 'Infinite'}
                    </p>
                  </div>
                )}

                {/* Expandable Audit Section */}
                {isExpanded && (
                  <div className="space-y-2 border-t pt-3">
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Created:</span>{' '}
                        {new Date(config.createdAt).toLocaleDateString('en-PH')}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Updated:</span>{' '}
                        {new Date(config.updatedAt).toLocaleDateString('en-PH')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(config)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete(config)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page size:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(parseInt(v))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
