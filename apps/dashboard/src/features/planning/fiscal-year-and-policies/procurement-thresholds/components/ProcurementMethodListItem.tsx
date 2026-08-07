import { Pencil } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThresholdEditingPanel } from './ThresholdEditingPanel'
import type {
  ProcurementMethod,
  FiscalYear,
} from '@/lib/fiscal-year-and-policies/types'
import { ProcurementMethodThreshold } from '@/lib/fiscal-year-and-policies/procurement-threshold.types'

interface ProcurementMethodListItemProps {
  method: ProcurementMethod
  threshold: ProcurementMethodThreshold
  onThresholdChange: (updatedThreshold: ProcurementMethodThreshold) => void
  fiscalYear?: FiscalYear
}

export function ProcurementMethodListItem({
  method,
  threshold,
  onThresholdChange,
  fiscalYear,
}: ProcurementMethodListItemProps) {
  const isInherited = threshold.isInherited

  return (
    <Card className="overflow-hidden border border-border bg-card hover:shadow-md transition-shadow duration-200">
      <div className="p-5 space-y-4">
        {/* Header: Method Name & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base text-foreground">
              {method.name}
            </h4>
            {method.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {method.description}
              </p>
            )}
            {fiscalYear && (
              <p className="text-xs text-muted-foreground mt-1">
                Fiscal Year: {fiscalYear.year}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!threshold.isConfigured && (
              <>
                <Badge variant="soft" color="warning" className="text-xs">
                  Not Configured
                </Badge>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </>
            )}
            {isInherited && (
              <Badge variant="outline" color="info" className="text-xs italic">
                Inherited
              </Badge>
            )}
          </div>
        </div>

        {/* Threshold Value Section */}
        <div className="space-y-3 pt-2">
          <div className="text-sm font-semibold text-foreground">
            Threshold Value
          </div>
          <ThresholdEditingPanel
            threshold={threshold}
            boundary={{
              min: method.minimumThreshold,
              max: method.maximumThreshold,
              label: 'Inherited',
            }}
            methodName={method.name}
            onThresholdChange={onThresholdChange}
          />
        </div>
      </div>
    </Card>
  )
}
