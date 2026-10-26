import React, { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Building2, Coins, Calendar, Info, Layers } from 'lucide-react'

export interface AddAPPItemFormData {
  ppmpItemId: string
  itemNameOverride: string
  procurementModeId: string
  fundSourceId: string
  officeId: string
  papCode: string
  generalDescription: string
  procurementStartDate: string
  procurementEndDate: string
  remarks: string
  isEarlyProcurementActivity: boolean
  isOutsourced: boolean
  bidEvaluationCriteria: string
  procurementStrategies: string[]
}

export interface PPMPItemOption {
  id: string
  name?: string
  description?: string
  code?: string
  papCode?: string
  remarks?: string
  unitPrice?: number
  totalAllocationAmount?: number
  PPMPItemAllocationTotalAmount?: number
  procurementModeId?: string
  procurementModeName?: string
  procurementStartDate?: string
  procurementEndDate?: string
  PPMP?: {
    officeId?: string
    officeName?: string
    fundSourceId?: string
    fundSourceName?: string
    ppmpNumber?: string
  }
}

export interface ProcurementModeOption {
  id: string
  name?: string
  description?: string
}

export interface FundSourceOption {
  id: string
  name?: string
}

export interface OfficeOption {
  id: string
  name?: string
  code?: string
}

// Allowed dropdown options for Bid Evaluation Criteria
export const BID_EVALUATION_CRITERIA_OPTIONS = [
  { value: 'LCRB', label: 'LCRB - Lowest Calculated Responsive Bid' },
  { value: 'MEARB', label: 'MEARB - Most Advantageous Economic and Responsive Bid (Sustainability)' },
  { value: 'MARB_HRRB_SRRB', label: 'MARB/HRRB/SRRB - Highest Rated Responsive Bid' },
  { value: 'LCCRB', label: 'LCCRB - Lowest Calculated and Complying Responsive Bid' },
]

// Allowed options for Procurement Strategies
export const PROCUREMENT_STRATEGY_OPTIONS = [
  { value: 'LCA', label: 'Least Cost Analysis (LCA)' },
  { value: 'Subcontracting', label: 'Subcontracting' },
  { value: 'MultiYearContracting', label: 'Multi-Year Contracting' },
  { value: 'DesignAndBuild', label: 'Design and Build' },
  { value: 'ProcurementAgent', label: 'Procurement Agent' },
  { value: 'FrameworkAgreement', label: 'Framework Agreement' },
  { value: 'PooledProcurement', label: 'Pooled Procurement' },
  { value: 'RenewalOfServices', label: 'Renewal of Services' },
  { value: 'WarehousingInventory', label: 'Warehousing & Inventory' },
  { value: 'NotApplicable', label: 'Not Applicable (N/A)' },
]

export interface AddAPPItemFormFieldsProps {
  formData: AddAPPItemFormData
  setFormData: React.Dispatch<React.SetStateAction<AddAPPItemFormData>>
  ppmpItems: PPMPItemOption[]
  procurementModes: ProcurementModeOption[]
  fundSources: FundSourceOption[]
  offices: OfficeOption[]
  handleStrategyToggle: (strategy: string) => void
  attachedPpmpItemIds?: Set<string>
}

