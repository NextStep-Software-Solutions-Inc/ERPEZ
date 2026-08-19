/**
 * Attachment Requirements Card
 * Clean neutral display showing individual requirement statuses with progress count
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'
import type { AttachmentOptions } from '@/features/procurement/apr/types'

interface AttachmentRequirementsCardProps {
  attachments: AttachmentOptions | undefined
}

const ATTACHMENT_TYPES = [
  {
    key: 'observationReportRequired',
    label: 'Observation Report (ObR)',
    description: 'Required for item inspection and verification',
  },
  {
    key: 'collectiveBarterAgreementRequired',
    label: 'Collective Barter Agreement (CBA)',
    description: 'Required for barter/exchange transactions',
  },
  {
    key: 'completeSpecsRequired',
    label: 'Complete Specifications',
    description: 'Detailed technical specifications required for item fulfillment',
  },
] as const

export function AttachmentRequirementsCard({
  attachments,
}: AttachmentRequirementsCardProps) {
  const safeAttachments = attachments || {
    observationReportRequired: false,
    collectiveBarterAgreementRequired: false,
    completeSpecsRequired: false,
  }

  const requiredCount = Object.values(safeAttachments).filter(Boolean).length

  return (
    <Card className="border border-gray-200 shadow-xs bg-white">
      <CardHeader className="py-3 px-5 border-b bg-slate-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attachment Requirements
        </CardTitle>
        <span className="text-xs font-medium text-muted-foreground font-mono">
          {requiredCount} of 3 configured
        </span>
      </CardHeader>
      <CardContent className="p-5">
        <div className="divide-y divide-gray-100">
          {ATTACHMENT_TYPES.map(({ key, label, description }) => {
            const isRequired = Boolean(safeAttachments[key as keyof AttachmentOptions])
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {isRequired ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-medium ${isRequired ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                      {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={isRequired ? 'default' : 'outline'}
                  className={`text-[10px] font-semibold tracking-wider flex-shrink-0 ${
                    isRequired
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'text-gray-500 border-gray-200 bg-gray-50/50'
                  }`}
                >
                  {isRequired ? 'REQUIRED' : 'OPTIONAL'}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
