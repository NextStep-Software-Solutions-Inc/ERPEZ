import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, HelpCircle, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

// Hierarchical Budget Interfaces
interface BudgetItem {
  id: string
  description: string
  q1: number
  q2: number
  q3: number
  q4: number
  total: number
}

interface ItemOfExpenditure {
  id: string
  name: string
  items: BudgetItem[]
}

interface ExpenditureType {
  id: string
  name: string
  type: 'PS' | 'MOOE' | 'CO'
  itemsOfExpenditure: ItemOfExpenditure[]
}

interface Activity {
  id: string
  name: string
  expenditureTypes: ExpenditureType[]
}

// LIB 2026 Mock Data - Hierarchical Structure
const LIB_2026_DATA: Activity[] = [
  {
    id: 'activity-1',
    name: 'Call for Applicants',
    expenditureTypes: [
      {
        id: 'exptype-1',
        name: 'PS (Personnel Services)',
        type: 'PS',
        itemsOfExpenditure: [
          {
            id: 'itemexp-1',
            name: 'Representative Expense',
            items: [
              {
                id: 'item-1',
                description: 'Snacks and Lunch of Deliberation Panel and Secretariat',
                q1: 0,
                q2: 60000,
                q3: 0,
                q4: 0,
                total: 60000,
              },
              {
                id: 'item-2',
                description: 'Coffee and refreshments for staff meetings',
                q1: 60000,
                q2: 0,
                q3: 0,
                q4: 0,
                total: 60000,
              },
            ],
          },
        ],
      },
      {
        id: 'exptype-2',
        name: 'MOOE (Maintenance & Other Operating Expenses)',
        type: 'MOOE',
        itemsOfExpenditure: [
          {
            id: 'itemexp-2',
            name: 'Equipment and Supplies',
            items: [
              {
                id: 'item-3',
                description: 'Office supplies and consumables',
                q1: 40000,
                q2: 0,
                q3: 60000,
                q4: 0,
                total: 100000,
              },
            ],
          },
        ],
      },
    ],
  },
]


interface RealSourceItem {
  id: string
  libId: string
  libName: string
  description: string
  allotmentClass: 'PS' | 'MOOE' | 'CO'
  q1: number
  q2: number
  q3: number
  q4: number
  total: number
  selectedLineItems: Array<{ id: string; description: string; q1: number; q2: number; q3: number; q4: number; total: number; deductAmount: number }>
}

interface RealDestinationItem {
  id: string
  description: string
  allotmentClass: 'PS' | 'MOOE' | 'CO'
  addAmount: number
  targetQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
}

interface RealignmentRequest {
  id: string
  reason: string
  justification: string
  sources: RealSourceItem[]
  destinations: RealDestinationItem[]
  status: 'Draft' | 'Submitted (For Endorsement)' | 'For Budget Review' | 'Approved' | 'Returned for Revision'
  fiscalYear: string
  activities: Activity[]
  createdAt: string
  updatedAt?: string
}

interface CreateRealignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (request: RealignmentRequest) => void
}

const MODIFICATION_REASONS = [
  'UnforeseenModification',
  'Reassessment',
  'AdditionalRequirements',
]

