import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Split } from 'lucide-react'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
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
import { getObjectsRequest } from '@/features/planning/object/handlers/getObjectsRequest'
import { updateLineItemBudgetDetailsRequest } from '../handlers/updateLineItemBudgetDetailsRequest'
import { createLineItemBudgetDetailsRequest } from '../handlers/createLineItemBudgetDetailsRequest'
import {
  resolveExpenditureTypes,
  getDescendantExpenditureItems,
  type ExpenditureItemOption,
} from '../utils/expenditureHierarchyHelpers'
import { ExpenditureItemCombobox } from './ExpenditureItemCombobox'
import { formatDateToISO } from '../utils/periodAllocationHelpers'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { LineItemBudgetDetails } from '../types/types'

interface EditLineItemBudgetDetailsDialogProps {
  item: LineItemBudgetDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  libId?: string
  libActivityId?: string
  onSuccess?: () => void
}

const useGetObjects = createQueryHookFromTemplate(getObjectsRequest)
const useUpdateLineItemBudgetDetails = createMutationHookFromTemplate(
  updateLineItemBudgetDetailsRequest,
)
const useCreateLineItemBudgetDetails = createMutationHookFromTemplate(
  createLineItemBudgetDetailsRequest,
)

const TIMELINE_OPTIONS = [
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'monthly', label: 'Monthly' },
] as const

const QUARTERS = [
  {
    id: 'Q1',
    label: 'Q1 (Jan – Mar)',
    startMonth: 0,
    startDay: 1,
    endMonth: 2,
    endDay: 31,
  },
  {
    id: 'Q2',
    label: 'Q2 (Apr – Jun)',
    startMonth: 3,
    startDay: 1,
    endMonth: 5,
    endDay: 30,
  },
  {
    id: 'Q3',
    label: 'Q3 (Jul – Sep)',
    startMonth: 6,
    startDay: 1,
    endMonth: 8,
    endDay: 30,
  },
  {
    id: 'Q4',
    label: 'Q4 (Oct – Dec)',
    startMonth: 9,
    startDay: 1,
    endMonth: 11,
    endDay: 31,
  },
] as const

export interface CoveredQuarter {
  id: string
  key: string
  label: string
  year: number
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
  startDate: string
  endDate: string
}

export function getCoveredQuarters(
  startDateStr: string,
  endDateStr: string,
): CoveredQuarter[] {
  if (!startDateStr) return []
  const start = new Date(startDateStr)
  const end = endDateStr ? new Date(endDateStr) : start
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return []

  const startYear = start.getFullYear()
  const endYear = end.getFullYear()
  const startQ = Math.floor(start.getMonth() / 3) + 1
  const endQ = Math.floor(end.getMonth() / 3) + 1

  const result: CoveredQuarter[] = []

  for (let y = startYear; y <= endYear; y++) {
    const qFrom = y === startYear ? startQ : 1
    const qTo = y === endYear ? endQ : 4
    for (let q = qFrom; q <= qTo; q++) {
      const def = QUARTERS[q - 1]
      const s = new Date(Date.UTC(y, def.startMonth, def.startDay))
        .toISOString()
        .split('T')[0]
      const e = new Date(Date.UTC(y, def.endMonth, def.endDay))
        .toISOString()
        .split('T')[0]

      result.push({
        id: `Q${q}`,
        key: `${y}-Q${q}`,
        label: `Q${q} (${def.label.replace(/^Q\d\s*\(?/, '').replace(/\)$/, '')})`,
        year: y,
        startMonth: def.startMonth,
        startDay: def.startDay,
        endMonth: def.endMonth,
        endDay: def.endDay,
        startDate: s,
        endDate: e,
      })
    }
  }

  return result
}

