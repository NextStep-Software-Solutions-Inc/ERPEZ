import React, { useEffect } from 'react'
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
import { useCreateOrgUnit } from '@/pages/planning/organization/hooks/useOrgUnits'
import { organizationConfig } from '@/config/organization.config'
import { Loader2 } from 'lucide-react'
import { OrgUnit } from '../types'
import { getOrganizationsRequest } from '../handlers/getOrganizationsRequest'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getOfficeCategoriesRequest } from '../settings/handlers/office-category'
import { getOfficeTypesRequest } from '../settings/handlers/office-type'
import { getProcurementWorkflowsRequest } from '../settings/handlers/procurement-workflow'
import { getAdministrativeLevelsRequest } from '../settings/handlers/administrative-level'
import { getClustersRequest } from '../settings/handlers/cluster'

export const useOrganizations = createQueryHookFromTemplate(getOrganizationsRequest)
export const useOfficeTypes = createQueryHookFromTemplate(getOfficeTypesRequest)
export const useOfficeCategories = createQueryHookFromTemplate(getOfficeCategoriesRequest)
export const useAdministrativeLevels = createQueryHookFromTemplate(getAdministrativeLevelsRequest)
export const useProcurementWorkflows = createQueryHookFromTemplate(getProcurementWorkflowsRequest)
export const useSatelliteClusters = createQueryHookFromTemplate(getClustersRequest)

export const officeSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  parentId: z.string().optional(),
  organizationId: z.string().optional(),
  uacsCode: z.string().optional(),
  responsibilityCenter: z.string().optional(),
  address: z.string().optional(),
  cluster: z.string().optional(),
  procurementWorkflow: z.string().optional(),
  budgetingCostCenter: z.string().optional(),
  description: z.string().optional(),
}).refine(
  (data) => {
    // Check if all required fields have values
    const requiredFields = ['name', 'code', 'type', 'category', 'level', 'parentId', 'responsibilityCenter', 'address', 'budgetingCostCenter']
    for (const field of requiredFields) {
      if (!data[field as keyof typeof data] || String(data[field as keyof typeof data]).trim() === '') {
        return false
      }
    }

    // Get current multi-site setting from localStorage
    const stored = localStorage.getItem('org_is_multi_site')
    const isMultiSite = stored !== null ? JSON.parse(stored) : organizationConfig.IS_MULTI_SITE
    // For multi-site: cluster is required
    if (isMultiSite && !data.cluster) {
      return false
    }
    return true
  },
  {
    message: 'Please fill in all required fields',
    path: ['_error'],
  }
)

export type OfficeFormValues = z.infer<typeof officeSchema>

interface CreateOfficeFormProps {
  onCreated: () => void
  onClose: () => void
  parentUnits?: OrgUnit[]
  isDirtyCallback?: (isDirty: boolean) => void
  organizationId?: string
}

