/**
 * Step 1: Project Overview Form
 * Collects basic project information and auto-fills user profile data
 * Location: src/features/planning/market-scoping/forms/
 */

import { useEffect, useState, useMemo, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarIcon, Loader2, X } from 'lucide-react'
import type { ProjectOverviewFormData } from '../utils/validationRules'
import {
  projectOverviewSchema,
  validateBudgetPeriod,
  validateDeliveryDate,
} from '../utils/validationRules'
import { useAtom } from 'jotai'
import {
  draftMarketScopingAtom,
  currentFormStepAtom,
} from '../atoms/marketScopingStateAtom'
import { cn } from '@/lib/utils'
import { fetchUsers, type User } from '@/services/api/users'
import api from '@/services/api'

interface ScopingActivityOption {
  id: string
  name: string
  budget: number
  lineItemBudgetId?: string
  isScoped?: boolean
  scopedMsfCode?: string
}

interface ProjectOverviewFormProps {
  libActivities?: readonly {
    readonly id: string
    readonly name: string
    readonly budget: number
  }[]
  userProfile?: {
    readonly name: string
    readonly designation: string
    readonly departmentUnit: string
    readonly agencyName: string
  }
  onNext: (data: ProjectOverviewFormData) => void
  onSaveDraft?: (data: Partial<ProjectOverviewFormData>) => void
}

interface RawLib {
  id: string
  name?: string
  title?: string
  libNumber?: string
  version?: number | string
  status?: string
  scope?: string
  totalAmount?: number
  fiscalYear?: string | number | { year?: string | number }
  fiscalYearEntity?: { year?: string | number }
  office?: { name?: string }
  officeName?: string
}

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

interface LibDetailActivityDetail {
  budget?: number
  unitQuantity?: number
  unitCost?: number
}

interface LibDetailActivity {
  id: string
  name?: string
  budget?: number
  wfpObjectiveActivity?: { activityName?: string }
  opcrActivity?: { name?: string }
  details?: LibDetailActivityDetail[]
}

interface LibDetail {
  id?: string
  name?: string
  title?: string
  scope?: string
  totalAmount?: number
  activities?: LibDetailActivity[]
  orphanDetails?: LibDetailActivityDetail[]
}

