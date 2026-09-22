"use client"

import * as React from 'react'
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table'

import {
  Building,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
  FileText,
  FileCheck,
  ShieldCheck,
  ShoppingCart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  X,
  Inbox,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

import { CreateDirectContractingModal } from '../components/CreateDirectContractingModal'
import { UpdateDirectContractingModal } from '../components/UpdateDirectContractingModal'
import { ViewProposalDetailsModal } from '../components/ViewProposalDetailsModal'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getDirectContractingsRequest } from '../handlers/getDirectContractingsRequest'
import { formatCurrencyPHP, formatDateV2 } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import type { DirectContracting as BaseDirectContracting } from '../store/directContractingStore'

const useDirectContractings = createQueryHookFromTemplate(getDirectContractingsRequest)

export type DirectContractingRecord = BaseDirectContracting & {
  name?: string
  bacProjectId?: string
  bacProjectTitle?: string
  exclusiveSupplierId?: string
  exclusiveSupplierName?: string
  exclusiveSupplierEmail?: string
  exclusiveSupplierContact?: string
  exclusiveSupplierPhilGEPS?: string
  submissionDeadline?: string
}

// TanStack Table v9 Feature registration
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
})

const columnHelper = createColumnHelper<typeof features, DirectContractingRecord>()

// Initial rich procurement mock data adhering to RA 12009 (New Government Procurement Act - Rule XVI)
const INITIAL_MOCK_DATA: DirectContractingRecord[] = [
  {
    id: 'dc-001',
    dcNumber: 'DC-2026-0001',
    name: 'Annual Preventive Maintenance & OEM Calibration for Siemens SOMATOM CT Scanner',
    dcName: 'Annual Preventive Maintenance & OEM Calibration for Siemens SOMATOM CT Scanner',
    bacProjectId: 'bac-proj-101',
    bacProjectTitle: 'BAC-RES-2026-0042 (Radiology Dept)',
    bacResolutionNumber: 'BAC-RES-2026-0042',
    prNumber: 'PR-2026-01-0089',
    office: 'Department of Radiology & Medical Imaging',
    category: 'Medical Equipment Maintenance',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 3850000.0,
    proposalAmount: 3720000.0,
    exclusiveSupplierId: 'supp-001',
    exclusiveSupplierName: 'Siemens Healthcare Inc.',
    supplierName: 'Siemens Healthcare Inc.',
    exclusiveSupplierEmail: 'contact.ph@siemens-healthineers.com',
    exclusiveSupplierContact: '+63 (2) 8814-9888',
    exclusiveSupplierPhilGEPS: '2019-109283 (Platinum)',
    submissionDeadline: '2026-10-15T17:00:00.000Z',
    deadline: '2026-10-15T17:00:00.000Z',
    status: 'for-review',
    remarks: 'Patent certification and exclusive distributor agreement verified by TWG.',
    createdBy: 'Engr. Rafael Mendoza',
    createdAt: '2026-09-10T08:30:00.000Z',
    exclusivityProofFileName: 'Siemens_Sole_Distributor_Certificate_2026.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    soleDistCertFileName: 'ISO_Calibration_Exclusive_Auth.pdf',
    soleDistCertUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'dc-002',
    dcNumber: 'DC-2026-0002',
    name: 'Proprietary Reagents & Consumables for Roche Cobas 6000 Analyzer',
    dcName: 'Proprietary Reagents & Consumables for Roche Cobas 6000 Analyzer',
    bacProjectId: 'bac-proj-102',
    bacProjectTitle: 'BAC-RES-2026-0078 (Clinical Lab)',
    bacResolutionNumber: 'BAC-RES-2026-0078',
    prNumber: 'PR-2026-02-0145',
    office: 'Clinical Chemistry Laboratory',
    category: 'Laboratory Supplies',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 2150000.0,
    proposalAmount: 2100000.0,
    exclusiveSupplierId: 'supp-002',
    exclusiveSupplierName: 'Roche Philippines Inc.',
    supplierName: 'Roche Philippines Inc.',
    exclusiveSupplierEmail: 'orders.ph@roche.com',
    exclusiveSupplierContact: '+63 (2) 8893-4567',
    exclusiveSupplierPhilGEPS: '2018-048291 (Platinum)',
    submissionDeadline: '2026-10-22T17:00:00.000Z',
    deadline: '2026-10-22T17:00:00.000Z',
    status: 'submitted-to-supplier',
    remarks: 'Reagents are closed-system and proprietary to the Cobas 6000 platform.',
    createdBy: 'Dr. Carmela Santos',
    createdAt: '2026-09-12T09:15:00.000Z',
    exclusivityProofFileName: 'Roche_Closed_System_Exclusivity_Affidavit.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'dc-003',
    dcNumber: 'DC-2026-0003',
    name: 'Oracle Exadata Cloud@Customer Software License & Enterprise Support Renewal',
    dcName: 'Oracle Exadata Cloud@Customer Software License & Enterprise Support Renewal',
    bacProjectId: 'bac-proj-103',
    bacProjectTitle: 'BAC-RES-2026-0112 (MIS Division)',
    bacResolutionNumber: 'BAC-RES-2026-0112',
    prNumber: 'PR-2026-02-0201',
    office: 'Management Information Systems Division',
    category: 'IT & Software Licenses',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 8750000.0,
    proposalAmount: 8500000.0,
    exclusiveSupplierId: 'supp-003',
    exclusiveSupplierName: 'Oracle Software (Philippines) Corp.',
    supplierName: 'Oracle Software (Philippines) Corp.',
    exclusiveSupplierEmail: 'gov-sales@oracle.com',
    exclusiveSupplierContact: '+63 (2) 7976-8000',
    exclusiveSupplierPhilGEPS: '2017-003921 (Platinum)',
    submissionDeadline: '2026-11-05T17:00:00.000Z',
    deadline: '2026-11-05T17:00:00.000Z',
    status: 'approved',
    remarks: 'Sole copyright holder of proprietary RDBMS and Exadata firmware.',
    createdBy: 'Mark Anthony Reyes',
    createdAt: '2026-08-25T14:00:00.000Z',
    approvedBy: 'BAC Chairperson - Dir. Elena Cruz',
    approvedAt: '2026-09-18T16:00:00.000Z',
    approvalDocumentFileName: 'BAC_Resolution_DirectContracting_Approved.pdf',
    approvalDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    exclusivityProofFileName: 'Oracle_Sole_Proprietorship_IP_Cert.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'dc-004',
    dcNumber: 'DC-2026-0004',
    name: 'OEM Replacement Parts for GE Healthcare Optima XR646 X-Ray Generator',
    dcName: 'OEM Replacement Parts for GE Healthcare Optima XR646 X-Ray Generator',
    bacProjectId: 'bac-proj-104',
    bacProjectTitle: 'BAC-RES-2026-0130 (Biomedical Eng)',
    bacResolutionNumber: 'BAC-RES-2026-0130',
    prNumber: 'PR-2026-03-0052',
    office: 'Biomedical Engineering Section',
    category: 'Hospital Equipment Spares',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 1620000.0,
    proposalAmount: 0,
    exclusiveSupplierId: 'supp-004',
    exclusiveSupplierName: 'GE Medical Systems Philippines Inc.',
    supplierName: 'GE Medical Systems Philippines Inc.',
    exclusiveSupplierEmail: 'ph.service@gehealthcare.com',
    exclusiveSupplierContact: '+63 (2) 8877-3000',
    exclusiveSupplierPhilGEPS: '2018-091823 (Platinum)',
    submissionDeadline: '2026-10-30T17:00:00.000Z',
    deadline: '2026-10-30T17:00:00.000Z',
    status: 'draft',
    remarks: 'Drafting market scoping and verifying sole distributor certificate.',
    createdBy: 'Engr. Jonathan Dela Cruz',
    createdAt: '2026-09-19T11:20:00.000Z',
    exclusivityProofFileName: 'GE_Optima_Sole_Source_Affidavit.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'dc-005',
    dcNumber: 'DC-2026-0005',
    name: 'Annual Subscription & Threat Intelligence Updates for Palo Alto Strata Firewalls',
    dcName: 'Annual Subscription & Threat Intelligence Updates for Palo Alto Strata Firewalls',
    bacProjectId: 'bac-proj-105',
    bacProjectTitle: 'BAC-RES-2026-0145 (Cybersecurity)',
    bacResolutionNumber: 'BAC-RES-2026-0145',
    prNumber: 'PR-2026-03-0118',
    office: 'Information Security Office',
    category: 'Cybersecurity',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 4300000.0,
    proposalAmount: 4250000.0,
    exclusiveSupplierId: 'supp-005',
    exclusiveSupplierName: 'Trend Micro / Palo Alto Authorized Direct PH',
    supplierName: 'Trend Micro / Palo Alto Authorized Direct PH',
    exclusiveSupplierEmail: 'sec-enterprise@paloalto.ph',
    exclusiveSupplierContact: '+63 (2) 8856-1122',
    exclusiveSupplierPhilGEPS: '2020-039182 (Platinum)',
    submissionDeadline: '2026-10-18T17:00:00.000Z',
    deadline: '2026-10-18T17:00:00.000Z',
    status: 'submitted',
    remarks: 'Submitted to BAC Secretariat for preliminary completeness check.',
    createdBy: 'Atty. Katrina Rivera',
    createdAt: '2026-09-15T10:00:00.000Z',
    exclusivityProofFileName: 'Palo_Alto_Threat_Feed_Exclusive_License.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'dc-006',
    dcNumber: 'DC-2026-0006',
    name: 'Aircraft OEM Avionics Firmware Upgrade for Beechcraft King Air 350i',
    dcName: 'Aircraft OEM Avionics Firmware Upgrade for Beechcraft King Air 350i',
    bacProjectId: 'bac-proj-106',
    bacProjectTitle: 'BAC-RES-2026-0160 (Aviation Wing)',
    bacResolutionNumber: 'BAC-RES-2026-0160',
    prNumber: 'PR-2026-04-0012',
    office: 'Air Operations Support Division',
    category: 'Aviation Support',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 12400000.0,
    proposalAmount: 12150000.0,
    exclusiveSupplierId: 'supp-006',
    exclusiveSupplierName: 'Textron Aviation Direct Parts Asia',
    supplierName: 'Textron Aviation Direct Parts Asia',
    exclusiveSupplierEmail: 'asia.sales@txtav.com',
    exclusiveSupplierContact: '+65 6424-6000',
    exclusiveSupplierPhilGEPS: '2016-012948 (Platinum)',
    submissionDeadline: '2026-11-15T17:00:00.000Z',
    deadline: '2026-11-15T17:00:00.000Z',
    status: 'for-review',
    remarks: 'FAA and CAAP airworthiness directives mandate manufacturer direct parts only.',
    createdBy: 'Capt. Fernando Gomez',
    createdAt: '2026-09-16T13:45:00.000Z',
    exclusivityProofFileName: 'Textron_OEM_Airworthiness_Certificate.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'dc-007',
    dcNumber: 'DC-2026-0007',
    name: 'Proprietary High-Throughput Sequencing Flow Cells for Illumina NovaSeq 6000',
    dcName: 'Proprietary High-Throughput Sequencing Flow Cells for Illumina NovaSeq 6000',
    bacProjectId: 'bac-proj-107',
    bacProjectTitle: 'BAC-RES-2026-0182 (Genomics Center)',
    bacResolutionNumber: 'BAC-RES-2026-0182',
    prNumber: 'PR-2026-04-0089',
    office: 'National Genome Research Facility',
    category: 'Scientific Research Consumables',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 6800000.0,
    proposalAmount: 6800000.0,
    exclusiveSupplierId: 'supp-007',
    exclusiveSupplierName: 'Illumina Singapore Pte Ltd / PH Direct',
    supplierName: 'Illumina Singapore Pte Ltd / PH Direct',
    exclusiveSupplierEmail: 'genomics.ph@illumina.com',
    exclusiveSupplierContact: '+65 6579-2600',
    exclusiveSupplierPhilGEPS: '2019-058392 (Platinum)',
    submissionDeadline: '2026-10-05T17:00:00.000Z',
    deadline: '2026-10-05T17:00:00.000Z',
    status: 'rejected',
    remarks: 'Returned by TWG: Requested updated manufacturer exclusivity consular notarization.',
    createdBy: 'Dr. Patricia Ramos',
    createdAt: '2026-08-30T09:00:00.000Z',
    exclusivityProofFileName: 'Illumina_Proprietary_Flowcell_Proof.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'dc-008',
    dcNumber: 'DC-2026-0008',
    name: 'OEM Surgical Robot Consumables & Arm Cartridges for da Vinci Xi Surgical System',
    dcName: 'OEM Surgical Robot Consumables & Arm Cartridges for da Vinci Xi Surgical System',
    bacProjectId: 'bac-proj-108',
    bacProjectTitle: 'BAC-RES-2026-0205 (Operating Room Suite)',
    bacResolutionNumber: 'BAC-RES-2026-0205',
    prNumber: 'PR-2026-05-0033',
    office: 'Minimally Invasive Surgery Dept',
    category: 'Surgical Robotics',
    modeOfProcurement: 'Direct Contracting',
    totalABC: 5450000.0,
    proposalAmount: 5320000.0,
    exclusiveSupplierId: 'supp-008',
    exclusiveSupplierName: 'Intuitive Surgical Philippines Distribution',
    supplierName: 'Intuitive Surgical Philippines Distribution',
    exclusiveSupplierEmail: 'davinci.support@intuitive.ph',
    exclusiveSupplierContact: '+63 (2) 8802-9900',
    exclusiveSupplierPhilGEPS: '2021-049281 (Platinum)',
    submissionDeadline: '2026-10-25T17:00:00.000Z',
    deadline: '2026-10-25T17:00:00.000Z',
    status: 'submitted-to-supplier',
    remarks: 'Robotic instruments and endo-wrist attachments are proprietary to da Vinci Xi.',
    createdBy: 'Dr. Luis Alcantara',
    createdAt: '2026-09-17T15:30:00.000Z',
    exclusivityProofFileName: 'Intuitive_Sole_Manufacturer_Declaration.pdf',
    exclusivityProofUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
]

function renderStatusBadge(status: string) {
  const normalized = (status || '').toLowerCase()
  switch (normalized) {
    case 'draft':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 py-1 px-2.5"
        >
          <ShoppingCart className="h-3 w-3 text-slate-500" />
          <span>Draft</span>
        </Badge>
      )
    case 'submitted':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 py-1 px-2.5"
        >
          <Send className="h-3 w-3 text-sky-600" />
          <span>Submitted</span>
        </Badge>
      )
    case 'for-review':
    case 'for_review':
    case 'pending-for-approval':
    case 'pending_for_approval':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 py-1 px-2.5"
        >
          <FileCheck className="h-3 w-3 text-amber-600" />
          <span>For Review</span>
        </Badge>
      )
    case 'submitted-to-supplier':
    case 'submitted_to_supplier':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 py-1 px-2.5"
        >
          <CheckCircle className="h-3 w-3 text-purple-600" />
          <span>Sent to Supplier</span>
        </Badge>
      )
    case 'approved':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 py-1 px-2.5"
        >
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Approved</span>
        </Badge>
      )
    case 'rejected':
    case 'returned':
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-xs bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 py-1 px-2.5"
        >
          <AlertCircle className="h-3 w-3 text-rose-600" />
          <span>Returned / Rejected</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {status}
        </Badge>
      )
  }
}

