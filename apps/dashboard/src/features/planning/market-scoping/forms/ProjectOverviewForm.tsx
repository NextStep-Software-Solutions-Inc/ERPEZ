/**
 * Step 1: Project Overview Form
 * Collects basic project information and auto-fills user profile data
 * Location: src/features/planning/market-scoping/forms/
 */

import { useEffect, useState, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, Loader2, X } from 'lucide-react'
import type { ProjectOverviewFormData } from '../utils/validationRules'
import { projectOverviewSchema, validateBudgetPeriod, validateDeliveryDate } from '../utils/validationRules'
import { useAtom } from 'jotai'
import { draftMarketScopingAtom, currentFormStepAtom } from '../atoms/marketScopingStateAtom'
import { cn } from '@/lib/utils'
import { fetchUsers, type User } from '@/services/api/users'
import api from '@/services/api'

interface ProjectOverviewFormProps {
  libActivities?: readonly { readonly id: string; readonly name: string; readonly budget: number }[]
  userProfile?: {
    readonly name: string
    readonly designation: string
    readonly departmentUnit: string
    readonly agencyName: string
  }
  onNext: (data: ProjectOverviewFormData) => void
}

function formatIsoToMmYyyy(dateStr?: string): string {
  if (!dateStr) return ''
  if (/^\d{2}\/\d{4}$/.test(dateStr)) return dateStr
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      const month = String(d.getUTCMonth() + 1).padStart(2, '0')
      const year = d.getUTCFullYear()
      return `${month}/${year}`
    }
  } catch {}
  return dateStr
}