interface ExistingMarketScopingItem {
  id: string
  targetLineItemBudgetId?: string
  targetLineItemBudgetActivityId?: string
  projectName?: string
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
  onSaveDraft,
}: ProjectOverviewFormProps) {
  const [draft] = useAtom(draftMarketScopingAtom)
  const [, setCurrentStep] = useAtom(currentFormStepAtom)
  const [periodFromOpen, setPeriodFromOpen] = useState(false)
  const [periodToOpen, setPeriodToOpen] = useState(false)
  const [expectedDeliveryDateOpen, setExpectedDeliveryDateOpen] =
    useState(false)

  const initialTargetLibId =
    draft?.targetLineItemBudgetId ||
    draft?.targetLineItemBudget?.id ||
    draft?.targetLineItemBudgetActivity?.lineItemBudgetId ||
    ''
  const initialTargetActivityId =
    draft?.linkedLibActivityId ||
    draft?.targetLineItemBudgetActivityId ||
    draft?.targetLineItemBudgetActivity?.id ||
    ''

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    initialTargetActivityId,
  )

  // User selection state
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [showPersonnelDropdown, setShowPersonnelDropdown] = useState(false)

  // Initialize selectedUser and search term from draft if present so edit view is never empty
  const [selectedUser, setSelectedUser] = useState<User | null>(() => {
    if (draft?.userId && (draft?.representativeName || draft?.departmentUnit)) {
      return {
        id: draft.userId,
        username: draft.userId,
        fullName: draft.representativeName || 'Representative',
        firstName: draft.representativeName?.split(' ')[0] || '',
        lastName: draft.representativeName?.split(' ').slice(1).join(' ') || '',
        email: '',
        employeeNumber: '',
        officeName: draft.departmentUnit || '',
        employmentStatus: draft.representativeDesignation || '',
        isActive: true,
      }
    }
    return null
  })

  const [personnelSearchTerm, setPersonnelSearchTerm] = useState(
    draft?.representativeName || '',
  )

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
    initialTargetActivityId || initialTargetLibId ? 'lib' : 'standalone',
  )
  const initialYear =
    draft?.periodFrom?.split('/')[1] || new Date().getFullYear().toString()
  const [targetFiscalYear, setTargetFiscalYear] = useState<string>(initialYear)
  const [selectedLibId, setSelectedLibId] = useState<string>(initialTargetLibId)

  // Real Fiscal Years state - supports all fiscal years from API with full range fallback
  const [fiscalYears, setFiscalYears] = useState<string[]>([
    '2030',
    '2029',
    '2028',
    '2027',
    '2026',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
  ])

  useEffect(() => {
    const fetchFiscalYears = async () => {
      try {
        const res = await api.get('/fiscal-years')
        const items =
          res.data?.data?.items ||
          res.data?.data ||
          res.data?.items ||
          res.data ||
          []
        if (Array.isArray(items) && items.length > 0) {
          const apiYears = items
            .map(
              (item: {
                year?: number | string
                name?: string
                fiscalYear?: string
                yearNumber?: number | string
              }) =>
                String(
                  item.year ||
                    item.yearNumber ||
                    item.name ||
                    item.fiscalYear ||
                    '',
                ),
            )
            .filter((y: string) => /^\d{4}$/.test(y))

          if (apiYears.length > 0) {
            const uniqueYears = Array.from(new Set(apiYears)).sort((a, b) =>
              b.localeCompare(a),
            )
            setFiscalYears(uniqueYears)
          }
        }
      } catch (err) {
        console.warn('Falling back to standard fiscal years list:', err)
      }
    }
    fetchFiscalYears()
  }, [])

  // Real Line Item Budgets (LIBs) state fetched from backend GET /libs API
  interface RealLibItem {
    id: string
    name: string
    title: string
    libNumber?: string
    fiscalYear: string
    officeName?: string
    scope?: string
    totalAmount?: number
  }

  const [realLibs, setRealLibs] = useState<RealLibItem[]>([])

  useEffect(() => {
    const fetchRealLibs = async () => {
      try {
        const res = await api.get<{
          data?: { items?: RawLib[] } | RawLib[]
          items?: RawLib[]
        }>('/libs', { params: { pageSize: 1000 } })
        const rawItems: RawLib[] = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.data?.items)
            ? res.data.data.items
            : Array.isArray(res.data?.items)
              ? res.data.items
              : []
        if (rawItems.length > 0) {
          const seenIds = new Set<string>()
          const mappedLibs: RealLibItem[] = []

          // Track name frequencies to fallback to sequential versioning if version property is missing
          const nameCounters: Record<string, number> = {}

          for (const item of rawItems) {
            if (!item.id || seenIds.has(item.id)) continue
            seenIds.add(item.id)

            const fy = String(
              (typeof item.fiscalYear === 'object'
                ? item.fiscalYear?.year
                : item.fiscalYear) ||
                item.fiscalYearEntity?.year ||
                '2026',
            )
            const baseName = item.name || item.title || 'Line Item Budget'

            // Determine version text (e.g. v1.0, v2.0)
            nameCounters[baseName] = (nameCounters[baseName] || 0) + 1
            const versionNum =
              item.version !== undefined && item.version !== null
                ? item.version
                : nameCounters[baseName]
            const versionStr = ` (v${versionNum}.0)`

            const libNumTag = item.libNumber ? ` [${item.libNumber}]` : ''
            const scopeTag =
              item.scope === 'Project' || item.scope === 'ProjectLevel'
                ? ' (Project Scope)'
                : ''
            const fullTitle = baseName.startsWith('FY')
              ? `${baseName}${versionStr}${libNumTag}${scopeTag}`
              : `FY ${fy} ${baseName}${versionStr}${libNumTag}${scopeTag}`

            mappedLibs.push({
              id: item.id,
              name: baseName,
              title: fullTitle,
              libNumber: item.libNumber,
              fiscalYear: fy,
              officeName: item.office?.name || item.officeName || '',
              scope:
                item.scope ||
                (item.name?.toLowerCase().includes('project')
                  ? 'Project'
                  : 'Activity'),
              totalAmount: item.totalAmount || 0,
            })
          }

          setRealLibs(mappedLibs)
        }
      } catch (err) {
        console.error('Failed to fetch real LIBs:', err)
      }
    }
    fetchRealLibs()
  }, [])

  // Available LIBs filtered by selected Target Fiscal Year and Selected User's Office Context
  const filteredLibs = useMemo(() => {
    let base = realLibs.filter((lib) => {
      if (selectedLibId && lib.id === selectedLibId) return true
      const matchesFy = lib.fiscalYear === targetFiscalYear
      // Match office if office information is available
      const matchesOffice =
        !selectedUser?.officeName ||
        !lib.officeName ||
        lib.officeName
          .toLowerCase()
          .includes(selectedUser.officeName.toLowerCase()) ||
        selectedUser.officeName
          .toLowerCase()
          .includes(lib.officeName.toLowerCase())
      return matchesFy && matchesOffice
    })

    // If selectedLibId is present from draft but not in realLibs yet, add a placeholder entry so the dropdown renders it
    if (selectedLibId && !base.some((l) => l.id === selectedLibId)) {
      const budgetNumber =
        draft?.targetLineItemBudgetNumber ||
        draft?.targetLineItemBudget?.libNumber
      base = [
        {
          id: selectedLibId,
          name: budgetNumber || 'Line Item Budget',
          title: budgetNumber
            ? `Line Item Budget [${budgetNumber}]`
            : 'Line Item Budget',
          fiscalYear: targetFiscalYear,
          officeName: selectedUser?.officeName || '',
        },
        ...base,
      ]
    }

    return base
  }, [realLibs, targetFiscalYear, selectedUser, selectedLibId, draft])

  // Real LIB activities state fetched from backend GET /lib-activities API
  const [realLibActivities, setRealLibActivities] = useState<
    { id: string; name: string; budget: number; lineItemBudgetId: string }[]
  >([])
  const [selectedLibActivities, setSelectedLibActivities] = useState<
    ScopingActivityOption[]
  >([])
  const [, setSelectedLibDetail] = useState<LibDetail | null>(null)
  const [isLoadingLibActivities, setIsLoadingLibActivities] = useState(false)

  useEffect(() => {
    const fetchRealLibActivities = async () => {
      try {
        const res = await api.get<{
          data?: { items?: RawLibActivity[] } | RawLibActivity[]
          items?: RawLibActivity[]
        }>('/lib-activities', {
          params: { pageSize: 1000 },
        })
        const items: RawLibActivity[] = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.data?.items)
            ? res.data.data.items
            : Array.isArray(res.data?.items)
              ? res.data.items
              : []

        if (items.length > 0) {
          setRealLibActivities(
            items.map((item) => ({
              id: item.id,
              name:
                item.activityName || item.name || item.title || 'LIB Activity',
              budget: item.amount || item.budget || 0,
              lineItemBudgetId:
                item.lineItemBudgetId || item.lineItemBudget?.id || '',
            })),
          )
        }
      } catch (err) {
        console.error('Failed to load real LIB activities:', err)
      }
    }
    fetchRealLibActivities()
  }, [])

  // Existing market scopings to guard against duplicate MSFs for same activity/LIB
  const [existingMarketScopings, setExistingMarketScopings] = useState<
    ExistingMarketScopingItem[]
  >([])

  useEffect(() => {
    const fetchExistingMarketScopings = async () => {
      try {
        const res = await api.get<{
          data?:
            | { items?: ExistingMarketScopingItem[] }
            | ExistingMarketScopingItem[]
          items?: ExistingMarketScopingItem[]
        }>('/market-scopings', {
          params: { pageSize: 1000 },
        })
        const items: ExistingMarketScopingItem[] = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.data?.items)
            ? res.data.data.items
            : Array.isArray(res.data?.items)
              ? res.data.items
              : []
        if (items.length > 0) {
          setExistingMarketScopings(
            items.map((ms) => ({
              id: ms.id,
              targetLineItemBudgetId: ms.targetLineItemBudgetId,
              targetLineItemBudgetActivityId: ms.targetLineItemBudgetActivityId,
              projectName: ms.projectName,
            })),
          )
        }
      } catch (err) {
        console.warn(
          'Failed to load existing market scopings for duplicate guard:',
          err,
        )
      }
    }
    fetchExistingMarketScopings()
  }, [])

  const scopedActivityMap = useMemo(() => {
    const map = new Map<string, { msfId: string; projectName?: string }>()
    existingMarketScopings.forEach((ms) => {
      if (draft?.id && ms.id === draft.id) return
      if (ms.targetLineItemBudgetActivityId) {
        map.set(ms.targetLineItemBudgetActivityId, {
          msfId: ms.id,
          projectName: ms.projectName,
        })
      }
    })
    return map
  }, [existingMarketScopings, draft?.id])

  const scopedLibMap = useMemo(() => {
    const map = new Map<string, { msfId: string; projectName?: string }>()
    existingMarketScopings.forEach((ms) => {
      if (draft?.id && ms.id === draft.id) return
      if (ms.targetLineItemBudgetId) {
        map.set(ms.targetLineItemBudgetId, {
          msfId: ms.id,
          projectName: ms.projectName,
        })
      }
    })
    return map
  }, [existingMarketScopings, draft?.id])

  // Combine directly loaded activities for selected LIB, cached real activities, and passed props
  const availableActivities = useMemo<ScopingActivityOption[]>(() => {
    let list: ScopingActivityOption[] = []
    if (selectedLibActivities.length > 0) {
      list = selectedLibActivities
    } else if (realLibActivities.length > 0) {
      const filtered = realLibActivities.filter(
        (act) => act.lineItemBudgetId === selectedLibId,
      )
      if (filtered.length > 0) {
        list = filtered.map((act) => ({
          id: act.id,
          name: act.name,
          budget: act.budget,
          lineItemBudgetId: act.lineItemBudgetId,
        }))
      }
    } else if (libActivities && libActivities.length > 0) {
      list = libActivities.map((act) => ({
        id: act.id,
        name: act.name,
        budget: act.budget,
      }))
    }

    // Ensure the draft's activity is in the list even if activities are still loading
    const currentActivityId =
      draft?.linkedLibActivityId || draft?.targetLineItemBudgetActivityId
    if (currentActivityId && !list.some((a) => a.id === currentActivityId)) {
      list = [
        ...list,
        {
          id: currentActivityId,
          name:
            draft?.targetLineItemBudgetActivityName ||
            draft?.projectName ||
            'Linked LIB Activity',
          budget: draft?.estimatedBudget || 0,
          lineItemBudgetId: selectedLibId,
        },
      ]
    }

    return list.map((act) => {
      const scopedInfo = scopedActivityMap.get(act.id)
      return {
        ...act,
        isScoped: Boolean(
          scopedInfo && (!draft?.id || scopedInfo.msfId !== draft.id),
        ),
        scopedMsfCode: scopedInfo?.projectName,
      }
    })
  }, [
    selectedLibActivities,
    realLibActivities,
    selectedLibId,
    libActivities,
    scopedActivityMap,
    draft,
  ])

  const selectedLib = useMemo(() => {
    return realLibs.find((lib) => lib.id === selectedLibId)
  }, [realLibs, selectedLibId])

  const isProjectScopeLib =
    selectedLib?.scope === 'Project' || selectedLib?.scope === 'ProjectLevel'

  const form = useForm({
    defaultValues: {
      userId: draft?.userId || '',
      projectName: draft?.projectName || '',
      estimatedBudget: draft?.estimatedBudget || 0,
      periodFrom: formatIsoToMmYyyy(draft?.periodFrom),
      periodTo: formatIsoToMmYyyy(draft?.periodTo),
      expectedDeliveryDate: formatIsoToMmYyyy(draft?.expectedDeliveryDate),
      targetLineItemBudgetId: draft?.targetLineItemBudgetId || undefined,
      linkedLibActivityId:
        draft?.linkedLibActivityId ||
        draft?.targetLineItemBudgetActivityId ||
        undefined,
      targetLineItemBudgetActivityId:
        draft?.targetLineItemBudgetActivityId ||
        draft?.linkedLibActivityId ||
        undefined,
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
        const pathKey = String(firstIssue.path[0] || '')
        const fieldName = fieldLabels[pathKey] ?? 'A required field'
        toast.warning('Please check your input', {
          description: `${fieldName}: ${firstIssue.message}. Fill in all required fields before proceeding.`,
        })
        return
      }

      // Additional validation: budget period consistency
      if (
        !validateBudgetPeriod(values.value.periodFrom, values.value.periodTo)
      ) {
        toast.warning('Invalid date range', {
          description:
            'The End Date must be the same as or later than the Start Date. Please adjust the period.',
        })
        return
      }

      // Additional validation: delivery date within period
      if (
        !validateDeliveryDate(
          values.value.periodFrom,
          values.value.expectedDeliveryDate,
        )
      ) {
        toast.warning('Invalid delivery date', {
          description:
            'The Expected Delivery Date must fall on or after the Start Date. Please select a valid date.',
        })
        return
      }

      const completeData: ProjectOverviewFormData = {
        ...values.value,
        representativeName: selectedUser?.fullName || '',
        representativeDesignation: selectedUser?.employmentStatus || '',
        departmentUnit: selectedUser?.officeName || '',
        agencyName: selectedUser?.officeName || '',
        targetLineItemBudgetId:
          scopingMode === 'lib' && isProjectScopeLib
            ? selectedLibId
            : undefined,
        linkedLibActivityId:
          scopingMode === 'lib' && !isProjectScopeLib
            ? values.value.linkedLibActivityId ||
              draft?.linkedLibActivityId ||
              draft?.targetLineItemBudgetActivityId
            : undefined,
        targetLineItemBudgetActivityId:
          scopingMode === 'lib' && !isProjectScopeLib
            ? values.value.linkedLibActivityId ||
              draft?.linkedLibActivityId ||
              draft?.targetLineItemBudgetActivityId
            : undefined,
      }

      onNext(completeData)
    },
  })

  const handleSelectLib = async (
    libId: string,
    preserveActivityId?: string,
  ) => {
    setSelectedLibId(libId)
    setSelectedLibActivities([])
    setSelectedLibDetail(null)
    setIsLoadingLibActivities(true)

    const matched = realLibs.find((l) => l.id === libId)
    if (!matched) {
      setIsLoadingLibActivities(false)
      return
    }

    try {
      const res = await api.get<{ data?: LibDetail } & LibDetail>(
        `/libs/${libId}`,
      )
      const detail: LibDetail | null = res.data?.data || res.data || null
      setSelectedLibDetail(detail)

      const rawActivities: LibDetailActivity[] = detail?.activities || []
      const mappedActivities: ScopingActivityOption[] = rawActivities.map(
        (act) => ({
          id: act.id,
          name:
            act.wfpObjectiveActivity?.activityName ||
            act.opcrActivity?.name ||
            act.name ||
            'LIB Activity',
          budget:
            (act.details || []).reduce(
              (sum: number, d) =>
                sum + (d.budget ?? (d.unitQuantity ?? 0) * (d.unitCost ?? 0)),
              0,
            ) ||
            act.budget ||
            0,
          lineItemBudgetId: libId,
        }),
      )
      setSelectedLibActivities(mappedActivities)

      const isProject =
        detail?.scope === 'Project' ||
        detail?.scope === 'ProjectLevel' ||
        matched.scope === 'Project' ||
        matched.scope === 'ProjectLevel'

      if (isProject) {
        if (scopedLibMap.has(libId)) {
          toast.warning('Line Item Budget Already Scoped', {
            description:
              'A Market Scoping Form has already been created for this Project-Level Line Item Budget.',
          })
          setSelectedLibId('')
          return
        }

        const orphanTotal = (detail?.orphanDetails || []).reduce(
          (
            sum: number,
            d: { budget?: number; unitQuantity?: number; unitCost?: number },
          ) => sum + (d.budget ?? (d.unitQuantity ?? 0) * (d.unitCost ?? 0)),
          0,
        )
        const budget =
          orphanTotal > 0
            ? orphanTotal
            : (detail?.totalAmount ?? matched.totalAmount ?? 0)
        const projectName = detail?.name || matched.name || matched.title

        form.setFieldValue('targetLineItemBudgetId', libId)
        form.setFieldValue('linkedLibActivityId', undefined)
        if (!form.getFieldValue('projectName')) {
          form.setFieldValue('projectName', projectName)
        }
        if (!form.getFieldValue('estimatedBudget') && budget > 0) {
          form.setFieldValue('estimatedBudget', budget)
        }

        if (!preserveActivityId) {
          toast.success('Project-Level LIB Linked', {
            description: `Auto-filled Project Name ("${projectName}") and Estimated Budget (₱${budget.toLocaleString()}). You can customize these fields if needed.`,
          })
        }
      } else {
        form.setFieldValue('targetLineItemBudgetId', undefined)
        const targetActId =
          preserveActivityId ||
          selectedActivityId ||
          form.getFieldValue('linkedLibActivityId') ||
          draft?.linkedLibActivityId ||
          draft?.targetLineItemBudgetActivityId

        if (targetActId && mappedActivities.some((a) => a.id === targetActId)) {
          setSelectedActivityId(targetActId)
          form.setFieldValue('linkedLibActivityId', targetActId)
          form.setFieldValue('targetLineItemBudgetActivityId', targetActId)
        } else if (!preserveActivityId) {
          setSelectedActivityId('')
          form.setFieldValue('linkedLibActivityId', undefined)
          form.setFieldValue('targetLineItemBudgetActivityId', undefined)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch detailed LIB:', err)
      if (matched.scope === 'Project' || matched.scope === 'ProjectLevel') {
        form.setFieldValue('targetLineItemBudgetId', libId)
        form.setFieldValue('linkedLibActivityId', undefined)
        if (!form.getFieldValue('projectName')) {
          form.setFieldValue('projectName', matched.name)
        }
        if (
          !form.getFieldValue('estimatedBudget') &&
          matched.totalAmount &&
          matched.totalAmount > 0
        ) {
          form.setFieldValue('estimatedBudget', matched.totalAmount)
        }
      } else {
        form.setFieldValue('targetLineItemBudgetId', undefined)
        const targetActId =
          preserveActivityId ||
          selectedActivityId ||
          form.getFieldValue('linkedLibActivityId') ||
          draft?.linkedLibActivityId ||
          draft?.targetLineItemBudgetActivityId
        if (targetActId) {
          setSelectedActivityId(targetActId)
          form.setFieldValue('linkedLibActivityId', targetActId)
          form.setFieldValue('targetLineItemBudgetActivityId', targetActId)
        } else {
          setSelectedActivityId('')
          form.setFieldValue('linkedLibActivityId', undefined)
          form.setFieldValue('targetLineItemBudgetActivityId', undefined)
        }
      }
    } finally {
      setIsLoadingLibActivities(false)
    }
  }

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  // Fetch users on mount and reconcile with draft representative
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const users = await fetchUsers()
        setAllUsers(users)
        if (draft?.userId) {
          const matchedUser = users.find((u) => u.id === draft.userId)
          if (matchedUser) {
            setSelectedUser(matchedUser)
            setPersonnelSearchTerm(matchedUser.fullName)
          }
        }
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
  }, [toast, draft?.userId])

  // Auto-resolve LIB and Activity from draft target IDs or matching project name
  useEffect(() => {
    if (realLibActivities.length === 0) return

    const targetActId =
      selectedActivityId ||
      draft?.linkedLibActivityId ||
      draft?.targetLineItemBudgetActivityId ||
      draft?.targetLineItemBudgetActivity?.id

    if (targetActId) {
      const found = realLibActivities.find((a) => a.id === targetActId)
      if (found?.lineItemBudgetId) {
        if (!selectedLibId) setSelectedLibId(found.lineItemBudgetId)
        setScopingMode('lib')
        setSelectedActivityId(found.id)
        form.setFieldValue('linkedLibActivityId', found.id)
        form.setFieldValue('targetLineItemBudgetActivityId', found.id)
      }
    } else if (draft?.projectName) {
      const foundByName = realLibActivities.find(
        (a) =>
          a.name.trim().toLowerCase() ===
          draft.projectName?.trim().toLowerCase(),
      )
      if (foundByName) {
        setScopingMode('lib')
        if (!selectedLibId) setSelectedLibId(foundByName.lineItemBudgetId)
        setSelectedActivityId(foundByName.id)
        form.setFieldValue('linkedLibActivityId', foundByName.id)
        form.setFieldValue('targetLineItemBudgetActivityId', foundByName.id)
      }
    }
  }, [selectedLibId, draft, realLibActivities, selectedActivityId])

  // Hydrate LIB activities when realLibs loads and selectedLibId is present
  const hasHydratedLibRef = useRef(false)
  useEffect(() => {
    if (selectedLibId && realLibs.length > 0 && !hasHydratedLibRef.current) {
      hasHydratedLibRef.current = true
      const targetActId =
        selectedActivityId ||
        draft?.linkedLibActivityId ||
        draft?.targetLineItemBudgetActivityId ||
        draft?.targetLineItemBudgetActivity?.id ||
        realLibActivities.find(
          (a) =>
            a.name.trim().toLowerCase() ===
            (draft?.projectName || '').trim().toLowerCase(),
        )?.id
      handleSelectLib(selectedLibId, targetActId)

      // Sync fiscal year if needed
      const matched = realLibs.find((l) => l.id === selectedLibId)
      if (matched?.fiscalYear && matched.fiscalYear !== targetFiscalYear) {
        setTargetFiscalYear(matched.fiscalYear)
      }
    }
  }, [
    selectedLibId,
    realLibs,
    draft,
    targetFiscalYear,
    selectedActivityId,
    realLibActivities,
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Provide basic information about your project and market scoping
            period
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
              <h3 className="text-sm font-semibold mb-4">
                Representative Information
              </h3>

              {/* User Search Field */}
              <div className="mb-4 relative">
                <Label
                  htmlFor="personnelSearch"
                  className="text-sm font-medium"
                >
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
                        setSelectedLibId('')
                        form.setFieldValue('linkedLibActivityId', undefined)
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
                          setSelectedLibId('')
                          form.setFieldValue('linkedLibActivityId', undefined)
                        }}
                        className={cn(
                          'w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors',
                          selectedUser?.id === user.id && 'bg-blue-100',
                        )}
                      >
                        <div className="font-medium text-sm">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.employeeNumber} • {user.officeName}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results Message */}
                {showPersonnelDropdown &&
                  personnelSearchTerm &&
                  filteredUsers.length === 0 &&
                  !isLoadingUsers && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">
                      No users found matching "{personnelSearchTerm}"
                    </div>
                  )}
              </div>

              {/* Display Selected User Details */}
              {selectedUser && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Full Name
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {selectedUser.fullName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Employee Number
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {selectedUser.employeeNumber}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Email
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Office
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {selectedUser.officeName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Phone
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {selectedUser.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Employment Status
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {selectedUser.employmentStatus || 'N/A'}
                    </p>
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
                {(field) => <input type="hidden" value={field.state.value} />}
              </form.Field>

              <form.Field name="targetLineItemBudgetId">
                {(field) => (
                  <input type="hidden" value={field.state.value || ''} />
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
                    onClick={() => {
                      setScopingMode('lib')
                      if (!selectedLibId) {
                        const targetLib =
                          initialTargetLibId ||
                          draft?.targetLineItemBudgetId ||
                          draft?.targetLineItemBudgetActivity
                            ?.lineItemBudgetId ||
                          realLibActivities.find(
                            (a) =>
                              a.name.trim().toLowerCase() ===
                              (draft?.projectName || '').trim().toLowerCase(),
                          )?.lineItemBudgetId
                        if (targetLib) {
                          setSelectedLibId(targetLib)
                          const targetAct =
                            selectedActivityId ||
                            initialTargetActivityId ||
                            realLibActivities.find(
                              (a) =>
                                a.name.trim().toLowerCase() ===
                                (draft?.projectName || '').trim().toLowerCase(),
                            )?.id
                          if (targetAct) {
                            setSelectedActivityId(targetAct)
                          }
                          handleSelectLib(targetLib, targetAct)
                        }
                      }
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border text-left transition-all',
                      scopingMode === 'lib'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300 bg-white',
                    )}
                  >
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center',
                          scopingMode === 'lib'
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300',
                        )}
                      >
                        {scopingMode === 'lib' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      Link to Line Item Budget
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-6">
                      Connect to a Project-level or Activity-level Line Item
                      Budget to auto-fill project name & budget.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScopingMode('standalone')
                      setSelectedActivityId('')
                      form.setFieldValue('targetLineItemBudgetId', undefined)
                      form.setFieldValue('linkedLibActivityId', undefined)
                      form.setFieldValue(
                        'targetLineItemBudgetActivityId',
                        undefined,
                      )
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border text-left transition-all',
                      scopingMode === 'standalone'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300 bg-white',
                    )}
                  >
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center',
                          scopingMode === 'standalone'
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300',
                        )}
                      >
                        {scopingMode === 'standalone' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      Standalone / Pre-LIB Scoping
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-6">
                      For budget proposal preparation or ad-hoc scoping before
                      an LIB is approved.
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
                      <span className="text-xs font-semibold text-slate-700 block">
                        Office / Department Context:
                      </span>
                      {selectedUser ? (
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1.5 mt-0.5">
                          {selectedUser.officeName || 'No office assigned'}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 inline-flex items-center gap-1.5 mt-0.5">
                          Select a representative first
                        </span>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="fySelect"
                        className="text-xs font-semibold text-slate-700 block mb-1"
                      >
                        Target Fiscal Year
                      </Label>
                      <Select
                        value={targetFiscalYear}
                        onValueChange={(fy) => {
                          setTargetFiscalYear(fy)
                          setSelectedLibId('')
                          form.setFieldValue(
                            'targetLineItemBudgetId',
                            undefined,
                          )
                          form.setFieldValue('linkedLibActivityId', undefined)
                        }}
                      >
                        <SelectTrigger
                          id="fySelect"
                          className="h-8 text-xs bg-white w-32 font-medium"
                        >
                          <SelectValue placeholder="FY Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {fiscalYears.map((fy) => (
                            <SelectItem key={fy} value={fy}>
                              FY {fy}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dropdown 1: Select Approved Line Item Budget (LIB) */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="libSelect"
                      className="text-xs font-semibold text-slate-900"
                    >
                      1. Select Approved Line Item Budget (LIB) *
                    </Label>
                    <Select
                      value={selectedLibId}
                      disabled={!selectedUser}
                      onValueChange={handleSelectLib}
                    >
                      <SelectTrigger
                        id="libSelect"
                        className="bg-white text-sm"
                      >
                        <SelectValue
                          placeholder={
                            selectedUser
                              ? `Select an approved LIB for ${selectedUser.officeName || 'office'} (${targetFiscalYear})...`
                              : 'Select a representative first'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {!selectedUser ? (
                          <div className="p-3 text-xs text-slate-500 text-center">
                            Please select a representative user first to view
                            available LIBs
                          </div>
                        ) : filteredLibs.length === 0 ? (
                          <div className="p-3 text-xs text-slate-500 text-center">
                            No approved LIBs found for{' '}
                            {selectedUser.officeName || 'office'} in FY{' '}
                            {targetFiscalYear}
                          </div>
                        ) : (
                          filteredLibs.map((lib) => {
                            const isLibScoped =
                              (lib.scope === 'Project' ||
                                lib.scope === 'ProjectLevel') &&
                              scopedLibMap.has(lib.id)
                            return (
                              <SelectItem
                                key={lib.id}
                                value={lib.id}
                                disabled={isLibScoped}
                                className={cn(
                                  isLibScoped &&
                                    'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400',
                                )}
                              >
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span>{lib.title}</span>
                                  {isLibScoped && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      🔒 Already Scoped
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dropdown 2 or Project-Scope Indicator */}
                  {selectedLibId && isProjectScopeLib ? (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Project Scope Linked
                          </span>
                          <span className="text-xs text-emerald-900 font-medium">
                            Project-level Line Item Budget (no activity
                            selection required)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">
                          Budget: ₱
                          {(
                            form.getFieldValue('estimatedBudget') || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <form.Field name="linkedLibActivityId">
                      {(field) => {
                        const selectedLibActivity = availableActivities.find(
                          (a) => a.id === field.state.value,
                        )

                        return (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor={field.name}
                                className="text-xs font-semibold text-slate-900"
                              >
                                2. Select Target LIB Activity (API) *
                              </Label>
                              {selectedLibActivity && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ✓ Activity Linked
                                </span>
                              )}
                            </div>
                            <Select
                              disabled={
                                !selectedLibId && filteredLibs.length > 0
                              }
                              value={
                                field.state.value || selectedActivityId || ''
                              }
                              onValueChange={(val) => {
                                const matched = availableActivities.find(
                                  (a) => a.id === val,
                                )
                                if (matched?.isScoped) {
                                  toast.warning('Activity Already Scoped', {
                                    description:
                                      'A Market Scoping Form has already been created for this LIB Activity.',
                                  })
                                  return
                                }
                                setSelectedActivityId(val)
                                field.handleChange(val)
                                form.setFieldValue('linkedLibActivityId', val)
                                form.setFieldValue(
                                  'targetLineItemBudgetActivityId',
                                  val,
                                )
                                form.setFieldValue(
                                  'targetLineItemBudgetId',
                                  undefined,
                                )
                                if (matched) {
                                  form.setFieldValue(
                                    'projectName',
                                    matched.name,
                                  )
                                  form.setFieldValue(
                                    'estimatedBudget',
                                    matched.budget,
                                  )
                                  toast.success('LIB Activity Linked', {
                                    description: `Auto-filled Project Name ("${matched.name}") and Approved Budget (₱${matched.budget.toLocaleString()}). You can adjust these if needed.`,
                                  })
                                }
                              }}
                            >
                              <SelectTrigger
                                id={field.name}
                                className="bg-white text-sm"
                              >
                                <SelectValue
                                  placeholder={
                                    isLoadingLibActivities
                                      ? 'Loading activities...'
                                      : selectedLibId
                                        ? 'Select an activity under this LIB...'
                                        : 'Please select an LIB first'
                                  }
                                />
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
                                        isScoped &&
                                          'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400',
                                      )}
                                    >
                                      <div className="flex items-center justify-between w-full gap-2">
                                        <span>
                                          {activity.name} — ₱
                                          {activity.budget.toLocaleString()}
                                        </span>
                                        {isScoped && (
                                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            🔒{' '}
                                            {msfCode
                                              ? `Already Scoped (${msfCode})`
                                              : 'Already Scoped'}
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
                                <span className="font-bold text-emerald-700">
                                  ₱{selectedLibActivity.budget.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      }}
                    </form.Field>
                  )}
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
                        const val =
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
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
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium"
                      >
                        Period From (mm/yyyy) *
                      </Label>
                      <Popover
                        open={periodFromOpen}
                        onOpenChange={setPeriodFromOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal mt-1.5',
                              !field.state.value && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.state.value || 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3 space-y-2">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Month
                              </Label>
                              <Select
                                value={
                                  field.state.value
                                    ? field.state.value.split('/')[0]
                                    : ''
                                }
                                onValueChange={(month) => {
                                  const year =
                                    field.state.value?.split('/')[1] ||
                                    new Date().getFullYear().toString()
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem
                                      key={i}
                                      value={String(i + 1).padStart(2, '0')}
                                    >
                                      {new Date(2024, i, 1).toLocaleString(
                                        'default',
                                        { month: 'long' },
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Year
                              </Label>
                              <Select
                                value={
                                  field.state.value
                                    ? field.state.value.split('/')[1]
                                    : ''
                                }
                                onValueChange={(year) => {
                                  const month =
                                    field.state.value?.split('/')[0] || '01'
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year =
                                      new Date().getFullYear() - 2 + i
                                    return (
                                      <SelectItem
                                        key={year}
                                        value={year.toString()}
                                      >
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
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium"
                      >
                        Period To (mm/yyyy) *
                      </Label>
                      <Popover
                        open={periodToOpen}
                        onOpenChange={setPeriodToOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal mt-1.5',
                              !field.state.value && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.state.value || 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-3 space-y-2">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Month
                              </Label>
                              <Select
                                value={
                                  field.state.value
                                    ? field.state.value.split('/')[0]
                                    : ''
                                }
                                onValueChange={(month) => {
                                  const year =
                                    field.state.value?.split('/')[1] ||
                                    new Date().getFullYear().toString()
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem
                                      key={i}
                                      value={String(i + 1).padStart(2, '0')}
                                    >
                                      {new Date(2024, i, 1).toLocaleString(
                                        'default',
                                        { month: 'long' },
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">
                                Year
                              </Label>
                              <Select
                                value={
                                  field.state.value
                                    ? field.state.value.split('/')[1]
                                    : ''
                                }
                                onValueChange={(year) => {
                                  const month =
                                    field.state.value?.split('/')[0] || '01'
                                  field.handleChange(`${month}/${year}`)
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {
                                    const year =
                                      new Date().getFullYear() - 2 + i
                                    return (
                                      <SelectItem
                                        key={year}
                                        value={year.toString()}
                                      >
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
                    <Popover
                      open={expectedDeliveryDateOpen}
                      onOpenChange={setExpectedDeliveryDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal mt-1.5',
                            !field.state.value && 'text-muted-foreground',
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
                              value={
                                field.state.value
                                  ? field.state.value.split('/')[0]
                                  : ''
                              }
                              onValueChange={(month) => {
                                const year =
                                  field.state.value?.split('/')[1] ||
                                  new Date().getFullYear().toString()
                                field.handleChange(`${month}/${year}`)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem
                                    key={i}
                                    value={String(i + 1).padStart(2, '0')}
                                  >
                                    {new Date(2024, i, 1).toLocaleString(
                                      'default',
                                      { month: 'long' },
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Year</Label>
                            <Select
                              value={
                                field.state.value
                                  ? field.state.value.split('/')[1]
                                  : ''
                              }
                              onValueChange={(year) => {
                                const month =
                                  field.state.value?.split('/')[0] || '01'
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
                                    <SelectItem
                                      key={year}
                                      value={year.toString()}
                                    >
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

            <div className="flex justify-end items-center gap-3 pt-4 border-t">
              {onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onSaveDraft({
                      ...form.state.values,
                      representativeName: selectedUser?.fullName || '',
                      representativeDesignation:
                        selectedUser?.employmentStatus || '',
                      departmentUnit: selectedUser?.officeName || '',
                      agencyName: selectedUser?.officeName || '',
                      targetLineItemBudgetId:
                        scopingMode === 'lib' && isProjectScopeLib
                          ? selectedLibId
                          : undefined,
                      linkedLibActivityId:
                        scopingMode === 'lib' && !isProjectScopeLib
                          ? form.state.values.linkedLibActivityId ||
                            draft?.linkedLibActivityId ||
                            draft?.targetLineItemBudgetActivityId
                          : undefined,
                      targetLineItemBudgetActivityId:
                        scopingMode === 'lib' && !isProjectScopeLib
                          ? form.state.values.linkedLibActivityId ||
                            draft?.linkedLibActivityId ||
                            draft?.targetLineItemBudgetActivityId
                          : undefined,
                    })
                  }
                >
                  Save as Draft
                </Button>
              )}
              <Button type="submit">Next: Activities Conducted</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
