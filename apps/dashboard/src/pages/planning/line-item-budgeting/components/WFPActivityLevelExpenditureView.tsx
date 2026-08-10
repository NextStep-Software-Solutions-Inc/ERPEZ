import { useState } from 'react'
import { Plus, MoreHorizontal, Edit, Trash2, AlertCircle, X, Loader2, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface LineItem {
  unitCost?: number
  id: string
  description: string
  unitEstimate: number
  quantity: number
  subTotal: number
  quarterlyAllocation: {
    q1: number
    q2: number
    q3: number
    q4: number
  }
}

interface ExpenditureItemDetail {
  quarterlyAllocation: any
  id: string
  itemName: string // e.g., "Representative Expense"
  lineItems: LineItem[]
  total: number
}

interface ExpenditureItem {
  id: string
  typeCode: string // e.g., 'PS', 'MOOE', 'CO'
  items: ExpenditureItemDetail[]
}

interface WFPActivityLevelExpenditureViewProps {
  expenditures: ExpenditureItem[]
  onAddExpenditure: (data: {
    typeCode: string
    itemName: string
    lineItems: Array<{
      description: string
      unitEstimate: number
      quantity: number
    }>
  }) => void
  onEditExpenditure: (item: ExpenditureItemDetail) => void
  onDeleteExpenditure: (itemId: string) => void
  onSaveAllocation?: (payload: { lineItemId: string, q1: number, q2: number, q3: number, q4: number }) => void
  onUpdateExpenditure?: (typeCode: string, updatedItem: ExpenditureItemDetail) => void
}

const getExpenditureTypeColor = (typeCode: string) => {
  switch (typeCode) {
    case 'PS':
      return {
        headerText: 'text-green-700',
        borderL: 'border-l-green-400',
        badge: 'bg-green-100 text-green-700 border-green-200',
        allocationBg: 'bg-green-50',
        allocationBorder: 'border-green-200',
        allocationText: 'text-green-700',
      }
    case 'MOOE':
      return {
        headerText: 'text-blue-700',
        borderL: 'border-l-blue-400',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        allocationBg: 'bg-blue-50',
        allocationBorder: 'border-blue-200',
        allocationText: 'text-blue-700',
      }
    case 'CO':
      return {
        headerText: 'text-purple-700',
        borderL: 'border-l-purple-400',
        badge: 'bg-purple-100 text-purple-700 border-purple-200',
        allocationBg: 'bg-purple-50',
        allocationBorder: 'border-purple-200',
        allocationText: 'text-purple-700',
      }
    default:
      return {
        headerText: 'text-slate-700',
        borderL: 'border-l-slate-400',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        allocationBg: 'bg-slate-50',
        allocationBorder: 'border-slate-200',
        allocationText: 'text-slate-700',
      }
  }
}

export const WFPActivityLevelExpenditureView = ({
  expenditures,
  onAddExpenditure,
  onEditExpenditure,
  onDeleteExpenditure,
  onSaveAllocation,
  onUpdateExpenditure,
}: WFPActivityLevelExpenditureViewProps) => {
  const { toast } = useToast()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ExpenditureItemDetail | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [typeSearch, setTypeSearch] = useState<string>('')
  const [itemSearch, setItemSearch] = useState<string>('')
  const [openDropdown, setOpenDropdown] = useState<'type' | 'item' | 'filter' | null>(null)
  const [isBudgetAllocationModalOpen, setIsBudgetAllocationModalOpen] = useState(false)
  const [selectedLineItem, setSelectedLineItem] = useState<LineItem | null>(null)
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>('')
  const [budgetPeriod, setBudgetPeriod] = useState<'quarterly' | 'monthly'>('quarterly')
  const [filterType, setFilterType] = useState<string>('all')
  const [lineItems, setLineItems] = useState<Array<{
    id: string
    description: string
    unitEstimate: number
    quantity: number
    subTotal: number
  }>>([])
  const [currentLineItem, setCurrentLineItem] = useState({
    description: '',
    unitEstimate: 0,
    quantity: 0,
  })
  const [topUnitEstimate, setTopUnitEstimate] = useState<number | ''>('')
  const [topQuantity, setTopQuantity] = useState<number | ''>('')
  const [quarterlyAllocation, setQuarterlyAllocation] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  })
  const [monthlyAllocation, setMonthlyAllocation] = useState({
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
  })
  const [allocationError, setAllocationError] = useState<string>('')

  const EXPENDITURE_TYPES = [
    { code: 'PS', description: 'Personal Services' },
    { code: 'MOOE', description: 'Maintenance and Other Operating Expenses' },
    { code: 'CO', description: 'Capital Outlay' },
  ]

  const EXPENSE_ITEMS = {
    PS: [
      { code: 'REP-EXP', description: 'Representative Expense' },
      { code: 'STAFF-HRN', description: 'Staff Honorarium' },
      { code: 'STAFF-ALLOW', description: 'Staff Allowance' },
    ],
    MOOE: [
      { code: 'OFFICE-SUP', description: 'Office Supplies' },
      { code: 'TRAVEL', description: 'Travel and Transportation' },
      { code: 'UTILITIES', description: 'Utilities and Facility' },
    ],
    CO: [
      { code: 'EQUIPMENT', description: 'Equipment Purchase' },
      { code: 'FURNITURE', description: 'Furniture and Fixtures' },
    ],
  }

  const getTotalAllocated = () => {
    if (budgetPeriod === 'quarterly') {
      return quarterlyAllocation.q1 + quarterlyAllocation.q2 + quarterlyAllocation.q3 + quarterlyAllocation.q4
    }
    return (
      monthlyAllocation.jan + monthlyAllocation.feb + monthlyAllocation.mar + monthlyAllocation.apr +
      monthlyAllocation.may + monthlyAllocation.jun + monthlyAllocation.jul + monthlyAllocation.aug +
      monthlyAllocation.sep + monthlyAllocation.oct + monthlyAllocation.nov + monthlyAllocation.dec
    )
  }

  const validateAllocation = (newValue: number, quarter?: string, month?: string) => {
    let total = newValue
    
    if (quarter) {
      const otherQuarters = [
        quarterlyAllocation.q1,
        quarterlyAllocation.q2,
        quarterlyAllocation.q3,
        quarterlyAllocation.q4,
      ].reduce((sum, val, idx) => {
        if (idx === parseInt(quarter.slice(1)) - 1) return sum
        return sum + val
      }, 0)
      total = newValue + otherQuarters
    } else if (month) {
      const otherMonths = Object.entries(monthlyAllocation).reduce((sum, [key, val]) => {
        if (key === month) return sum
        return sum + val
      }, 0)
      total = newValue + otherMonths
    }

    if (selectedLineItem && total > selectedLineItem.subTotal) {
      setAllocationError(`Total allocation cannot exceed ₱${selectedLineItem.subTotal.toLocaleString()}`)
      return false
    }
    setAllocationError('')
    return true
  }

  const handleAddLineItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: currentLineItem.description,
      unitEstimate: currentLineItem.unitEstimate,
      quantity: currentLineItem.quantity,
      subTotal: currentLineItem.unitEstimate * currentLineItem.quantity,
    }
    setLineItems([...lineItems, newItem])
    setCurrentLineItem({ description: '', unitEstimate: 0, quantity: 0 })
  }

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const handleCreateExpenditure = () => {
    // Validation
    if (!selectedType) {
      toast({
        title: 'Error',
        description: 'Please select a type of expenditure',
        color: 'destructive',
      })
      return
    }

    if (!selectedItem) {
      toast({
        title: 'Error',
        description: 'Please select an item of expenditure',
        color: 'destructive',
      })
      return
    }

    // If no line items were added, require top-level unit & qty
    if ((lineItems.length === 0) && (topUnitEstimate === '' || topQuantity === '')) {
      toast({
        title: 'Error',
        description: 'Please provide Unit Cost and Quantity when no line items are added',
        color: 'destructive',
      })
      return
    }

    // Line items are optional now — allow creating an expenditure without line items.

    // Set loading state
    setIsSubmitting(true)

    // Simulate API call delay
    setTimeout(() => {
      // Get the item name
      const selectedItemObj = (EXPENSE_ITEMS[selectedType as keyof typeof EXPENSE_ITEMS] || []).find(
        item => item.code === selectedItem
      )
      const itemName = selectedItemObj?.description || ''

      // If both top-level values and detailed line items were provided,
      // ignore the top-level values and use the detailed line items only.
      if (lineItems && lineItems.length > 0 && (topUnitEstimate !== '' || topQuantity !== '')) {
        toast({
          title: 'Notice',
          description: 'Top-level Unit/Quantity ignored because detailed line items were provided.',
          color: 'default',
        })
      }

      // Prepare payload line items. If no detailed line items were added,
      // create one from the top-level Unit Cost and Quantity so parent can
      // compute totals consistently.
      const payloadLineItems = (lineItems && lineItems.length > 0)
        ? lineItems.map(item => ({
            description: item.description,
            unitEstimate: item.unitEstimate,
            quantity: item.quantity,
          }))
        : [{
            description: selectedItem || itemName || 'Item',
            unitEstimate: (topUnitEstimate || 0) as number,
            quantity: (topQuantity || 0) as number,
          }]

      if (editingItem) {
        // Prepare item detail for edit
        const updatedItem: ExpenditureItemDetail = {
          id: editingItem.id,
          itemName: itemName || editingItem.itemName,
          quarterlyAllocation: editingItem.quarterlyAllocation || { q1: 0, q2: 0, q3: 0, q4: 0 },
          lineItems: payloadLineItems.map((li, idx) => ({
            id: editingItem.lineItems[idx]?.id || `li-${Date.now()}-${idx}`,
            description: li.description,
            unitEstimate: li.unitEstimate,
            quantity: li.quantity,
            subTotal: (li.unitEstimate || 0) * (li.quantity || 0),
            quarterlyAllocation: editingItem.lineItems[idx]?.quarterlyAllocation || { q1: 0, q2: 0, q3: 0, q4: 0 },
          })),
          total: payloadLineItems.reduce((s, li) => s + ((li.unitEstimate || 0) * (li.quantity || 0)), 0),
        }

        if (onUpdateExpenditure) {
          onUpdateExpenditure(selectedType, updatedItem)
        } else {
          onEditExpenditure && onEditExpenditure(updatedItem)
        }
      } else {
        onAddExpenditure({
          typeCode: selectedType,
          itemName: itemName,
          lineItems: payloadLineItems,
        })
      }

      // Show success toast
      toast({
        title: 'Success',
        description: 'Expenditure item created successfully',
        color: 'success',
      })

      // Close modal and reset form
      setIsCreateModalOpen(false)
      setSelectedType('')
      setSelectedItem('')
      setLineItems([])
      setEditingItem(null)
      setCurrentLineItem({ description: '', unitEstimate: 0, quantity: 0 })
      setTopUnitEstimate('')
      setTopQuantity('')
      setIsSubmitting(false)
    }, 500)
  }

  const totalLineItems = lineItems.reduce((sum, item) => sum + item.subTotal, 0)

  // Map typeCode to display name
  const typeDisplay: { [key: string]: string } = {
    'PS': 'Personal Services',
    'MOOE': 'Maintenance and Other Operating Expenses',
    'CO': 'Capital Outlay',
  }

  return (
    <div>
      {/* Header with Create Expenditure Button and Filter */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Expenditure Items</h3>
        </div>
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'filter' ? null : 'filter')}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span>{filterType === 'all' ? 'Filter Type' : filterType}</span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDropdown === 'filter' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* Filter Dropdown */}
          {openDropdown === 'filter' && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setOpenDropdown(null)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-lg bg-white border border-slate-200 z-50">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Filter by Type</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFilterType('all')
                      setOpenDropdown(null)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-slate-100 ${
                      filterType === 'all'
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium">All Types</div>
                    <div className="text-xs text-slate-500 mt-1">Show all expenditure items</div>
                  </button>
                  {EXPENDITURE_TYPES.map(type => (
                    <button
                      key={type.code}
                      onClick={() => {
                        setFilterType(type.code)
                        setOpenDropdown(null)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-slate-100 last:border-b-0 ${
                        filterType === type.code
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium">{type.code}</div>
                      <div className="text-xs text-slate-500 mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button 
            color="primary"
            size="sm"
            className="gap-2"
            onClick={() => {
              setIsCreateModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" />
            Create Expenditure
          </Button>
        </div>
      </div>

      {/* Expenditure Items Grouped by Type */}
      <div className="space-y-8">
        {expenditures
          .filter(typeGroup => filterType === 'all' || typeGroup.typeCode === filterType)
          .map((typeGroup) => {
            const colors = getExpenditureTypeColor(typeGroup.typeCode)

          return (
            <div key={typeGroup.typeCode}>
              {/* Type Header - e.g., "PS - Personal Services" */}
              <div className="flex items-center mb-4">
                <h4 className={`text-base font-bold ${colors.headerText}`}>
                  {typeGroup.typeCode} - {typeDisplay[typeGroup.typeCode] || typeGroup.typeCode}
                </h4>
              </div>

              {/* Items within this type */}
              <div className="space-y-4">
                {typeGroup.items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white border-l-4 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow ${colors.borderL}`}
                  >
                    {/* Item Header - e.g., "Representative Expense" */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                      <div className="flex-1">
                        <h5 className="text-base font-bold text-slate-900">
                          {item.itemName}
                        </h5>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem 
                            onClick={() => {
                              // Open create modal in edit mode with prefilled data
                              setEditingItem(item)
                              setSelectedType(typeGroup.typeCode)
                              setItemSearch(item.itemName)
                              setSelectedItem('')
                              setLineItems((item.lineItems || []).map(li => ({
                                id: li.id,
                                description: li.description,
                                unitEstimate: li.unitEstimate,
                                quantity: li.quantity,
                                subTotal: li.subTotal,
                              })))
                              setTopUnitEstimate('')
                              setTopQuantity('')
                              setIsCreateModalOpen(true)
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            Set Budget Allocation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteExpenditure(item.id)}
                            className="gap-2 cursor-pointer text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Item summary removed to avoid duplicate display; per-line-item summaries remain below */}

                    {/* Line Items under this item */}
                    <div className="space-y-3 mb-6">
                      {item.lineItems.map((lineItem) => {
                        const hasNoAllocation = lineItem.quarterlyAllocation.q1 === 0 && 
                          lineItem.quarterlyAllocation.q2 === 0 && 
                          lineItem.quarterlyAllocation.q3 === 0 && 
                          lineItem.quarterlyAllocation.q4 === 0
                        return (
                          <div key={lineItem.id} className="space-y-2">
                            <div className="font-semibold text-slate-900">
                              {lineItem.description}
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                <p className="text-xs text-slate-600 font-semibold mb-1">Unit Cost</p>
                                <p className="text-sm font-bold text-slate-900">
                                  ₱{lineItem.unitEstimate.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                <p className="text-xs text-slate-600 font-semibold mb-1">Quantity</p>
                                <p className="text-sm font-bold text-slate-900">
                                  {lineItem.quantity}
                                </p>
                              </div>
                              <div className="flex items-stretch gap-2">
                                <div className={`flex-1 p-3 rounded border-2 flex items-center justify-center ${colors.badge}`}>
                                  <div>
                                    <p className="text-xs text-slate-600 font-semibold mb-1">Sub-Total</p>
                                    <p className="text-sm font-bold">
                                      ₱{lineItem.subTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto px-2"
                                      title="Line Item Actions"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[180px]">
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setSelectedLineItem(lineItem)
                                        setSelectedTypeCode(typeGroup.typeCode)
                                        setQuarterlyAllocation(lineItem.quarterlyAllocation || { q1: 0, q2: 0, q3: 0, q4: 0 })
                                        // if line item has monthly allocation, set it too
                                        setMonthlyAllocation((lineItem as any).monthlyAllocation || {
                                          jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
                                          jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
                                        })
                                        setIsBudgetAllocationModalOpen(true)
                                      }}
                                      className="gap-2 cursor-pointer"
                                    >
                                      {hasNoAllocation ? (
                                        <Plus className="h-4 w-4" />
                                      ) : (
                                        <Edit className="h-4 w-4" />
                                      )}
                                      {hasNoAllocation ? 'Set Budget Allocation' : 'Edit Budget Allocation'}
                                    </DropdownMenuItem>
                                    {/* Delete removed as requested */}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* No Budget Allocation Alert - Only show if no allocation set */}
                            {hasNoAllocation && (
                              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                <span className="text-sm text-amber-700 font-medium">No budget allocation set yet</span>
                              </div>
                            )}

                            {/* Quarterly Budget Allocation for each line item - Only show if allocation is set */}
                            {!hasNoAllocation && (
                              <div className={`${colors.allocationBg} border ${colors.allocationBorder} rounded-lg p-4`}>
                                <h6 className={`text-sm font-semibold ${colors.allocationText} mb-4`}>
                                  Quarterly Budget Allocation
                                </h6>
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">1st Quarter</p>
                                    <p className="text-sm font-bold text-slate-900">
                                      ₱{lineItem.quarterlyAllocation.q1.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">2nd Quarter</p>
                                    <p className="text-sm font-bold text-slate-900">
                                      ₱{lineItem.quarterlyAllocation.q2.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">3rd Quarter</p>
                                    <p className="text-sm font-bold text-slate-900">
                                      ₱{lineItem.quarterlyAllocation.q3.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">4th Quarter</p>
                                    <p className="text-sm font-bold text-slate-900">
                                      ₱{lineItem.quarterlyAllocation.q4.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className={`flex justify-end pt-3 border-t ${colors.allocationBorder}`}>
                                  <p className="text-sm font-semibold text-slate-900">
                                    Total Quarterly Budget:{' '}
                                    <span className={colors.allocationText}>
                                      ₱{(
                                        lineItem.quarterlyAllocation.q1 +
                                        lineItem.quarterlyAllocation.q2 +
                                        lineItem.quarterlyAllocation.q3 +
                                        lineItem.quarterlyAllocation.q4
                                      ).toLocaleString()}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      {/* Overall Total for all line items */}
                      <div className={`p-4 rounded-lg border-2 ${colors.badge} mt-6`}>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-slate-900">Total Expenditure:</p>
                          <p className="text-lg font-bold">
                            ₱{item.lineItems.reduce((sum, lineItem) => sum + lineItem.subTotal, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Total */}
      {expenditures.length > 0 && (
        <div className="mt-6 p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Grand Total:</p>
          <p className="text-lg font-bold text-slate-900">
            ₱{expenditures.reduce((sum, grp) => {
              const grpTotal = grp.items.reduce((s, it) => {
                const itemTotal = (it.total !== undefined && it.total !== null)
                  ? it.total
                  : (it.lineItems ? it.lineItems.reduce((a, li) => a + (li.subTotal || 0), 0) : 0)
                return s + itemTotal
              }, 0)
              return sum + grpTotal
            }, 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {/* Empty State */}
      {expenditures.length === 0 && (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
          <p className="text-slate-600 font-medium">No expenditure items yet</p>
          <p className="text-slate-500 text-sm mt-1">Click "Create Expenditure" to add your first expenditure</p>
        </div>
      )}

      {/* Empty state when filter returns no results */}
      {expenditures.length > 0 && filterType !== 'all' && expenditures.every(type => type.items.length === 0) && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No expenditure items found for the selected type</p>
        </div>
      )}

      {/* Create Expenditure Modal */}
      <ResponsiveDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) {
            setEditingItem(null)
            setSelectedType('')
            setSelectedItem('')
            setLineItems([])
            setCurrentLineItem({ description: '', unitEstimate: 0, quantity: 0 })
            setTopUnitEstimate('')
            setTopQuantity('')
          }
        }}
        title={editingItem ? 'Edit Expenditure' : 'Create Expenditure'}
        description={editingItem ? 'Edit the expenditure item and its line items.' : 'Add expenditure type, item, and multiple line items with their allocations.'}
        size="2xl"
        showCloseButton
        footer={
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false)
                setSelectedType('')
                setSelectedItem('')
                setLineItems([])
                setCurrentLineItem({ description: '', unitEstimate: 0, quantity: 0 })
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
              onClick={handleCreateExpenditure}
              disabled={isSubmitting || !selectedType || (!editingItem && !selectedItem)}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingItem ? 'Saving...' : 'Creating...'}
                </div>
              ) : (
                (editingItem ? 'Save Changes' : 'Create Expenditures')
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              Select the type of expenditure, item name, then add line items with unit cost, quantity, and quarterly allocations.
            </p>
          </div>

          {/* Type of Expenditure */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Select Type of Expenditure <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  value={typeSearch || selectedType}
                  onChange={(e) => {
                    setTypeSearch(e.target.value)
                    setOpenDropdown('type')
                  }}
                  onFocus={() => setOpenDropdown('type')}
                  onBlur={() => setTimeout(() => setOpenDropdown(null), 200)}
                  placeholder="Search expenditure type..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedType && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType('')
                      setTypeSearch('')
                      setSelectedItem('')
                      setItemSearch('')
                      setOpenDropdown(null)
                    }}
                    className="absolute right-3 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>
              {openDropdown === 'type' && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-md z-50 max-h-48 overflow-y-auto">
                  {EXPENDITURE_TYPES.filter(type =>
                    type.code.toLowerCase().includes(typeSearch.toLowerCase()) ||
                    type.description.toLowerCase().includes(typeSearch.toLowerCase())
                  ).map((type) => (
                    <button
                      key={type.code}
                      type="button"
                      onClick={() => {
                        setSelectedType(type.code)
                        setTypeSearch('')
                        setSelectedItem('')
                        setItemSearch('')
                        setOpenDropdown(null)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-sm transition-colors"
                    >
                      <div className="font-medium text-slate-900">{type.code}</div>
                      <div className="text-xs text-slate-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Item of Expenditure */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Item of Expenditure <span className="text-red-600">*</span>
            </label>
            {selectedType === '' && (
              <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Select an Expenditure Type first
              </p>
            )}
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  value={itemSearch || selectedItem}
                  onChange={(e) => {
                    setItemSearch(e.target.value)
                    setOpenDropdown('item')
                  }}
                  onFocus={() => {
                    if (selectedType !== '') {
                      setOpenDropdown('item')
                    }
                  }}
                  onBlur={() => setTimeout(() => setOpenDropdown(null), 200)}
                  placeholder={selectedType === '' ? "Select an expenditure type first..." : "Search item..."}
                  disabled={selectedType === ''}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                {selectedItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem('')
                      setItemSearch('')
                      setOpenDropdown(null)
                    }}
                    className="absolute right-3 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </div>
              {openDropdown === 'item' && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-md z-50 max-h-48 overflow-y-auto">
                  {selectedType === '' ? (
                    <div className="px-3 py-4 text-center text-sm text-slate-500">
                      Please select an Expenditure Type first
                    </div>
                  ) : (
                    EXPENSE_ITEMS[selectedType as keyof typeof EXPENSE_ITEMS]
                      ?.filter(item =>
                        item.code.toLowerCase().includes(itemSearch.toLowerCase()) ||
                        item.description.toLowerCase().includes(itemSearch.toLowerCase())
                      )
                      .map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setSelectedItem(item.code)
                            setItemSearch('')
                            setOpenDropdown(null)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-sm transition-colors"
                        >
                          <div className="font-medium text-slate-900">{item.code}</div>
                          <div className="text-xs text-slate-600">{item.description}</div>
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top-level default unit/quantity when no line items added */}
          {lineItems.length === 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Unit Cost (required)</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                  <span className="px-2 text-slate-500 text-sm">₱</span>
                  <input
                    type="number"
                    min="0"
                    value={topUnitEstimate === '' ? '' : topUnitEstimate}
                    onChange={(e) => setTopUnitEstimate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="flex-1 px-2 py-2 border-0 bg-white focus:outline-none focus:ring-0 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Quantity (required)</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                  <input
                    type="number"
                    min="1"
                    value={topQuantity === '' ? '' : topQuantity}
                    onChange={(e) => setTopQuantity(e.target.value === '' ? '' : parseInt(e.target.value || '0'))}
                    placeholder="1"
                    className="flex-1 px-2 py-2 border-0 bg-white focus:outline-none focus:ring-0 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Top-level computed total when no line items */}
          {lineItems.length === 0 && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Total:</p>
              <p className="text-lg font-bold text-slate-900">
                ₱{((topUnitEstimate || 0) * (topQuantity || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Line Items Section */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h5 className="text-sm font-semibold text-slate-900 mb-4">Line Items</h5>

            {/* Add Line Item Form */}
            <div className="space-y-4 mb-6 p-4 bg-white border border-slate-200 rounded-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={currentLineItem.description}
                  onChange={(e) => setCurrentLineItem({ ...currentLineItem, description: e.target.value })}
                  placeholder="e.g., Snacks and Lunch of Deliberation Panel and Secretariat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Unit Cost
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <span className="px-3 text-slate-500 text-sm">₱</span>
                    <input
                      type="number"
                      min="0"
                      value={currentLineItem.unitEstimate || ''}
                      onChange={(e) => setCurrentLineItem({ ...currentLineItem, unitEstimate: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="flex-1 px-2 py-2 border-0 focus:outline-none focus:ring-0 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentLineItem.quantity || ''}
                    onChange={(e) => setCurrentLineItem({ ...currentLineItem, quantity: parseFloat(e.target.value) || 0 })}
                    placeholder="eg., 2"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Sub-Total
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-100">
                    <span className="px-3 text-slate-500 text-sm">₱</span>
                    <input
                      type="text"
                      disabled
                      value={(currentLineItem.unitEstimate * currentLineItem.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      className="flex-1 px-2 py-2 border-0 bg-slate-100 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddLineItem}
              >
                <Plus className="w-4 h-4" />
                Add Line Item
              </Button>
            </div>

            {/* Line Items List */}
            {lineItems.length > 0 ? (
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.description}</p>
                      <p className="text-xs text-slate-600">
                        ₱{item.unitEstimate.toLocaleString()} × {item.quantity} = ₱{item.subTotal.toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(item.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Line Items Total:</span>
                  <span className="text-lg font-bold text-blue-600">₱{totalLineItems.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-center py-6 text-sm text-slate-500">No line items added yet. Add items above.</p>
            )}
          </div>
        </div>
      </ResponsiveDialog>

      {/* Budget Allocation Modal */}
      <ResponsiveDialog
        open={isBudgetAllocationModalOpen}
        onOpenChange={(open) => {
          setIsBudgetAllocationModalOpen(open)
          if (!open) {
            setSelectedLineItem(null)
            setQuarterlyAllocation({ q1: 0, q2: 0, q3: 0, q4: 0 })
            setMonthlyAllocation({
              jan: 0,
              feb: 0,
              mar: 0,
              apr: 0,
              may: 0,
              jun: 0,
              jul: 0,
              aug: 0,
              sep: 0,
              oct: 0,
              nov: 0,
              dec: 0,
            })
            setAllocationError('')
          }
        }}
        title="Set Budget Allocation"
        description={`Allocate budget for: ${selectedLineItem?.description || ''}`}
        size="2xl"
        showCloseButton
        footer={
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsBudgetAllocationModalOpen(false)
                setSelectedLineItem(null)
                setQuarterlyAllocation({ q1: 0, q2: 0, q3: 0, q4: 0 })
                setMonthlyAllocation({
                  jan: 0,
                  feb: 0,
                  mar: 0,
                  apr: 0,
                  may: 0,
                  jun: 0,
                  jul: 0,
                  aug: 0,
                  sep: 0,
                  oct: 0,
                  nov: 0,
                  dec: 0,
                })
                setAllocationError('')
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              onClick={() => {
                if (allocationError) return

                // Persist allocation via parent callback if provided
                if (selectedLineItem && typeof onSaveAllocation === 'function') {
                  onSaveAllocation({
                    lineItemId: selectedLineItem.id,
                    q1: quarterlyAllocation.q1,
                    q2: quarterlyAllocation.q2,
                    q3: quarterlyAllocation.q3,
                    q4: quarterlyAllocation.q4,
                  })
                }

                setIsBudgetAllocationModalOpen(false)
                setSelectedLineItem(null)
                setQuarterlyAllocation({ q1: 0, q2: 0, q3: 0, q4: 0 })
                setMonthlyAllocation({
                  jan: 0,
                  feb: 0,
                  mar: 0,
                  apr: 0,
                  may: 0,
                  jun: 0,
                  jul: 0,
                  aug: 0,
                  sep: 0,
                  oct: 0,
                  nov: 0,
                  dec: 0,
                })
                toast({
                  title: 'Success',
                  description: 'Budget allocation updated successfully',
                  color: 'success',
                })
              }}
              disabled={!!allocationError}
            >
              Save Allocation
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Sub-Total Display */}
          {(() => {
            const colors = getExpenditureTypeColor(selectedTypeCode)
            return (
              <div className={`p-4 ${colors.allocationBg} border ${colors.allocationBorder} rounded-lg`}>
                <p className="text-sm text-slate-600 font-semibold mb-1">Item Sub-Total (Max to Allocate)</p>
                <p className={`text-2xl font-bold ${colors.allocationText}`}>₱{selectedLineItem?.subTotal.toLocaleString() || '0'}</p>
              </div>
            )
          })()}

          {/* Budget Period Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Budget Period <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-3">
              {(() => {
                const colors = getExpenditureTypeColor(selectedTypeCode)
                return (
                  <>
                    <button
                      onClick={() => setBudgetPeriod('quarterly')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                        budgetPeriod === 'quarterly'
                          ? `${colors.allocationBg} ${colors.allocationText} border-2 border-current`
                          : 'bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Quarterly
                    </button>
                    <button
                      onClick={() => setBudgetPeriod('monthly')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                        budgetPeriod === 'monthly'
                          ? `${colors.allocationBg} ${colors.allocationText} border-2 border-current`
                          : 'bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Monthly
                    </button>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Budget Allocation Grid */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              {budgetPeriod === 'quarterly' ? 'Quarterly' : 'Monthly'} Allocation
            </label>
            <p className="text-xs text-amber-600 mb-3 font-semibold">
              Note: Total allocation cannot exceed ₱{selectedLineItem?.subTotal.toLocaleString() || '0'}
            </p>
            {allocationError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">{allocationError}</span>
              </div>
            )}
            <div className={`grid gap-3 ${budgetPeriod === 'quarterly' ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {budgetPeriod === 'quarterly' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">1st Quarter</label>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <span className="px-2 text-slate-500 text-sm">₱</span>
                      <input
                        type="number"
                        min="0"
                        value={quarterlyAllocation.q1 || ''}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0
                          validateAllocation(newValue, 'q1')
                          setQuarterlyAllocation({ ...quarterlyAllocation, q1: newValue })
                        }}
                        placeholder="0.00"
                        className="flex-1 px-2 py-2 border-0 bg-slate-50 focus:outline-none focus:ring-0 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">2nd Quarter</label>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <span className="px-2 text-slate-500 text-sm">₱</span>
                      <input
                        type="number"
                        min="0"
                        value={quarterlyAllocation.q2 || ''}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0
                          validateAllocation(newValue, 'q2')
                          setQuarterlyAllocation({ ...quarterlyAllocation, q2: newValue })
                        }}
                        placeholder="0.00"
                        className="flex-1 px-2 py-2 border-0 bg-slate-50 focus:outline-none focus:ring-0 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">3rd Quarter</label>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <span className="px-2 text-slate-500 text-sm">₱</span>
                      <input
                        type="number"
                        min="0"
                        value={quarterlyAllocation.q3 || ''}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0
                          validateAllocation(newValue, 'q3')
                          setQuarterlyAllocation({ ...quarterlyAllocation, q3: newValue })
                        }}
                        placeholder="0.00"
                        className="flex-1 px-2 py-2 border-0 bg-slate-50 focus:outline-none focus:ring-0 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">4th Quarter</label>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <span className="px-2 text-slate-500 text-sm">₱</span>
                      <input
                        type="number"
                        min="0"
                        value={quarterlyAllocation.q4 || ''}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0
                          validateAllocation(newValue, 'q4')
                          setQuarterlyAllocation({ ...quarterlyAllocation, q4: newValue })
                        }}
                        placeholder="0.00"
                        className="flex-1 px-2 py-2 border-0 bg-slate-50 focus:outline-none focus:ring-0 text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const).map((month) => {
                    const monthLabel = month.charAt(0).toUpperCase() + month.slice(1)
                    return (
                      <div key={month}>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">{monthLabel}</label>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <span className="px-2 text-slate-500 text-sm">₱</span>
                          <input
                            type="number"
                            min="0"
                            value={monthlyAllocation[month] || ''}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value) || 0
                              validateAllocation(newValue, undefined, month)
                              setMonthlyAllocation({ ...monthlyAllocation, [month]: newValue })
                            }}
                            placeholder="0.00"
                            className="flex-1 px-2 py-2 border-0 bg-slate-50 focus:outline-none focus:ring-0 text-sm"
                          />
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>

          {/* Total Allocated */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Total Allocated:</span>
            <span className={`text-lg font-bold ${allocationError ? 'text-red-600' : 'text-blue-600'}`}>
              ₱{getTotalAllocated().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  )
}
