import { create } from 'zustand'
import type {
  Activity,
  ExpenditureType,
  ItemOfExpenditure,
  BudgetItem,
  ObjectGroup,
  DescriptionGroup,
  ProjectItem,
  LibVersion,
  ProjectLibVersion,
} from '../types/realignment.types'
import type { LIBDetails } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import type { OPCRDetails } from '@/features/planning/opcr'
import type { WFPDetails } from '@/components/features/planning/wfp'
import {
  currentFiscalYear,
  APPROVED_LIB_2026,
  ACTIVITIES_WFP2_2026,
  ACTIVITIES_WFP3_2026,
  APPROVED_LIB_2025,
  ACTIVITIES_WFP2_2025,
  ACTIVITIES_WFP3_2025,
  APPROVED_LIB_2024,
  ACTIVITIES_WFP2_2024,
  ACTIVITIES_WFP3_2024,
  APPROVED_OPCR_2026,
  APPROVED_OPCR_2025,
  APPROVED_OPCR_2024,
  APPROVED_PROJECT_LIB_2026,
  PROJECT_LIB_WFP2_2026,
  PROJECT_LIB_WFP3_2026,
  APPROVED_PROJECT_LIB_2025,
  PROJECT_LIB_WFP2_2025,
  PROJECT_LIB_WFP3_2025,
  APPROVED_PROJECT_LIB_2024,
  PROJECT_LIB_WFP2_2024,
  PROJECT_LIB_WFP3_2024,
} from '../constants/realignmentConstants'

export interface RealignmentState {
  // Config & Navigation
  editMode: boolean
  selectedFiscalYear: string
  selectedSource: 'all' | 'activity' | 'opcr' | 'project'
  selectedWfpId: string

  // Common UI State
  viewingVersion: number | null
  compareWithVersion: number | null
  showVersionHistory: boolean
  modificationReasonType: string
  modificationExplanation: string
  showReasonDialog: boolean
  showSubmitDialog: boolean
  submissionStatus: 'draft' | 'submitted'
  editingItemId: string | null
  editingItemBackup: ProjectItem | BudgetItem | null

  // Activity-Level Data
  activitiesByWfpYear: Record<string, Record<string, Activity[]>>
  opcrActivitiesByYear: Record<string, Activity[]>
  activitiesVersions: Record<string, Record<string, LibVersion[]>>
  opcrVersions: Record<string, LibVersion[]>

  // Project-Level Data
  projectGroupsByWfpYear: Record<string, Record<string, ObjectGroup[]>>
  projectVersions: Record<string, Record<string, ProjectLibVersion[]>>
  viewingProjectVersion: number | null
  compareWithProjectVersion: number | null

  // Active dynamically-fetched accounts
  activities: Activity[]
  projectGroups: ObjectGroup[]
  activeLibId: string | null
  activeLib: LIBDetails | null
  activeOpcrData: OPCRDetails | null
  activeWfpData: WFPDetails | null

  // Pending creation/deletion queues
  pendingLIBActivityCreations: Array<{
    tempId: string
    lineItemBudgetId: string
    wfpObjectiveActivityId?: string
    opcrActivityId?: string
    name: string
  }>
  pendingLineItemCreations: Array<{
    tempId: string
    libId: string
    libActivityId?: string
    objectId: string
    description?: string
    unitQuantity?: number
    unitCost?: number
    startDate: string
    endDate: string
    timelineType: string
    budget: number
  }>
  pendingOPCRLineItemCreations: Array<{
    tempId: string
    libId: string
    libActivityId: string
    objectId: string
    description: string
    timelineType: string
    periods: Array<{
      period: string
      budget: number
      startDate: string
      endDate: string
    }>
  }>


  // Actions
  setEditMode: (mode: boolean) => void
  setSelectedFiscalYear: (year: string) => void
  setSelectedSource: (source: 'all' | 'activity' | 'opcr' | 'project') => void
  setSelectedWfpId: (wfpId: string) => void
  setViewingVersion: (version: number | null) => void
  setCompareWithVersion: (version: number | null) => void
  setShowVersionHistory: (show: boolean) => void
  setModificationReasonType: (type: string) => void
  setModificationExplanation: (explanation: string) => void
  setShowReasonDialog: (show: boolean) => void
  setShowSubmitDialog: (show: boolean) => void
  setSubmissionStatus: (status: 'draft' | 'submitted') => void
  setEditingItemId: (id: string | null) => void
  setEditingItemBackup: (backup: ProjectItem | BudgetItem | null) => void

