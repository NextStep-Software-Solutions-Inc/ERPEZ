import React, { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
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
import { useUpdateOrgUnit } from '@/pages/planning/organization/hooks/useOrgUnits'
import type { OrgUnit } from '@/services/mock/orgUnits'
import { Loader2 } from 'lucide-react'
import { useOfficeCategories, useSatelliteClusters, useOfficeTypes, useAdministrativeLevels, useProcurementWorkflows } from '@/pages/planning/organization/hooks/useSettings'

// Helper function to render validation errors as text
const getErrorMessage = (error: unknown): string => {
  if (error == null) return 'This field is required'
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}

export const officeSchema = z.object({
  name: z.string().trim().min(1, 'Office name is required'),
  code: z.string().min(1, 'Office code is required'),
  type: z.enum(['office', 'division', 'section', 'unit', 'department', 'bureau', 'service', 'center']),
  category: z.enum(['executive', 'administrative', 'technical', 'support', 'oversight', 'delivery', 'regulatory']),
  level: z.enum(['central', 'regional', 'provincial', 'municipal', 'barangay', 'satellite']),
  parentId: z.string().optional(),
  uacsCode: z.string().optional(),
  responsibilityCenter: z.string().optional(),
  region: z.string().optional(),
  province: z.string().optional(),
  municipality: z.string().optional(),
  barangay: z.string().optional(),
  cluster: z.string().optional(),
  procurementWorkflow: z.enum(['centralized', 'decentralized', 'mixed', 'none']).optional(),
  budgetingCostCenter: z.string().optional(),
  description: z.string().optional(),
})

export type OfficeFormValues = z.infer<typeof officeSchema>

interface UpdateOfficeFormProps {
  unit: OrgUnit
  onUpdated: () => void
  onClose: () => void
  parentUnits?: OrgUnit[]
  isDirtyCallback?: (isDirty: boolean) => void
}

export function UpdateOfficeForm({ unit, onUpdated, onClose, parentUnits, isDirtyCallback }: UpdateOfficeFormProps) {
  const updateMutation = useUpdateOrgUnit()
  const { data: officeCategoriesResp } = useOfficeCategories({ pathParams: {}, queryParams: {} })
  const officeCategories = officeCategoriesResp?.data ?? []

  const { data: satelliteClustersResp } = useSatelliteClusters({ pathParams: {}, queryParams: {} })
  const satelliteClusters = satelliteClustersResp?.data ?? []

  const { data: officeTypesResp } = useOfficeTypes({ pathParams: {}, queryParams: {} })
  const officeTypes = officeTypesResp?.data ?? []

  const { data: administrativeLevelsResp } = useAdministrativeLevels({ pathParams: {}, queryParams: {} })
  const administrativeLevels = administrativeLevelsResp?.data ?? []

  const { data: procurementWorkflowsResp } = useProcurementWorkflows({ pathParams: {}, queryParams: {} })
  const procurementWorkflows = procurementWorkflowsResp?.data ?? []

  const form = useForm({
    defaultValues: {
      name: unit.name,
      code: unit.code,
      type: (unit.type || 'division') as 'office' | 'division' | 'section' | 'unit' | 'department' | 'bureau' | 'service' | 'center',
      // category: (unit.category || 'administrative') as 'executive' | 'administrative' | 'technical' | 'support' | 'oversight' | 'delivery' | 'regulatory', 
      level: (unit.level || 'central') as 'central' | 'regional' | 'provincial' | 'municipal' | 'barangay' | 'satellite',
      parentId: unit.parentId || 'root',
      uacsCode: unit.uacsCode || '',
      responsibilityCenter: unit.responsibilityCenter || unit.code,
      region: unit.region || '',
      province: unit.province || '',
      municipality: unit.municipality || '',
      barangay: unit.barangay || '',
      cluster: unit.cluster || '',
      procurementWorkflow: (unit.procurementWorkflow || 'centralized') as 'centralized' | 'decentralized' | 'mixed' | 'none',
      budgetingCostCenter: unit.budgetingCostCenter || '',
      description: unit.description || '',
    },
    validators: {
      onChange: officeSchema,
      onSubmit: officeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: unit.id,
          ...value,
          name: value.name?.trim(),
          parentId: value.parentId === 'root' ? undefined : value.parentId,
        })
        onUpdated()
      } catch (error) {
        console.error('Failed to update office:', error)
      }
    },
  })

  // Notify parent when form dirty state changes
  React.useEffect(() => {
    isDirtyCallback?.(form.state.isDirty)
  }, [form.state.isDirty, isDirtyCallback])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      {/* Form-level error display */}
      {form.state.submitCount > 0 && !form.state.isValid && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-semibold">
            Please correct the errors below before saving.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="name"
          children={(field) => (
            <div className="col-span-2 space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Office / Unit Name
              </Label>
              <Input
                id={field.name}
                type="text"
                placeholder="e.g., Finance and Administrative Services"
                value={field.state.value}
                onBlur={() => {
                  field.handleBlur()
                  field.handleChange(String(field.state.value ?? '').trim())
                }}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`text-sm font-medium ${field.state.meta.errors?.length ? 'border-destructive' : ''}`}
              />
              {(field.state.meta.errors?.length ?? 0) > 0 && (
                <p className="text-xs text-destructive font-semibold">{getErrorMessage(field.state.meta.errors?.[0])}</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="code"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Office Code
              </Label>
              <Input
                id={field.name}
                type="text"
                placeholder="e.g., FAS"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`text-sm font-mono font-semibold ${field.state.meta.errors?.length ? 'border-destructive' : ''}`}
              />
              {(field.state.meta.errors?.length ?? 0) > 0 && (
                <p className="text-xs text-destructive font-semibold">{getErrorMessage(field.state.meta.errors?.[0])}</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="type"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Office Type
              </Label>
              <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as any)}>
                <SelectTrigger className={field.state.meta.errors?.length ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder_type" disabled className="text-default-400">Select type</SelectItem>
                  {officeTypes.length > 0 ? (
                    officeTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name.toLowerCase()}>
                        {t.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="division">Division</SelectItem>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="unit">Unit</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="bureau">Bureau</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {(field.state.meta.errors?.length ?? 0) > 0 && (
                <p className="text-xs text-destructive font-semibold">{getErrorMessage(field.state.meta.errors?.[0])}</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="category"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Category
              </Label>
              <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as any)}>
                <SelectTrigger className={field.state.meta.errors?.length ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder_category" disabled className="text-default-400">Select category</SelectItem>
                  {officeCategories.length > 0 ? (
                    officeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback to hardcoded values if no categories loaded
                    <>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="oversight">Oversight</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {(field.state.meta.errors?.length ?? 0) > 0 && (
                <p className="text-xs text-destructive font-semibold">{getErrorMessage(field.state.meta.errors?.[0])}</p>
              )}
            </div>
          )}
        />

        <form.Field
          name="level"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Administrative Level
              </Label>
              <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as any)}>
                <SelectTrigger className={field.state.meta.errors?.length ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder_level" disabled className="text-default-400">Select level</SelectItem>
                  {administrativeLevels.length > 0 ? (
                    administrativeLevels.map((level) => (
                      <SelectItem key={level.id} value={level.name.toLowerCase()}>
                        {level.name}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback to hardcoded values if no levels loaded
                    <>
                      <SelectItem value="central">Central</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="provincial">Provincial</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="barangay">Barangay</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {(field.state.meta.errors?.length ?? 0) > 0 && (
                <p className="text-xs text-destructive font-semibold">{getErrorMessage(field.state.meta.errors?.[0])}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Financial & Location Metadata */}
      <div className="pt-4 border-t border-default-200">
        <h3 className="text-xs font-semibold text-default-700 uppercase tracking-wider mb-4">Financial Metadata</h3>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="uacsCode"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                  UACS Code
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="e.g., 01-01-01-001"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="text-sm font-mono"
                />
              </div>
            )}
          />

          <form.Field
            name="procurementWorkflow"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                  Procurement Workflow
                </Label>
                <Select value={field.state.value || 'centralized'} onValueChange={(value) => field.handleChange(value as any)}>
                  <SelectTrigger className={field.state.meta.errors?.length ? 'border-destructive' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder_workflow" disabled className="text-default-400">Select workflow</SelectItem>
                    {procurementWorkflows.length > 0 ? (
                      procurementWorkflows.map((w) => (
                        <SelectItem key={w.id} value={w.name.toLowerCase()}>
                          {w.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="centralized">Centralized</SelectItem>
                        <SelectItem value="decentralized">Decentralized</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {(field.state.meta.errors?.length ?? 0) > 0 && (
                  <p className="text-xs text-destructive font-semibold">{getErrorMessage(field.state.meta.errors?.[0])}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Geographic & Satellite Details */}
      <div className="pt-4 border-t border-default-200">
        <h3 className="text-xs font-semibold text-default-700 uppercase tracking-wider mb-4">Agency Location & Satellite Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="region"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                  Region
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="e.g., NCR"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="text-sm font-medium"
                />
              </div>
            )}
          />

          <form.Field
            name="province"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                  Province
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="e.g., Manila"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="text-sm font-medium"
                />
              </div>
            )}
          />

          <form.Field
            name="municipality"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                  Municipality
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="e.g., Makati"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="text-sm font-medium"
                />
              </div>
            )}
          />

          <form.Field
            name="cluster"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                  Satellite / Cluster
                </Label>
                <Select value={field.state.value || ''} onValueChange={(value) => field.handleChange(value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a satellite cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__placeholder_cluster" disabled className="text-default-400">Select a satellite cluster</SelectItem>
                    {satelliteClusters.length > 0 ? (
                      satelliteClusters.map((cluster) => (
                        <SelectItem key={cluster.id} value={cluster.id}>
                          {cluster.name} ({cluster.code})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-clusters" disabled>
                        No clusters available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-default-200">
        <Button
          type="button"
          variant="outline"
          className="font-medium"
          onClick={onClose}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending || !form.state.isValid}
          className="font-semibold"
        >
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
