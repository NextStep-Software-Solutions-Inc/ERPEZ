import { useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { TemplateTable } from '@/components/TemplateTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BacResolution } from '../types'

interface ViewBacResolutionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolutionId?: string | null
  onCreatePr?: (resolution: BacResolution) => void
}

export function ViewBacResolutionDetailsDialog({
  open,
  onOpenChange,
}: ViewBacResolutionDetailsDialogProps) {



  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="BAC Project & Resolution Details"
      description="Detailed overview of the BAC resolution, procurement context, and bidding activities."
      size="xl"
      showCloseButton
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-3">

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <></>
    </ResponsiveDialogDashtail>
  )
}
