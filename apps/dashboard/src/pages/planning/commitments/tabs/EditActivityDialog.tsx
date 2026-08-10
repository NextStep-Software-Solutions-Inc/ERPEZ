import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'

const AVAILABLE_DIVISIONS = [
  'Quality Assurance Division',
  'Human Resources Division',
  'Planning Division',
  'ICT Division',
  'Finance Division',
  'Risk Management Division',
  'Innovation Division',
  'Customer Relations Division',
  'Project Management Office'
]

interface EditActivityDialogProps {
  activity: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivityUpdated: (updatedActivity: any) => void
}

export function EditActivityDialog({
  activity,
  open,
  onOpenChange,
  onActivityUpdated,
}: EditActivityDialogProps) {
  const { toast } = useToast()
  const [editedActivity, setEditedActivity] = useState({
    name: '',
    description: '',
    budget: '',
    involvedDivisions: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when activity or dialog opens
  useEffect(() => {
    if (open && activity) {
      setEditedActivity({
        name: activity.name || '',
        description: activity.description || '',
        budget: activity.budget?.toString() || '',
        involvedDivisions: activity.responsibleOffice
          ? activity.responsibleOffice.split(', ')
          : [],
      })
    }
  }, [open, activity])

  const handleUpdateActivity = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!editedActivity.name.trim()) {
      newErrors.name = 'Activity name is required'
    }
    if (!editedActivity.budget || parseFloat(editedActivity.budget as any) <= 0) {
      newErrors.budget = 'Budget must be greater than 0'
    }
    if (editedActivity.involvedDivisions.length === 0) {
      newErrors.involvedDivisions = 'At least one division must be selected'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    const updatedActivity = {
      ...activity,
      name: editedActivity.name,
      description: editedActivity.description,
      budget: parseFloat(editedActivity.budget as any),
      responsibleOffice: editedActivity.involvedDivisions.join(', '),
    }

    onActivityUpdated(updatedActivity)
    onOpenChange(false)

    // Show success toast
    toast({
      title: 'Success',
      description: `Activity "${editedActivity.name}" has been updated successfully.`,
      color: 'success',
    })
  }

  const handleDivisionToggle = (division: string) => {
    setEditedActivity(prev => ({
      ...prev,
      involvedDivisions: prev.involvedDivisions.includes(division)
        ? prev.involvedDivisions.filter(d => d !== division)
        : [...prev.involvedDivisions, division]
    }))
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Activity"
      description="Update activity details"
      size="lg"
      overlayClass="bg-black/20 backdrop-blur-sm"
      showCloseButton={true}
      footer={
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-activity-form">
            Update Activity
          </Button>
        </div>
      }
      className="sm:max-w-[600px]"
    >
      <form id="edit-activity-form" onSubmit={handleUpdateActivity} className="space-y-6">
        <div className="space-y-6">
            {/* Activity Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Activity Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter activity name"
                value={editedActivity.name}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the activity in detail"
                value={editedActivity.description}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Proposed Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">
                Budget <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">₱</span>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter budget amount"
                  value={editedActivity.budget}
                  onChange={(e) => setEditedActivity(prev => ({ ...prev, budget: e.target.value }))}
                  className={`flex-1 ${errors.budget ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
            </div>

            {/* Involved Divisions */}
            <div className="space-y-2">
              <Label>
                Involved Divisions <span className="text-red-500">*</span>
              </Label>
              <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {AVAILABLE_DIVISIONS.map((division) => (
                  <div key={division} className="flex items-center space-x-2">
                    <Checkbox
                      id={division}
                      checked={editedActivity.involvedDivisions.includes(division)}
                      onCheckedChange={() => handleDivisionToggle(division)}
                    />
                    <Label htmlFor={division} className="font-normal cursor-pointer">
                      {division}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.involvedDivisions && <p className="text-sm text-red-500">{errors.involvedDivisions}</p>}
            </div>
        </div>
      </form>
    </ResponsiveDialog>
  )
}
