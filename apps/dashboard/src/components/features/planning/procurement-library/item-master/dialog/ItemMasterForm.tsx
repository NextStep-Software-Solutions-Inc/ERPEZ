import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Upload, Info } from 'lucide-react'
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

interface ItemMasterFormProps {
  onSubmit: (data: ItemMasterFormData) => void
  onCancel: () => void
  initialData?: ItemMasterFormData
  isLoading?: boolean
}

// Mock UACS data - in real app, would come from API

export function ItemMasterForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: ItemMasterFormProps) {
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

  const unspscComboOptions = useMemo(
    () => unspscOptions.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` })),
    [unspscOptions],
  )

  const uomComboOptions = useMemo(
    () => uomOptions.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` })),
    [uomOptions],
  )

  // Initialize image preview if there's an existing imageURL (for edit mode)
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

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  // Handle drag and drop
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

  // Validate and set file
  const validateAndSetFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    // Create blob URL from the selected file
    // This will be the actual image the user selected, ensuring consistency between preview and view
    const blobUrl = URL.createObjectURL(file)
    setImagePreview(blobUrl)

    // Store the blob URL as the imageURL
    // In a real app, you'd upload the file to server and get back a persistent URL
    // For now, storing blob URL ensures the user sees the exact same image they uploaded
    setFormData({ ...formData, imageURL: blobUrl })
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData({ ...formData, imageURL: '' })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required'
    }
    if (!formData.objectCodeId.trim() || !formData.uacsCode.trim()) {
      newErrors.uacsCode = 'UACS code is required'
    }
    if (!formData.uomId.trim() || !formData.uom.trim()) {
      newErrors.uom = 'Unit of Measurement is required'
    }
    if (!formData.itemType) {
      newErrors.itemType = 'Item type is required'
    }

    // Ensure itemLife is positive when provided
    if (formData.itemLife !== '' && Number(formData.itemLife) <= 0) {
      newErrors.itemLife = 'Item life must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]"
    >
      {/* Item Name */}
      <div className="space-y-2">
        <Label htmlFor="itemName">
          Item Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="itemName"
          placeholder="Enter item name"
          value={formData.itemName}
          onChange={(e) =>
            setFormData({ ...formData, itemName: e.target.value })
          }
          className={errors.itemName ? 'border-red-500' : ''}
        />
        {errors.itemName && (
          <p className="text-sm text-red-500">{errors.itemName}</p>
        )}
        <span className="text-xs text-muted-foreground">
          Must be unique across the system
        </span>
      </div>

      {/* Object Code */}
      <div className="space-y-2">
        <Label htmlFor="uacsCode">
          Object Code <span className="text-red-500">*</span>
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
          <p className="text-sm text-red-500">{errors.uacsCode}</p>
        )}
        <span className="text-xs text-muted-foreground">
          Select from the active Object Code catalogue
        </span>
      </div>
      {/* UNSPSC Code */}
      <div className="space-y-2">
        <Label htmlFor="unspscCode">
          UNSPSC Code <span className="text-gray-400">(Optional)</span>
        </Label>
        <Combobox
          options={unspscComboOptions}
          value={formData.unspscCodeId || ''}
          onValueChange={(value) => {
            const selectedUnspsc = unspscOptions.find((item) => item.id === value)
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
        <span className="text-xs text-muted-foreground">
          Leave empty if the item does not need an UNSPSC code
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setFormData({ ...formData, unspscCode: '', unspscCodeId: '' })
          }}
          disabled={!formData.unspscCodeId && !formData.unspscCode}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear selection
        </Button>
      </div>
      {/* Product Code */}
      <div className="space-y-2">
        <Label htmlFor="productCode">Product Code</Label>
        <Input
          id="productCode"
          placeholder="Enter product code"
          value={formData.productCode}
          onChange={(e) =>
            setFormData({ ...formData, productCode: e.target.value })
          }
        />
        <span className="text-xs text-muted-foreground">
          Manufacturer or supplier product code
        </span>
      </div>

      {/* Minimum Technical Specifications */}
      <div className="space-y-2">
        <Label htmlFor="specs">Minimum Technical Specifications</Label>
        <Textarea
          id="specs"
          placeholder="Enter minimum technical specifications..."
          value={formData.minimumTechnicalSpecifications}
          onChange={(e) =>
            setFormData({
              ...formData,
              minimumTechnicalSpecifications: e.target.value,
            })
          }
          rows={4}
        />
        <span className="text-xs text-muted-foreground">
          Describe the minimum technical requirements for this item
        </span>
      </div>

      {/* Unit of Measurement */}
      <div className="space-y-2">
        <Label htmlFor="uom">
          Unit of Measurement <span className="text-red-500">*</span>
        </Label>
        <Combobox
          options={uomComboOptions}
          value={formData.uomId || ''}
          onValueChange={(value) => {
            const selectedUom = uomOptions.find((item) => item.id === value)
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
          aria-invalid={!!errors.uom}
          className={errors.uom ? 'ring-1 ring-red-500 rounded-md' : ''}
        />
        <span className="text-xs text-muted-foreground">
          Select from the active Unit of Measurement catalogue
        </span>
      </div>

      {/* CSE Info (readonly) */}
      <div className="space-y-2">
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center">
          <div className="flex-1">
            <div className="font-semibold text-sm">CSE Status</div>
            <div className="text-xs text-muted-foreground">
              CSE classification is handled automatically by the system
            </div>
          </div>
          <span
            className="ml-3 p-1 rounded"
            aria-hidden="true"
          >
            <Info className="w-4 h-4 text-gray-600" />
          </span>
        </div>
      </div>

      {/* Item Type */}
      <div className="space-y-2 relative z-40">
        <Label htmlFor="itemType">
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
            className={errors.itemType ? 'border-red-500' : ''}
            >
            <SelectValue placeholder="Select an item type" />
            </SelectTrigger>
            <SelectContent side="bottom" className="z-[99999]">
            <SelectItem value="Expendable">Expendable</SelectItem>
            <SelectItem value="SemiExpendable">Semi Expendable</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="PPE">PPE</SelectItem>
          </SelectContent>
        </Select>
        {errors.itemType && (
          <p className="text-sm text-red-500">{errors.itemType}</p>
        )}
        <span className="text-xs text-muted-foreground">
          Categorize the item based on its usage and durability
        </span>
      </div>

      {/* Item Life */}
      <div className="space-y-2 relative z-40">
        <Label htmlFor="itemLife">Item Life</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="itemLife"
            type="number"
            placeholder="Enter item life (e.g., 5)"
            value={formData.itemLife}
            onChange={(e) =>
              setFormData({ ...formData, itemLife: e.target.value })
            }
            min={1}
            className="flex-1"
          />
          <Select
            value={formData.itemLifeUnit}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                itemLifeUnit: value as 'days' | 'weeks' | 'months' | 'years',
              })
            }
          >
            <SelectTrigger className="w-32 h-10">
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
        <span className="text-xs text-muted-foreground">
          Expected lifespan or useful life of the item
        </span>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="imageUpload">Image Upload</Label>
        <div className="space-y-3">
          {/* File Input Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer group"
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors mb-3">
                  <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <p className="font-semibold text-gray-700 mb-1">
                  Drag and drop your image here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse from your computer
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG, GIF up to 5MB
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
                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors z-10"
                  title="Remove image"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <div>
                    <p className="font-medium text-gray-700">
                      {formData.itemName || 'Item'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">
                      {selectedFile?.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFile ? `${(selectedFile!.size / 1024 / 1024).toFixed(2)} MB` : null}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Ready to upload
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          Upload an image file (max 5MB, JPG/PNG/GIF)
        </span>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Item'}
        </Button>
      </div>
    </form>
  )
}
