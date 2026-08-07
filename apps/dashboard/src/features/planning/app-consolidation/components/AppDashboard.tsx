import { useState, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreVertical, Plus, Eye, Edit3, Send, Download, Lock } from 'lucide-react'
import { format } from 'date-fns'
import {
  draftAppsAtom,
  submittedAppsAtom,
  approvedAppsAtom,
  appCountsAtom,
} from '../atoms/index'
import { canPerformActionOnApp, canCreateApp } from '../utils/rbacUtils'
import type { AppMaster, UserRole } from '../types'

interface AppDashboardProps {
  onCreateApp?: () => void
  onEditApp?: (app: AppMaster) => void
  onViewApp?: (app: AppMaster) => void
  onSubmitApp?: (app: AppMaster) => void
  onApproveApp?: (app: AppMaster) => void
  onDownloadApp?: (app: AppMaster) => void
  userRole?: UserRole
}

/**
 * APP Dashboard - Central view for managing Annual Procurement Plans
 *
 * Features:
 * - Tab-based layout: Draft, Pending Approval, Approved
 * - Grid display: Name, Code, Fiscal Year, Type, Status, Created By, Date
 * - Row actions: Edit (Draft only), View (all), Submit (Draft only), Download (all)
 * - Filters: Fiscal Year, Type
 * - Search: By APP Name or Code
 * - Create button with role-based access (BAC_SECRETARIAT only)
 * - Count badges on tabs
 * - Status indicators
 *
 * Documentation: documentations/app-dashboard.md
 */
