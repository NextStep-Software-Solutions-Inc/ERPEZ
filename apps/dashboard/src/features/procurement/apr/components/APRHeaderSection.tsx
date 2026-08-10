/**
 * APR Header Section Component
 * Displays APR metadata: number, dates, entities, requestor info
 */

import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APRStatusBadge } from './APRStatusBadge'
import type { APRMaster } from '../types'

interface APRHeaderSectionProps {
  apr: APRMaster
}

export function APRHeaderSection({ apr }: APRHeaderSectionProps) {
  const headerFields = [
    { label: 'APR Number', value: apr.aprNumber },
    { label: 'Control Number', value: apr.agencyControlNumber },
    { label: 'Account Code', value: apr.agencyAccountCode },
    { label: 'Fiscal Year', value: apr.fiscalYear.toString() },
    {
      label: 'Request Date',
      value: format(new Date(apr.requestDate), 'MMM dd, yyyy'),
    },
  ]

  const entityFields = [
    { label: 'Procuring Entity', value: apr.procuringEntity },
    { label: 'Requesting Entity', value: apr.requestingEntity },
    { label: 'Requested By', value: apr.requestedBy },
    { label: 'Position', value: apr.requestedByPosition },
  ]

  const timelineFields = [
    apr.submittedAt ? {
      label: 'Submitted',
      value: format(new Date(apr.submittedAt), 'MMM dd, yyyy hh:mm a'),
      detail: undefined,
    } : null,
    apr.returnedAt ? {
      label: 'Returned',
      value: format(new Date(apr.returnedAt), 'MMM dd, yyyy hh:mm a'),
      detail: apr.returnedBy,
    } : null,
    apr.approvedAt ? {
      label: 'Approved',
      value: format(new Date(apr.approvedAt), 'MMM dd, yyyy hh:mm a'),
      detail: apr.approvedBy,
    } : null,
  ].filter((f): f is { label: string; value: string; detail: string | undefined } => f !== null)

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{apr.aprNumber}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{apr.description}</p>
            </div>
            <APRStatusBadge status={apr.status} size="lg" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* APR Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {headerFields.map((field, idx) => (
                <div key={idx} className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {field.label}
                  </span>
                  <span className="text-sm text-gray-900">{field.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entities & Requestor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entities & Requestor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entityFields.map((field, idx) => (
                <div key={idx} className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {field.label}
                  </span>
                  <span className="text-sm text-gray-900">{field.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {timelineFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-medium text-gray-600">
                  Created
                </span>
                <span className="text-sm text-gray-900">
                  {format(new Date(apr.createdAt), 'MMM dd, yyyy hh:mm a')}
                </span>
              </div>
              {timelineFields.map((field, idx) => (
                <div key={idx} className="flex justify-between border-b pb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      {field.label}
                    </span>
                    {field.detail && (
                      <p className="text-xs text-gray-500">by {field.detail}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{field.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
