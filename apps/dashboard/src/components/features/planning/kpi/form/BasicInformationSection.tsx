import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFunctionTypesRequest } from '../../fiscal-year/handlers/getFunctionTypesRequest'
import { SDGImageCard } from '../components/SDGImageCard'
import { getAttributesRequest } from '../../attribute/handlers/getAttributesRequest'
import { getMfoPapsRequest } from '../../attribute/handlers/getMfoPapsRequest'
import { getSDGsRequest } from '../../SDGs/handlers/getSDGsRequest'
import type { Attribute } from '../../attribute/types'
import type { FormType } from './CreateKpiForm'
import type { SDG } from '../../SDGs/types'
import type { MfoPap } from '../../mfopap/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, splitPascalCase } from '@/lib/utils'

interface BasicInformationSectionProps {
  form: FormType
  isLoading?: boolean
  mode?: 'kpi' | 'subKpi'
  parentSdgIds?: Array<SDG>
  initialPrimaryAttrId?: string
  initialMandatoryAttrId?: string
}

const useAttributes = createQueryHookFromTemplate(getAttributesRequest)
const useFunctionTypes = createQueryHookFromTemplate(getFunctionTypesRequest)
const useMfoPaps = createQueryHookFromTemplate(getMfoPapsRequest)
const useSDGs = createQueryHookFromTemplate(getSDGsRequest)

