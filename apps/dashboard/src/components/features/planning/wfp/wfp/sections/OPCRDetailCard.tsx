import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { OPCR } from '../../opcr/table/types'
import { formatCurrencyPHP } from '@/utils/formatters'
import { OPCRDetailsDialog } from '../dialog/OPCRDetailsDialog'

interface OPCRDetailCardProps {
  linkedOPCR: OPCR
  showActivities: boolean
  onToggleActivities: () => void
}

export const OPCRDetailCard = ({
  linkedOPCR,
  showActivities,
  onToggleActivities,
}: OPCRDetailCardProps) => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  return (
    <Card className="shadow-sm border border-amber-200 bg-white">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Assigned OPCR Info */}
          <div className="p-4 border border-amber-100 rounded-lg bg-amber-50/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800">{linkedOPCR?.name}</h3>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <span>
                    <span className="text-gray-500 font-medium">Department: </span>
                    {linkedOPCR?.office?.name || 'N/A'}
                  </span>
                  <span>
                    <span className="text-gray-500 font-medium">Status: </span>
                    <span className="text-amber-700 font-medium">{linkedOPCR?.status}</span>
                  </span>
                  <span>
                    <span className="text-gray-500 font-medium">Budget: </span>
                    <span className="font-medium">{formatCurrencyPHP(linkedOPCR?.totalBudget || 0)}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2"
                  onClick={onToggleActivities}
                >
                  <FileText className="h-4 w-4" />
                  {showActivities ? 'Hide Activities' : 'View Activities'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDetailsDialogOpen(true)}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </div>

          {/* OPCR Details Dialog */}
          <OPCRDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            opcrId={linkedOPCR?.id}
            opcr={linkedOPCR}
          />
        </div>
      </CardContent>
    </Card>
  )
}
