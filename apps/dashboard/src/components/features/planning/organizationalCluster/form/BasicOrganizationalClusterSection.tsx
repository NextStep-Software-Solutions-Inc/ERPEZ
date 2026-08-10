import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BasicClusterSectionProps {
  form: any
  isLoading?: boolean
}

export default function BasicOrganizationalClusterSection({
  form,
  isLoading = false,
}: BasicClusterSectionProps) {
  return (
    <div className="grid gap-6">
      {/* Cluster Name */}
      <form.Field
        name="name"
        children={(field: any) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter Cluster Name"
              disabled={isLoading}
              className={
                field.state.meta.errors.length > 0 ? 'border-destructive' : ''
              }
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Cluster Description */}
      <form.Field
        name="description"
        children={(field: any) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              value={field.state.value ?? ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter Cluster Description"
              rows={4}
              disabled={isLoading}
            />
          </div>
        )}
      />
    </div>
  )
}