export default function BasicInformationSection({
  form,
  isLoading = false,
  mode = 'kpi',
  parentSdgIds = [],
  initialPrimaryAttrId = '',
  initialMandatoryAttrId = '',
}: BasicInformationSectionProps) {
  const [sdgDialogOpen, setSdgDialogOpen] = useState(false)
  const [selectedsdGs, setSelectedsdGs] = useState<Array<string>>(form.state.values.SDGIds)
  const [selectedPrimaryAttrId, setSelectedPrimaryAttrId] = useState<string>(initialPrimaryAttrId)
  const [selectedMandatoryAttrId, setSelectedMandatoryAttrId] = useState<string>(initialMandatoryAttrId)

  const { data: functionTypes } = useFunctionTypes({
    pathParams: {},
    queryParams: {},
  })
  const { data: attributesData } = useAttributes({
    pathParams: {},
    queryParams: {},
  })
  const { data: mfoPaps } = useMfoPaps({
    pathParams: {},
    queryParams: {},
  })
  const { data: sdgsData, isLoading: sdgsLoading } = useSDGs({
    pathParams: {},
    queryParams: {
      pageSize: 50,
    },
  })

  // Filter parent attributes - exclude items that have a parentAttributeId (i.e., only include top-level attributes)
  const parentAttributes = attributesData?.data.filter(
    (attr: Attribute) => attr.parentAttributeId == null,
  )

  // Initialize both primary and mandatory from persisted form attributes when data loads
  useEffect(() => {
    if (attributesData?.data && form.state.values.AttributeIds.length > 0) {
      const persistedAttrs = form.state.values.AttributeIds

      // Find primary (parentAttributeId === null) and mandatory (parentAttributeId !== null)
      for (const attrId of persistedAttrs) {
        const attr = attributesData.data.find((a: Attribute) => a.id === attrId)
        if (attr) {
          if (attr.parentAttributeId === null) {
            // This is a primary attribute
            setSelectedPrimaryAttrId(attr.id)
          } else if (attr.parentAttributeId) {
            // This is a mandatory (child) attribute - also set its parent as primary
            setSelectedMandatoryAttrId(attr.id)
            setSelectedPrimaryAttrId(attr.parentAttributeId)
          }
        }
      }
    }
  }, [attributesData?.data, form.state.values.AttributeIds])

  // Filter child attributes based on selected primary attribute
  const childAttributes = selectedPrimaryAttrId
    ? attributesData?.data.filter(
      (attr: Attribute) => attr.parentAttributeId === selectedPrimaryAttrId,
    )
    : undefined
  const hasChildren = (childAttributes || []).length > 0



  const handleAddSdg = (id: string) => {
    const newSelected = selectedsdGs.includes(id) ? selectedsdGs : [...selectedsdGs, id]
    setSelectedsdGs(newSelected)
    form.setFieldValue('SDGIds', newSelected)
  }

  const handleRemoveSdg = (id: string) => {
    const newSelected = selectedsdGs.filter((sdg) => sdg !== id)
    setSelectedsdGs(newSelected)
    form.setFieldValue('SDGIds', newSelected)
  }

  // Filter SDGs based on parent KPI's SDGs when in subKpi mode
  const allSdgs = sdgsData?.data || []
  const availableSdgs =
    mode === 'subKpi'
      ? parentSdgIds.length > 0
        ? allSdgs.filter((sdg: SDG) => parentSdgIds.some(parent => parent.id === sdg.id))
        : allSdgs
      : allSdgs

  // SubKpi mode: Show only name, description, and SDGs
  if (mode === 'subKpi') {
    return (
      <div className="grid gap-6">
        <form.Field
          name="name"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Sub-KPI Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter sub-KPI name"
                disabled={isLoading}
                className={cn(
                  field.state.meta.errors.length > 0 ? 'border-destructive' : '',
                  'w-full truncate'
                )}
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

        <form.Field
          name="description"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Description</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter a description for this sub-KPI..."
                rows={4}
                disabled={isLoading}
                className={cn(
                  field.state.meta.errors.length > 0 ? 'border-destructive' : '',
                  'w-full resize-none overflow-hidden'
                )}
              />
            </div>
          )}
        />

        {/* SDG Section - filtered by parent KPI's SDGs */}
        {parentSdgIds.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium">
                Sustainable Development Goals{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSdgDialogOpen(true)}
                className="gap-2"
                // disabled={isLoading || availableSdgs.length === 0}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                Select SDGs
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Select from the parent KPI's SDGs ({availableSdgs.length}{' '}
              available)
            </p>
            <div className="flex flex-wrap gap-3">
              {sdgsLoading && (
                <span className="text-muted-foreground text-sm">
                  Loading SDGs...
                </span>
              )}
              {!sdgsLoading && selectedsdGs.length === 0 && (
                <span className="text-muted-foreground text-sm">
                  No SDGs selected
                </span>
              )}
              {!sdgsLoading &&
                selectedsdGs.map((id) => {
                  const sdg = allSdgs.find((s: SDG) => s.id.toString() === id)
                  if (!sdg) return null
                  return (
                    <div key={sdg.id} className="relative group px-2 py-4">
                      <SDGImageCard
                        sdg={sdg}
                        isSelected={true}
                        className="w-20 h-20"
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemoveSdg(id)
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/70"
                      >
                        <X className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
        {/* SDG Selection Dialog - filtered by parent SDGs */}
        <Dialog open={sdgDialogOpen} onOpenChange={setSdgDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Sustainable Development Goals</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-2">
                {availableSdgs.map((sdg: SDG) => (
                  <SDGImageCard
                    sdg={sdg}
                    isSelected={selectedsdGs.includes(sdg.id.toString())}
                    onClick={() => {
                      if (selectedsdGs.includes(sdg.id.toString())) {
                        handleRemoveSdg(sdg.id.toString())
                      } else {
                        handleAddSdg(sdg.id.toString())
                      }
                    }}
                    className="w-full aspect-square cursor-pointer"
                  />
                ))}

              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setSdgDialogOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // KPI mode: Show full form
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-6">
        <form.Field
          name="MFOPAPId"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Project <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                disabled={isLoading}
              >
                <SelectTrigger
                  className={cn(
                    field.state.meta.errors.length > 0
                      ? 'border-destructive'
                      : '',
                    'w-full truncate',
                  )}
                >
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {mfoPaps?.data.map((project: MfoPap) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]?.message}
                </p>
              )}
            </div>
          )}
        />
        <form.Field
          name="functionType"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name} className="w-full">
                KPI Function <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                disabled={isLoading || !functionTypes?.data}
              >
                <SelectTrigger
                  className={cn(
                    field.state.meta.errors.length > 0
                      ? 'border-destructive'
                      : '',
                    'w-full truncate',
                  )}
                >
                  <SelectValue placeholder="Select a function type" />
                </SelectTrigger>
                <SelectContent>
                  {functionTypes?.data &&
                    (functionTypes.data as Array<string>).map(
                      (functionType: string) => (
                        <SelectItem key={functionType} value={functionType}>
                          {splitPascalCase(functionType)}
                        </SelectItem>
                      ),
                    )}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]?.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <form.Field
          name="AttributeIds"
          children={(field) => {
            return (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>
                  Primary Attribute <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedPrimaryAttrId || ''}
                  onValueChange={(attrId) => {
                    setSelectedPrimaryAttrId(attrId)
                    // Reset mandatory when primary changes
                    setSelectedMandatoryAttrId('')
                    // Set only primary attribute (mandatory will be added when selected)
                    form.setFieldValue('AttributeIds', [attrId])
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      field.state.meta.errors.length > 0
                        ? 'border-destructive'
                        : '',
                      'w-full truncate',
                    )}
                  >
                    <SelectValue placeholder="Select primary attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {(parentAttributes || []).map((attribute: Attribute) => (
                      <SelectItem key={attribute.id} value={attribute.id}>
                        {attribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            )
          }}
        />
        {/* Mandatory Classification Code - Optional if primary has no children */}
        <form.Field
          name="AttributeIds"
          children={(field) => {
            return (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>
                  Mandatory Classification Code{' '}
                  {hasChildren && <span className="text-destructive">*</span>}
                </Label>
                <Select
                  value={selectedMandatoryAttrId || ''}
                  onValueChange={(childId) => {
                    setSelectedMandatoryAttrId(childId)
                    // Persist both primary and mandatory in the attributes array
                    if (selectedPrimaryAttrId && childId) {
                      form.setFieldValue('AttributeIds', [
                        selectedPrimaryAttrId,
                        childId,
                      ])
                    } else if (selectedPrimaryAttrId) {
                      form.setFieldValue('AttributeIds', [
                        selectedPrimaryAttrId,
                      ])
                    }
                  }}
                  disabled={isLoading || !hasChildren || !selectedPrimaryAttrId}
                >
                  <SelectTrigger
                    className={cn(
                      field.state.meta.errors.length > 0
                        ? 'border-destructive'
                        : '',
                      'w-full truncate',
                    )}
                  >
                    <SelectValue
                      placeholder={
                        !selectedPrimaryAttrId
                          ? 'Select primary first'
                          : hasChildren
                            ? 'Select a classification code'
                            : 'No classification codes available (optional)'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(childAttributes || []).map((code: Attribute) => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!hasChildren && selectedPrimaryAttrId && (
                  <p className="text-sm text-muted-foreground">
                    No classification codes available for this attribute
                    (optional)
                  </p>
                )}
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            )
          }}
        />
      </div>
      <form.Field
        name="isOfficeMandate"
        children={(field) => (
          <div className="grid gap-2">
            <div className="flex items-center space-x-4">
              <Label className="font-medium">Office Mandate</Label>
              <RadioGroup
                value={field.state.value ? 'yes' : 'no'}
                onValueChange={(value) => field.handleChange(value === 'yes')}
                disabled={isLoading}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="yes"
                    id="office-mandate-yes"
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="office-mandate-yes"
                    className="cursor-pointer"
                  >
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="no"
                    id="office-mandate-no"
                    disabled={isLoading}
                  />
                  <Label htmlFor="office-mandate-no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="name"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>
              KPI Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter name (e.g., Revenue Growth, Customer Satisfaction)"
              disabled={isLoading}
              className={cn(
                field.state.meta.errors.length > 0 ? 'border-destructive' : '',
                'w-full truncate'
              )}
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

      <form.Field
        name="description"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>KPI Description</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value ?? ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter a detailed description of this KPI, its purpose, and how it will be measured..."
              rows={4}
              disabled={isLoading}
              className={cn(
                field.state.meta.errors.length > 0 ? 'border-destructive' : '',
                'w-full resize-none overflow-hidden'
              )}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Is Percentage Toggle */}
      <form.Field
        name="isPercentage"
        children={(field) => (
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={field.name}
                checked={field.state.value || false}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isLoading}
              />
              <Label htmlFor={field.name}>Target is Percentage</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Check this box if the target values should be expressed as
              percentages
            </p>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="isTargetValueAllocable"
        children={(field) => (
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={field.name}
                checked={field.state.value ?? false}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isLoading}
              />
              <Label htmlFor={field.name}>KPI Target Allocable</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Check if the KPI target can be distributed across units
            </p>
          </div>
        )}
      />

      {/* SDG Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="font-medium">
            Sustainable Development Goals{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSdgDialogOpen(true)}
            className="gap-2"
            disabled={isLoading || sdgsLoading}
          >
            <Plus className="w-4 h-4" />
            Add SDGs
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {sdgsLoading && (
            <span className="text-muted-foreground text-sm">
              Loading SDGs...
            </span>
          )}
          {!sdgsLoading &&
            selectedsdGs.map((id) => {
              const sdg = allSdgs.find((s: SDG) => s.id.toString() === id)
              if (!sdg) return null
              return (
                <div key={sdg.id} className="relative group px-2 py-4">
                  <SDGImageCard
                    sdg={sdg}
                    isSelected={true}
                    className="w-20 h-20"
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemoveSdg(id)
                    }}
                    className="absolute top-4 left-2 w-20 h-20  opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    Remove
                  </Button>
                </div>
              )
            })}
        </div>
      </div>

      <Dialog open={sdgDialogOpen} onOpenChange={setSdgDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 ">
            {/* SDG Selection */}
            <div>
              <h3 className="font-semibold mb-3">
                Sustainable Development Goals
              </h3>
              {sdgsLoading && (
                <p className="text-muted-foreground text-sm">Loading SDGs...</p>
              )}
              <div className="grid grid-cols-4 gap-2">
                {allSdgs.map((sdg: SDG) => (
                  <SDGImageCard
                    key={sdg.id}
                    sdg={sdg}
                    isSelected={selectedsdGs.includes(sdg.id.toString())}
                    onClick={() => {
                      if (selectedsdGs.includes(sdg.id.toString())) {
                        handleRemoveSdg(sdg.id.toString())
                      } else {
                        handleAddSdg(sdg.id.toString())
                      }
                    }}
                    className="w-full aspect-square cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setSdgDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
