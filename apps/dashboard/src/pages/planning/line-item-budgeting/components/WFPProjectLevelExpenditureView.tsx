import { useState } from 'react'
import { Plus, Package, GitBranch, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'

interface ProjectLineItem {
  id: string
  description: string
  unitCost: number
  quantity: number
  subTotal: number
}

interface ProjectPhaseDetail {
  id: string
  phaseName: string // e.g., "Phase 1 - Planning", "Phase 2 - Implementation"
  startDate?: string
  endDate?: string
  lineItems: ProjectLineItem[]
  phaseTotal: number
  status?: 'Planning' | 'In Progress' | 'Completed'
}

interface ProjectExpenditureItem {
  id: string
  typeCode: string // e.g., 'PS', 'MOOE', 'CO'
  phases: ProjectPhaseDetail[]
}

interface WFPProjectLevelExpenditureViewProps {
  expenditures: ProjectExpenditureItem[]
  onAddExpenditure: (data: any) => void
  onEditExpenditure: (item: ProjectPhaseDetail) => void
  onDeleteExpenditure: (itemId: string) => void
}

const PHASES = [
  { code: 'PHASE-1', name: 'Phase 1 - Planning & Design' },
  { code: 'PHASE-2', name: 'Phase 2 - Procurement' },
  { code: 'PHASE-3', name: 'Phase 3 - Implementation' },
  { code: 'PHASE-4', name: 'Phase 4 - Monitoring & Evaluation' },
]

const PHASE_COLORS = {
  'PHASE-1': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
  'PHASE-2': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
  'PHASE-3': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
  'PHASE-4': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' },
}

const getExpenditureTypeColor = (typeCode: string) => {
  switch (typeCode) {
    case 'PS':
      return {
        headerText: 'text-green-700',
        borderL: 'border-l-green-400',
        badge: 'bg-green-100 text-green-700 border-green-200',
      }
    case 'MOOE':
      return {
        headerText: 'text-blue-700',
        borderL: 'border-l-blue-400',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
      }
    case 'CO':
      return {
        headerText: 'text-purple-700',
        borderL: 'border-l-purple-400',
        badge: 'bg-purple-100 text-purple-700 border-purple-200',
      }
    default:
      return {
        headerText: 'text-slate-700',
        borderL: 'border-l-slate-400',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
      }
  }
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Planning':
      return 'bg-blue-100 text-blue-700'
    case 'In Progress':
      return 'bg-amber-100 text-amber-700'
    case 'Completed':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export const WFPProjectLevelExpenditureView = ({
  expenditures,
}: WFPProjectLevelExpenditureViewProps) => {
  const { toast } = useToast()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [, setSelectedPhase] = useState<string | null>(null)
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [, setIsBudgetAllocationModalOpen] = useState(false)
  const [, setSelectedLineItem] = useState<ProjectLineItem | null>(null)
  const [currentLineItem, setCurrentLineItem] = useState<Omit<ProjectLineItem, 'id'>>({
    description: '',
    unitCost: 0,
    quantity: 0,
    subTotal: 0,
  })

  const getTotalByType = (typeCode: string) => {
    return expenditures
      .filter(exp => exp.typeCode === typeCode)
      .reduce((sum, exp) => sum + exp.phases.reduce((phaseSum, phase) => phaseSum + phase.phaseTotal, 0), 0)
  }

  const getTotalExpenditure = () => {
    return expenditures.reduce((sum, exp) => sum + exp.phases.reduce((phaseSum, phase) => phaseSum + phase.phaseTotal, 0), 0)
  }


  const EXPENDITURE_TYPES = [
    { code: 'PS', description: 'Personal Services' },
    { code: 'MOOE', description: 'Maintenance and Other Operating Expenses' },
    { code: 'CO', description: 'Capital Outlay' },
  ]

  return (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Project Phases & Expenditures</h3>
              <p className="text-sm text-slate-600 mt-1">Manage expenditures organized by project phases and expenditure types</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Add Phase Expenditure
            </Button>
          </div>
    
          {/* Phase Timeline Overview */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-6">
              <h4 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-slate-600" />
                Project Phases Overview
              </h4>
              
              {/* Horizontal Phase Timeline */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4">
                {PHASES.map((phase, index) => {
                  const colors = PHASE_COLORS[phase.code as keyof typeof PHASE_COLORS] || PHASE_COLORS['PHASE-1']
                  const phaseTotal = expenditures.reduce((sum, exp) => {
                    const p = exp.phases.find(ph => ph.phaseName.includes(phase.name.split(' - ')[1] || ''))
                    return sum + (p ? p.phaseTotal : 0)
                  }, 0)
                  
                  return (
                    <div key={phase.code} className="flex items-center gap-2 flex-shrink-0">
                      <div 
                        className={`${colors.bg} ${colors.border} border rounded-lg p-4 min-w-[180px] cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => setSelectedPhase(phase.code)}
                      >
                        <div className={`text-sm font-semibold ${colors.text} mb-1`}>{phase.code}</div>
                        <div className="text-xs text-slate-600 mb-2 line-clamp-2">{phase.name}</div>
                        <div className={`text-lg font-bold ${colors.text}`}>₱{phaseTotal.toLocaleString()}</div>
                      </div>
                      {index < PHASES.length - 1 && (
                        <div className="w-8 h-1 bg-slate-300 flex-shrink-0"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
    
          {/* Expenditure Types by Phase */}
          <div className="space-y-6">
            {EXPENDITURE_TYPES.map(type => {
              const typeExpenditure = expenditures.find(exp => exp.typeCode === type.code)
              if (!typeExpenditure || typeExpenditure.phases.length === 0) return null
    
              const colors = getExpenditureTypeColor(type.code)
              const typeTotal = getTotalByType(type.code)
    
              return (
                <div key={type.code} className={`border-l-4 ${colors.borderL} bg-slate-50 rounded-lg p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${colors.badge}`}>
                        {type.code}
                      </span>
                      <p className={`text-lg font-semibold ${colors.headerText} mt-2`}>{type.description}</p>
                    </div>
                    <div className={`text-right font-bold ${colors.headerText}`}>
                      <p className="text-sm text-slate-600">Total</p>
                      <p className="text-2xl">₱{typeTotal.toLocaleString()}</p>
                    </div>
                  </div>
    
                  {/* Phases Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PHASES.map(phase => {
                      const phaseData = typeExpenditure?.phases.find(p => p.phaseName.includes(phase.name.split(' - ')[1] || ''))
                      const phaseColors = PHASE_COLORS[phase.code as keyof typeof PHASE_COLORS]
                      
                      return (
                        <div
                          key={phase.code}
                          className={`${phaseColors.bg} ${phaseColors.border} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => setExpandedPhase(expandedPhase === phase.code ? null : phase.code)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`text-sm font-semibold ${phaseColors.text}`}>{phase.code}</div>
                            {phaseData?.status && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(phaseData.status)}`}>
                                {phaseData.status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-3">{phase.name}</p>
                          <div className={`text-xl font-bold ${phaseColors.text}`}>
                            ₱{(phaseData?.phaseTotal || 0).toLocaleString()}
                          </div>
                          
                          {/* Expandable Details */}
                          {expandedPhase === phase.code && phaseData && (
                            <div className="mt-4 pt-4 border-t border-slate-300 space-y-2">
                              <p className="text-xs font-semibold text-slate-700 uppercase">Items:</p>
                              {phaseData.lineItems.map(item => (
                                <div key={item.id} className="text-xs bg-white bg-opacity-50 rounded p-2">
                                  <p className="font-medium text-slate-700">{item.description}</p>
                                  <p className="text-slate-600">Qty: {item.quantity} × ₱{item.unitCost.toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
    
          {/* Summary Metrics */}
          {expenditures.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h4 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                  Budget Summary
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-700 font-semibold">PS (Personnel Services)</p>
                    <p className="text-2xl font-bold text-green-900 mt-2">₱{getTotalByType('PS').toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 font-semibold">MOOE (Maintenance)</p>
                    <p className="text-2xl font-bold text-blue-900 mt-2">₱{getTotalByType('MOOE').toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-700 font-semibold">CO (Capital Outlay)</p>
                    <p className="text-2xl font-bold text-purple-900 mt-2">₱{getTotalByType('CO').toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-4 border border-slate-600">
                    <p className="text-sm text-white font-semibold">Total Project Budget</p>
                    <p className="text-2xl font-bold text-white mt-2">₱{getTotalExpenditure().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
    
          {/* Empty State */}
          {expenditures.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Project Phases</h3>
              <p className="text-slate-600 mb-6">Start by adding project phase expenditures to track costs</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Phase Expenditure
              </Button>
            </div>
          )}
    
          {/* Create Modal */}
          <ResponsiveDialog
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            title="Add Project Phase Expenditure"
            description="Create a new expenditure item for a specific project phase"
            size="2xl"
            showCloseButton
            footer={
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setCurrentLineItem({ description: '', unitCost: 0, quantity: 0, subTotal: 0 })
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    toast({
                      title: 'Success',
                      description: 'Project phase expenditure added successfully',
                      color: 'success',
                    })
                    setIsCreateModalOpen(false)
                    setCurrentLineItem({ description: '', unitCost: 0, quantity: 0, subTotal: 0 })
                  }}
                >
                  Save Expenditure
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Phase Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Select Project Phase <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PHASES.map(phase => {
                    const colors = PHASE_COLORS[phase.code as keyof typeof PHASE_COLORS]
                    return (
                      <button
                        key={phase.code}
                        type="button"
                        className={`p-3 rounded-lg border-2 text-left transition-all ${colors.bg} ${colors.border} hover:shadow-md`}
                      >
                        <div className={`text-sm font-semibold ${colors.text}`}>{phase.code}</div>
                        <div className="text-xs text-slate-600">{phase.name}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
    
              {/* Expenditure Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Select Expenditure Type <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {EXPENDITURE_TYPES.map(type => {
                    const colors = getExpenditureTypeColor(type.code)
                    return (
                      <button
                        key={type.code}
                        type="button"
                        className={`p-3 rounded-lg border-2 text-left transition-all ${colors.badge} hover:shadow-md`}
                      >
                        <div className="text-sm font-semibold">{type.code}</div>
                        <div className="text-xs text-slate-600">{type.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
    
              {/* Line Item Form */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h5 className="text-sm font-semibold text-slate-900 mb-4">Line Item Details</h5>
    
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Item Description <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentLineItem.description}
                      onChange={(e) => setCurrentLineItem({ ...currentLineItem, description: e.target.value })}
                      placeholder="e.g., Office Equipment and Supplies"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
    
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">
                        Unit Cost <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <span className="px-3 text-slate-500 text-sm">₱</span>
                        <input
                          type="number"
                          min="0"
                          value={currentLineItem.unitCost || ''}
                          onChange={(e) => setCurrentLineItem({ ...currentLineItem, unitCost: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="flex-1 px-2 py-2 border-0 focus:outline-none focus:ring-0 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">
                        Quantity <span className="text-red-600">*</span>
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
                          value={(currentLineItem.unitCost * currentLineItem.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          className="flex-1 px-2 py-2 border-0 bg-slate-100 text-sm font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
    
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!currentLineItem.description || currentLineItem.unitCost <= 0 || currentLineItem.quantity <= 0}
                    >
                      <Plus className="w-4 h-4" />
                      Add Line Item
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        if (!currentLineItem.description || currentLineItem.unitCost <= 0 || currentLineItem.quantity <= 0) {
                          toast({
                            title: 'Error',
                            description: 'Please fill in all line item fields first',
                            color: 'destructive',
                          })
                          return
                        }
                        setSelectedLineItem({
                          id: '',
                          ...currentLineItem,
                          subTotal: currentLineItem.unitCost * currentLineItem.quantity
                        })
                        setIsBudgetAllocationModalOpen(true)
                      }}
                      disabled={!currentLineItem.description || currentLineItem.unitCost <= 0 || currentLineItem.quantity <= 0}
                    >
                      Set Budget Allocation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveDialog>
        </div>
      )
    }

