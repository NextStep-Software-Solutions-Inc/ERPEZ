import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PriceCatalogueFormData } from '../../types'

type SelectOption = {
  value: string
  label: string
}

interface PriceCatalogueFormProps {
  onSubmit: (data: PriceCatalogueFormData) => void
  onCancel: () => void
  initialData?: PriceCatalogueFormData
  isLoading?: boolean
  procurementItemOptions: SelectOption[]
  fiscalYearOptions: SelectOption[]
}

export function PriceCatalogueForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  procurementItemOptions,
  fiscalYearOptions,
}: PriceCatalogueFormProps) {
  const [formData, setFormData] = useState<PriceCatalogueFormData>(
    initialData || {
      procurementItemId: '',
      fiscalYearId: '',
      unitPrice: 0,
    },
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData(
      initialData || {
        procurementItemId: '',
        fiscalYearId: '',
        unitPrice: 0,
      },
    )
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fiscalYearId) {
      newErrors.fiscalYearId = 'Fiscal year is required'
    }
    if (!formData.procurementItemId) {
      newErrors.procurementItemId = 'Procurement item is required'
    }
    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]"
    >
      {/* Fiscal Year - First */}
      <div className="space-y-2">
        <Label htmlFor="fiscalYearId">
          Fiscal Year <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.fiscalYearId}
          onValueChange={(value) =>
            setFormData({ ...formData, fiscalYearId: value })
          }
        >
          <SelectTrigger
            id="fiscalYearId"
            className={errors.fiscalYearId ? 'border-red-500' : ''}
          >
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent side="bottom" className="z-[9999]">
            {fiscalYearOptions.map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.fiscalYearId && (
          <p className="text-sm text-red-500">{errors.fiscalYearId}</p>
        )}
      </div>

      {/* Procurement Item */}
      <div className="space-y-2">
        <Label htmlFor="procurementItemId">
          Procurement Item <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.procurementItemId}
          onValueChange={(value) =>
            setFormData({ ...formData, procurementItemId: value })
          }
        >
          <SelectTrigger
            id="procurementItemId"
            className={errors.procurementItemId ? 'border-red-500' : ''}
          >
            <SelectValue placeholder="Select procurement item" />
          </SelectTrigger>
          <SelectContent side="bottom" className="z-[9999]">
            {procurementItemOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.procurementItemId && (
          <p className="text-sm text-red-500">{errors.procurementItemId}</p>
        )}
      </div>

      {/* Unit Price */}
      <div className="space-y-2">
        <Label htmlFor="unitPrice">
          Unit Price <span className="text-red-500">*</span>
        </Label>
        <Input
          id="unitPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={formData.unitPrice}
          onChange={(e) =>
            setFormData({
              ...formData,
              unitPrice: parseFloat(e.target.value) || 0,
            })
          }
          className={errors.unitPrice ? 'border-red-500' : ''}
        />
        {errors.unitPrice && (
          <p className="text-sm text-red-500">{errors.unitPrice}</p>
        )}
        <span className="text-xs text-muted-foreground">
          In Philippine Pesos (₱)
        </span>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Price'}
        </Button>
      </div>
    </form>
  )
}
