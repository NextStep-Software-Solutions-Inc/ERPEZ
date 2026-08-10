/**
 * AdminRequestsTab
 * Request Queue with approval/return workflow
 * Phase 1/2: Pending Review, Approved, Returned, All tabs
 * Features: Status filtering, category/date/office filtering, approval panel
 */

import { useState, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { UserRequestsTable } from '../tables/UserRequestsTable'
import { ApprovalDetailPanel } from '../panels/ApprovalDetailPanel.tsx'
import { ItemDetailReadOnlyPanel } from '../panels/ItemDetailReadOnlyPanel.tsx'
import { itemRequestsAtom } from '../atoms/catalogAtoms'
import { PROCUREMENT_CATEGORIES } from '../utils/cascadingUacs'
import type { ItemRequest } from '../types/catalog.types'

export function AdminRequestsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<
    ItemRequest['status'] | 'all'
  >('Submitted')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [officeFilter, setOfficeFilter] = useState<string>('All')
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days'>('all')

  const allRequests = useAtomValue(itemRequestsAtom)
  const reviewableRequests = useMemo(
    () => allRequests.filter((req) => req.status !== 'Draft'),
    [allRequests],
  )

  // Filter logic
  const filteredRequests = useMemo(() => {
    return reviewableRequests.filter((req) => {
      // Status filter
      if (selectedStatus !== 'all' && req.status !== selectedStatus) return false

      // Search filter
      if (
        searchTerm &&
        !req.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !req.specifications.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Category filter
      if (
        categoryFilter !== 'All' &&
        req.procurementCategory !== categoryFilter
      ) {
        return false
      }

      // Office filter
      if (officeFilter !== 'All' && req.requestingOffice !== officeFilter) {
        return false
      }

      // Date range filter
      const requestDate = new Date(req.requestDate)
      const now = new Date()
      const daysAgo =
        (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)

      if (dateRange === '7days' && daysAgo > 7) return false
      if (dateRange === '30days' && daysAgo > 30) return false

      return true
    })
  }, [
    reviewableRequests,
    selectedStatus,
    searchTerm,
    categoryFilter,
    officeFilter,
    dateRange,
  ])

  const submittedCount = reviewableRequests.filter(
    (r) => r.status === 'Submitted',
  ).length
  const approvedCount = reviewableRequests.filter(
    (r) => r.status === 'Approved',
  ).length
  const returnedCount = reviewableRequests.filter(
    (r) => r.status === 'Returned',
  ).length

  // Get unique offices for filter
  const uniqueOffices = useMemo(
    () =>
      Array.from(new Set(reviewableRequests.map((r) => r.requestingOffice))).sort(),
    [reviewableRequests],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Request Queue</h2>
        <p className="text-sm text-muted-foreground">
          {submittedCount} pending review • {approvedCount} approved • {returnedCount}{' '}
          returned
        </p>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={selectedStatus}
        onValueChange={(v) => setSelectedStatus(v as ItemRequest['status'] | 'all')}
      >
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="Submitted" className="relative">
            Pending Review
            {submittedCount > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {submittedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Approved">
            Approved
            {approvedCount > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">
                {approvedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Returned">
            Returned
            {returnedCount > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                {returnedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All ({reviewableRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4 mt-6">
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {PROCUREMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={officeFilter} onValueChange={setOfficeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Offices</SelectItem>
                {uniqueOffices.map((office) => (
                  <SelectItem key={office} value={office}>
                    {office}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={dateRange}
              onValueChange={(v: any) => setDateRange(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <UserRequestsTable
            data={filteredRequests}
            total={filteredRequests.length}
            selectedStatus={selectedStatus === 'all' ? undefined : selectedStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      {filteredRequests.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No requests matching current filters
          </p>
        </div>
      )}

      {/* Approval Detail Panel */}
      <ApprovalDetailPanel />

      {/* Item Detail Read-Only Panel */}
      <ItemDetailReadOnlyPanel />
    </div>
  )
}