export function CreateRealignmentDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateRealignmentDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [newRequest, setNewRequest] = useState({
    reason: '',
    justification: '',
    fiscalYear: '2026',
  })

  // Budget state - now hierarchical
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [expandedExpType, setExpandedExpType] = useState<string | null>(null)
  const [expandedItemExp, setExpandedItemExp] = useState<string | null>(null)

  // Dialog states
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [isAddExpTypeOpen, setIsAddExpTypeOpen] = useState(false)
  const [isAddItemExpOpen, setIsAddItemExpOpen] = useState(false)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false)
  const [isEditExpTypeOpen, setIsEditExpTypeOpen] = useState(false)
  const [isEditItemExpOpen, setIsEditItemExpOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Editing contexts
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editingExpType, setEditingExpType] = useState<ExpenditureType | null>(null)
  const [editingItemExp, setEditingItemExp] = useState<ItemOfExpenditure | null>(null)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [deleteContext, setDeleteContext] = useState<{
    type: 'activity' | 'exptype' | 'itemexp' | 'item'
    id: string
  } | null>(null)

  // New form inputs
  const [newActivityName, setNewActivityName] = useState('')
  const [newExpTypeName, setNewExpTypeName] = useState('')
  const [newExpTypeType, setNewExpTypeType] = useState<'PS' | 'MOOE' | 'CO'>('MOOE')
  const [newItemExpName, setNewItemExpName] = useState('')
  const [newItemExpCustomName, setNewItemExpCustomName] = useState('')
  const [newItemData, setNewItemData] = useState({
    description: '',
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  })
  const [currentContext, setCurrentContext] = useState<{
    activityId?: string
    expTypeId?: string
    itemExpId?: string
  }>({})

  // Handle source selection
  const handleSourceChange = (value: string) => {
    setSelectedSource(value)
    if (value === 'LIB-2026') {
      setActivities(JSON.parse(JSON.stringify(LIB_2026_DATA)))
    }
  }

  // Activity handlers
  const handleAddActivity = () => {
    if (!newActivityName.trim()) {
      toast({ title: 'Error', description: 'Activity name is required' })
      return
    }
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      name: newActivityName,
      expenditureTypes: [],
    }
    setActivities([...activities, newActivity])
    setNewActivityName('')
    setIsAddActivityOpen(false)
    toast({ title: 'Success', description: 'Activity added successfully' })
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setNewActivityName(activity.name)
    setIsEditActivityOpen(true)
  }

  const handleSaveEditActivity = () => {
    if (!editingActivity || !newActivityName.trim()) {
      toast({ title: 'Error', description: 'Activity name is required' })
      return
    }
    setActivities(
      activities.map((a) =>
        a.id === editingActivity.id ? { ...a, name: newActivityName } : a
      )
    )
    setIsEditActivityOpen(false)
    setEditingActivity(null)
    setNewActivityName('')
    toast({ title: 'Success', description: 'Activity updated successfully' })
  }

  const handleDeleteActivity = (activityId: string) => {
    setDeleteContext({ type: 'activity', id: activityId })
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteContext) return
    
    if (deleteContext.type === 'activity') {
      setActivities(activities.filter((a) => a.id !== deleteContext.id))
    } else if (deleteContext.type === 'exptype') {
      setActivities(
        activities.map((a) =>
          a.id === currentContext.activityId
            ? {
                ...a,
                expenditureTypes: a.expenditureTypes.filter(
                  (e) => e.id !== deleteContext.id
                ),
              }
            : a
        )
      )
    } else if (deleteContext.type === 'itemexp') {
      setActivities(
        activities.map((a) =>
          a.id === currentContext.activityId
            ? {
                ...a,
                expenditureTypes: a.expenditureTypes.map((e) =>
                  e.id === currentContext.expTypeId
                    ? {
                        ...e,
                        itemsOfExpenditure: e.itemsOfExpenditure.filter(
                          (i) => i.id !== deleteContext.id
                        ),
                      }
                    : e
                ),
              }
            : a
        )
      )
    } else if (deleteContext.type === 'item') {
      setActivities(
        activities.map((a) =>
          a.id === currentContext.activityId
            ? {
                ...a,
                expenditureTypes: a.expenditureTypes.map((e) =>
                  e.id === currentContext.expTypeId
                    ? {
                        ...e,
                        itemsOfExpenditure: e.itemsOfExpenditure.map((i) =>
                          i.id === currentContext.itemExpId
                            ? {
                                ...i,
                                items: i.items.filter((it) => it.id !== deleteContext.id),
                              }
                            : i
                        ),
                      }
                    : e
                ),
              }
            : a
        )
      )
    }

    setIsDeleteConfirmOpen(false)
    setDeleteContext(null)
    toast({ title: 'Success', description: 'Item deleted successfully' })
  }

  // Expenditure Type handlers
  const handleAddExpType = (activityId: string) => {
    if (!newExpTypeName.trim()) {
      toast({ title: 'Error', description: 'Expenditure type name is required' })
      return
    }
    setCurrentContext({ activityId })
    setActivities(
      activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              expenditureTypes: [
                ...a.expenditureTypes,
                {
                  id: `exptype-${Date.now()}`,
                  name: newExpTypeName,
                  type: newExpTypeType,
                  itemsOfExpenditure: [],
                },
              ],
            }
          : a
      )
    )
    setNewExpTypeName('')
    setIsAddExpTypeOpen(false)
    toast({ title: 'Success', description: 'Expenditure type added successfully' })
  }

  const handleEditExpType = (activity: Activity, expType: ExpenditureType) => {
    setCurrentContext({ activityId: activity.id })
    setEditingExpType(expType)
    setNewExpTypeName(expType.name)
    setNewExpTypeType(expType.type)
    setIsEditExpTypeOpen(true)
  }

  const handleSaveEditExpType = () => {
    if (!editingExpType || !newExpTypeName.trim()) {
      toast({ title: 'Error', description: 'Expenditure type name is required' })
      return
    }
    setActivities(
      activities.map((a) =>
        a.id === currentContext.activityId
          ? {
              ...a,
              expenditureTypes: a.expenditureTypes.map((e) =>
                e.id === editingExpType.id
                  ? { ...e, name: newExpTypeName, type: newExpTypeType }
                  : e
              ),
            }
          : a
      )
    )
    setIsEditExpTypeOpen(false)
    setEditingExpType(null)
    setNewExpTypeName('')
    toast({ title: 'Success', description: 'Expenditure type updated successfully' })
  }

  // Item of Expenditure handlers
  const handleAddItemExp = (activityId: string, expTypeId: string, providedName?: string) => {
    const nameToUse = (providedName !== undefined ? providedName : newItemExpName) || ''
    if (!nameToUse.trim()) {
      toast({ title: 'Error', description: 'Item of expenditure name is required' })
      return
    }
    setCurrentContext({ activityId, expTypeId })
    setActivities(
      activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              expenditureTypes: a.expenditureTypes.map((e) =>
                e.id === expTypeId
                  ? {
                      ...e,
                      itemsOfExpenditure: [
                        ...e.itemsOfExpenditure,
                        {
                          id: `itemexp-${Date.now()}`,
                          name: nameToUse,
                          items: [],
                        },
                      ],
                    }
                  : e
              ),
            }
          : a
      )
    )
    setNewItemExpName('')
    setNewItemExpCustomName('')
    setIsAddItemExpOpen(false)
    toast({ title: 'Success', description: 'Item of expenditure added successfully' })
  }

  const handleEditItemExp = (
    activity: Activity,
    expType: ExpenditureType,
    itemExp: ItemOfExpenditure
  ) => {
    setCurrentContext({ activityId: activity.id, expTypeId: expType.id })
    setEditingItemExp(itemExp)
    setNewItemExpName(itemExp.name)
    setIsEditItemExpOpen(true)
  }

  const handleSaveEditItemExp = () => {
    if (!editingItemExp || !newItemExpName.trim()) {
      toast({ title: 'Error', description: 'Item of expenditure name is required' })
      return
    }
    setActivities(
      activities.map((a) =>
        a.id === currentContext.activityId
          ? {
              ...a,
              expenditureTypes: a.expenditureTypes.map((e) =>
                e.id === currentContext.expTypeId
                  ? {
                      ...e,
                      itemsOfExpenditure: e.itemsOfExpenditure.map((i) =>
                        i.id === editingItemExp.id ? { ...i, name: newItemExpName } : i
                      ),
                    }
                  : e
              ),
            }
          : a
      )
    )
    setIsEditItemExpOpen(false)
    setEditingItemExp(null)
    setNewItemExpName('')
    toast({ title: 'Success', description: 'Item of expenditure updated successfully' })
  }

  // Budget Item handlers
  const handleAddItem = (activityId: string, expTypeId: string, itemExpId: string) => {
    if (!newItemData.description.trim()) {
      toast({ title: 'Error', description: 'Item description is required' })
      return
    }
    const total = newItemData.q1 + newItemData.q2 + newItemData.q3 + newItemData.q4
    setCurrentContext({ activityId, expTypeId, itemExpId })
    setActivities(
      activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              expenditureTypes: a.expenditureTypes.map((e) =>
                e.id === expTypeId
                  ? {
                      ...e,
                      itemsOfExpenditure: e.itemsOfExpenditure.map((i) =>
                        i.id === itemExpId
                          ? {
                              ...i,
                              items: [
                                ...i.items,
                                {
                                  id: `item-${Date.now()}`,
                                  description: newItemData.description,
                                  q1: newItemData.q1,
                                  q2: newItemData.q2,
                                  q3: newItemData.q3,
                                  q4: newItemData.q4,
                                  total,
                                },
                              ],
                            }
                          : i
                      ),
                    }
                  : e
              ),
            }
          : a
      )
    )
    setNewItemData({ description: '', q1: 0, q2: 0, q3: 0, q4: 0 })
    setIsAddItemOpen(false)
    toast({ title: 'Success', description: 'Item added successfully' })
  }

  const handleEditItem = (
    activity: Activity,
    expType: ExpenditureType,
    itemExp: ItemOfExpenditure,
    item: BudgetItem
  ) => {
    setCurrentContext({
      activityId: activity.id,
      expTypeId: expType.id,
      itemExpId: itemExp.id,
    })
    setEditingItem(item)
    setNewItemData({
      description: item.description,
      q1: item.q1,
      q2: item.q2,
      q3: item.q3,
      q4: item.q4,
    })
    setIsEditItemOpen(true)
  }

  const handleSaveEditItem = () => {
    if (!editingItem || !newItemData.description.trim()) {
      toast({ title: 'Error', description: 'Item description is required' })
      return
    }
    const total = newItemData.q1 + newItemData.q2 + newItemData.q3 + newItemData.q4
    setActivities(
      activities.map((a) =>
        a.id === currentContext.activityId
          ? {
              ...a,
              expenditureTypes: a.expenditureTypes.map((e) =>
                e.id === currentContext.expTypeId
                  ? {
                      ...e,
                      itemsOfExpenditure: e.itemsOfExpenditure.map((i) =>
                        i.id === currentContext.itemExpId
                          ? {
                              ...i,
                              items: i.items.map((it) =>
                                it.id === editingItem.id
                                  ? {
                                      ...it,
                                      description: newItemData.description,
                                      q1: newItemData.q1,
                                      q2: newItemData.q2,
                                      q3: newItemData.q3,
                                      q4: newItemData.q4,
                                      total,
                                    }
                                  : it
                              ),
                            }
                          : i
                      ),
                    }
                  : e
              ),
            }
          : a
      )
    )
    setIsEditItemOpen(false)
    setEditingItem(null)
    setNewItemData({ description: '', q1: 0, q2: 0, q3: 0, q4: 0 })
    toast({ title: 'Success', description: 'Item updated successfully' })
  }

  const handleCreateRequest = async () => {
    if (!newRequest.reason || !newRequest.justification || !selectedSource) {
      toast({
        title: 'Incomplete Form',
        description: 'Please fill in all required fields.',
      })
      return
    }

    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))

      const newReq: RealignmentRequest = {
        id: `REALIGN-${Date.now()}`,
        reason: newRequest.reason,
        justification: newRequest.justification,
        sources: [],
        destinations: [],
        activities,
        status: 'Draft',
        fiscalYear: newRequest.fiscalYear,
        createdAt: new Date().toISOString(),
      }

      onCreate(newReq)

      toast({
        title: 'Success',
        description: `Modification request ${newReq.id} has been created successfully.`,
      })

      handleClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create modification request. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNewRequest({ reason: '', justification: '', fiscalYear: '2026' })
    setSelectedSource('')
    setActivities([])
    setExpandedActivity(null)
    setExpandedExpType(null)
    setExpandedItemExp(null)
    onOpenChange(false)
  }

  const calculateActivityTotal = (activity: Activity) => {
    return activity.expenditureTypes.reduce((sum, et) => {
      const etTotal = et.itemsOfExpenditure.reduce((etSum, ie) => {
        const ieTotal = ie.items.reduce((ieSum, item) => ieSum + item.total, 0)
        return etSum + ieTotal
      }, 0)
      return sum + etTotal
    }, 0)
  }


  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Modification of Budget Request"
      description="Modify approved LIB 2026 budget allocations"
      size="full"
      className="max-w-[1000px] max-h-[90vh]"
      overlayClass="bg-black/30 backdrop-blur-sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRequest}
            disabled={!newRequest.reason || !newRequest.justification || !selectedSource || isLoading}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating...' : 'Create Request'}
          </Button>
        </div>
      }
      showCloseButton
    >
      <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto pr-4">
        {/* Reason & Justification Section */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Reason for Modification <span className="text-red-500">*</span>
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Select the primary reason for this budget modification.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={newRequest.reason}
              onValueChange={(v) => setNewRequest({ ...newRequest, reason: v })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {MODIFICATION_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Detailed Justification <span className="text-red-500">*</span>
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Provide a detailed explanation of the specific circumstances and need for this modification.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              value={newRequest.justification}
              onChange={(e) =>
                setNewRequest({ ...newRequest, justification: e.target.value })
              }
              placeholder="Explain the specific circumstances and need for this budget modification..."
              rows={4}
              className="text-sm border-gray-200"
            />
          </div>
        </div>

        {/* Budget Summary Section */}
        <div className="border-t pt-6 space-y-4">
          {/* Source Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Source <span className="text-red-500">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the budget source to modify</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={selectedSource} onValueChange={handleSourceChange}>
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIB-2026">LIB 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* No Source Selected Alert */}
          {!selectedSource && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Please select a budget source to view and modify the budget allocation structure.
              </p>
            </div>
          )}

          {/* Hierarchical Budget Structure */}
          {selectedSource && activities.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Budget Structure</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddActivityOpen(true)}
                  className="h-8 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Activity
                </Button>
              </div>

              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg">
                    {/* Activity Header */}
                    <div className="bg-gray-50 p-3 flex items-center justify-between border-b">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() =>
                            setExpandedActivity(
                              expandedActivity === activity.id ? null : activity.id
                            )
                          }
                          className="p-1"
                        >
                          {expandedActivity === activity.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        <span className="font-semibold text-gray-900">{activity.name}</span>
                        <span className="text-xs text-gray-500">
                          ₱{calculateActivityTotal(activity).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditActivity(activity)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Expenditure Types */}
                    {expandedActivity === activity.id && (
                      <div className="p-3 space-y-2">
                        {activity.expenditureTypes.map((expType) => (
                          <div key={expType.id} className="border rounded bg-white">
                            {/* Expenditure Type Header */}
                            <div className="bg-blue-50 p-2 flex items-center justify-between border-b">
                              <div className="flex items-center gap-2 flex-1 ml-4">
                                <button
                                  onClick={() =>
                                    setExpandedExpType(
                                      expandedExpType === expType.id ? null : expType.id
                                    )
                                  }
                                  className="p-1"
                                >
                                  {expandedExpType === expType.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                                <span className="font-medium text-blue-900 text-sm">{expType.name}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditExpType(activity, expType)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setDeleteContext({ type: 'exptype', id: expType.id })
                                    setCurrentContext({ activityId: activity.id })
                                    setIsDeleteConfirmOpen(true)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>

                            {/* Items of Expenditure */}
                            {expandedExpType === expType.id && (
                              <div className="p-2 space-y-2">
                                {expType.itemsOfExpenditure.map((itemExp) => (
                                  <div key={itemExp.id} className="border rounded bg-gray-50">
                                    {/* Item of Expenditure Header */}
                                    <div className="bg-gray-100 p-2 flex items-center justify-between border-b">
                                      <div className="flex items-center gap-2 flex-1 ml-6">
                                        <button
                                          onClick={() =>
                                            setExpandedItemExp(
                                              expandedItemExp === itemExp.id ? null : itemExp.id
                                            )
                                          }
                                          className="p-1"
                                        >
                                          {expandedItemExp === itemExp.id ? (
                                            <ChevronUp className="h-3 w-3" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3" />
                                          )}
                                        </button>
                                        <span className="text-sm font-medium text-gray-800">{itemExp.name}</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleEditItemExp(activity, expType, itemExp)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Edit2 className="h-3 w-3 text-blue-600" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setDeleteContext({ type: 'itemexp', id: itemExp.id })
                                            setCurrentContext({
                                              activityId: activity.id,
                                              expTypeId: expType.id,
                                            })
                                            setIsDeleteConfirmOpen(true)
                                          }}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Trash2 className="h-3 w-3 text-red-600" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Budget Items */}
                                    {expandedItemExp === itemExp.id && (
                                      <div className="p-2 space-y-1">
                                        {itemExp.items.map((item) => (
                                          <div key={item.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                                            <div className="flex-1 ml-8">
                                              <p className="font-medium text-gray-900">{item.description}</p>
                                              <div className="flex gap-4 text-gray-600 mt-1">
                                                <span>Q1: ₱{item.q1.toLocaleString()}</span>
                                                <span>Q2: ₱{item.q2.toLocaleString()}</span>
                                                <span>Q3: ₱{item.q3.toLocaleString()}</span>
                                                <span>Q4: ₱{item.q4.toLocaleString()}</span>
                                                <span className="font-semibold text-gray-900">Total: ₱{item.total.toLocaleString()}</span>
                                              </div>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                  handleEditItem(activity, expType, itemExp, item)
                                                }
                                                className="h-6 w-6 p-0"
                                              >
                                                <Edit2 className="h-3 w-3 text-blue-600" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                  setDeleteContext({ type: 'item', id: item.id })
                                                  setCurrentContext({
                                                    activityId: activity.id,
                                                    expTypeId: expType.id,
                                                    itemExpId: itemExp.id,
                                                  })
                                                  setIsDeleteConfirmOpen(true)
                                                }}
                                                className="h-6 w-6 p-0"
                                              >
                                                <Trash2 className="h-3 w-3 text-red-600" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setCurrentContext({
                                              activityId: activity.id,
                                              expTypeId: expType.id,
                                              itemExpId: itemExp.id,
                                            })
                                            setIsAddItemOpen(true)
                                          }}
                                          className="h-7 text-xs gap-1 ml-8"
                                        >
                                          <Plus className="h-3 w-3" />
                                          Add Item
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentContext({
                                      activityId: activity.id,
                                      expTypeId: expType.id,
                                    })
                                    setIsAddItemExpOpen(true)
                                  }}
                                  className="h-7 text-xs gap-1 ml-4"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Item of Expenditure
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentContext({ activityId: activity.id })
                            setIsAddExpTypeOpen(true)
                          }}
                          className="h-8 text-xs gap-1 ml-4"
                        >
                          <Plus className="h-3 w-3" />
                          Add Expenditure Type
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>Create a new activity</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Activity Name *</label>
              <Input
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="Enter activity name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddActivityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity} className="bg-blue-600">
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditActivityOpen} onOpenChange={setIsEditActivityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>Update activity details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Activity Name *</label>
              <Input
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="Enter activity name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditActivityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditActivity} className="bg-blue-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expenditure Type Dialog */}
      <Dialog open={isAddExpTypeOpen} onOpenChange={setIsAddExpTypeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expenditure Type</DialogTitle>
            <DialogDescription>Create a new expenditure type</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={newExpTypeName}
                onChange={(e) => setNewExpTypeName(e.target.value)}
                placeholder="e.g., PS (Personnel Services)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type *</label>
              <Select value={newExpTypeType} onValueChange={(v) => setNewExpTypeType(v as 'PS' | 'MOOE' | 'CO')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PS">PS (Personnel Services)</SelectItem>
                  <SelectItem value="MOOE">MOOE (Maintenance & Other Operating Expenses)</SelectItem>
                  <SelectItem value="CO">CO (Capital Outlay)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpTypeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleAddExpType(currentContext.activityId || '')}
              className="bg-blue-600"
            >
              Add Expenditure Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expenditure Type Dialog */}
      <Dialog open={isEditExpTypeOpen} onOpenChange={setIsEditExpTypeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expenditure Type</DialogTitle>
            <DialogDescription>Update expenditure type details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={newExpTypeName}
                onChange={(e) => setNewExpTypeName(e.target.value)}
                placeholder="e.g., PS (Personnel Services)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type *</label>
              <Select value={newExpTypeType} onValueChange={(v) => setNewExpTypeType(v as 'PS' | 'MOOE' | 'CO')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PS">PS (Personnel Services)</SelectItem>
                  <SelectItem value="MOOE">MOOE (Maintenance & Other Operating Expenses)</SelectItem>
                  <SelectItem value="CO">CO (Capital Outlay)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditExpTypeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditExpType} className="bg-blue-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item of Expenditure Dialog */}
      <Dialog open={isAddItemExpOpen} onOpenChange={setIsAddItemExpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item of Expenditure</DialogTitle>
            <DialogDescription>Create a new item of expenditure</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const activity = activities.find((a) => a.id === currentContext.activityId)
              const expType = activity?.expenditureTypes.find((e) => e.id === currentContext.expTypeId)
              const targetType = expType?.type

              const availableNames = Array.from(
                new Set(
                  activities
                    .flatMap((a) => a.expenditureTypes)
                    .filter((e) => e.type === targetType)
                    .flatMap((e) => e.itemsOfExpenditure.map((i) => i.name))
                )
              )

              return (
                <div>
                  <label className="text-sm font-medium">Choose Existing or Add New *</label>
                  <Select
                    value={newItemExpName || ''}
                    onValueChange={(v) => setNewItemExpName(v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNames.length === 0 && (
                        <SelectItem value="__no_existing_items__" disabled>
                          No existing items found for this expenditure type.
                        </SelectItem>
                      )}
                      {availableNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__add_new__">Add new item...</SelectItem>
                    </SelectContent>
                  </Select>

                  {newItemExpName === '__add_new__' && (
                    <div className="mt-3">
                      <label className="text-sm font-medium">New Item Name *</label>
                      <Input
                        value={newItemExpCustomName}
                        onChange={(e) => setNewItemExpCustomName(e.target.value)}
                        placeholder="e.g., Representative Expense"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemExpOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleAddItemExp(
                  currentContext.activityId || '',
                  currentContext.expTypeId || '',
                  newItemExpName === '__add_new__' ? newItemExpCustomName : newItemExpName
                )
              }
              className="bg-blue-600"
            >
              Add Item of Expenditure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item of Expenditure Dialog */}
      <Dialog open={isEditItemExpOpen} onOpenChange={setIsEditItemExpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item of Expenditure</DialogTitle>
            <DialogDescription>Update item of expenditure details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={newItemExpName}
                onChange={(e) => setNewItemExpName(e.target.value)}
                placeholder="e.g., Representative Expense"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemExpOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditItemExp} className="bg-blue-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Budget Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
            <DialogDescription>Create a new budget item with quarterly allocations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Input
                value={newItemData.description}
                onChange={(e) =>
                  setNewItemData({ ...newItemData, description: e.target.value })
                }
                placeholder="Enter item description"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Q1</label>
                <Input
                  type="number"
                  value={newItemData.q1}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q1: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Q2</label>
                <Input
                  type="number"
                  value={newItemData.q2}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q2: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Q3</label>
                <Input
                  type="number"
                  value={newItemData.q3}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q3: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Q4</label>
                <Input
                  type="number"
                  value={newItemData.q4}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q4: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-600">
                Total: ₱{(newItemData.q1 + newItemData.q2 + newItemData.q3 + newItemData.q4).toLocaleString()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleAddItem(
                  currentContext.activityId || '',
                  currentContext.expTypeId || '',
                  currentContext.itemExpId || ''
                )
              }
              className="bg-blue-600"
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Budget Item</DialogTitle>
            <DialogDescription>Update budget item details and allocations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Input
                value={newItemData.description}
                onChange={(e) =>
                  setNewItemData({ ...newItemData, description: e.target.value })
                }
                placeholder="Enter item description"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Q1</label>
                <Input
                  type="number"
                  value={newItemData.q1}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q1: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Q2</label>
                <Input
                  type="number"
                  value={newItemData.q2}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q2: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Q3</label>
                <Input
                  type="number"
                  value={newItemData.q3}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q3: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Q4</label>
                <Input
                  type="number"
                  value={newItemData.q4}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, q4: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 text-sm"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-600">
                Total: ₱{(newItemData.q1 + newItemData.q2 + newItemData.q3 + newItemData.q4).toLocaleString()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditItem} className="bg-blue-600">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResponsiveDialog>
  )
}