  // Active accounts actions
  setActiveLibId: (id: string | null) => void
  setActiveLib: (lib: LIBDetails | null) => void
  setActiveOpcrData: (data: OPCRDetails | null) => void
  setActiveWfpData: (data: WFPDetails | null) => void
  setActivitiesList: (activities: Activity[]) => void
  setProjectGroupsList: (groups: ObjectGroup[]) => void

  // Queue Actions
  addPendingLIBActivity: (activity: {
    lineItemBudgetId: string
    wfpObjectiveActivityId?: string
    opcrActivityId?: string
    name: string
  }) => void
  addPendingLineItem: (item: {
    libId: string
    libActivityId?: string
    objectId: string
    description?: string
    unitQuantity?: number
    unitCost?: number
    startDate: string
    endDate: string
    timelineType: string
    budget: number
  }) => void
  addPendingOPCRLineItem: (item: {
    libId: string
    libActivityId: string
    objectId: string
    description: string
    timelineType: string
    periods: Array<{
      period: string
      budget: number
      startDate: string
      endDate: string
    }>
  }) => void
  clearPendingQueues: () => void

  // Setters/Updaters
  setActivities: (updater: Activity[] | ((prev: Activity[]) => Activity[])) => void
  setProjectGroups: (updater: ObjectGroup[] | ((prev: ObjectGroup[]) => ObjectGroup[])) => void
  setActivitiesVersions: (
    updater:
      | Record<string, Record<string, LibVersion[]>>
      | ((
        prev: Record<string, Record<string, LibVersion[]>>,
      ) => Record<string, Record<string, LibVersion[]>>),
  ) => void
  setOpcrVersions: (
    updater:
      | Record<string, LibVersion[]>
      | ((prev: Record<string, LibVersion[]>) => Record<string, LibVersion[]>),
  ) => void
  setProjectVersions: (
    updater:
      | Record<string, Record<string, ProjectLibVersion[]>>
      | ((
        prev: Record<string, Record<string, ProjectLibVersion[]>>,
      ) => Record<string, Record<string, ProjectLibVersion[]>>),
  ) => void

  // Operations - Activity
  handleStartItemEdit: (id: string, item: ProjectItem | BudgetItem) => void
  handleSaveItemEdit: () => void
  handleCancelItemEdit: () => void

  handleAddActivity: (name: string, opcrActivityId?: string) => void
  handleAddExpType: (activityId: string, type: 'PS' | 'MOOE' | 'CO') => void
  handleAddItemOfExpenditure: (activityId: string, expTypeId: string, name: string) => void
  handleAddBudgetItem: (
    activityId: string,
    expTypeId: string,
    itemId: string,
    budgetItem: Omit<BudgetItem, 'total'>,
  ) => void
  handleUpdateBudgetItem: (
    activityId: string,
    expTypeId: string,
    itemId: string,
    budgetItemId: string,
    field: 'q1' | 'q2' | 'q3' | 'q4' | 'description',
    value: string | number,
  ) => void
  handleDeleteBudgetItem: (activityId: string, expTypeId: string, itemId: string, budgetItemId: string) => void

  // Operations - Project
  handleAddObjectGroup: (allotmentClass: 'PS' | 'MOOE' | 'CO', name: string) => void
  handleAddDescGroup: (objectId: string, description: string) => void
  handleAddProjectItem: (objectId: string, descGroupId: string, item: Omit<ProjectItem, 'budget'>) => void
  handleUpdateProjectItem: (
    objectId: string,
    descGroupId: string,
    itemId: string,
    field: keyof Omit<ProjectItem, 'id' | 'budget'>,
    value: string | number,
  ) => void
  handleDeleteProjectItem: (objectId: string, descGroupId: string, itemId: string) => void

  // Version Operations
  handleSaveModifications: (toastCallback: (msg: { title: string; description: string }) => void) => void
  handleConfirmSubmitForApproval: (toastCallback: (msg: { title: string; description: string }) => void) => void
}

