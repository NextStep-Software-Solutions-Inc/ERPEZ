import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Upload, ChevronRight, ChevronLeft } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { ObjectCodeCombobox } from '@/components/ui/object-code-combobox'
import type { ItemMasterFormData } from '../../types'
import { getObjectCodesRequest } from '../handlers/getObjectCodesRequest'
import { getUnspscCodesRequest } from '../handlers/getUnspscCodesRequest'
import { getUomsRequest } from '../handlers/getUomsRequest'
import type { LookupOption } from '../types'

const useObjectCodesQuery = createQueryHookFromTemplate(getObjectCodesRequest)
const useUnspscCodesQuery = createQueryHookFromTemplate(getUnspscCodesRequest)
const useUomsQuery = createQueryHookFromTemplate(getUomsRequest)

interface ItemMasterWizardFormProps {
  onSubmit: (data: ItemMasterFormData) => void
  onCancel: () => void
  initialData?: ItemMasterFormData
  isLoading?: boolean
  isCreateMode?: boolean
}

export function ItemMasterWizardForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  isCreateMode = false,
}: ItemMasterWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const [formData, setFormData] = useState<ItemMasterFormData>(
    initialData || {
      itemName: '',
      uacsCode: '',
      objectCodeId: '',
      objectCodeName: '',
      isCSE: false,
      unspscCode: '',
      unspscCodeId: '',
      minimumTechnicalSpecifications: '',
      uom: '',
      uomId: '',
      uomName: '',
      itemType: 'Expendable',
      itemLife: '',
      itemLifeUnit: 'days',
      productCode: '',
      imageURL: '',
    },
  )

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: objectCodesResponse, isLoading: isObjectCodesLoading } =
    useObjectCodesQuery({
      pathParams: {},
      queryParams: {},
    })
  const { data: unspscCodesResponse, isLoading: isUnspscCodesLoading } =
    useUnspscCodesQuery({
      pathParams: {},
      queryParams: {},
    })
  const { data: uomsResponse, isLoading: isUomsLoading } = useUomsQuery({
    pathParams: {},
    queryParams: {},
  })

  const activeObjectCodes = useMemo(
    () => objectCodesResponse?.data?.filter((item) => item.isActive) ?? [],
    [objectCodesResponse?.data],
  )

  const objectCodeOptions = useMemo<Array<LookupOption>>(
    () =>
      activeObjectCodes.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        isActive: item.isActive,
      })),
    [activeObjectCodes],
  )

  const unspscOptions = useMemo<Array<LookupOption>>(
    () =>
      unspscCodesResponse?.data
        ?.filter((item) => item.isActive && item.code && item.name)
        .map((item) => ({
          id: item.id,
          code: item.code ?? '',
          name: item.name ?? '',
          isActive: item.isActive,
        })) ?? [],
    [unspscCodesResponse?.data],
  )

  const uomOptions = useMemo<Array<LookupOption>>(
    () =>
      uomsResponse?.data
        ?.filter((item) => item.isActive)
        .map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          isActive: item.isActive,
        })) ?? [],
    [uomsResponse?.data],
  )

  const unspscComboOptions = useMemo(
    () => unspscOptions.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` })),
    [unspscOptions],
  )

  const uomComboOptions = useMemo(
    () => uomOptions.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` })),
    [uomOptions],
  )

  useEffect(() => {
    if (initialData?.imageURL && !imagePreview) {
      setImagePreview(initialData.imageURL)
    }
  }, [])

  useEffect(() => {
    if (!objectCodeOptions.length) return

    setFormData((prev) => {
      const resolvedObjectCode =
        objectCodeOptions.find((item) => item.id === prev.objectCodeId) ??
        objectCodeOptions.find(
          (item) =>
            item.code === prev.uacsCode || item.name === prev.objectCodeName,
        )

      if (!resolvedObjectCode) return prev

      if (
        prev.objectCodeId === resolvedObjectCode.id &&
        prev.uacsCode === resolvedObjectCode.code &&
        prev.objectCodeName === resolvedObjectCode.name
      ) {
        return prev
      }

      return {
        ...prev,
        objectCodeId: resolvedObjectCode.id,
        objectCodeName: resolvedObjectCode.name,
        uacsCode: resolvedObjectCode.code,
      }
    })
  }, [objectCodeOptions])

  useEffect(() => {
    if (!uomOptions.length) return

    setFormData((prev) => {
      const resolvedUom =
        uomOptions.find((item) => item.id === prev.uomId) ??
        uomOptions.find(
          (item) => item.code === prev.uom || item.name === prev.uomName,
        )

      if (!resolvedUom) return prev

      if (
        prev.uomId === resolvedUom.id &&
        prev.uom === resolvedUom.code &&
        prev.uomName === resolvedUom.name
      ) {
        return prev
      }

      return {
        ...prev,
        uomId: resolvedUom.id,
        uomName: resolvedUom.name,
        uom: resolvedUom.code,
      }
    })
  }, [uomOptions])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files?.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    const blobUrl = URL.createObjectURL(file)
    setImagePreview(blobUrl)
    setFormData({ ...formData, imageURL: blobUrl })
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData({ ...formData, imageURL: '' })
  }

  const handleClearUnspscSelection = () => {
    setFormData((prev) => ({
      ...prev,
      unspscCode: '',
      unspscCodeId: '',
    }))
    setErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors.unspscCode
      return nextErrors
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.itemName.trim()) {
        newErrors.itemName = 'Item name is required'
      }
      if (!formData?.objectCodeId?.trim() || !formData?.uacsCode?.trim()) {
        newErrors.uacsCode = 'Object Code is required'
      }
      if (!formData?.uomId?.trim() || !formData?.uom?.trim()) {
        newErrors.uom = 'Unit of Measurement is required'
      }
      if (!formData.itemType) {
        newErrors.itemType = 'Item type is required'
      }
    }

    // Step 2 additional validations (itemLife requirement on create)
    if (step === 2) {
      if (isCreateMode) {
        if (formData.itemLife === '' || Number(formData.itemLife) <= 0) {
          newErrors.itemLife = 'Item life must be greater than 0'
        }
      } else {
        // if provided, ensure it's positive
        if (formData.itemLife !== '' && Number(formData.itemLife) <= 0) {
          newErrors.itemLife = 'Item life must be greater than 0'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleSubmit = () => {
    if (currentStep < totalSteps) {
      handleNext()
      return
    }
    if (validateStep(currentStep)) {
      onSubmit(formData)
    }
  }

  // Render step indicator dots
  const renderStepIndicator = () => {
    return (
      <div className="mt-4 mb-8">
        <div className="grid grid-cols-5 items-center gap-0 px-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center col-span-1 relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                1 === currentStep
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                  : 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
              aria-current={1 === currentStep ? 'step' : undefined}
            >
              {1 < currentStep ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                1
              )}
            </div>
            <span
              className={`text-xs font-semibold mt-2 text-center transition-colors line-clamp-1 ${
                1 <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Basic Info
            </span>
          </div>

          {/* Connector 1 */}
          <div className="flex items-center col-span-1 h-1 w-64 relative z-0 -translate-x-15 -translate-y-3">
            <div
              className={`w-full h-full rounded-full transition-all ${
                1 < currentStep ? 'bg-green-500' : 'bg-muted'
              }`}
            />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center col-span-1 relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                2 === currentStep
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                  : 2 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
              aria-current={2 === currentStep ? 'step' : undefined}
            >
              {2 < currentStep ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                2
              )}
            </div>
            <span
              className={`text-xs font-semibold mt-2 text-center transition-colors text-wrap ${
                2 <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Details
            </span>
          </div>

          {/* Connector 2 */}
          <div className="flex items-center col-span-1 h-1 w-64 relative z-0 -translate-x-15 -translate-y-3">
            <div
              className={`w-full h-full rounded-full transition-all ${
                2 < currentStep ? 'bg-green-500' : 'bg-muted'
              }`}
            />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center col-span-1 relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                3 === currentStep
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                  : 3 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
              aria-current={3 === currentStep ? 'step' : undefined}
            >
              {3 < currentStep ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                3
              )}
            </div>
            <span
              className={`text-xs font-semibold mt-2 text-center transition-colors ${
                3 <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Review & Media
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <form
        className="space-y-8 flex-1 flex flex-col px-1"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className="space-y-8 flex-1 overflow-y-auto">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300 pb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Basic Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter the fundamental item details
              </p>
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-base font-medium">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="itemName"
                placeholder="Enter item name (e.g., Bond Paper 70gsm A4)"
                value={formData.itemName}
                onChange={(e) =>
                  setFormData({ ...formData, itemName: e.target.value })
                }
                className={`h-11 text-base ${errors.itemName ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.itemName && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.itemName}
                </p>
              )}
              <span className="text-xs text-muted-foreground">
                Must be unique across the system
              </span>
            </div>

            {/* Object Code */}
            <div className="space-y-2">
              <Label htmlFor="uacsCode" className="text-base font-medium">
                Object Code (UACS) <span className="text-red-500">*</span>
              </Label>
              <ObjectCodeCombobox
                options={activeObjectCodes}
                value={formData.objectCodeId || ''}
                onValueChange={(value, selectedItem) => {
                  if (!value || !selectedItem) {
                    setFormData((prev) => ({
                      ...prev,
                      objectCodeId: '',
                      objectCodeName: '',
                      uacsCode: '',
                    }))
                    return
                  }
                  setFormData((prev) => ({
                    ...prev,
                    objectCodeId: selectedItem.id,
                    objectCodeName: selectedItem.name,
                    uacsCode: selectedItem.code || '',
                  }))
                }}
                placeholder={
                  isObjectCodesLoading
                    ? 'Loading object codes...'
                    : 'Select Object Code'
                }
                searchPlaceholder="Search by code, name, class (e.g. 50203, supplies)..."
                emptyMessage="No object codes found."
                disabled={isObjectCodesLoading}
                hasError={!!errors.uacsCode}
              />
              {errors.uacsCode && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.uacsCode}
                </p>
              )}
              <span className="text-xs text-muted-foreground">
                Select from the active Object Code catalogue
              </span>
            </div>

            {/* UNSPSC Code */}
            <div className="space-y-2">
              <Label htmlFor="unspscCode" className="text-base font-medium">
                UNSPSC Code <span className="text-gray-400">(Optional)</span>
              </Label>
              <Combobox
                options={unspscComboOptions}
                value={formData.unspscCodeId || ''}
                onValueChange={(value) => {
                  const selectedUnspsc = unspscOptions.find(
                    (item) => item.id === value,
                  )
                  if (!selectedUnspsc) return

                  setFormData({
                    ...formData,
                    unspscCodeId: selectedUnspsc.id,
                    unspscCode: selectedUnspsc.code,
                  })
                }}
                placeholder={isUnspscCodesLoading ? 'Loading UNSPSC codes...' : 'Select UNSPSC Code (optional)'}
                searchPlaceholder="Search by code or name..."
                emptyMessage="No UNSPSC codes found."
                disabled={isUnspscCodesLoading}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Leave empty if the item does not need an UNSPSC code
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearUnspscSelection}
                  disabled={!formData.unspscCodeId && !formData.unspscCode}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear selection
                </Button>
              </div>
              {errors.unspscCode && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.unspscCode}
                </p>
              )}
            </div>

            {/* UOM */}
            <div className="space-y-2">
              <Label htmlFor="uom" className="text-base font-medium">
                Unit of Measurement <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={uomComboOptions}
                value={formData.uomId || ''}
                onValueChange={(value) => {
                  const selectedUom = uomOptions.find(
                    (item) => item.id === value,
                  )
                  if (!selectedUom) return

                  setFormData({
                    ...formData,
                    uomId: selectedUom.id,
                    uomName: selectedUom.name,
                    uom: selectedUom.code,
                  })
                }}
                placeholder={isUomsLoading ? 'Loading units...' : 'Select Unit of Measurement'}
                searchPlaceholder="Search by code or name..."
                emptyMessage="No units found."
                disabled={isUomsLoading}
                  className={errors.uom ? 'ring-1 ring-red-500 ring-offset-1 focus-within:ring-2 focus-within:ring-red-500 rounded-md' : ''}
                />
              {errors.uom && (
                <p className="text-sm text-red-500 font-medium">{errors.uom}</p>
              )}
              <span className="text-xs text-muted-foreground">
                Select from the active Unit of Measurement catalogue
              </span>
            </div>

            {/* Item Type */}
            <div className="space-y-2 relative z-40">
              <Label htmlFor="itemType" className="text-base font-medium">
                Item Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.itemType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    itemType: value as 'Expendable' | 'SemiExpendable' | 'Equipment' | 'PPE',
                  })
                }
              >
                <SelectTrigger
                  id="itemType"
                  className={`h-11 text-base ${errors.itemType ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Select an item type" />
                </SelectTrigger>
                <SelectContent side="bottom" className="z-[99999]">
                  <SelectItem value="Expendable">Expendable</SelectItem>
                  <SelectItem value="SemiExpendable">Semi Expendable</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="PPE">PPE (Personal Protective Equipment)</SelectItem>
                </SelectContent>
              </Select>
              {errors.itemType && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.itemType}
                </p>
              )}
              <span className="text-xs text-muted-foreground">
                Categorize the item based on its usage
              </span>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300 pb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Item Details
              </h3>
              <p className="text-sm text-muted-foreground">
                Add additional specifications and codes
              </p>
            </div>

            {/* Product Code */}
            <div className="space-y-2">
              <Label htmlFor="productCode" className="text-base font-medium">
                Product Code <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="productCode"
                placeholder="Enter product code (e.g., PC-0001)"
                value={formData.productCode}
                onChange={(e) =>
                  setFormData({ ...formData, productCode: e.target.value })
                }
                className="h-11 text-base"
              />
              <span className="text-xs text-muted-foreground">
                Manufacturer or supplier product code
              </span>
            </div>

            {/* Item Life */}
            <div className="space-y-2 relative z-40">
              <Label htmlFor="itemLife" className="text-base font-medium">
                Item Life <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="itemLife"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.itemLife}
                  onChange={(e) =>
                    setFormData({ ...formData, itemLife: e.target.value })
                  }
                  min={1}
                  className={`flex-1 h-11 text-base ${errors.itemLife ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                <Select
                  value={formData.itemLifeUnit}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      itemLifeUnit: value as
                        | 'days'
                        | 'weeks'
                        | 'months'
                        | 'years',
                    })
                  }
                >
                  <SelectTrigger className="w-36 h-11 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" className="z-9999">
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.itemLife ? (
                <p className="text-sm text-red-500 font-medium">
                  {errors.itemLife}
                </p>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Expected lifespan of the item
                </span>
              )}
            </div>

            {/* Technical Specifications */}
            <div className="space-y-2">
              <Label htmlFor="specs" className="text-base font-medium">
                Technical Specifications{' '}
                <span className="text-gray-400">(Optional)</span>
              </Label>
              <Textarea
                id="specs"
                placeholder="Enter minimum technical requirements..."
                value={formData.minimumTechnicalSpecifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumTechnicalSpecifications: e.target.value,
                  })
                }
                rows={5}
                className="text-base"
              />
              <span className="text-xs text-muted-foreground">
                Describe the minimum technical requirements
              </span>
            </div>

            {/* CSE Info (readonly) */}
            <div className="space-y-3 pt-4 border-t">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm">CSE Status</div>
                  <div className="text-xs text-muted-foreground">CSE classification is handled automatically by the system</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300 pb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Review & Media
              </h3>
              <p className="text-sm text-muted-foreground">
                Confirm details and add item image
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  Item Name
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.itemName || '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  Object Code
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.uacsCode || '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  UNSPSC Code
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.unspscCode || '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  Item Type
                </p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {formData.itemType}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  Unit of Measurement
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.uom || '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  Product Code
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.productCode || '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  Item Life
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.itemLife
                    ? `${formData.itemLife} ${formData.itemLifeUnit}`
                    : '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border col-span-2">
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  Technical Specifications
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {formData.minimumTechnicalSpecifications || '—'}
                </p>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-medium">
                Item Image <span className="text-gray-400">(Optional)</span>
              </Label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 bg-linear-to-b from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 transition-all cursor-pointer group"
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!imagePreview ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-3">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      Drop your image here
                    </p>
                    <p className="text-xs text-gray-600">
                      or click to browse (JPG, PNG, GIF up to 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile()
                      }}
                      className="absolute -top-3 -right-3 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors z-10 shadow-lg"
                      title="Remove image"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex items-center gap-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {formData.itemName || 'Item'}
                        </p>
                        <p className="text-xs text-gray-600 truncate max-w-xs">
                          {selectedFile?.name}
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-gray-500 mt-2">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mt-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Ready to upload
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            disabled={isLoading}
            className="gap-2"
          >
            {currentStep === 1 ? null : <ChevronLeft className="w-4 h-4" />}
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isLoading
                ? isCreateMode
                  ? 'Creating...'
                  : 'Saving...'
                : isCreateMode
                  ? 'Create Item'
                  : 'Save Changes'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
