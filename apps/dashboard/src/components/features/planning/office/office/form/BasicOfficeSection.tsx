import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BasicOfficeSectionProps {
  form: any
  isLoading?: boolean
}

export default function BasicOfficeSection({
  form,
  isLoading = false,
}: BasicOfficeSectionProps) {
  return (
    <div className="grid gap-6">
      {/* First Row: Office Name & Description */}
      <div className="grid grid-cols-1 gap-6">
        {/* Office Name */}
        <form.Field
          name="name"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Office <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Office Name"
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

        {/* Description */}
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
                placeholder="Enter Office Description"
                rows={4}
                disabled={isLoading}
              />
            </div>
          )}
        />
      </div>

      {/* Second Row: Office Head & Email */}
      <div className="grid grid-cols-1 gap-6">
        {/* Office Head */}
        <form.Field
          name="officeHead"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Office Head <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Office Head Name"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
                required
              />
            </div>
          )}
        />

        {/* Email */}
        <form.Field
          name="email"
          children={(field: any) => (
            <div className="grid gap-1">
              <Label htmlFor={field.name}>
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Email"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
                required
              />
            </div>
          )}
        />
      </div>

      {/* Office Address */}
      <form.Field
        name="address"
        children={(field: any) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>
              Office Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter Office Address"
              disabled={isLoading}
              className={
                field.state.meta.errors.length > 0 ? 'border-destructive' : ''
              }
              required
            />
          </div>
        )}
      />

      {/* Country & Postal Code */}
      <div className="grid grid-cols-2 gap-6">
        <form.Field
          name="country"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Country <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Country"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
                required
              />
            </div>
          )}
        />

        <form.Field
          name="postalCode"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Postal Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Postal Code"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
                required
              />
            </div>
          )}
        />
      </div>

      {/* Contact Number & Responsibility Center Code */}
      <div className="grid grid-cols-2 gap-6">
        <form.Field
          name="contactNumber"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Contact Number"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
                required
              />
            </div>
          )}
        />

        <form.Field
          name="responsibilityCenterCode"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Responsibility Center Code</Label>
              <Input
                id={field.name}
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Responsibility Center Code"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
