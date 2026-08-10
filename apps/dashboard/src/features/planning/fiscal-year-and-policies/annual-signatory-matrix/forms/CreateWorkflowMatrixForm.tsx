'use client'

import { useForm } from '@tanstack/react-form'
import { useMemo } from 'react'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import FieldInfo from '@/components/FieldInfo'
import type { Department, User } from '@/lib/fiscal-year-and-policies/types'
import { FiscalYear } from '../../fiscal-year-management/types/types'
import type { CreateWorkflowMatrixPayload } from '../types/workflowMatrixTypes'

const createWorkflowMatrixFormSchema = z
  .object({
    officeId: z.string().min(1, 'Office is required'),
    fiscalYearId: z.string().min(1, 'Fiscal year is required'),
    documentType: z.string().min(1, 'Document type is required'),
    recommendingApproverUserId: z
      .string()
      .min(1, 'Recommending approver is required'),
    finalApproverUserId: z.string().min(1, 'Final approver is required'),
  })
  .refine(
    (data) => data.recommendingApproverUserId !== data.finalApproverUserId,
    {
      message: 'Recommending and Final approvers cannot be the same person',
      path: ['finalApproverUserId'],
    },
  )

interface CreateWorkflowMatrixFormProps {
  officeId?: string
  fiscalYearId?: string
  documentType?: string
  recommendingApproverUserId?: string
  finalApproverUserId?: string
  onSubmit: (values: CreateWorkflowMatrixPayload) => Promise<void>
  isLoading?: boolean
  formId?: string
  availableUsers?: User[]
  availableOffices?: Department[]
  availableFiscalYears?: FiscalYear[]
}

export function CreateWorkflowMatrixForm({
  officeId = '',
  fiscalYearId = '',
  documentType = '',
  recommendingApproverUserId = '',
  finalApproverUserId = '',
  onSubmit,
  isLoading = false,
  formId = 'create-workflow-matrix-form',
  availableUsers = [],
  availableOffices = [],
  availableFiscalYears = [],
}: CreateWorkflowMatrixFormProps) {
  const form = useForm({
    defaultValues: {
      officeId,
      fiscalYearId,
      documentType,
      recommendingApproverUserId,
      finalApproverUserId,
    },
    validators: {
      onChange: createWorkflowMatrixFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const userOptions = useMemo(
    () =>
      availableUsers.map((user) => ({
        value: user.id,
        label: user.name,
      })),
    [availableUsers],
  )

  const officeOptions = useMemo(
    () =>
      availableOffices.map((office) => ({
        value: office.id,
        label: `${office.name} (${office.code})`,
      })),
    [availableOffices],
  )

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <form.Field
        name="officeId"
        children={(field) => (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Office <span className="text-destructive">*</span>
            </Label>
            <Combobox
              options={officeOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              placeholder="Select office"
              searchPlaceholder="Search offices..."
              disabled={isLoading}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

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
              disabled={isLoading}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

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
        name="recommendingApproverUserId"
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
        name="finalApproverUserId"
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

export default CreateWorkflowMatrixForm
