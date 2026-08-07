'use client'

import { useForm } from '@tanstack/react-form'
import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import FieldInfo from '@/components/FieldInfo'
import type { Department, User } from '@/lib/fiscal-year-and-policies/types'
import { FiscalYear } from '../../fiscal-year-management/types/types'
import type { SignatoryMatrixFormValues } from './signatoryMatrixForm.schema'
import { signatoryMatrixFormSchema } from './signatoryMatrixForm.schema'

interface EditWorkflowMatrixFormProps {
  fiscalYearId?: string
  departmentId?: string
  departmentName?: string
  documentType?: string
  recommendingApproverId?: string
  finalApproverId?: string
  onSubmit: (values: SignatoryMatrixFormValues) => Promise<void>
  isLoading?: boolean
  formId?: string
  isEdit?: boolean
  availableUsers?: User[]
  availableDepartments?: Department[]
  availableFiscalYears?: FiscalYear[]
}

export function EditWorkflowMatrixForm({
  fiscalYearId = '',
  departmentId = '',
  departmentName = '',
  documentType = '',
  recommendingApproverId = '',
  finalApproverId = '',
  onSubmit,
  isLoading = false,
  formId = 'edit-workflow-matrix-form',
  isEdit = false,
  availableUsers = [],
  availableDepartments = [],
  availableFiscalYears = [],
}: EditWorkflowMatrixFormProps) {
  const form = useForm({
    defaultValues: {
      fiscalYearId: fiscalYearId || '',
      departmentId: departmentId || '',
      documentType: documentType || '',
      recommendingApproverId: recommendingApproverId || '',
      finalApproverId: finalApproverId || '',
    },
    validators: {
      onChange: signatoryMatrixFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const userOptions = useMemo(
    () =>
      availableUsers.map((user: User) => ({
        value: user.id,
        label: user.name,
      })),
    [availableUsers],
  )

  const deptOptions = useMemo(
    () =>
      availableDepartments.map((dept: Department) => ({
        value: dept.id,
        label: `${dept.name} (${dept.code})`,
      })),
    [availableDepartments],
  )

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <form.Field
        name="fiscalYearId"
        children={(field) => (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Fiscal Year <span className="text-destructive">*</span>
            </Label>
            <Combobox
              options={availableFiscalYears.map((fy: FiscalYear) => ({
                value: fy.id,
                label: String(fy.year),
              }))}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              placeholder="Select fiscal year"
              searchPlaceholder="Search fiscal years..."
              disabled={isLoading || isEdit}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {isEdit && fiscalYearId && (
        <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-lg">
          <p className="text-xs text-slate-600 font-medium">Fiscal Year</p>
          <p className="text-sm font-semibold text-slate-900">
            {availableFiscalYears.find(
              (fy: FiscalYear) => fy.id === fiscalYearId,
            )?.year || fiscalYearId}
          </p>
        </div>
      )}

      {!isEdit && (
        <form.Field
          name="departmentId"
          children={(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Department <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={deptOptions}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                placeholder="Select a department"
                searchPlaceholder="Search departments..."
                disabled={isLoading || isEdit}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      {isEdit && departmentId && (
        <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-lg">
          <p className="text-xs text-slate-600 font-medium">Department</p>
          <p className="text-sm font-semibold text-slate-900">
            {departmentName}
          </p>
        </div>
      )}

      <form.Field
        name="documentType"
        children={(field) => (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Document Type <span className="text-destructive">*</span>
            </Label>
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Enter document type"
              disabled={isLoading}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Field
        name="recommendingApproverId"
        children={(field) => (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Recommending Approver <span className="text-destructive">*</span>
            </Label>
            <Combobox
              options={userOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              placeholder="Select recommending approver"
              searchPlaceholder="Search users..."
              disabled={isLoading}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <form.Field
        name="finalApproverId"
        children={(field) => (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Final Approver <span className="text-destructive">*</span>
            </Label>
            <Combobox
              options={userOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              placeholder="Select final approver"
              searchPlaceholder="Search users..."
              disabled={isLoading}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      <button type="submit" hidden />
    </form>
  )
}

export default EditWorkflowMatrixForm
