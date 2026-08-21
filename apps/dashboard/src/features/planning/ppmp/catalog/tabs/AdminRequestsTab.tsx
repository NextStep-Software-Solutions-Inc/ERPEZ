/**
 * AdminRequestsTab
 * Request Queue with review/approval workflow for TWG and Admin
 * Status tabs: Pending Review (Submitted), Approved, Returned, All
 * Filterable by: Category, Office, Date range, Search
 */

import { useState, useMemo } from 'react'
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
import { useItemRequests } from '../hooks/useItemRequestQueries'
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

  const { data: response, isLoading } = useItemRequests({
    pageSize: 100,
    sorts: '-requestDate',
  })
  const allRequests: ItemRequest[] = useMemo(
    () => response?.data || [],
    [response?.data],
  )
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
      const specs = req.technicalSpecification || req.specifications || ''
      if (
        searchTerm &&
        !req.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !specs.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Category filter
      const category =
        req.procurementCategoryName || req.procurementCategory || ''
      if (categoryFilter !== 'All' && category !== categoryFilter) {
        return false
      }

      // Office filter
      const office = req.officeName || req.requestingOffice || ''
      if (officeFilter !== 'All' && office !== officeFilter) {
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
      Array.from(
        new Set(
          reviewableRequests
            .map((r) => r.officeName || r.requestingOffice || '')
            .filter(Boolean),
        ),
      ).sort(),
    [reviewableRequests],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Request Queue
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {submittedCount} pending review • {approvedCount} approved •{' '}
          {returnedCount} returned
        </p>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={selectedStatus}
        onValueChange={(v) =>
          setSelectedStatus(v as ItemRequest['status'] | 'all')
        }
        className="w-full space-y-4"
      >
        <TabsList className="grid w-full max-w-md grid-cols-4 p-1 bg-muted/60">
          <TabsTrigger value="Submitted" className="text-xs">
            Pending
            {submittedCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-[10px] font-bold">
                {submittedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Approved" className="text-xs">
            Approved
            {approvedCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold">
                {approvedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Returned" className="text-xs">
            Returned
            {returnedCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 text-[10px] font-bold">
                {returnedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            All ({reviewableRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4 mt-0">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-card p-3 rounded-lg border border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Category..." />
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
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Office..." />
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

            <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Date range..." />
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
            isLoading={isLoading}
            selectedStatus={selectedStatus === 'all' ? undefined : selectedStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Approval Detail Panel */}
      <ApprovalDetailPanel />

      {/* Item Detail Read-Only Panel */}
      <ItemDetailReadOnlyPanel />
    </div>
  )
}