export function EditLineItemBudgetDetailsDialog({
  item,
  open,
  onOpenChange,
  libId,
  libActivityId,
  onSuccess,
}: EditLineItemBudgetDetailsDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateLineItem, isPending: isUpdating } =
    useUpdateLineItemBudgetDetails()
  const { mutateAsync: createLineItem, isPending: isCreating } =
    useCreateLineItemBudgetDetails()
  const isSubmitting = isUpdating || isCreating

  // Form states
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [selectedObjectId, setSelectedObjectId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [budget, setBudget] = useState<string>('')
  const [timelineType, setTimelineType] = useState<string>('quarterly')
  const [selectedQuarter, setSelectedQuarter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Split mode state
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false)
  const [splitBudgets, setSplitBudgets] = useState<Record<string, string>>({})

  // Covered quarters based on current dates
  const coveredQuarters = useMemo(
    () => getCoveredQuarters(startDate, endDate),
    [startDate, endDate],
  )
  const spansMultipleQuarters = coveredQuarters.length > 1

  const splitSum = useMemo(() => {
    return Object.values(splitBudgets).reduce(
      (acc, val) => acc + (parseFloat(val) || 0),
      0,
    )
  }, [splitBudgets])

  // Fetch objects hierarchy
  const { data: allObjectsResponse, isLoading: isLoadingObjects } =
    useGetObjects({
      pathParams: {},
      queryParams: {
        pageSize: 5000,
      },
      enabled: open,
    })

  const allObjects = useMemo(
    () => allObjectsResponse?.data ?? [],
    [allObjectsResponse?.data],
  )

  const { expenditureTypes } = useMemo(
    () => resolveExpenditureTypes(allObjects),
    [allObjects],
  )

  // Compute descendants of the selected type/sub-class
  const descendantExpenditureItems = useMemo(
    () => getDescendantExpenditureItems(allObjects, selectedParentId || null),
    [allObjects, selectedParentId],
  )

  // Prepopulate form when item changes or opens
  useEffect(() => {
    if (!item || !open) return

    setSelectedObjectId(item.objectId || item.object?.id || '')
    setDescription(item.description || '')
    const itemBudget = item.budget != null ? String(item.budget) : ''
    setBudget(itemBudget)
    setTimelineType(item.timelineType?.toLowerCase() || 'quarterly')

    const sDate = item.startDate ? item.startDate.split('T')[0] : ''
    const eDate = item.endDate ? item.endDate.split('T')[0] : ''
    setStartDate(sDate)
    setEndDate(eDate)

    // Detect single quarter or multi-quarter from actual date range
    if (sDate && eDate) {
      const covered = getCoveredQuarters(sDate, eDate)
      if (covered.length === 1) {
        setSelectedQuarter(covered[0].id)
        setIsSplitMode(false)
      } else if (covered.length > 1) {
        setSelectedQuarter('MULTI')
        const totalB = item.budget != null ? item.budget : 0
        const perQ = Math.floor((totalB / covered.length) * 100) / 100
        const initial: Record<string, string> = {}
        covered.forEach((q, idx) => {
          if (idx === covered.length - 1) {
            initial[q.id] = (totalB - perQ * (covered.length - 1)).toFixed(2)
          } else {
            initial[q.id] = perQ.toFixed(2)
          }
        })
        setSplitBudgets(initial)
      } else {
        setSelectedQuarter('')
        setIsSplitMode(false)
      }
    } else if (sDate) {
      const month = new Date(sDate).getMonth()
      const qNum = Math.floor(month / 3) + 1
      setSelectedQuarter(`Q${qNum}`)
      setIsSplitMode(false)
    } else {
      setSelectedQuarter('')
      setIsSplitMode(false)
    }

    // Try finding the parent group (expense class) in expenditureTypes
    let matchedParentId: string | null = null

    if (allObjects.length > 0) {
      let currentId: string | undefined = item.objectId || item.object?.id
      while (currentId) {
        const obj = allObjects.find((o) => o.id === currentId)
        if (!obj) break
        const pId = (obj.parent as any)?.id || (obj as any)?.parentId
        if (pId && expenditureTypes.some((t) => t.id === pId)) {
          matchedParentId = pId
          break
        }
        currentId = pId
      }
    }

    // Fallback: match by code prefix against expenditureTypes (501: PS, 502: MOOE, 503: FE, 506: CO)
    if (!matchedParentId && expenditureTypes.length > 0) {
      const code = (item.object?.code || '').replace(/[\s-]/g, '')
      if (code.startsWith('501')) {
        matchedParentId =
          expenditureTypes.find((t) =>
            (t.code || '').replace(/[\s-]/g, '').startsWith('501'),
          )?.id || null
      } else if (code.startsWith('502')) {
        matchedParentId =
          expenditureTypes.find((t) =>
            (t.code || '').replace(/[\s-]/g, '').startsWith('502'),
          )?.id || null
      } else if (code.startsWith('503')) {
        matchedParentId =
          expenditureTypes.find((t) =>
            (t.code || '').replace(/[\s-]/g, '').startsWith('503'),
          )?.id || null
      } else if (code.startsWith('506')) {
        matchedParentId =
          expenditureTypes.find((t) =>
            (t.code || '').replace(/[\s-]/g, '').startsWith('506'),
          )?.id || null
      }
    }

    if (matchedParentId) {
      setSelectedParentId(matchedParentId)
    } else if (item.object?.parentId) {
      setSelectedParentId(item.object.parentId)
    }
  }, [item, open, allObjects, expenditureTypes])

  const handleToggleSplitMode = () => {
    if (!isSplitMode) {
      const totalB = parseFloat(budget) || 0
      const count = coveredQuarters.length || 2
      const perQ = Math.floor((totalB / count) * 100) / 100
      const initial: Record<string, string> = {}
      coveredQuarters.forEach((q, idx) => {
        if (idx === count - 1) {
          initial[q.id] = (totalB - perQ * (count - 1)).toFixed(2)
        } else {
          initial[q.id] = perQ.toFixed(2)
        }
      })
      setSplitBudgets(initial)
      setIsSplitMode(true)
    } else {
      setIsSplitMode(false)
    }
  }

  const handleEqualizeBudgets = () => {
    const totalB = parseFloat(budget) || 0
    const count = coveredQuarters.length || 2
    const perQ = Math.floor((totalB / count) * 100) / 100
    const initial: Record<string, string> = {}
    coveredQuarters.forEach((q, idx) => {
      if (idx === count - 1) {
        initial[q.id] = (totalB - perQ * (count - 1)).toFixed(2)
      } else {
        initial[q.id] = perQ.toFixed(2)
      }
    })
    setSplitBudgets(initial)
  }

  // When selected quarter changes, automatically update dates based on current year
  const handleQuarterChange = (qId: string) => {
    setSelectedQuarter(qId)
    setIsSplitMode(false)
    const quarterDef = QUARTERS.find((q) => q.id === qId)
    if (!quarterDef) return

    const year = startDate
      ? new Date(startDate).getFullYear()
      : new Date().getFullYear()

    const s = new Date(Date.UTC(year, quarterDef.startMonth, quarterDef.startDay))
    const e = new Date(Date.UTC(year, quarterDef.endMonth, quarterDef.endDay))

    setStartDate(s.toISOString().split('T')[0])
    setEndDate(e.toISOString().split('T')[0])
  }

  const handleComboboxChange = (
    val: string,
    selectedItem?: ExpenditureItemOption | null,
  ) => {
    setSelectedObjectId(val)
    if (selectedItem?.name && !description) {
      setDescription(selectedItem.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    const numBudget = parseFloat(budget)
    if (isNaN(numBudget) || numBudget <= 0) {
      toast.error('Budget must be greater than 0')
      return
    }

    if (!selectedObjectId) {
      toast.error('Please select an Item of Expenditure')
      return
    }

    if (!startDate || !endDate) {
      toast.error('Start date and end date are required')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be on or after start date')
      return
    }

    if (isSplitMode) {
      if (coveredQuarters.length < 2) {
        toast.error('At least 2 quarters are required to split')
        return
      }

      for (const q of coveredQuarters) {
        const val = parseFloat(splitBudgets[q.id] || '0')
        if (isNaN(val) || val <= 0) {
          toast.error(
            `Please provide a valid budget greater than 0 for ${q.label}`,
          )
          return
        }
      }

      try {
        const firstQ = coveredQuarters[0]
        const firstBudget = parseFloat(splitBudgets[firstQ.id])

        // 1. Update the original line item with first quarter's dates and budget
        await updateLineItem({
          pathParams: { id: item.id },
          payload: {
            lineItemBudgetId: libId || item.lineItemBudgetId,
            lineItemBudgetActivityId:
              libActivityId || item.lineItemBudgetActivityId,
            wfpObjectiveActivityExpenditureId:
              item.wfpObjectiveActivityExpenditureId,
            objectId: selectedObjectId,
            description: description.trim() || undefined,
            timelineType: 'quarterly',
            startDate: formatDateToISO(new Date(firstQ.startDate)),
            endDate: formatDateToISO(new Date(firstQ.endDate)),
            budget: firstBudget,
          },
        })

        // 2. Create discrete line items for subsequent quarters
        for (let i = 1; i < coveredQuarters.length; i++) {
          const q = coveredQuarters[i]
          const qBudget = parseFloat(splitBudgets[q.id])
          await createLineItem({
            pathParams: {},
            payload: {
              lineItemBudgetId: libId || item.lineItemBudgetId,
              lineItemBudgetActivityId:
                libActivityId || item.lineItemBudgetActivityId,
              wfpObjectiveActivityExpenditureId: undefined,
              objectId: selectedObjectId,
              description: description.trim() || undefined,
              timelineType: 'quarterly',
              startDate: formatDateToISO(new Date(q.startDate)),
              endDate: formatDateToISO(new Date(q.endDate)),
              budget: qBudget,
            },
          })
        }

        toast.success(
          `Successfully split line item into ${coveredQuarters.length} quarterly allocations!`,
        )
        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].includes('/line-item-budget-details') ||
              query.queryKey[0].includes('/lib-activities') ||
              query.queryKey[0].includes('/libs')),
        })

        onSuccess?.()
        onOpenChange(false)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to split line item'
        toast.error(message)
      }
      return
    }

    try {
      await updateLineItem({
        pathParams: { id: item.id },
        payload: {
          lineItemBudgetId: libId || item.lineItemBudgetId,
          lineItemBudgetActivityId:
            libActivityId || item.lineItemBudgetActivityId,
          wfpObjectiveActivityExpenditureId:
            item.wfpObjectiveActivityExpenditureId,
          objectId: selectedObjectId,
          description: description.trim() || undefined,
          timelineType: timelineType || undefined,
          startDate: formatDateToISO(new Date(startDate)),
          endDate: formatDateToISO(new Date(endDate)),
          budget: numBudget,
        },
      })

      toast.success('Line item updated successfully!')
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          (query.queryKey[0].includes('/line-item-budget-details') ||
            query.queryKey[0].includes('/lib-activities') ||
            query.queryKey[0].includes('/libs')),
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update line item'
      toast.error(message)
    }
  }

  const totalBudgetNum = parseFloat(budget) || 0

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Expenditure Line Item"
      description="Update expenditure details, schedule, and allocated budget amount."
      size="2xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-line-item-form"
            disabled={isSubmitting}
            className={`text-white min-w-[130px] ${
              isSplitMode
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting
              ? isSplitMode
                ? 'Splitting Line Item...'
                : 'Saving Changes...'
              : isSplitMode
                ? `Split into ${coveredQuarters.length} Quarters & Save`
                : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form
        id="edit-line-item-form"
        onSubmit={handleSubmit}
        className="p-4 space-y-4 text-sm"
      >
        {/* Category Group Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">
            Type of Expenditure (Class)
          </Label>
          <Select
            value={selectedParentId}
            onValueChange={(val) => {
              setSelectedParentId(val)
              setSelectedObjectId('')
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Category / Group..." />
            </SelectTrigger>
            <SelectContent>
              {expenditureTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.code ? `${type.code} - ` : ''}
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item of Expenditure Combobox */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">
            Item of Expenditure (Object Code) <span className="text-red-500">*</span>
          </Label>
          <ExpenditureItemCombobox
            items={
              descendantExpenditureItems.length > 0
                ? descendantExpenditureItems
                : item?.object
                  ? [
                      {
                        id: item.object.id || item.objectId,
                        name: item.object.name || 'Current Item',
                        code: item.object.code || '',
                        depth: 0,
                        isLeaf: true,
                        isSelectable: true,
                      },
                    ]
                  : []
            }
            value={selectedObjectId}
            onValueChange={handleComboboxChange}
            placeholder={
              isLoadingObjects
                ? 'Loading expenditure items...'
                : 'Search object code or name...'
            }
            isLoading={isLoadingObjects}
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-description" className="text-xs font-semibold text-gray-700">
            Description / Specifications
          </Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description, purpose, or procurement specs..."
            rows={3}
            className="text-sm resize-none"
          />
        </div>

        {/* Budget and Timeline Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-budget" className="text-xs font-semibold text-gray-700">
              Allocated Budget (₱) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-budget"
              type="number"
              step="0.01"
              min="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="text-sm font-semibold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Timeline Type
            </Label>
            <Select
              value={timelineType}
              onValueChange={(val) => setTimelineType(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timeline..." />
              </SelectTrigger>
              <SelectContent>
                {TIMELINE_OPTIONS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quarter & Date Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Quarter Preset
            </Label>
            <Select
              value={selectedQuarter}
              onValueChange={handleQuarterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick quarter..." />
              </SelectTrigger>
              <SelectContent>
                {spansMultipleQuarters && (
                  <SelectItem
                    value="MULTI"
                    disabled
                    className="font-semibold text-amber-700 bg-amber-50/80"
                  >
                    Spans {coveredQuarters.map((q) => q.id).join(' & ')}
                  </SelectItem>
                )}
                {QUARTERS.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-start-date" className="text-xs font-semibold text-gray-700">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                const newSDate = e.target.value
                setStartDate(newSDate)
                const covered = getCoveredQuarters(newSDate, endDate)
                if (covered.length === 1) {
                  setSelectedQuarter(covered[0].id)
                  setIsSplitMode(false)
                } else if (covered.length > 1) {
                  setSelectedQuarter('MULTI')
                } else {
                  setSelectedQuarter('')
                  setIsSplitMode(false)
                }
              }}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-end-date" className="text-xs font-semibold text-gray-700">
              End Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                const newEDate = e.target.value
                setEndDate(newEDate)
                const covered = getCoveredQuarters(startDate, newEDate)
                if (covered.length === 1) {
                  setSelectedQuarter(covered[0].id)
                  setIsSplitMode(false)
                } else if (covered.length > 1) {
                  setSelectedQuarter('MULTI')
                } else {
                  setSelectedQuarter('')
                  setIsSplitMode(false)
                }
              }}
              required
            />
          </div>
        </div>

        {/* Multi-Quarter Split Banner & Breakdown (Option 2) */}
        {spansMultipleQuarters && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-amber-900">
                    Multi-Quarter Allocation ({coveredQuarters.map((q) => q.id).join(' & ')})
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    This allocation spans {startDate} to {endDate}. Split it across quarters to align with the quarterly matrix columns.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant={isSplitMode ? 'default' : 'outline'}
                onClick={handleToggleSplitMode}
                className={`h-7 px-2.5 text-xs font-medium shrink-0 ${
                  isSplitMode
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'border-amber-300 text-amber-800 hover:bg-amber-100 bg-white'
                }`}
              >
                <Split className="h-3.5 w-3.5 mr-1" />
                {isSplitMode ? 'Cancel Split' : 'Split Across Quarters'}
              </Button>
            </div>

            {/* Split Breakdown */}
            {isSplitMode && (
              <div className="bg-white rounded-lg border border-amber-200 p-3 space-y-3 pt-2.5">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-gray-800">
                    Quarterly Budget Breakdown
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEqualizeBudgets}
                    className="h-6 text-[11px] text-blue-600 hover:text-blue-800 font-medium px-2"
                  >
                    Divide Equally
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {coveredQuarters.map((q) => (
                    <div
                      key={q.id}
                      className="bg-gray-50/80 rounded-lg p-2.5 border border-gray-100 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-800">
                          {q.label}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {q.startDate} – {q.endDate}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-semibold text-gray-400">
                          ₱
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={splitBudgets[q.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setSplitBudgets((prev) => ({
                              ...prev,
                              [q.id]: val,
                            }))
                          }}
                          className="h-8 pl-6 text-xs font-semibold"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-500 text-[11px]">
                    Sum of quarters:{' '}
                    <strong
                      className={`font-semibold ${
                        Math.abs(splitSum - totalBudgetNum) > 0.01
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrencyPHP(splitSum)}
                    </strong>
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    Total Budget:{' '}
                    <strong className="text-gray-900 font-semibold">
                      {formatCurrencyPHP(totalBudgetNum)}
                    </strong>
                  </span>
                </div>

                {Math.abs(splitSum - totalBudgetNum) > 0.01 && (
                  <p className="text-[11px] text-amber-700 font-medium">
                    ⚠️ The sum of quarters ({formatCurrencyPHP(splitSum)}) differs from the total budget ({formatCurrencyPHP(totalBudgetNum)}).
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </ResponsiveDialogDashtail>
  )
}
