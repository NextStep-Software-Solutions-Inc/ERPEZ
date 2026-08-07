import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { createDebouncedYearValidation } from '../utils/validation'
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types'

interface EditFiscalYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fiscalYear: FiscalYear | null
  year: number
  // onYearChange: (year: number) => void;
  description: string
  onDescriptionChange: (description: string) => void
  onUpdate: () => void
  isLoading?: boolean
  existingYears: FiscalYear[]
}

/**
 * Dialog component for editing existing fiscal years
 */
export function EditFiscalYearDialog({
  open,
  onOpenChange,
  fiscalYear,
  year,
  onYearChange,
  description,
  onDescriptionChange,
  onUpdate,
  isLoading = false,
  existingYears,
}: EditFiscalYearDialogProps) {
  if (!fiscalYear) return null

  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [duplicateYearError, setDuplicateYearError] = useState<string | null>(
    null,
  )

  const debouncedValidateYear = createDebouncedYearValidation(
    existingYears,
    fiscalYear.id,
    setDuplicateYearError,
  )

  // Trigger debounced validation when year changes
  useEffect(() => {
    if (year && year >= 2000 && year <= 2100) {
      debouncedValidateYear(year)
    } else {
      setDuplicateYearError(null)
    }
  }, [year, debouncedValidateYear])

  const validateYear = (value: number): boolean => {
    if (!value) {
      return false
    }
    if (value < 2000 || value > 2100) {
      return false
    }
    return true
  }

  const validateDescription = (value: string): boolean => {
    if (value.length > 200) {
      setDescriptionError('Description must not exceed 200 characters')
      return false
    }
    setDescriptionError(null)
    return true
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    onYearChange(value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onDescriptionChange(value)
    validateDescription(value)
  }

  const isYearValid = validateYear(year)
  const isFormValid = isYearValid && !descriptionError && !duplicateYearError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Fiscal Year</DialogTitle>
          <DialogDescription>
            Update the fiscal year details. 12 months are already created and
            cannot be modified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-year">Fiscal Year</Label>
            <Input
              id="edit-year"
              type="number"
              value={year}
              onChange={handleYearChange}
              min="2000"
              max="2100"
              disabled={isLoading}
              className={cn(
                'transition-colors',
                (!isYearValid || duplicateYearError) &&
                  year !== 0 &&
                  'border-destructive focus:border-destructive',
              )}
            />
            {!isYearValid && year !== 0 && (
              <p className="text-xs text-destructive">
                Year must be between 2000 and 2100
              </p>
            )}
            {duplicateYearError && (
              <p className="text-xs text-destructive">{duplicateYearError}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <span className="text-xs text-muted-foreground">
                {description.length}/200
              </span>
            </div>
            <Input
              id="edit-description"
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="e.g., Current Fiscal Year"
              disabled={isLoading}
              className={cn(
                'transition-colors',
                descriptionError &&
                  'border-destructive focus:border-destructive',
              )}
            />
            {descriptionError && (
              <p className="text-xs text-destructive">{descriptionError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={isLoading || !isFormValid}>
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