export function ProjectOverviewForm({
  libActivities = [],
  onNext,
}: ProjectOverviewFormProps) {
  const [draft] = useAtom(draftMarketScopingAtom)
  const [, setCurrentStep] = useAtom(currentFormStepAtom)
  const [periodFromOpen, setPeriodFromOpen] = useState(false)
  const [periodToOpen, setPeriodToOpen] = useState(false)
  const [expectedDeliveryDateOpen, setExpectedDeliveryDateOpen] = useState(false)
  
  // User selection state
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [personnelSearchTerm, setPersonnelSearchTerm] = useState('')
  const [showPersonnelDropdown, setShowPersonnelDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!personnelSearchTerm.trim()) return allUsers
    const term = personnelSearchTerm.toLowerCase()
    return allUsers.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(term) ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.employeeNumber.toLowerCase().includes(term)
      )
    })
  }, [allUsers, personnelSearchTerm])

  const [scopingMode, setScopingMode] = useState<'lib' | 'standalone'>(
    draft?.linkedLibActivityId ? 'lib' : 'standalone'
  )
  const [targetFiscalYear, setTargetFiscalYear] = useState<string>('2024')
  const [selectedLibId, setSelectedLibId] = useState<string>('')

  // Mock LIB structure matching Philippine SUC / Agency offices (USTP format)
  const mockLibs = useMemo(() => [
    {
      id: 'lib-2024-vcri-01',
      title: 'FY 2024 Line Item Budget (Internally Generated Income Fund)',
      fiscalYear: '2024',
      officeName: selectedUser?.officeName || 'VCRI',
      fundSource: 'Internally Generated Income Fund 2024',
      activities: [
        { id: '11111111-1111-4111-8111-111111111101', name: 'Conduct Capability Trainings/Workshops on research and extension', budget: 50000, isScoped: false },
        { id: '11111111-1111-4111-8111-111111111102', name: 'Conduct of Quarterly Meeting and performance evaluations', budget: 20000, isScoped: true, scopedMsfCode: 'MSF-2024-002' },
        { id: '11111111-1111-4111-8111-111111111103', name: 'Organize Operational Planning', budget: 30000, isScoped: false },
      ],
    },
    {
      id: 'lib-2024-vcri-02',
      title: 'FY 2024 Research & Innovation Systems Procurement',
      fiscalYear: '2024',
      officeName: selectedUser?.officeName || 'VCRI',
      fundSource: 'General Appropriations Act (GAA) 2024',
      activities: [
        { id: '11111111-1111-4111-8111-111111111104', name: 'Procurement of High-Performance Server & Storage Clusters', budget: 450000, isScoped: true, scopedMsfCode: 'MSF-2024-001' },
        { id: '11111111-1111-4111-8111-111111111105', name: 'Subscription to Scientific Journals & Research Databases', budget: 150000, isScoped: false },
      ],
    },
    {
      id: 'lib-2025-vcri-01',
      title: 'FY 2025 Line Item Budget (GAA Fund - Proposed)',
      fiscalYear: '2025',
      officeName: selectedUser?.officeName || 'VCRI',
      fundSource: 'Proposed GAA 2025',
      activities: [
        { id: '22222222-2222-4222-8222-222222222201', name: 'AI & Data Science Laboratory Hardware & Software', budget: 800000, isScoped: false },
      ],
    },
  ], [selectedUser?.officeName])

  // Available LIBs filtered by selected Fiscal Year and Representative's Office
  const filteredLibs = useMemo(() => {
    return mockLibs.filter((lib) => lib.fiscalYear === targetFiscalYear)
  }, [mockLibs, targetFiscalYear])

  // Activities of the currently selected LIB
  const activeLibObj = useMemo(() => {
    return mockLibs.find((lib) => lib.id === selectedLibId)
  }, [mockLibs, selectedLibId])

  // Real LIB activities state fetched from backend
  const [realLibActivities, setRealLibActivities] = useState<{ id: string; name: string; budget: number; lineItemBudgetId: string }[]>([])

  useEffect(() => {
    const fetchRealLibActivities = async () => {
      try {
        const res = await api.get('/lib-activities')
        const items = res.data?.data?.items || res.data?.data || res.data?.items || []
        
        interface RawLibActivity {
          id: string
          activityName?: string
          name?: string
          title?: string
          amount?: number
          budget?: number
          lineItemBudgetId?: string
          lineItemBudget?: {
            id: string
          }
        }

        if (Array.isArray(items) && items.length > 0) {
          setRealLibActivities(
            (items as RawLibActivity[]).map((item) => ({
              id: item.id,
              name: item.activityName || item.name || item.title || 'LIB Activity',
              budget: item.amount || item.budget || 0,
              lineItemBudgetId: item.lineItemBudgetId || item.lineItemBudget?.id || '',
            }))
          )
        }
      } catch (err) {
        console.error('Failed to load real LIB activities:', err)
      }
    }
    fetchRealLibActivities()
  }, [])

  interface ScopingActivityOption {
    id: string
    name: string
    budget: number
    lineItemBudgetId?: string
    isScoped?: boolean
    scopedMsfCode?: string
  }

  // Combine passed props libActivities with real/mock activities, filtering by selected LIB
  const availableActivities = useMemo<ScopingActivityOption[]>(() => {
    if (realLibActivities.length > 0) {
      const filtered = realLibActivities.filter(act => act.lineItemBudgetId === selectedLibId)
      if (filtered.length > 0) return filtered as ScopingActivityOption[]
    }
    if (activeLibObj) return activeLibObj.activities as ScopingActivityOption[]
    return libActivities as ScopingActivityOption[]
  }, [realLibActivities, selectedLibId, activeLibObj, libActivities])

  const form = useForm({
    defaultValues: {
      userId: (draft?.userId || '') as string,
      projectName: (draft?.projectName || '') as string,
      estimatedBudget: (draft?.estimatedBudget || 0) as number,
      periodFrom: formatIsoToMmYyyy(draft?.periodFrom),
      periodTo: formatIsoToMmYyyy(draft?.periodTo),
      expectedDeliveryDate: formatIsoToMmYyyy(draft?.expectedDeliveryDate),
      linkedLibActivityId: (draft?.linkedLibActivityId || undefined) as string | undefined,
    },
    onSubmit: async (values) => {
      // Validate using Zod schema
      const validationResult = projectOverviewSchema.safeParse(values.value)
      
      const fieldLabels: Record<string, string> = {
        userId: 'Representative',
        projectName: 'Project Name',
        estimatedBudget: 'Estimated Budget',
        periodFrom: 'Start Date',
        periodTo: 'End Date',
        expectedDeliveryDate: 'Expected Delivery Date',
      }

      if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0]
        const fieldName = fieldLabels[firstIssue.path[0] as string] ?? 'A required field'
        toast.warning('Please check your input', {
          description: `${fieldName}: ${firstIssue.message}. Fill in all required fields before proceeding.`,
        })
        return
      }

      // Additional validation: budget period consistency
      if (!validateBudgetPeriod(values.value.periodFrom, values.value.periodTo)) {
        toast.warning('Invalid date range', {
          description: 'The End Date must be the same as or later than the Start Date. Please adjust the period.',
        })
        return
      }

      // Additional validation: delivery date within period
      if (!validateDeliveryDate(values.value.periodFrom, values.value.expectedDeliveryDate)) {
        toast.warning('Invalid delivery date', {
          description: 'The Expected Delivery Date must fall on or after the Start Date. Please select a valid date.',
        })
        return
      }

      const completeData = {
        ...values.value,
        representativeName: selectedUser?.fullName || '',
        representativeDesignation: selectedUser?.employmentStatus || '',
        departmentUnit: selectedUser?.officeName || '',
        agencyName: selectedUser?.officeName || '',
      } as ProjectOverviewFormData

      onNext(completeData)
    },
  })

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  // Fetch users on mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const users = await fetchUsers()
        setAllUsers(users)
      } catch (error) {
        console.error('Failed to fetch users:', error)
        toast.error('Error', {
          description: 'Failed to load user list. Please try again.',
        })
      } finally {
        setIsLoadingUsers(false)
      }
    }
    loadUsers()
  }, [toast])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Provide basic information about your project and market scoping period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Personnel Selection Section */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Representative Information</h3>
              
              {/* User Search Field */}
              <div className="mb-4 relative">
                <Label htmlFor="personnelSearch" className="text-sm font-medium">
                  Search Representative *
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="personnelSearch"
                    value={personnelSearchTerm}
                    onChange={(e) => {
                      setPersonnelSearchTerm(e.target.value)
                      setShowPersonnelDropdown(true)
                    }}
                    onFocus={() => setShowPersonnelDropdown(true)}
                    placeholder="Type name, email, or employee number..."
                    className="w-full"
                  />
                  {isLoadingUsers && (
                    <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {selectedUser && !showPersonnelDropdown && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null)
                        setPersonnelSearchTerm('')
                        form.setFieldValue('userId', '')
                      }}
                      className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                {/* User Dropdown */}
                {showPersonnelDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user)
                          setPersonnelSearchTerm(user.fullName)
                          setShowPersonnelDropdown(false)
                          form.setFieldValue('userId', user.id)
                        }}
                        className={cn(
                          'w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors',
                          selectedUser?.id === user.id && 'bg-blue-100'
                        )}
                      >
                        <div className="font-medium text-sm">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          {user.employeeNumber} • {user.officeName}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No Results Message */}
                {showPersonnelDropdown && personnelSearchTerm && filteredUsers.length === 0 && !isLoadingUsers && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">
                    No users found matching "{personnelSearchTerm}"
                  </div>
                )}
              </div>

              {/* Display Selected User Details */}
              {selectedUser && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm font-medium mt-1">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Employee Number</Label>
                    <p className="text-sm font-medium mt-1">{selectedUser.employeeNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Email</Label>
                    <p className="text-sm font-medium mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Office</Label>
                    <p className="text-sm font-medium mt-1">{selectedUser.officeName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Phone</Label>
                    <p className="text-sm font-medium mt-1">{selectedUser.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Employment Status</Label>
                    <p className="text-sm font-medium mt-1">{selectedUser.employmentStatus || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Editable fields */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-1">Project Details</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Choose your market scoping mode and provide project details.
              </p>

              <form.Field name="userId">
                {(field) => (
                  <input
                    type="hidden"
                    value={field.state.value}
                  />
                )}
              </form.Field>

              {/* Explicit Mode Selector Cards */}
              <div className="mb-6 space-y-2">
                <Label className="text-sm font-semibold text-slate-900">
                  Market Scoping Mode *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScopingMode('lib')}
                    className={cn(
                      'p-3.5 rounded-xl border text-left transition-all',
                      scopingMode === 'lib'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span className={cn('w-4 h-4 rounded-full border flex items-center justify-center', scopingMode === 'lib' ? 'border-primary bg-primary text-white' : 'border-slate-300')}>
                        {scopingMode === 'lib' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      Link to LIB Activity
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-6">
                      Connect to an approved LIB Activity line item to auto-fill project name & budget.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScopingMode('standalone')
                      form.setFieldValue('linkedLibActivityId', undefined)
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border text-left transition-all',
                      scopingMode === 'standalone'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span className={cn('w-4 h-4 rounded-full border flex items-center justify-center', scopingMode === 'standalone' ? 'border-primary bg-primary text-white' : 'border-slate-300')}>
                        {scopingMode === 'standalone' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      Standalone / Pre-LIB Scoping
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-6">
                      For budget proposal preparation or ad-hoc scoping before an LIB is approved.
                    </p>
                  </button>
                </div>
              </div>

              {/* Target LIB & Activity Section (2 Dependent Dropdowns when Mode = 'lib') */}
              {scopingMode === 'lib' && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  {/* Top Bar: Office & FY Filter info */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Office / Department Context:</span>
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedUser?.officeName || 'VCRI (Office of the Vice Chancellor for Research & Innovation)'}
                      </span>
                    </div>
                    <div>
                      <Label htmlFor="fySelect" className="text-xs font-semibold text-slate-700 block mb-1">
                        Target Fiscal Year
                      </Label>
                      <Select value={targetFiscalYear} onValueChange={(fy) => {
                        setTargetFiscalYear(fy)
                        setSelectedLibId('')
                        form.setFieldValue('linkedLibActivityId', undefined)
                      }}>
                        <SelectTrigger id="fySelect" className="h-8 text-xs bg-white w-28">
                          <SelectValue placeholder="FY Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">FY 2024</SelectItem>
                          <SelectItem value="2025">FY 2025</SelectItem>
                          <SelectItem value="2026">FY 2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dropdown 1: Select Approved Line Item Budget (LIB) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="libSelect" className="text-xs font-semibold text-slate-900">
                      1. Select Approved Line Item Budget (LIB) *
                    </Label>
                    <Select
                      value={selectedLibId}
                      onValueChange={(libId) => {
                        setSelectedLibId(libId)
                        form.setFieldValue('linkedLibActivityId', undefined)
                      }}
                    >
                      <SelectTrigger id="libSelect" className="bg-white text-sm">
                        <SelectValue placeholder={`Select an approved LIB for ${selectedUser?.officeName || 'VCRI'} (${targetFiscalYear})...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredLibs.length === 0 ? (
                          <div className="p-3 text-xs text-slate-500 text-center">
                            No approved LIBs found for FY {targetFiscalYear}
                          </div>
                        ) : (
                          filteredLibs.map((lib) => (
                            <SelectItem key={lib.id} value={lib.id}>
                              {lib.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dropdown 2: Select Target LIB Activity (API) */}
                  <form.Field name="linkedLibActivityId">
                    {(field) => {
                      const selectedLibActivity = availableActivities.find((a) => a.id === field.state.value)

                      return (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={field.name} className="text-xs font-semibold text-slate-900">
                              2. Select Target LIB Activity (API) *
                            </Label>
                            {selectedLibActivity && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ Activity Linked
                              </span>
                            )}
                          </div>
                          <Select
                            disabled={!selectedLibId && filteredLibs.length > 0}
                            value={field.state.value || ''}
                            onValueChange={(val) => {
                              field.handleChange(val)
                              const matched = availableActivities.find((a) => a.id === val)
                              if (matched) {
                                form.setFieldValue('projectName', matched.name)
                                form.setFieldValue('estimatedBudget', matched.budget)
                                toast.success('LIB Activity Linked', {
                                  description: `Auto-filled Project Name ("${matched.name}") and Approved Budget (₱${matched.budget.toLocaleString()}).`,
                                })
                              }
                            }}
                          >
                            <SelectTrigger id={field.name} className="bg-white text-sm">
                              <SelectValue placeholder={selectedLibId ? "Select an activity under this LIB..." : "Please select an LIB first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableActivities.map((activity) => {
                                const isScoped = activity.isScoped === true
                                const msfCode = activity.scopedMsfCode
                                return (
                                  <SelectItem
                                    key={activity.id}
                                    value={activity.id}
                                    disabled={isScoped}
                                    className={cn(
                                      isScoped && "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400"
                                    )}
                                  >
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <span>{activity.name} — ₱{activity.budget.toLocaleString()}</span>
                                      {isScoped && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                          🔒 {msfCode ? `Already Scoped (${msfCode})` : 'Already Scoped'}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          {selectedLibActivity && (
                            <div className="mt-2 pt-2 flex items-center justify-between text-xs text-slate-600 bg-white p-2 rounded border border-emerald-200">
                              <span>Allocated API Budget Ceiling:</span>
                              <span className="font-bold text-emerald-700">₱{selectedLibActivity.budget.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )
                    }}
                  </form.Field>
                </div>
              )}

              <form.Field name="projectName">
                {(field) => (
                  <div className="mb-4">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      Project Name *
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter project name"
                      className="mt-1.5"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="estimatedBudget">
                {(field) => (
                  <div className="mb-4">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      Estimated Budget *
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value === 0 ? '' : field.state.value}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        field.handleChange(isNaN(val) ? 0 : val)
                      }}
                      onBlur={field.handleBlur}
                      placeholder="0.00"
                      className="mt-1.5"
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <form.Field name="periodFrom">
                  {(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-sm font-medium">
                        Period From (mm/yyyy) *
                      </Label>
                      <Popover open={periodFromOpen} onOpenChange={setPeriodFromOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal mt-1.5',
                              !field.state.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.state.value || 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3 space-y-2">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Month</Label>
                              <Select
                                value={field.state.value ? field.state.value.split('/')[0] : ''}
                                onValueChange={(month) => {
                                  const year = field.state.value?.split('/')[1] || new Date().getFullYear().toString()
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>
                                      {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Year</Label>
                              <Select
                                value={field.state.value ? field.state.value.split('/')[1] : ''}
                                onValueChange={(year) => {
                                  const month = field.state.value?.split('/')[0] || '01'
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() - 2 + i
                                    return (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => setPeriodFromOpen(false)}
                            >
                              Done
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {field.state.meta.errors && (
                        <p className="text-xs text-red-600 mt-1">
                          {field.state.meta.errors.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="periodTo">
                  {(field) => (
                    <div>
                      <Label htmlFor={field.name} className="text-sm font-medium">
                        Period To (mm/yyyy) *
                      </Label>
                      <Popover open={periodToOpen} onOpenChange={setPeriodToOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal mt-1.5',
                              !field.state.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.state.value || 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3 space-y-2">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Month</Label>
                              <Select
                                value={field.state.value ? field.state.value.split('/')[0] : ''}
                                onValueChange={(month) => {
                                  const year = field.state.value?.split('/')[1] || new Date().getFullYear().toString()
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>
                                      {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Year</Label>
                              <Select
                                value={field.state.value ? field.state.value.split('/')[1] : ''}
                                onValueChange={(year) => {
                                  const month = field.state.value?.split('/')[0] || '01'
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() - 2 + i
                                    return (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => setPeriodToOpen(false)}
                            >
                              Done
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="expectedDeliveryDate">
                {(field) => (
                  <div className="mb-4">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      Expected Date of Delivery (mm/yyyy) *
                    </Label>
                    <Popover open={expectedDeliveryDateOpen} onOpenChange={setExpectedDeliveryDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal mt-1.5',
                            !field.state.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.state.value || 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3 space-y-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Month</Label>
                            <Select
                              value={field.state.value ? field.state.value.split('/')[0] : ''}
                              onValueChange={(month) => {
                                const year = field.state.value?.split('/')[1] || new Date().getFullYear().toString()
                                field.handleChange(`${month}/${year}`)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>
                                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Year</Label>
                            <Select
                              value={field.state.value ? field.state.value.split('/')[1] : ''}
                              onValueChange={(year) => {
                                const month = field.state.value?.split('/')[0] || '01'
                                field.handleChange(`${month}/${year}`)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => {
                                  const year = new Date().getFullYear() - 2 + i
                                  return (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => setExpectedDeliveryDateOpen(false)}
                          >
                            Done
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </form.Field>
            </div>

            <Button type="submit" className="w-full">
              Next: Activities Conducted
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
