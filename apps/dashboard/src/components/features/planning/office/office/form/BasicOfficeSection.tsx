import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getOfficeTypesRequest } from '../handlers/getOfficeTypesRequest'
import { getOrganizationsRequest } from '../handlers/getOrganizationsRequest'
import { getCategoriesRequest } from '../handlers/getCategoriesRequest'
import { getAdministrativeLevelsRequest } from '../handlers/getAdministrativeLevelsRequest'

interface BasicOfficeSectionProps {
  form: any
  isLoading?: boolean
}

const useOfficeTypes = createQueryHookFromTemplate(getOfficeTypesRequest)
const useOrganizations = createQueryHookFromTemplate(getOrganizationsRequest)
const useCategories = createQueryHookFromTemplate(getCategoriesRequest)
const useAdministrativeLevels = createQueryHookFromTemplate(getAdministrativeLevelsRequest)

export default function BasicOfficeSection({
  form,
  isLoading = false,
}: BasicOfficeSectionProps) {
  const { data: officeTypesData, isLoading: officeTypesLoading } = useOfficeTypes({ pathParams: {}, queryParams: {} })
  const { data: organizationsData, isLoading: orgsLoading } = useOrganizations({ pathParams: {}, queryParams: {} })
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ pathParams: {}, queryParams: {} })
  const { data: adminLevelsData, isLoading: adminLevelsLoading } = useAdministrativeLevels({ pathParams: {}, queryParams: {} })

  const officeTypes = officeTypesData?.data ?? []
  const organizations = organizationsData?.data ?? []
  const categories = categoriesData?.data ?? []
  const adminLevels = adminLevelsData?.data ?? []

  return (
    <div className="grid gap-6">
      {/* Row: Office Name & Code */}
      <div className="grid grid-cols-2 gap-4">
        {/* Office Name */}
        <form.Field
          name="name"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Office Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter Office Name"
                disabled={isLoading}
                className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
                required
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        />

        {/* Office Code */}
        <form.Field
          name="code"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Office Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                placeholder="e.g. DICT-HQ"
                disabled={isLoading}
                className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
                required
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>
              )}
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
              placeholder="Enter full office address"
              disabled={isLoading}
              className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>
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
              placeholder="Enter office description"
              rows={3}
              disabled={isLoading}
            />
          </div>
        )}
      />

      {/* Row: Office Type & Organization */}
      <div className="grid grid-cols-2 gap-4">
        {/* Office Type */}
        <form.Field
          name="officeTypeId"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label>
                Office Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value || ''}
                onValueChange={(v) => field.handleChange(v)}
                disabled={isLoading || officeTypesLoading}
              >
                <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}>
                  <SelectValue placeholder={officeTypesLoading ? 'Loading...' : 'Select Office Type'} />
                </SelectTrigger>
                <SelectContent>
                  {officeTypes.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        />

        {/* Organization */}
        <form.Field
          name="organizationId"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label>
                Organization <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value || ''}
                onValueChange={(v) => field.handleChange(v)}
                disabled={isLoading || orgsLoading}
              >
                <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}>
                  <SelectValue placeholder={orgsLoading ? 'Loading...' : 'Select Organization'} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Row: Category & Administrative Level */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <form.Field
          name="categoryId"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value || ''}
                onValueChange={(v) => field.handleChange(v)}
                disabled={isLoading || categoriesLoading}
              >
                <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}>
                  <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select Category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        />

        {/* Administrative Level */}
        <form.Field
          name="administrativeLevelId"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label>
                Administrative Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value || ''}
                onValueChange={(v) => field.handleChange(v)}
                disabled={isLoading || adminLevelsLoading}
              >
                <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-destructive' : ''}>
                  <SelectValue placeholder={adminLevelsLoading ? 'Loading...' : 'Select Admin Level'} />
                </SelectTrigger>
                <SelectContent>
                  {adminLevels.map((l: any) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Row: Responsibility Center Code & Budget Cost Center */}
      <div className="grid grid-cols-2 gap-4">
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
                placeholder="e.g. RC-001"
                disabled={isLoading}
              />
            </div>
          )}
        />

        <form.Field
          name="budgetCostCenter"
          children={(field: any) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Budget Cost Center</Label>
              <Input
                id={field.name}
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. CC-001"
                disabled={isLoading}
              />
            </div>
          )}
        />
      </div>
    </div>
  )
}