export function AddAPPItemFormFields({
  formData,
  setFormData,
  ppmpItems,
  procurementModes,
  fundSources,
  offices,
  handleStrategyToggle,
  attachedPpmpItemIds = new Set(),
}: AddAPPItemFormFieldsProps) {
  const selectedPPMPItem = ppmpItems.find((item) => item.id === formData.ppmpItemId)
  const officeName = selectedPPMPItem?.PPMP?.officeName || offices.find(o => o.id === formData.officeId)?.name || '—'
  const fundSourceName = selectedPPMPItem?.PPMP?.fundSourceName || fundSources.find(f => f.id === formData.fundSourceId)?.name || '—'
  const startDateStr = selectedPPMPItem?.procurementStartDate || '—'
  const endDateStr = selectedPPMPItem?.procurementEndDate || '—'
  const ppmpNumberStr = selectedPPMPItem?.PPMP?.ppmpNumber || '—'

  // Calculate estimated budget total allocation amount
  const estimatedBudgetAmount = selectedPPMPItem
    ? selectedPPMPItem.PPMPItemAllocationTotalAmount ||
      selectedPPMPItem.totalAllocationAmount ||
      selectedPPMPItem.unitPrice ||
      0
    : 0

  const formattedBudget = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(estimatedBudgetAmount)

  // Group PPMP items by parent PPMP Number
  const groupedPPMPItems = useMemo(() => {
    const groups: Record<string, PPMPItemOption[]> = {}
    ppmpItems.forEach((item) => {
      const groupKey = item.PPMP?.ppmpNumber || 'General PPMP'
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })
    return groups
  }, [ppmpItems])

  return (
    <div className="space-y-6 pt-2">
      {/* 1. PPMP Item Selector */}
      <div className="space-y-2">
        <Label htmlFor="ppmpItem" className="text-sm font-semibold flex items-center gap-1.5 text-gray-900">
          <FileText className="w-4 h-4 text-blue-600" />
          PPMP Item <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.ppmpItemId}
          onValueChange={(val) => {
            const selectedItem = ppmpItems.find((item) => item.id === val)
            const isAttached = attachedPpmpItemIds.has(val)
            if (isAttached) return

            const defaultName = selectedItem?.name || selectedItem?.code || ''
            const defaultDesc = selectedItem?.description || selectedItem?.name || ''
            const defaultStart = selectedItem?.procurementStartDate || ''
            const defaultEnd = selectedItem?.procurementEndDate || ''

            setFormData((p) => ({
              ...p,
              ppmpItemId: val,
              itemNameOverride: defaultName || p.itemNameOverride || '',
              procurementModeId: selectedItem?.procurementModeId || p.procurementModeId,
              officeId: selectedItem?.PPMP?.officeId || p.officeId,
              fundSourceId: selectedItem?.PPMP?.fundSourceId || p.fundSourceId,
              papCode: selectedItem?.papCode || p.papCode || '',
              generalDescription: defaultDesc || p.generalDescription || '',
              procurementStartDate: defaultStart || p.procurementStartDate || '',
              procurementEndDate: defaultEnd || p.procurementEndDate || '',
              remarks: selectedItem?.remarks || p.remarks || '',
            }))
          }}
        >
          <SelectTrigger id="ppmpItem" className="h-auto min-h-[52px] py-2 px-3 text-left border-gray-300">
            <SelectValue placeholder="Select PPMP Item from Consolidated PPMP(s)">
              {selectedPPMPItem ? (
                <div className="flex flex-col text-left justify-center min-w-0 flex-1 pr-2">
                  <span className="font-semibold text-gray-900 text-sm truncate" title={selectedPPMPItem.code || selectedPPMPItem.name}>
                    {selectedPPMPItem.code || selectedPPMPItem.name || 'PPMP Item'}
                  </span>
                  {selectedPPMPItem.description && selectedPPMPItem.description !== (selectedPPMPItem.code || selectedPPMPItem.name) && (
                    <span className="text-xs text-gray-500 truncate max-w-[480px]" title={selectedPPMPItem.description}>
                      {selectedPPMPItem.description}
                    </span>
                  )}
                </div>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[320px] max-w-[550px]">
            {Object.keys(groupedPPMPItems).length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No available PPMP items in consolidated PPMPs</div>
            ) : (
              Object.entries(groupedPPMPItems).map(([ppmpNum, items]) => (
                <SelectGroup key={ppmpNum}>
                  <SelectLabel className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 border-y border-slate-200">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Parent PPMP: {ppmpNum}
                  </SelectLabel>
                  {items.map((item) => {
                    const isAttached = attachedPpmpItemIds.has(item.id) || Boolean((item as any).isAttached) || Boolean((item as any).isAlreadyAdded)
                    const itemTitle = item.code || item.name || item.id
                    const itemDesc = item.description && item.description !== itemTitle ? item.description : ''

                    return (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        disabled={isAttached}
                        className={`py-2.5 px-3 border-b border-gray-100 last:border-0 ${
                          isAttached ? 'opacity-50 bg-gray-50/70 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full min-w-0 gap-3 text-left">
                          <div className="flex flex-col text-left min-w-0 flex-1">
                            {/* Level 1: Primary Item Name / Code */}
                            <span className="font-semibold text-gray-900 text-sm truncate" title={itemTitle}>
                              {itemTitle}
                            </span>
                            {/* Level 2: Secondary Description */}
                            {itemDesc && (
                              <span className="text-xs text-gray-500 truncate max-w-[400px]" title={itemDesc}>
                                {itemDesc}
                              </span>
                            )}
                          </div>
                          {isAttached && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-800 flex-shrink-0">
                              Already Added
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Inherited PPMP Summary Banner */}
      {selectedPPMPItem && (
        <div className="p-4 bg-gradient-to-r from-blue-50/90 via-slate-50 to-emerald-50/60 border border-blue-200/80 rounded-xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-blue-100/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Inherited PPMP Allocation Info
              </span>
              <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded text-xs shadow-2xs">
                {ppmpNumberStr}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>Estimated Budget: {formattedBudget}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700">
            <div className="flex flex-col bg-white/70 p-2 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">Implementing Office</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                {officeName}
              </span>
            </div>

            <div className="flex flex-col bg-white/70 p-2 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">Source of Fund</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5 truncate">
                <Coins className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                {fundSourceName}
              </span>
            </div>

            <div className="flex flex-col bg-white/70 p-2 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">PPMP Start Date</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                {startDateStr}
              </span>
            </div>

            <div className="flex flex-col bg-white/70 p-2 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">PPMP End Date</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                {endDateStr}
              </span>
            </div>
          </div>

          {/* Source PPMP Item Lineage Reference */}
          <div className="pt-2 border-t border-blue-100/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="bg-white/70 p-2 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium block">Source PPMP Item (Immutable):</span>
              <span className="font-semibold text-gray-900 line-clamp-1">{selectedPPMPItem.name || selectedPPMPItem.code || '—'}</span>
            </div>
            <div className="bg-white/70 p-2 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium block">Source PPMP Description (Immutable):</span>
              <span className="font-semibold text-gray-900 line-clamp-1">{selectedPPMPItem.description || selectedPPMPItem.name || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Section: APP Item Core Details */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Layers className="w-4 h-4 text-blue-600" />
          General Information & Mode of Procurement
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Title / Item Name */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="itemNameOverride" className="text-sm font-semibold flex items-center justify-between">
              <span>Project Title / Item Name</span>
              <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Column 1 on APP (Editable Override)
              </span>
            </Label>
            <Input
              id="itemNameOverride"
              placeholder="Project Title / Item Name for APP document..."
              value={formData.itemNameOverride}
              onChange={(e) => setFormData((p) => ({ ...p, itemNameOverride: e.target.value }))}
            />
            <p className="text-[11px] text-gray-500">
              Overrides the title appearing on the consolidated APP and generated document without modifying the original PPMP.
            </p>
          </div>

          {/* General Description */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="generalDescription" className="text-sm font-semibold flex items-center justify-between">
              <span>General Description</span>
              <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Column 3 on APP (Editable Override)
              </span>
            </Label>
            <textarea
              id="generalDescription"
              rows={Math.min(10, Math.max(4, Math.ceil(((formData.generalDescription || '').length) / 65)))}
              placeholder="General Description of the project item..."
              value={formData.generalDescription}
              onChange={(e) => setFormData((p) => ({ ...p, generalDescription: e.target.value }))}
              className="flex min-h-[110px] w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-sm leading-relaxed resize-y shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-[11px] text-gray-500">
              Overrides the general project description appearing on the consolidated APP and generated document.
            </p>
          </div>

          {/* Mode of Procurement */}
          <div className="space-y-2">
            <Label htmlFor="procurementMode" className="text-sm font-semibold">
              Mode of Procurement <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.procurementModeId}
              onValueChange={(val) => setFormData((p) => ({ ...p, procurementModeId: val }))}
            >
              <SelectTrigger id="procurementMode" className="border-gray-300">
                <SelectValue placeholder="Select Mode of Procurement" />
              </SelectTrigger>
              <SelectContent>
                {procurementModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PAP Code */}
          <div className="space-y-2">
            <Label htmlFor="papCode" className="text-sm font-semibold">PAP Code</Label>
            <Input
              id="papCode"
              placeholder="e.g. coo22"
              value={formData.papCode}
              onChange={(e) => setFormData((p) => ({ ...p, papCode: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* 4. Section: Procurement Activity Schedule */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Procurement Activity Schedule
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="procurementStartDate" className="text-sm font-semibold flex items-center justify-between">
              <span>Start of Procurement Activity</span>
              <span className="text-xs text-gray-400 font-normal">(Editable)</span>
            </Label>
            <Input
              id="procurementStartDate"
              type="date"
              value={formData.procurementStartDate}
              onChange={(e) => setFormData((p) => ({ ...p, procurementStartDate: e.target.value }))}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="procurementEndDate" className="text-sm font-semibold flex items-center justify-between">
              <span>End of Procurement Activity</span>
              <span className="text-xs text-gray-400 font-normal">(Editable)</span>
            </Label>
            <Input
              id="procurementEndDate"
              type="date"
              value={formData.procurementEndDate}
              onChange={(e) => setFormData((p) => ({ ...p, procurementEndDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* 5. Section: Evaluation & Procurement Strategies */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Coins className="w-4 h-4 text-blue-600" />
          Evaluation & Procurement Strategies
        </h4>

        {/* Bid Evaluation Criteria */}
        <div className="space-y-2">
          <Label htmlFor="bidEvaluationCriteria" className="text-sm font-semibold">
            Criteria for Bid Evaluation
          </Label>
          <Select
            value={formData.bidEvaluationCriteria}
            onValueChange={(val) => setFormData((p) => ({ ...p, bidEvaluationCriteria: val }))}
          >
            <SelectTrigger id="bidEvaluationCriteria" className="border-gray-300">
              <SelectValue placeholder="Select Criteria for Bid Evaluation" />
            </SelectTrigger>
            <SelectContent>
              {BID_EVALUATION_CRITERIA_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Procurement Strategies */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Procurement Strategies</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-gray-200 rounded-lg p-3 bg-gray-50/50 max-h-[160px] overflow-y-auto">
            {PROCUREMENT_STRATEGY_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`strategy-${opt.value}`}
                  checked={formData.procurementStrategies.includes(opt.value)}
                  onCheckedChange={() => handleStrategyToggle(opt.value)}
                />
                <label htmlFor={`strategy-${opt.value}`} className="text-xs text-gray-700 leading-none cursor-pointer select-none hover:text-gray-900">
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* EPA & Outsourced checkboxes */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isEarlyProcurementActivity"
              checked={formData.isEarlyProcurementActivity}
              onCheckedChange={(val) => setFormData((p) => ({ ...p, isEarlyProcurementActivity: !!val }))}
            />
            <label htmlFor="isEarlyProcurementActivity" className="text-xs font-semibold leading-none cursor-pointer select-none text-slate-800">
              Early Procurement Activity (EPA)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOutsourced"
              checked={formData.isOutsourced}
              onCheckedChange={(val) => setFormData((p) => ({ ...p, isOutsourced: !!val }))}
            />
            <label htmlFor="isOutsourced" className="text-xs font-semibold leading-none cursor-pointer select-none text-slate-800">
              Outsourced Services
            </label>
          </div>
        </div>
      </div>

      {/* 6. Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks" className="text-sm font-semibold">Remarks</Label>
        <textarea
          id="remarks"
          placeholder="Enter procurement remarks or notes..."
          value={formData.remarks}
          onChange={(e) => setFormData((p) => ({ ...p, remarks: e.target.value }))}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  )
}