export function CreateOfficeForm({ onCreated, onClose, parentUnits, isDirtyCallback, organizationId }: CreateOfficeFormProps) {
  const createMutation = useCreateOrgUnit()

  // Get multi-site setting from localStorage (defaults to config value if not set)
  const [isMultiSite] = React.useState(() => {
    const stored = localStorage.getItem('org_is_multi_site')
    return stored !== null ? JSON.parse(stored) : organizationConfig.IS_MULTI_SITE
  })

  // Load settings for dropdowns (use settings hooks — source of truth)
  const { data: officeTypesResp } = useOfficeTypes({ pathParams: {}, queryParams: {} })
  const officeTypes = officeTypesResp?.data ?? []

  const { data: officeCategoriesResp } = useOfficeCategories({ pathParams: {}, queryParams: {} })
  const officeCategories = officeCategoriesResp?.data ?? []

  const { data: administrativeLevelsResp } = useAdministrativeLevels({ pathParams: {}, queryParams: {} })
  const administrativeLevels = administrativeLevelsResp?.data ?? []

  const { data: procurementWorkflowsResp } = useProcurementWorkflows({ pathParams: {}, queryParams: {} })
  const procurementWorkflows = procurementWorkflowsResp?.data ?? []

  // use the full query result so we can access loading state properly
  const satelliteClustersQuery = useSatelliteClusters({ pathParams: {}, queryParams: {} })
  const satelliteClusters = satelliteClustersQuery.data?.data ?? []

  // organizations coming from backend (id,name,code,type,isActive)
  const organizationQuery = useOrganizations({pathParams: { pageNumber: 1, pageSize: 10 }, queryParams: {} }) 
  const organizations = organizationQuery.data?.data ?? []

  // Default cluster value based on multi-site config
  // Use undefined for multi-site (not empty string) to avoid failing validation on init
  const defaultCluster = isMultiSite ? undefined : organizationConfig.DEFAULT_CLUSTER_ID

  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      type: 'office',
      category: 'administrative',
      level: 'central',
      parentId: 'root',
      organizationId: '',
      uacsCode: '',
      responsibilityCenter: '',
      address: '',
      cluster: defaultCluster as string | undefined,
      procurementWorkflow: 'centralized',
      budgetingCostCenter: '',
      description: '',
    } as OfficeFormValues,
    validators: {
      onChange: officeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Helper: find ID by matching name (case-insensitive)
        const findIdByName = <T extends { id: string; name: string }>(items: T[], displayName: string): string | undefined => {
          const match = items.find(item => item.name.toLowerCase() === displayName.toLowerCase())
          return match?.id
        }

        // For single-site: auto-set cluster to default if not already set
        const finalCluster = !isMultiSite && !value.cluster 
          ? organizationConfig.DEFAULT_CLUSTER_ID 
          : value.cluster

        // Map display names to IDs
        const officeTypeId = value.type ? findIdByName(officeTypes, value.type) : undefined
        const categoryId = value.category ? findIdByName(officeCategories, value.category) : undefined
        const administrativeLevelId = value.level ? findIdByName(administrativeLevels, value.level) : undefined
        const procurementWorkflowId = value.procurementWorkflow ? findIdByName(procurementWorkflows, value.procurementWorkflow) : undefined
        const clusterId = finalCluster
        const parentOfficeId: string | null = value.parentId === 'root' ? null : (value.parentId || null)

        // Get organization ID from prop or parent unit's agencyId
        let finalOrganizationId = organizationId
        if (!finalOrganizationId && parentOfficeId) {
          const parentUnit = parentUnits?.find(u => u.id === parentOfficeId)
          finalOrganizationId = parentUnit?.agencyId
        }

        // Build backend payload matching expected API format (partial OfficeApiResponse)
        const payload = {
          name: value.name?.trim() ?? '',
          code: value.code ?? '',
          address: value.address ?? '',
          description: value.description || '',
          responsibilityCenterCode: value.responsibilityCenter || '',
          budgetCostCenter: value.budgetingCostCenter || '',
          officeTypeId: officeTypeId || undefined,
          organizationId: value.organizationId || finalOrganizationId || '',
          categoryId: categoryId || undefined,
          administrativeLevelId: administrativeLevelId || undefined,
          clusterId: clusterId || undefined,
          procurementWorkflowId: procurementWorkflowId || undefined,
          parentId: parentOfficeId,
        } as Partial<import('@/services/api/offices').OfficeApiResponse>

        // Validate all required IDs are present
        if (!payload.officeTypeId || !payload.categoryId || !payload.administrativeLevelId) {
          throw new Error('Failed to map one or more required fields to their IDs. Please verify all selections.')
        }

        // the mutation hook is typed against OrgUnit but API payload includes extra ids;
        // cast here to keep typing quiet (will be validated server-side)
        await createMutation.mutateAsync(payload as any)
        onCreated()
      } catch (error) {
        console.error('Failed to create office:', error)
        throw error
      }
    },
  })
  // Notify parent when form dirty state changes
  useEffect(() => {
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
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="name"
          children={(field) => (
            <div className="col-span-2 space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Office / Unit Name <div className="inline text-destructive">*</div>
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. Planning and Management Division"
                value={field.state.value}
                onBlur={() => {
                  field.handleBlur()
                  field.handleChange(String(field.state.value ?? '').trim())
                }}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
            </div>
          )}
        />

        <form.Field
          name="code"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Official Code <div className="inline text-destructive">*</div>
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. PMD-01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
            </div>
          )}
        />

        <form.Field
          name="organizationId"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Organization <span className="text-xs text-default-400">(optional)</span>
              </Label>
              <Select
                value={field.state.value || ''}
                onValueChange={(val) => field.handleChange(val || '')}
                disabled={organizationQuery.isLoading}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                  <SelectValue placeholder={organizationQuery.isLoading ? 'Loading organizations...' : 'Select organization'} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.length === 0 ? (
                    <SelectItem value="__no_orgs" disabled>
                      {organizationQuery.isLoading ? 'Loading...' : 'No organizations'}
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="__placeholder_org" disabled className="text-default-400">
                        Select organization
                      </SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="type"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Unit Type <div className="inline text-destructive">*</div>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as string)}
              >
                  <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md capitalize">
                  <SelectValue placeholder="Select type" />
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
            </div>
          )}
        />

        <form.Field
          name="category"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Category <div className="inline text-destructive">*</div>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md capitalize">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder_category" disabled className="text-default-400">Select category</SelectItem>
                  {officeCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name.toLowerCase()}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="level"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Administrative Level <div className="inline text-destructive">*</div>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as string)}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md capitalize">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder_level" disabled className="text-default-400">Select level</SelectItem>
                  {administrativeLevels.length > 0 ? (
                    administrativeLevels.map((l) => (
                      <SelectItem key={l.id} value={l.name.toLowerCase()}>
                        {l.name}
                      </SelectItem>
                    ))
                  ) : (
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
            </div>
          )}
        />

        <form.Field
          name="responsibilityCenter"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Responsibility Center <div className="inline text-destructive">*</div>
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. RC-001"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
            </div>
          )}
        />

        <form.Field
          name="procurementWorkflow"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Procurement Workflow
              </Label>
              <Select
                value={field.state.value || ''}
                onValueChange={(value) => field.handleChange(value as string)}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md capitalize">
                  <SelectValue placeholder="Select workflow" />
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
            </div>
          )}
        />

        <form.Field
          name="budgetingCostCenter"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Budgeting Cost Center <div className="inline text-destructive">*</div>
              </Label>
              <Input
                id={field.name}
                placeholder="e.g. CC-001"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
            </div>
          )}
        />
      </div>

      <form.Field
        name="parentId"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
              Parent Unit <div className="inline text-destructive">*</div>
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
            >
              <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                <SelectValue placeholder="Select Parent Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__placeholder_parent" disabled className="text-default-400">Select Parent Unit</SelectItem>
                <SelectItem value="root">Root (No Parent)</SelectItem>
                {parentUnits?.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        )}
      />

      <div className="space-y-4 pt-4 border-t border-default-100">
        <h4 className="text-[10px] font-bold text-default-400 uppercase tracking-widest leading-none">Geographic & Operational Context</h4>
        <form.Field
          name="address"
          children={(field) => {
            const isAddressAutoPopulated = isMultiSite && !!form.state.values.cluster
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-[10px] font-semibold text-default-500 tracking-wider">
                  Address <div className="inline text-destructive">*</div>
                  {isAddressAutoPopulated && <span className="text-[8px] text-default-400 ml-1">(from cluster)</span>}
                </Label>
                <Input
                  id={field.name}
                  placeholder="Enter full address"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isAddressAutoPopulated}
                  className={`h-9 text-xs border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md ${
                    isAddressAutoPopulated ? 'bg-default-50 text-default-500 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            )
          }}
        />
        <form.Field
          name="cluster"
          children={(field) => {
            // For multi-site: show dropdown (required), for single-site: hide the field
            if (!isMultiSite) {
              return null
            }
            
            const isLoading = satelliteClustersQuery.isLoading || false
            
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-[10px] font-semibold text-default-500 tracking-wider">
                  Satellite / Cluster <span className="text-destructive">*</span>
                  {isLoading && <span className="text-[8px] text-default-400 ml-1 animate-pulse">(loading...)</span>}
                </Label>
                <Select
                  value={field.state.value || ''}
                  onValueChange={(value) => field.handleChange(value || undefined)}
                  disabled={isLoading || satelliteClusters.length === 0}
                >
                  <SelectTrigger className="h-9 text-xs border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                    <SelectValue placeholder={isLoading ? 'Loading clusters...' : 'Select satellite cluster'} />
                  </SelectTrigger>
                  <SelectContent>
                    {satelliteClusters.length === 0 ? (
                      <SelectItem value="__no_clusters" disabled className="text-default-400">
                        {isLoading ? 'Loading clusters...' : 'No clusters available'}
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="__placeholder_cluster" disabled className="text-default-400">Select satellite cluster</SelectItem>
                        {satelliteClusters.map((cluster) => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )
          }}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-default-100">
        <form.Field
          name="description"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 tracking-wider">
                Description
              </Label>
              <textarea
                id={field.name}
                placeholder="Describe the office/unit's purpose and functions..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full h-20 px-3 py-2 border border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md resize-none"
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        {!form.state.isValid && form.state.isDirty && (
          <p className="text-xs text-destructive self-center mr-auto">Complete all required fields (marked with *) to establish the office.</p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="font-medium h-10 border-default-200 text-default-600 hover:bg-default-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || !form.state.isValid}
          className="font-semibold h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Establish Office'
          )}
        </Button>
      </div>
    </form>
  )
}
