import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Circle } from 'lucide-react'
import type { AttachmentOptions } from '@/features/procurement/apr/types'

interface AttachmentRequirementsCardProps {
  attachments: AttachmentOptions | undefined
}

const ATTACHMENT_TYPES = [
  {
    key: 'observationReportRequired',
    label: 'Observation Report',
    description: 'Required for item inspection/verification',
  },
  {
    key: 'collectiveBarterAgreementRequired',
    label: 'Collective Barter Agreement',
    description: 'Required for barter/exchange transactions',
  },
  {
    key: 'completeSpecsRequired',
    label: 'Complete Specifications',
    description: 'Detailed technical specifications required',
  },
] as const

export function AttachmentRequirementsCard({
  attachments,
}: AttachmentRequirementsCardProps) {
  if (!attachments) return null

  const requiredCount = Object.values(attachments).filter(Boolean).length

  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          Attachment Requirements ({requiredCount}/3)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ATTACHMENT_TYPES.map(({ key, label, description }) => {
            const isRequired = attachments[key as keyof AttachmentOptions]
            return (
              <div
                key={key}
                className="flex items-start gap-3 pb-2 last:pb-0 border-b last:border-b-0 border-green-200"
              >
                <div className="mt-0.5">
                  {isRequired ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      isRequired ? 'text-green-900' : 'text-gray-600'
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{description}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    isRequired
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isRequired ? 'REQUIRED' : 'OPTIONAL'}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
