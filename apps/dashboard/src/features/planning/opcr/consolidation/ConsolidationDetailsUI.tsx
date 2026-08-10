import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { ArrowLeft } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getOPCRConsolidationRequest } from '../handlers/getOPCRConsolidationRequest'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const useOPCRConsolidationDetail = createQueryHookFromTemplate(
  getOPCRConsolidationRequest,
)

interface ConsolidationDetailsUIProps {
  opcrConsolidationId: string
  onBack: () => void
  onOPCRClick?: (opcrId: string) => void
}

export default function ConsolidationDetailsUI({
  opcrConsolidationId,
  onBack,
  onOPCRClick,
}: ConsolidationDetailsUIProps) {
  const {
    data: consolidationResponse,
    isLoading,
    error,
  } = useOPCRConsolidationDetail({
    pathParams: {
      id: opcrConsolidationId,
    },
    queryParams: {},
  })

  const consolidation = consolidationResponse?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin inline-block">
              <Icon icon="mdi:loading" className="text-3xl" />
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Loading consolidation details...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !consolidation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center space-y-4">
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-4xl text-red-500 mx-auto"
            />
            <div>
              <h3 className="text-lg font-semibold text-red-700">
                Failed to Load Consolidation
              </h3>
              <p className="text-sm text-red-600 mt-2">
                {error?.message || 'Unable to fetch consolidation details.'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {consolidation.name || `Consolidation ${consolidation.id}`}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          FY {consolidation.fiscalYear} •{' '}
          {format(new Date(consolidation.createdDate), 'MMM d, yyyy')}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Total OPCRs</p>
            <p className="text-2xl font-bold text-slate-900">
              {consolidation.opcRs?.length || 0}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Fiscal Year</p>
            <p className="text-2xl font-bold text-slate-900">
              {consolidation.fiscalYear}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Created Date</p>
            <p className="text-lg font-semibold text-slate-900">
              {format(new Date(consolidation.createdDate), 'MMM d, yyyy')}
            </p>
          </div>
        </Card>
      </div>

      {/* OPCRs Table */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            OPCRs in Consolidation
          </h3>

          {consolidation.opcRs && consolidation.opcRs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">OPCR Name</TableHead>
                    <TableHead className="text-left">Code</TableHead>
                    <TableHead className="text-left">Office</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidation.opcRs.map((opcr) => (
                    <TableRow
                      key={opcr.id}
                      className={`${onOPCRClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                      onClick={() => onOPCRClick?.(opcr.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">
                            {opcr.name}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {opcr.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{opcr.code || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {opcr.officeName || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon
                icon="mdi:file-document-outline"
                className="text-4xl text-slate-300 mx-auto mb-4"
              />
              <p className="text-sm text-slate-600">
                No OPCRs in this consolidation
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
