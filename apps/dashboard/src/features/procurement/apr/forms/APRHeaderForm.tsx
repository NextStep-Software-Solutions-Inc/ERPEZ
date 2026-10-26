/**
 * APR Header Metadata Form Component
 * Handles user input for APR creation header (Agency Control No., Account Code, etc.)
 * 
 * Max 200 lines - composite component using TanStack Form + Zod
 */

import type { AnyFieldApi } from '@tanstack/react-form'
import {
  Input,
} from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

interface APRHeaderFormProps {
  form: {
    Field: React.ElementType<{
      name: string
      children: (field: AnyFieldApi) => React.ReactNode
    }>
  }
}

interface FieldWrapperProps {
  children: React.ReactNode
  label: string
  error?: string
}

function FieldWrapper({ children, label, error }: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export function APRHeaderForm({ form }: APRHeaderFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Agency Control Number */}
        <form.Field
          name="agencyControlNumber"
          children={(field: AnyFieldApi) => (
            <FieldWrapper
              label="Agency Control Number"
              error={field.state.meta.errors[0]}
            >
              <Input
                placeholder="Enter agency control number"
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full"
              />
            </FieldWrapper>
          )}
        />

        {/* Agency Account Code */}
        <form.Field
          name="agencyAccountCode"
          children={(field: AnyFieldApi) => (
            <FieldWrapper
              label="Agency Account Code"
              error={field.state.meta.errors[0]}
            >
              <Input
                placeholder="Enter account code"
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full"
              />
            </FieldWrapper>
          )}
        />
      </div>

      {/* Request Date */}
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="requestDate"
          children={(field: AnyFieldApi) => (
            <FieldWrapper
              label="Request Date"
              error={field.state.meta.errors[0]}
            >
              <Input
                type="date"
                value={
                  field.state.value
                    ? format(new Date(field.state.value), 'yyyy-MM-dd')
                    : ''
                }
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(new Date(e.target.value).toISOString())
                }
                className="w-full"
              />
            </FieldWrapper>
          )}
        />

        {/* Fiscal Year - Read Only (locked to APP selection) */}
        <form.Field
          name="fiscalYear"
          children={(field: AnyFieldApi) => (
            <FieldWrapper
              label="Fiscal Year (Locked)"
              error={field.state.meta.errors[0]}
            >
              <Select
                value={field.state.value?.toString()}
                onValueChange={(value) => field.handleChange(parseInt(value))}
                disabled={true}
              >
                <SelectTrigger className="opacity-60 cursor-not-allowed bg-gray-100">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        FY {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Fiscal year is determined by your APP selection</p>
            </FieldWrapper>
          )}
        />
      </div>

      {/* Description */}
      <form.Field
        name="description"
        children={(field: AnyFieldApi) => (
          <FieldWrapper
            label="Description"
            error={field.state.meta.errors[0]}
          >
            <Textarea
              placeholder="Enter APR description or remarks"
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full min-h-24"
            />
          </FieldWrapper>
        )}
      />
    </div>
  )
}