export const useRealignmentStore = create<RealignmentState>((set, get) => ({
  // Initial states
  editMode: false,
  selectedFiscalYear: currentFiscalYear,
  selectedSource: 'activity',
  selectedWfpId: 'wfp-1',

  viewingVersion: null,
  compareWithVersion: null,
  showVersionHistory: false,
  modificationReasonType: '',
  modificationExplanation: '',
  showReasonDialog: false,
  showSubmitDialog: false,
  submissionStatus: 'draft',
  editingItemId: null,
  editingItemBackup: null,

  activitiesByWfpYear: {
    '2026': {
      'wfp-1': APPROVED_LIB_2026,
      'wfp-2': ACTIVITIES_WFP2_2026,
      'wfp-3': ACTIVITIES_WFP3_2026,
    },
    '2025': {
      'wfp-1': APPROVED_LIB_2025,
      'wfp-2': ACTIVITIES_WFP2_2025,
      'wfp-3': ACTIVITIES_WFP3_2025,
    },
    '2024': {
      'wfp-1': APPROVED_LIB_2024,
      'wfp-2': ACTIVITIES_WFP2_2024,
      'wfp-3': ACTIVITIES_WFP3_2024,
    },
  },

  opcrActivitiesByYear: {
    '2026': APPROVED_OPCR_2026,
    '2025': APPROVED_OPCR_2025,
    '2024': APPROVED_OPCR_2024,
  },

  activitiesVersions: {
    '2026': {
      'wfp-1': [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          reason: 'Initial approved LIB for FY 2026',
          modifiedBy: 'Budget Committee',
          activities: APPROVED_LIB_2026,
          approved: true,
        },
      ],
      'wfp-2': [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          reason: 'Initial approved WFP Phase 2',
          modifiedBy: 'Budget Committee',
          activities: ACTIVITIES_WFP2_2026,
          approved: true,
        },
      ],
      'wfp-3': [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          reason: 'Initial approved WFP Phase 3',
          modifiedBy: 'Budget Committee',
          activities: ACTIVITIES_WFP3_2026,
          approved: true,
        },
      ],
    },
    '2025': {
      'wfp-1': [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          reason: 'Initial approved LIB for FY 2025',
          modifiedBy: 'Budget Committee',
          activities: APPROVED_LIB_2025,
          approved: true,
        },
      ],
    },
  },

  opcrVersions: {
    '2026': [
      {
        version: 1,
        timestamp: new Date().toISOString(),
        reason: 'Initial approved OPCR for FY 2026',
        modifiedBy: 'OPCR Admin',
        activities: APPROVED_OPCR_2026,
        approved: true,
      },
    ],
  },

  projectGroupsByWfpYear: {
    '2026': {
      'wfp-1': APPROVED_PROJECT_LIB_2026,
      'wfp-2': PROJECT_LIB_WFP2_2026,
      'wfp-3': PROJECT_LIB_WFP3_2026,
    },
    '2025': {
      'wfp-1': APPROVED_PROJECT_LIB_2025,
      'wfp-2': PROJECT_LIB_WFP2_2025,
      'wfp-3': PROJECT_LIB_WFP3_2025,
    },
    '2024': {
      'wfp-1': APPROVED_PROJECT_LIB_2024,
      'wfp-2': PROJECT_LIB_WFP2_2024,
      'wfp-3': PROJECT_LIB_WFP3_2024,
    },
  },

  projectVersions: {
    '2026': {
      'wfp-1': [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          reason: 'Initial approved project LIB for FY 2026',
          modifiedBy: 'Budget Committee',
          objectGroups: APPROVED_PROJECT_LIB_2026,
          approved: true,
        },
      ],
    },
  },

  viewingProjectVersion: null,
  compareWithProjectVersion: null,

  // Active dynamically-fetched accounts
  activities: [],
  projectGroups: [],
  activeLibId: null,
  activeLib: null,
  activeOpcrData: null,
  activeWfpData: null,

  // Pending creation/deletion queues
  pendingLIBActivityCreations: [],
  pendingLineItemCreations: [],
  pendingOPCRLineItemCreations: [],

  // Actions
  setEditMode: (mode) => set({ editMode: mode }),
  setSelectedFiscalYear: (year) => set({ selectedFiscalYear: year }),
  setSelectedSource: (source) => set({ selectedSource: source }),
  setSelectedWfpId: (wfpId) => set({ selectedWfpId: wfpId }),
  setViewingVersion: (version) => set({ viewingVersion: version }),
  setCompareWithVersion: (version) => set({ compareWithVersion: version }),
  setShowVersionHistory: (show) => set({ showVersionHistory: show }),
  setModificationReasonType: (type) => set({ modificationReasonType: type }),
  setModificationExplanation: (explanation) => set({ modificationExplanation: explanation }),
  setShowReasonDialog: (show) => set({ showReasonDialog: show }),
  setShowSubmitDialog: (show) => set({ showSubmitDialog: show }),
  setSubmissionStatus: (status) => set({ submissionStatus: status }),
  setEditingItemId: (id) => set({ editingItemId: id }),
  setEditingItemBackup: (backup) => set({ editingItemBackup: backup }),

  setActiveLibId: (id) => set({ activeLibId: id }),
  setActiveLib: (lib) => set({ activeLib: lib }),
  setActiveOpcrData: (data) => set({ activeOpcrData: data }),
  setActiveWfpData: (data) => set({ activeWfpData: data }),
  setActivitiesList: (activities) => set({ activities }),
  setProjectGroupsList: (groups) => set({ projectGroups: groups }),

  addPendingLIBActivity: (activity) => {
    const tempId = `temp_act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newAct: Activity = {
      id: tempId,
      name: activity.name,
      expenditureTypes: [],
    }
    set((state) => ({
      activities: [...state.activities, newAct],
      pendingLIBActivityCreations: [
        ...state.pendingLIBActivityCreations,
        { tempId, ...activity },
      ],
    }))
  },

  addPendingLineItem: (item) => {
    const tempId = `temp_li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Determine if it is Project-scoped or Activity-scoped
    if (item.libActivityId) {
      // Activity level
      // Guess allotment class (PS, MOOE, CO) from objectId or default to MOOE
      // The parent objects list: Personnel Services starts with 019f... we can fallback or inspect code. Let's default to MOOE if unknown.
      let allotmentClass: 'PS' | 'MOOE' | 'CO' = 'MOOE'
      // Try to determine allotmentClass from UI logic or set as MOOE

      const newBudgetItem: BudgetItem = {
        id: tempId,
        description: item.description || 'New Item',
        q1: item.timelineType === 'quarterly' ? item.budget / 4 : 0,
        q2: item.timelineType === 'quarterly' ? item.budget / 4 : 0,
        q3: item.timelineType === 'quarterly' ? item.budget / 4 : 0,
        q4: item.timelineType === 'quarterly' ? item.budget / 4 : 0,
        total: item.budget,
      }

      set((state) => ({
        pendingLineItemCreations: [
          ...state.pendingLineItemCreations,
          { tempId, ...item },
        ],
        activities: state.activities.map((act) => {
          if (act.id !== item.libActivityId) return act

          // Find or create expenditureType
          const hasExpType = act.expenditureTypes.some((et) => et.type === allotmentClass)
          let updatedExpTypes = [...act.expenditureTypes]
          if (!hasExpType) {
            updatedExpTypes.push({
              id: `temp_et_${Date.now()}`,
              name: 'Maintenance & Other Operating Expenses (MOOE)',
              type: allotmentClass,
              itemsOfExpenditure: [],
            })
          }

          updatedExpTypes = updatedExpTypes.map((et) => {
            if (et.type !== allotmentClass) return et

            // Find or create itemOfExpenditure (for objectId)
            const hasIoe = et.itemsOfExpenditure.some((ioe) => ioe.id === item.objectId)
            let updatedIoe = [...et.itemsOfExpenditure]
            if (!hasIoe) {
              updatedIoe.push({
                id: item.objectId,
                name: item.description || 'Item of Expenditure',
                items: [],
              })
            }

            updatedIoe = updatedIoe.map((ioe) => {
              if (ioe.id !== item.objectId) return ioe
              return {
                ...ioe,
                items: [...ioe.items, newBudgetItem],
              }
            })

            return {
              ...et,
              itemsOfExpenditure: updatedIoe,
            }
          })

          return {
            ...act,
            expenditureTypes: updatedExpTypes,
          }
        }),
      }))
    } else {
      // Project level
      const newProjectItem: ProjectItem = {
        id: tempId,
        qty: item.unitQuantity || 1,
        unitCost: item.unitCost || item.budget,
        timelineType: item.timelineType as 'PERIOD' | 'ONGOING',
        startDate: item.startDate,
        endDate: item.endDate,
        budget: item.budget,
        description: item.description || 'New Project Item',
      }

      set((state) => ({
        pendingLineItemCreations: [
          ...state.pendingLineItemCreations,
          { tempId, ...item },
        ],
        projectGroups: state.projectGroups.map((og) => {
          if (og.id !== item.objectId) return og

          // Find or create description group by description
          const descMatch = og.descriptionGroups.find((dg) => dg.description === item.description)
          let updatedDg = [...og.descriptionGroups]
          if (!descMatch) {
            updatedDg.push({
              id: `temp_dg_${Date.now()}`,
              description: item.description || 'General Description',
              items: [],
            })
          }

          updatedDg = updatedDg.map((dg) => {
            if (dg.description !== (item.description || 'General Description')) return dg
            return {
              ...dg,
              items: [...dg.items, newProjectItem],
            }
          })

          return {
            ...og,
            descriptionGroups: updatedDg,
          }
        }),
      }))
    }
  },

  addPendingOPCRLineItem: (item) => {
    const tempId = `temp_li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const q1 = item.periods.find((p) => p.period?.toLowerCase() === 'q1' || p.period?.toLowerCase().includes('quarter 1'))?.budget || 0
    const q2 = item.periods.find((p) => p.period?.toLowerCase() === 'q2' || p.period?.toLowerCase().includes('quarter 2'))?.budget || 0
    const q3 = item.periods.find((p) => p.period?.toLowerCase() === 'q3' || p.period?.toLowerCase().includes('quarter 3'))?.budget || 0
    const q4 = item.periods.find((p) => p.period?.toLowerCase() === 'q4' || p.period?.toLowerCase().includes('quarter 4'))?.budget || 0
    const total = q1 + q2 + q3 + q4

    const newBudgetItem: BudgetItem = {
      id: tempId,
      description: item.description,
      q1,
      q2,
      q3,
      q4,
      total,
    }

    set((state) => ({
      pendingOPCRLineItemCreations: [
        ...state.pendingOPCRLineItemCreations,
        { tempId, ...item },
      ],
      activities: state.activities.map((act) => {
        if (act.id !== item.libActivityId) return act

        let allotmentClass: 'PS' | 'MOOE' | 'CO' = 'MOOE'

        // Find or create expenditureType
        const hasExpType = act.expenditureTypes.some((et) => et.type === allotmentClass)
        let updatedExpTypes = [...act.expenditureTypes]
        if (!hasExpType) {
          updatedExpTypes.push({
            id: `temp_et_${Date.now()}`,
            name: 'Maintenance & Other Operating Expenses (MOOE)',
            type: allotmentClass,
            itemsOfExpenditure: [],
          })
        }

        updatedExpTypes = updatedExpTypes.map((et) => {
          if (et.type !== allotmentClass) return et

          // Find or create itemOfExpenditure
          const hasIoe = et.itemsOfExpenditure.some((ioe) => ioe.id === item.objectId)
          let updatedIoe = [...et.itemsOfExpenditure]
          if (!hasIoe) {
            updatedIoe.push({
              id: item.objectId,
              name: item.description || 'Item of Expenditure',
              items: [],
            })
          }

          updatedIoe = updatedIoe.map((ioe) => {
            if (ioe.id !== item.objectId) return ioe
            return {
              ...ioe,
              items: [...ioe.items, newBudgetItem],
            }
          })

          return {
            ...et,
            itemsOfExpenditure: updatedIoe,
          }
        })

        return {
          ...act,
          expenditureTypes: updatedExpTypes,
        }
      }),
    }))
  },

  clearPendingQueues: () =>
    set({
      pendingLIBActivityCreations: [],
      pendingLineItemCreations: [],
      pendingOPCRLineItemCreations: [],
    }),

  setActivities: (updater) => {
    const { activeLibId } = get()
    if (activeLibId !== null) {
      set((state) => ({
        activities: typeof updater === 'function' ? updater(state.activities) : updater,
      }))
      return
    }

    const { selectedSource, selectedFiscalYear, selectedWfpId } = get()
    const runUpdater = (prev: Activity[]) =>
      typeof updater === 'function' ? updater(prev) : updater

    if (selectedSource === 'opcr') {
      set((state) => ({
        opcrActivitiesByYear: {
          ...state.opcrActivitiesByYear,
          [selectedFiscalYear]: runUpdater(state.opcrActivitiesByYear[selectedFiscalYear] || []),
        },
      }))
    } else {
      set((state) => {
        const yearData = state.activitiesByWfpYear[selectedFiscalYear] || {}
        const wfpData = yearData[selectedWfpId] || []
        return {
          activitiesByWfpYear: {
            ...state.activitiesByWfpYear,
            [selectedFiscalYear]: {
              ...yearData,
              [selectedWfpId]: runUpdater(wfpData),
            },
          },
        }
      })
    }
  },

  setProjectGroups: (updater) => {
    const { activeLibId } = get()
    if (activeLibId !== null) {
      set((state) => ({
        projectGroups: typeof updater === 'function' ? updater(state.projectGroups) : updater,
      }))
      return
    }

    const { selectedFiscalYear, selectedWfpId } = get()
    const runUpdater = (prev: ObjectGroup[]) =>
      typeof updater === 'function' ? updater(prev) : updater

    set((state) => {
      const yearData = state.projectGroupsByWfpYear[selectedFiscalYear] || {}
      const wfpData = yearData[selectedWfpId] || []
      return {
        projectGroupsByWfpYear: {
          ...state.projectGroupsByWfpYear,
          [selectedFiscalYear]: {
            ...yearData,
            [selectedWfpId]: runUpdater(wfpData),
          },
        },
      }
    })
  },

  setActivitiesVersions: (updater) => {
    set((state) => ({
      activitiesVersions:
        typeof updater === 'function'
          ? updater(state.activitiesVersions)
          : updater,
    }))
  },

  setOpcrVersions: (updater) => {
    set((state) => ({
      opcrVersions:
        typeof updater === 'function' ? updater(state.opcrVersions) : updater,
    }))
  },

  setProjectVersions: (updater) => {
    set((state) => ({
      projectVersions:
        typeof updater === 'function'
          ? updater(state.projectVersions)
          : updater,
    }))
  },

  handleStartItemEdit: (id, item) => set({ editingItemId: id, editingItemBackup: { ...item } }),
  handleSaveItemEdit: () => set({ editingItemId: null, editingItemBackup: null }),
  handleCancelItemEdit: () => {
    const { editingItemId, editingItemBackup, selectedSource } = get()
    if (!editingItemId || !editingItemBackup) return

    if (selectedSource === 'project') {
      // Revert project item changes
      // This is handled reactively by dialog cancel or parent
      set({ editingItemId: null, editingItemBackup: null })
    } else {
      // Revert activity item changes
      set({ editingItemId: null, editingItemBackup: null })
    }
  },

  handleAddActivity: (name, opcrActivityId) => {
    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      name,
      expenditureTypes: [],
    }
    get().setActivities((prev) => [...prev, newAct])
  },

  handleAddExpType: (activityId, type) => {
    get().setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act
        const exists = act.expenditureTypes.some((e) => e.type === type)
        if (exists) return act
        const newExp: ExpenditureType = {
          id: `EXP-${Date.now()}`,
          name:
            type === 'PS'
              ? 'Personnel Services (PS)'
              : type === 'CO'
                ? 'Capital Outlay (CO)'
                : 'Maintenance & Other Operating Expenses (MOOE)',
          type,
          itemsOfExpenditure: [],
        }
        return {
          ...act,
          expenditureTypes: [...act.expenditureTypes, newExp],
        }
      }),
    )
  },

  handleAddItemOfExpenditure: (activityId, expTypeId, name) => {
    get().setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act
        return {
          ...act,
          expenditureTypes: act.expenditureTypes.map((exp) => {
            if (exp.id !== expTypeId) return exp
            const newIoe: ItemOfExpenditure = {
              id: `ITEM-${Date.now()}`,
              name,
              items: [],
            }
            return {
              ...exp,
              itemsOfExpenditure: [...exp.itemsOfExpenditure, newIoe],
            }
          }),
        }
      }),
    )
  },

  handleAddBudgetItem: (activityId, expTypeId, itemId, budgetItem) => {
    get().setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act
        return {
          ...act,
          expenditureTypes: act.expenditureTypes.map((exp) => {
            if (exp.id !== expTypeId) return exp
            return {
              ...exp,
              itemsOfExpenditure: exp.itemsOfExpenditure.map((ioe) => {
                if (ioe.id !== itemId) return ioe
                const total =
                  (budgetItem.q1 || 0) +
                  (budgetItem.q2 || 0) +
                  (budgetItem.q3 || 0) +
                  (budgetItem.q4 || 0)
                const newBud: BudgetItem = {
                  ...budgetItem,
                  id: `BUD-${Date.now()}`,
                  total,
                }
                return {
                  ...ioe,
                  items: [...ioe.items, newBud],
                }
              }),
            }
          }),
        }
      }),
    )
  },

  handleUpdateBudgetItem: (activityId, expTypeId, itemId, budgetItemId, field, value) => {
    get().setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act
        return {
          ...act,
          expenditureTypes: act.expenditureTypes.map((exp) => {
            if (exp.id !== expTypeId) return exp
            return {
              ...exp,
              itemsOfExpenditure: exp.itemsOfExpenditure.map((ioe) => {
                if (ioe.id !== itemId) return ioe
                return {
                  ...ioe,
                  items: ioe.items.map((bud) => {
                    if (bud.id !== budgetItemId) return bud
                    if (field === 'description') {
                      return {
                        ...bud,
                        description: value as string,
                      }
                    }
                    const updated = {
                      ...bud,
                      [field]: Number(value) || 0,
                    }
                    updated.total = updated.q1 + updated.q2 + updated.q3 + updated.q4
                    return updated
                  }),
                }
              }),
            }
          }),
        }
      }),
    )
  },

  handleDeleteBudgetItem: (activityId, expTypeId, itemId, budgetItemId) => {
    get().setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act
        return {
          ...act,
          expenditureTypes: act.expenditureTypes.map((exp) => {
            if (exp.id !== expTypeId) return exp
            return {
              ...exp,
              itemsOfExpenditure: exp.itemsOfExpenditure.map((ioe) => {
                if (ioe.id !== itemId) return ioe
                return {
                  ...ioe,
                  items: ioe.items.map((bud) => {
                    if (bud.id !== budgetItemId) return bud
                    return { ...bud, isDeleted: true }
                  }),
                }
              }),
            }
          }),
        }
      }),
    )
  },

  handleAddObjectGroup: (allotmentClass, name) => {
    const codeMap = { PS: '01', MOOE: '02', CO: '03' }
    const newGroup: ObjectGroup = {
      id: `OBJ-${Date.now()}`,
      name,
      code: codeMap[allotmentClass],
      descriptionGroups: [],
    }
    get().setProjectGroups((prev) => [...prev, newGroup])
  },

  handleAddDescGroup: (objectId, description) => {
    get().setProjectGroups((prev) =>
      prev.map((obj) => {
        if (obj.id !== objectId) return obj
        const newDg: DescriptionGroup = {
          id: `DG-${Date.now()}`,
          description,
          items: [],
        }
        return {
          ...obj,
          descriptionGroups: [...obj.descriptionGroups, newDg],
        }
      }),
    )
  },

  handleAddProjectItem: (objectId, descGroupId, item) => {
    get().setProjectGroups((prev) =>
      prev.map((obj) => {
        if (obj.id !== objectId) return obj
        return {
          ...obj,
          descriptionGroups: obj.descriptionGroups.map((dg) => {
            if (dg.id !== descGroupId) return dg
            const budget = item.qty * item.unitCost
            const newPi: ProjectItem = {
              ...item,
              id: `PI-${Date.now()}`,
              budget,
            }
            return {
              ...dg,
              items: [...dg.items, newPi],
            }
          }),
        }
      }),
    )
  },

  handleUpdateProjectItem: (objectId, descGroupId, itemId, field, value) => {
    get().setProjectGroups((prev) =>
      prev.map((obj) => {
        if (obj.id !== objectId) return obj
        return {
          ...obj,
          descriptionGroups: obj.descriptionGroups.map((dg) => {
            if (dg.id !== descGroupId) return dg
            return {
              ...dg,
              items: dg.items.map((pi) => {
                if (pi.id !== itemId) return pi
                const updated = {
                  ...pi,
                  [field]: value,
                } as ProjectItem
                updated.budget = updated.qty * updated.unitCost
                return updated
              }),
            }
          }),
        }
      }),
    )
  },

  handleDeleteProjectItem: (objectId, descGroupId, itemId) => {
    get().setProjectGroups((prev) =>
      prev.map((obj) => {
        if (obj.id !== objectId) return obj
        return {
          ...obj,
          descriptionGroups: obj.descriptionGroups.map((dg) => {
            if (dg.id !== descGroupId) return dg
            return {
              ...dg,
              items: dg.items.map((pi) => {
                if (pi.id !== itemId) return pi
                return { ...pi, isDeleted: true }
              }),
            }
          }),
        }
      }),
    )
  },

  handleSaveModifications: (toastCallback) => {
    const {
      selectedSource,
      selectedFiscalYear,
      selectedWfpId,
      modificationReasonType,
      modificationExplanation,
      projectGroupsByWfpYear,
      activitiesByWfpYear,
      opcrActivitiesByYear,
    } = get()

    const fullReason = `${modificationReasonType}\n\nExplanation: ${modificationExplanation}`

    if (selectedSource === 'project') {
      const currentGroups = projectGroupsByWfpYear[selectedFiscalYear]?.[selectedWfpId] || []
      set((state) => {
        const yearVersions = state.projectVersions[selectedFiscalYear] || {}
        const list = yearVersions[selectedWfpId] || []
        const newVersion: ProjectLibVersion = {
          version: list.length + 1,
          timestamp: new Date().toISOString(),
          reason: fullReason,
          modifiedBy: 'Current User',
          objectGroups: JSON.parse(JSON.stringify(currentGroups)),
        }
        return {
          projectVersions: {
            ...state.projectVersions,
            [selectedFiscalYear]: {
              ...yearVersions,
              [selectedWfpId]: [...list, newVersion],
            },
          },
          editMode: false,
          modificationReasonType: '',
          modificationExplanation: '',
          viewingProjectVersion: null,
        }
      })
    } else if (selectedSource === 'opcr') {
      const currentActs = opcrActivitiesByYear[selectedFiscalYear] || []
      set((state) => {
        const list = state.opcrVersions[selectedFiscalYear] || []
        const newVersion: LibVersion = {
          version: list.length + 1,
          timestamp: new Date().toISOString(),
          reason: fullReason,
          modifiedBy: 'Current User',
          activities: JSON.parse(JSON.stringify(currentActs)),
        }
        return {
          opcrVersions: {
            ...state.opcrVersions,
            [selectedFiscalYear]: [...list, newVersion],
          },
          editMode: false,
          modificationReasonType: '',
          modificationExplanation: '',
          viewingVersion: null,
        }
      })
    } else {
      const currentActs = activitiesByWfpYear[selectedFiscalYear]?.[selectedWfpId] || []
      set((state) => {
        const yearVersions = state.activitiesVersions[selectedFiscalYear] || {}
        const list = yearVersions[selectedWfpId] || []
        const newVersion: LibVersion = {
          version: list.length + 1,
          timestamp: new Date().toISOString(),
          reason: fullReason,
          modifiedBy: 'Current User',
          activities: JSON.parse(JSON.stringify(currentActs)),
        }
        return {
          activitiesVersions: {
            ...state.activitiesVersions,
            [selectedFiscalYear]: {
              ...yearVersions,
              [selectedWfpId]: [...list, newVersion],
            },
          },
          editMode: false,
          modificationReasonType: '',
          modificationExplanation: '',
          viewingVersion: null,
        }
      })
    }

    toastCallback({
      title: 'Success',
      description: 'Budget modifications saved successfully.',
    })
  },

  handleConfirmSubmitForApproval: (toastCallback) => {
    set({ submissionStatus: 'submitted' })
    toastCallback({
      title: 'Submitted',
      description: 'Budget modifications submitted for review.',
    })
  },
}))
