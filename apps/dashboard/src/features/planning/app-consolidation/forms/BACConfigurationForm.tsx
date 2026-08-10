import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AppMaster, BACWorkspace } from '../types'
import { BACWorkspace as BACWorkspaceComponent } from '../components/BACWorkspace'

interface BACConfigurationFormProps {
  appData: AppMaster
  onConfirm?: (data: AppMaster) => void
  onChange?: (data: AppMaster) => void
}

export function BACConfigurationForm({
  appData,
  onConfirm,
  onChange,
}: BACConfigurationFormProps) {
  const [formData, setFormData] = useState<AppMaster>(appData)

  const handleWorkspaceChange = (updatedWorkspace: BACWorkspace) => {
    const updated = { ...formData, bac: updatedWorkspace }
    setFormData(updated)
    onChange?.(updated)
  }

  const handleConfirm = () => {
    onConfirm?.(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Alignment Checklist Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <BACWorkspaceComponent
          workspace={formData.bac}
          onUpdate={handleWorkspaceChange}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleConfirm}>
            Confirm Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
