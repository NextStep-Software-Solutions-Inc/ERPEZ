import { atom } from 'jotai'
import type {
  AppMaster,
  BACWorkspace,
  PPMPData,
  SignatoryBlock,
} from './types'
import type { SupplementalMetadataFormValues } from './forms/SupplementalAPPMetadataForm'
import { MOCK_APP_LIST } from './handlers'

// Dialog States
export const createAPPDialogOpenAtom = atom(false)
export const appPreviewDialogOpenAtom = atom(false)
export const supplementalAPPDialogOpenAtom = atom(false)
export const supplementalPPMPSelectionDialogOpenAtom = atom(false)
export const appDetailsDialogOpenAtom = atom(false)
export const editAPPDialogOpenAtom = atom(false)
export const selectPPMPDialogOpenAtom = atom(false)
export const approveAPPDialogOpenAtom = atom(false)
export const rejectAPPDialogOpenAtom = atom(false)
export const publishAPPDialogOpenAtom = atom(false)
export const signatoriesDialogOpenAtom = atom(false)
export const addAPPItemDialogOpenAtom = atom(false)

// Task 2.10 & 3.10: Export and Supplemental Dialogs
export const appExportDialogOpenAtom = atom(false)
export const createSupplementalAPPDialogOpenAtom = atom(false)

// Supplemental APP Workflow States
export const supplementalMetadataAtom = atom<SupplementalMetadataFormValues | null>(null)

// APP Data States
export const selectedPPMPDataAtom = atom<PPMPData | null>(null)
export const currentAppAtom = atom<AppMaster | null>(null)
export const appListAtom = atom<AppMaster[]>(MOCK_APP_LIST as AppMaster[])
export const selectedFiscalYearAtom = atom<number | null>(null)
export const selectedAppForEditAtom = atom<AppMaster | null>(null)
export const selectedAppForApprovalAtom = atom<AppMaster | null>(null)
export const appMetadataAtom = atom<{ appName: string; appCode: string }>({
  appName: '',
  appCode: '',
})

// Form States
export const bacWorkspaceAtom = atom<BACWorkspace | null>(null)
export const signatoryBlockAtom = atom<SignatoryBlock | null>(null)

// UI States
export const bacWorkspaceTabAtom = atom<
  'checklist' | 'mop' | 'schedules' | 'strategy' | 'remarks' | 'epa'
>('checklist')
export const appListFilterAtom = atom<{
  fiscalYear: number
  status: 'all' | 'Draft' | 'For Review' | 'Approved' | 'Published'
  searchTerm: string
}>({
  fiscalYear: new Date().getFullYear(),
  status: 'all',
  searchTerm: '',
})

export const appListSortingAtom = atom({
  column: 'createdAt',
  direction: 'desc' as const,
})

export const appListPaginationAtom = atom({
  pageIndex: 0,
  pageSize: 10,
})

// Loading States
export const appCreationLoadingAtom = atom(false)
export const appExportLoadingAtom = atom(false)
export const batchDeleteLoadingAtom = atom(false)

// Selection States
export const selectedAppIdsAtom = atom<string[]>([])