const COLUMN_LABELS: Record<string, string> = {
  dcNumber: 'Request Details & Title',
  supplier: 'Exclusive Supplier',
  totalABC: 'Total ABC Amount',
  deadline: 'Submission Deadline',
  status: 'Procurement Status',
}

export function DirectContractingRequestPage() {
  const { toast } = useToast()

  // Hybrid Data State: Initialized with rich mock items, smoothly incorporates API items if returned
  const [data, setData] = React.useState<DirectContractingRecord[]>(INITIAL_MOCK_DATA)

  // API Query
  const { data: apiResponse } = useDirectContractings({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Synchronize with API response if present
  React.useEffect(() => {
    if (apiResponse?.data && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
      setData((prev) => {
        // Merge API data with mock data so we don't lose rich offline fields
        const apiIds = new Set(apiResponse.data.map((item: any) => item.id))
        const preservedMocks = prev.filter((p) => !apiIds.has(p.id))
        const formattedApi = apiResponse.data.map((item: any) => ({
          ...item,
          name: item.name || item.dcName,
          dcName: item.name || item.dcName,
          supplierName: item.exclusiveSupplierName || item.supplierName,
          exclusiveSupplierName: item.exclusiveSupplierName || item.supplierName,
          submissionDeadline: item.submissionDeadline || item.deadline,
          deadline: item.submissionDeadline || item.deadline,
          totalABC: item.totalABC || 0,
        }))
        return [...formattedApi, ...preservedMocks]
      })
    }
  }, [apiResponse])

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [editEntryId, setEditEntryId] = React.useState<string | null>(null)
  const [viewEntry, setViewEntry] = React.useState<DirectContractingRecord | null>(null)
  const [viewOpen, setViewOpen] = React.useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null)
  const [confirmSubmitId, setConfirmSubmitId] = React.useState<string | null>(null)
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false)

  // Active status tab filter ('all', 'draft', 'for-review', 'submitted-to-supplier', 'approved', 'rejected')
  const [activeStatusTab, setActiveStatusTab] = React.useState<string>('all')

  // TanStack Table v9 States
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Handlers for row actions
  const handleCopyDCNumber = React.useCallback(
    (dcNumber: string) => {
      navigator.clipboard.writeText(dcNumber)
      toast({
        title: 'Copied to Clipboard',
        description: `Reference number ${dcNumber} copied successfully.`,
      })
    },
    [toast],
  )

  const handleViewProposal = React.useCallback((entry: DirectContractingRecord) => {
    setViewEntry(entry)
    setViewOpen(true)
  }, [])

  const handleEdit = React.useCallback((id: string) => {
    setEditEntryId(id)
  }, [])

  const handlePromptSubmit = React.useCallback((id: string) => {
    setConfirmSubmitId(id)
  }, [])

  const handlePromptDelete = React.useCallback((id: string) => {
    setConfirmDeleteId(id)
  }, [])

  // Execute single submit
  const handleExecuteSubmit = React.useCallback(() => {
    if (!confirmSubmitId) return
    setData((prev) =>
      prev.map((item) =>
        item.id === confirmSubmitId
          ? { ...item, status: 'for-review' as const }
          : item,
      ),
    )
    toast({
      title: 'Request Submitted',
      description: 'The Direct Contracting request has been submitted for BAC review.',
    })
    setConfirmSubmitId(null)
  }, [confirmSubmitId, toast])

  // Execute single delete
  const handleExecuteDelete = React.useCallback(() => {
    if (!confirmDeleteId) return
    setData((prev) => prev.filter((item) => item.id !== confirmDeleteId))
    setRowSelection((prev) => {
      const next = { ...prev }
      delete next[confirmDeleteId]
      return next
    })
    toast({
      title: 'Request Deleted',
      description: 'The Direct Contracting request has been removed.',
    })
    setConfirmDeleteId(null)
  }, [confirmDeleteId, toast])

  // Export records to CSV
  const handleExportCSV = React.useCallback(
    (recordsToExport: DirectContractingRecord[]) => {
      if (recordsToExport.length === 0) {
        toast({
          title: 'No Data to Export',
          description: 'There are no records available for CSV export.',
        })
        return
      }
      const headers = [
        'DC Number',
        'Project Name',
        'BAC Project Reference',
        'Office',
        'Exclusive Supplier',
        'PhilGEPS Reg',
        'Total ABC (PHP)',
        'Proposal Amount (PHP)',
        'Submission Deadline',
        'Status',
        'Created By',
      ]
      const rows = recordsToExport.map((r) => [
        `"${r.dcNumber}"`,
        `"${(r.name || r.dcName || '').replace(/"/g, '""')}"`,
        `"${(r.bacProjectTitle || r.bacResolutionNumber || '').replace(/"/g, '""')}"`,
        `"${(r.office || '').replace(/"/g, '""')}"`,
        `"${(r.supplierName || r.exclusiveSupplierName || '').replace(/"/g, '""')}"`,
        `"${(r.exclusiveSupplierPhilGEPS || '').replace(/"/g, '""')}"`,
        r.totalABC || 0,
        r.proposalAmount || 0,
        `"${r.submissionDeadline || r.deadline || ''}"`,
        `"${r.status}"`,
        `"${r.createdBy || ''}"`,
      ])
      const csvString = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `Direct_Contracting_Requests_${new Date().toISOString().slice(0, 10)}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Successful',
        description: `Exported ${recordsToExport.length} Direct Contracting record(s) to CSV.`,
      })
    },
    [toast],
  )

  // Columns definition using TanStack Table v9 ColumnHelper
  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        }),
        columnHelper.accessor('dcNumber', {
          id: 'dcNumber',
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Request Details
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-3.5 w-3.5" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-3.5 w-3.5" />
              ) : (
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          ),
          filterFn: (row, _columnId, filterValue: string) => {
            if (!filterValue) return true
            const term = filterValue.toLowerCase().trim()
            const dcNumber = (row.original.dcNumber || '').toLowerCase()
            const name = (row.original.name || row.original.dcName || '').toLowerCase()
            const supplier = (
              row.original.supplierName ||
              row.original.exclusiveSupplierName ||
              ''
            ).toLowerCase()
            const bac = (
              row.original.bacProjectTitle ||
              row.original.bacResolutionNumber ||
              ''
            ).toLowerCase()
            return (
              dcNumber.includes(term) ||
              name.includes(term) ||
              supplier.includes(term) ||
              bac.includes(term)
            )
          },
          cell: ({ row }) => {
            const dc = row.original
            return (
              <div className="space-y-1 py-1 max-w-sm sm:max-w-md">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {dc.dcNumber}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium truncate">
                    {dc.category || 'Direct Contracting'}
                  </span>
                </div>
                <div
                  className="font-medium text-sm text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => handleViewProposal(dc)}
                  title={dc.name || dc.dcName}
                >
                  {dc.name || dc.dcName}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                  <span className="truncate">
                    {dc.bacProjectTitle || dc.bacResolutionNumber || 'BAC Project Ref'}
                  </span>
                </div>
              </div>
            )
          },
        }),
        columnHelper.accessor('supplierName', {
          id: 'supplier',
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Exclusive Supplier
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-3.5 w-3.5" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-3.5 w-3.5" />
              ) : (
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          ),
          cell: ({ row }) => {
            const dc = row.original
            const sName =
              dc.supplierName || dc.exclusiveSupplierName || 'Sole Proprietary Supplier'
            const philGeps = dc.exclusiveSupplierPhilGEPS || 'PhilGEPS Verified'
            return (
              <div className="space-y-1 py-1 max-w-[220px]">
                <div className="font-medium text-sm text-foreground truncate" title={sName}>
                  {sName}
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                    PhilGEPS: {philGeps}
                  </span>
                </div>
              </div>
            )
          },
        }),
        columnHelper.accessor('totalABC', {
          id: 'totalABC',
          header: ({ column }) => (
            <div className="text-right w-full">
              <Button
                variant="ghost"
                size="sm"
                className="-mr-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                Total ABC
                {column.getIsSorted() === 'asc' ? (
                  <ArrowUp className="ml-2 h-3.5 w-3.5" />
                ) : column.getIsSorted() === 'desc' ? (
                  <ArrowDown className="ml-2 h-3.5 w-3.5" />
                ) : (
                  <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                )}
              </Button>
            </div>
          ),
          cell: ({ row }) => {
            const amount = row.original.totalABC || 0
            return (
              <div className="text-right font-semibold text-sm tracking-tight text-foreground">
                {formatCurrencyPHP(amount)}
              </div>
            )
          },
        }),
        columnHelper.accessor('submissionDeadline', {
          id: 'deadline',
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Deadline
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-3.5 w-3.5" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-3.5 w-3.5" />
              ) : (
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          ),
          cell: ({ row }) => {
            const deadlineStr = row.original.submissionDeadline || row.original.deadline
            const isPast = deadlineStr ? new Date(deadlineStr) < new Date() : false
            return (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                <Calendar
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    isPast ? 'text-rose-500' : 'text-muted-foreground',
                  )}
                />
                <span className={cn(isPast && 'text-rose-600 font-medium dark:text-rose-400')}>
                  {deadlineStr ? formatDateV2(deadlineStr) : '—'}
                </span>
              </div>
            )
          },
        }),
        columnHelper.accessor('status', {
          id: 'status',
          header: 'Status',
          filterFn: (row, _columnId, filterValue: string) => {
            if (!filterValue || filterValue === 'all') return true
            const status = (row.original.status || '').toLowerCase()
            return status === filterValue.toLowerCase()
          },
          cell: ({ row }) => {
            const status = (row.original.status || 'draft').toLowerCase()
            return renderStatusBadge(status)
          },
        }),
        columnHelper.display({
          id: 'actions',
          enableHiding: false,
          cell: ({ row }) => {
            const dc = row.original
            return (
              <div className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleCopyDCNumber(dc.dcNumber)}>
                      <Copy className="mr-2 h-4 w-4" /> Copy DC Number
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewProposal(dc)}>
                      <Eye className="mr-2 h-4 w-4 text-primary" /> View Proposal Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(dc.id)}>
                      <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Request
                    </DropdownMenuItem>
                    {dc.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handlePromptSubmit(dc.id)}>
                        <Send className="mr-2 h-4 w-4 text-sky-600" /> Submit for Review
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handlePromptDelete(dc.id)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Request
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          },
        }),
      ]),
    [
      handleCopyDCNumber,
      handleViewProposal,
      handleEdit,
      handlePromptSubmit,
      handlePromptDelete,
    ],
  )

  // Initialize TanStack Table v9
  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  // Selected rows calculation
  const selectedRowList = React.useMemo(() => {
    return table.getSelectedRowModel().rows.map((r) => r.original)
  }, [table, rowSelection])

  const selectedCount = selectedRowList.length

  // Tab counts calculation
  const statusCounts = React.useMemo(() => {
    const counts = {
      all: data.length,
      draft: 0,
      'for-review': 0,
      'submitted-to-supplier': 0,
      approved: 0,
      rejected: 0,
    }
    data.forEach((item) => {
      const s = (item.status || '').toLowerCase()
      if (s === 'draft') counts.draft += 1
      else if (s === 'for-review' || s === 'for_review' || s === 'submitted') counts['for-review'] += 1
      else if (s === 'submitted-to-supplier' || s === 'submitted_to_supplier') counts['submitted-to-supplier'] += 1
      else if (s === 'approved') counts.approved += 1
      else if (s === 'rejected' || s === 'returned') counts.rejected += 1
    })
    return counts
  }, [data])

  // Change status tab
  const handleSelectStatusTab = (tabValue: string) => {
    setActiveStatusTab(tabValue)
    if (tabValue === 'all') {
      table.getColumn('status')?.setFilterValue(undefined)
    } else {
      table.getColumn('status')?.setFilterValue(tabValue)
    }
    table.setPageIndex(0)
  }

  // Bulk actions execution
  const handleBulkSubmit = () => {
    const selectedIds = new Set(selectedRowList.map((r) => r.id))
    setData((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) && item.status === 'draft'
          ? { ...item, status: 'for-review' as const }
          : item,
      ),
    )
    table.resetRowSelection()
    toast({
      title: 'Bulk Action Successful',
      description: `Submitted ${selectedCount} request(s) for review.`,
    })
  }

  const handleBulkDelete = () => {
    const selectedIds = new Set(selectedRowList.map((r) => r.id))
    setData((prev) => prev.filter((item) => !selectedIds.has(item.id)))
    table.resetRowSelection()
    setIsBulkDeleteConfirmOpen(false)
    toast({
      title: 'Bulk Action Successful',
      description: `Deleted ${selectedCount} request(s).`,
    })
  }

  const searchValue = (table.getColumn('dcNumber')?.getFilterValue() as string) ?? ''

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Direct Contracting
                </CardTitle>
                <Badge variant="outline" className="h-fit px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20">
                  v9 Datagrid
                </Badge>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Single-source procurement for proprietary items under RA 12009 Rule XVI. Requires Proof of Exclusivity & Verified PhilGEPS Certification.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-default-300">
                <Building className="h-3.5 w-3.5 mr-1.5 text-primary" /> RA 12009 / Rule XVI
              </Badge>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> New Direct Contracting
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Datagrid Container */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Direct Contracting Requests</CardTitle>
              <CardDescription>
                Manage, filter, and track exclusive supplier submissions and compliance documents
              </CardDescription>
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV(data)}
                className="h-8 gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Export All CSV
              </Button>
            </div>
          </div>

          {/* Status Tabs with Counters */}
          <div className="flex items-center gap-1.5 pt-4 overflow-x-auto pb-1 border-b border-border/40 scrollbar-none">
            {[
              { id: 'all', label: 'All Requests', count: statusCounts.all },
              { id: 'draft', label: 'Drafts', count: statusCounts.draft },
              { id: 'for-review', label: 'For Review', count: statusCounts['for-review'] },
              {
                id: 'submitted-to-supplier',
                label: 'Sent to Supplier',
                count: statusCounts['submitted-to-supplier'],
              },
              { id: 'approved', label: 'Approved', count: statusCounts.approved },
              { id: 'rejected', label: 'Returned', count: statusCounts.rejected },
            ].map((tab) => {
              const isActive = activeStatusTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectStatusTab(tab.id)}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted-foreground/15 text-muted-foreground',
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Table Toolbar: Search, Filters, Column Visibility */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by DC#, project title, or supplier..."
                  value={searchValue}
                  onChange={(e) => table.getColumn('dcNumber')?.setFilterValue(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
                {searchValue && (
                  <button
                    onClick={() => table.getColumn('dcNumber')?.setFilterValue('')}
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Column Visibility Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold">
                      Toggle Columns
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllColumns()
                      .filter((col) => col.getCanHide())
                      .map((col) => (
                        <DropdownMenuCheckboxItem
                          key={col.id}
                          className="capitalize text-xs cursor-pointer"
                          checked={col.getIsVisible()}
                          onCheckedChange={(val) => col.toggleVisibility(!!val)}
                        >
                          {COLUMN_LABELS[col.id] || col.id}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  table.resetColumnFilters()
                  setActiveStatusTab('all')
                }}
                className="h-9 text-xs"
                disabled={!searchValue && activeStatusTab === 'all'}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Interactive Bulk Action Banner */}
          {selectedCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-foreground animate-in fade-in-50 duration-150">
              <div className="flex items-center gap-2">
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground px-1.5">
                  {selectedCount}
                </span>
                <span className="text-sm font-semibold">
                  request{selectedCount > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 bg-background shadow-xs hover:bg-muted"
                  onClick={handleBulkSubmit}
                >
                  <Send className="h-3.5 w-3.5 text-sky-600" />
                  Submit Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 bg-background shadow-xs hover:bg-muted"
                  onClick={() => handleExportCSV(selectedRowList)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs gap-1.5 shadow-xs"
                  onClick={() => setIsBulkDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Selected
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => table.resetRowSelection()}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          )}

          {/* TanStack Table Grid */}
          <div className="rounded-lg border border-border overflow-hidden bg-card">
            <Table>
              <TableHeader className="bg-muted/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-11">
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="group transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary/5"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2.5">
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 py-8">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <Inbox className="h-6 w-6" />
                        </div>
                        <div className="font-semibold text-base text-foreground">
                          No Direct Contracting requests found
                        </div>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {searchValue || activeStatusTab !== 'all'
                            ? 'No requests match your current search and filter criteria. Try adjusting or clearing your filters.'
                            : 'There are currently no Direct Contracting requests registered. Create your first request to get started.'}
                        </p>
                        {(searchValue || activeStatusTab !== 'all') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={() => {
                              table.resetColumnFilters()
                              setActiveStatusTab('all')
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Full-featured Pagination Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-4 py-2">
            {/* Left: Selection count and record index */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {table.getRowModel().rows.length === 0
                    ? 0
                    : pagination.pageIndex * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-foreground">
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    table.getFilteredRowModel().rows.length,
                  )}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                  {table.getFilteredRowModel().rows.length}
                </span>{' '}
                entries
              </span>
              {selectedCount > 0 && (
                <span className="font-medium text-primary">
                  ({selectedCount} selected)
                </span>
              )}
            </div>

            {/* Right: Rows per page, page numbers, navigation buttons */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rows per page:</span>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(val) => {
                    const newSize = Number(val)
                    setPagination((prev) => ({ ...prev, pageSize: newSize, pageIndex: 0 }))
                  }}
                >
                  <SelectTrigger className="h-8 w-18 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} className="text-xs">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <div className="text-xs font-medium text-foreground px-2 tabular-nums">
                  Page {table.getPageCount() === 0 ? 0 : pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Confirmation Dialogs */}
      <CreateDirectContractingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {editEntryId && (
        <UpdateDirectContractingModal
          open={!!editEntryId}
          onOpenChange={(v) => {
            if (!v) setEditEntryId(null)
          }}
          editEntryId={editEntryId}
        />
      )}

      {viewEntry && (
        <ViewProposalDetailsModal
          open={viewOpen}
          onOpenChange={(v) => {
            setViewOpen(v)
            if (!v) setViewEntry(null)
          }}
          entry={viewEntry}
        />
      )}

      <ConfirmAlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title="Delete Direct Contracting Request?"
        description="Are you sure you want to delete this Direct Contracting request? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleExecuteDelete}
      />

      <ConfirmAlertDialog
        open={!!confirmSubmitId}
        onOpenChange={(v) => !v && setConfirmSubmitId(null)}
        title="Submit Request for BAC Review?"
        description="Are you sure you want to submit this Direct Contracting request for BAC review and validation under Rule XVI?"
        confirmLabel="Submit"
        onConfirm={handleExecuteSubmit}
      />

      <ConfirmAlertDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        title={`Delete ${selectedCount} Selected Requests?`}
        description={`Are you sure you want to delete ${selectedCount} selected Direct Contracting requests? This action cannot be undone.`}
        confirmLabel="Delete All Selected"
        onConfirm={handleBulkDelete}
      />
    </div>
  )
}