export function AppDashboard({
  onCreateApp,
  onEditApp,
  onViewApp,
  onSubmitApp,
  onApproveApp,
  onDownloadApp,
  userRole = 'BAC_MEMBER',
}: AppDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFiscalYear, setFilterFiscalYear] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'draft' | 'pending' | 'approved'>('draft')

  const draftApps = useAtomValue(draftAppsAtom)
  const submittedApps = useAtomValue(submittedAppsAtom)
  const approvedApps = useAtomValue(approvedAppsAtom)
  const counts = useAtomValue(appCountsAtom)

  // Filter logic
  const filterApps = (apps: AppMaster[]) => {
    return apps.filter((app) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        if (
          !app.appName.toLowerCase().includes(query) &&
          !app.appCode.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Fiscal year filter
      if (filterFiscalYear && app.fiscalYear !== parseInt(filterFiscalYear)) {
        return false
      }

      // Type filter
      if (filterType && app.appType !== filterType) {
        return false
      }

      return true
    })
  }

  const filteredDraftApps = useMemo(() => filterApps(draftApps), [draftApps, searchQuery, filterFiscalYear, filterType])
  const filteredSubmittedApps = useMemo(() => filterApps(submittedApps), [submittedApps, searchQuery, filterFiscalYear, filterType])
  const filteredApprovedApps = useMemo(() => filterApps(approvedApps), [approvedApps, searchQuery, filterFiscalYear, filterType])

  // Get unique fiscal years for filter dropdown
  const allApps = [...draftApps, ...submittedApps, ...approvedApps]
  const fiscalYears = useMemo(() => {
    const years = new Set(allApps.map((app) => app.fiscalYear))
    return Array.from(years).sort().reverse()
  }, [allApps])

  const handleViewApp = (app: AppMaster) => {
    onViewApp?.(app)
  }

  const handleEditApp = (app: AppMaster) => {
    onEditApp?.(app)
  }

  const AppTable = ({ apps }: { apps: AppMaster[] }) => (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">APP Code</TableHead>
            <TableHead className="font-semibold">APP Name</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Fiscal Year</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Items</TableHead>
            <TableHead className="text-right font-semibold">Budget</TableHead>
            <TableHead className="font-semibold">Created By</TableHead>
            <TableHead className="font-semibold">Created Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                No APPs found
              </TableCell>
            </TableRow>
          ) : (
            apps.map((app) => (
              <TableRow key={app.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{app.appCode}</TableCell>
                <TableCell className="font-medium">{app.appName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{app.appType}</Badge>
                </TableCell>
                <TableCell>{app.fiscalYear}</TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
                <TableCell className="text-center">
                  {app.bac?.lineItems?.length || 0}
                </TableCell>
                <TableCell className="text-right font-mono">
                  ₱{(app.bac?.totalBudget || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{app.createdBy || '—'}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {app.createdAt ? format(new Date(app.createdAt), 'MMM d, yyyy') : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* View - All roles */}
                      <DropdownMenuItem onClick={() => handleViewApp(app)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>

                      {/* Edit - Draft only, BAC_SECRETARIAT only */}
                      {canPerformActionOnApp(userRole, 'edit', app.status) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditApp(app)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Submit - Draft only, BAC_SECRETARIAT only */}
                      {canPerformActionOnApp(userRole, 'submit', app.status) && (
                        <DropdownMenuItem onClick={() => onSubmitApp?.(app)}>
                          <Send className="w-4 h-4 mr-2" />
                          Submit
                        </DropdownMenuItem>
                      )}

                      {/* Approve - Submitted only, HOPE only */}
                      {canPerformActionOnApp(userRole, 'approve', app.status) && (
                        <DropdownMenuItem onClick={() => onApproveApp?.(app)}>
                          <Send className="w-4 h-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                      )}

                      {/* Lock - Approved only, HOPE only */}
                      {canPerformActionOnApp(userRole, 'lock', app.status) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onApproveApp?.(app)}>
                            <Lock className="w-4 h-4 mr-2" />
                            Lock as Final
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Download - All roles, all statuses */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDownloadApp?.(app)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annual Procurement Plans</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and consolidate budget and procurement plans</p>
        </div>

        {/* Create Button - BAC_SECRETARIAT only */}
        {canCreateApp(userRole) && (
          <Button onClick={onCreateApp} className="gap-2">
            <Plus className="w-4 h-4" />
            Create APP
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search by APP Name or Code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />

        <Select value={filterFiscalYear || ''} onValueChange={(value) => setFilterFiscalYear(value || null)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Fiscal Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Years</SelectItem>
            {fiscalYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType || ''} onValueChange={(value) => setFilterType(value || null)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="Indicative">Indicative</SelectItem>
            <SelectItem value="Supplemental">Supplemental</SelectItem>
          </SelectContent>
        </Select>

        {(searchQuery || filterFiscalYear || filterType) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setFilterFiscalYear(null)
              setFilterType(null)
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b">
          <Button
            variant={activeTab === 'draft' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('draft')}
            className="rounded-none border-b-2"
          >
            Draft
            <Badge variant="soft" className="ml-2">
              {counts.draft}
            </Badge>
          </Button>
          <Button
            variant={activeTab === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('pending')}
            className="rounded-none border-b-2"
          >
            Pending
            <Badge variant="soft" className="ml-2">
              {counts.submitted}
            </Badge>
          </Button>
          <Button
            variant={activeTab === 'approved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('approved')}
            className="rounded-none border-b-2"
          >
            Approved
            <Badge variant="soft" className="ml-2">
              {counts.approved + counts.locked}
            </Badge>
          </Button>
        </div>

        {activeTab === 'draft' && <AppTable apps={filteredDraftApps} />}
        {activeTab === 'pending' && <AppTable apps={filteredSubmittedApps} />}
        {activeTab === 'approved' && <AppTable apps={filteredApprovedApps} />}
      </div>
    </div>
  )
}

/**
 * StatusBadge - Display APP status with appropriate styling
 */
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: any; label: string }> = {
    Draft: { variant: 'outline', label: 'Draft' },
    Submitted: { variant: 'secondary', label: 'Submitted' },
    Approved: { variant: 'default', label: 'Approved' },
    Locked: { variant: 'default', label: 'Locked' },
  }

  const config = statusConfig[status] || { variant: 'outline', label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
