import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Filter,
  Check,
  Building2,
  Wallet,
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  PackageCheck,
  Calendar,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  AppItemLink,
  AppRecord,
  ConsolidatedPrLink,
  ProcurementSourceType,
} from '../../types'
import {
  getMockAppRecords,
  getAppItemsByAppNumber,
} from '../../data/mockAppItemData'

interface SourceRecordPickerStepProps {
  sourceType: ProcurementSourceType
  appItems: AppItemLink[]
  consolidatedPrs: ConsolidatedPrLink[]
  selectedAppItem: AppItemLink | null
  selectedConsolidatedPr: ConsolidatedPrLink | null
  onSelectAppItem: (item: AppItemLink) => void
  onSelectConsolidatedPr: (cpr: ConsolidatedPrLink) => void
}

export function SourceRecordPickerStep({
  sourceType,
  appItems,
  consolidatedPrs,
  selectedAppItem,
  selectedConsolidatedPr,
  onSelectAppItem,
  onSelectConsolidatedPr,
}: SourceRecordPickerStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [officeFilter, setOfficeFilter] = useState('ALL')
  const [selectedAppRecord, setSelectedAppRecord] = useState<AppRecord | null>(
    null,
  )

  const appRecords = useMemo(() => getMockAppRecords(), [])

  // If there's an already selected app item, ensure its parent APP is active
  useEffect(() => {
    if (selectedAppItem && !selectedAppRecord) {
      const parent = appRecords.find(
        (a) => a.appNumber === selectedAppItem.appNumber,
      )
      if (parent) {
        setSelectedAppRecord(parent)
      }
    }
  }, [selectedAppItem, selectedAppRecord, appRecords])

  const filteredAppRecords = useMemo(() => {
    return appRecords.filter((app) => {
      const matchesSearch =
        app.appNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.implementingUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.fiscalYear.includes(searchTerm)
      const matchesOffice =
        officeFilter === 'ALL' || app.implementingUnit === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [appRecords, searchTerm, officeFilter])

  const currentAppItems = useMemo(() => {
    if (!selectedAppRecord) return []
    return appItems.filter(
      (item) => item.appNumber === selectedAppRecord.appNumber,
    )
  }, [appItems, selectedAppRecord])

  const filteredChildAppItems = useMemo(() => {
    return currentAppItems.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.modeOfProcurement.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesOffice =
        officeFilter === 'ALL' || item.officeName === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [currentAppItems, searchTerm, officeFilter])

  const filteredConsolidatedPrs = useMemo(() => {
    return consolidatedPrs.filter((cpr) => {
      const matchesSearch =
        cpr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.endUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.modeOfProcurement.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesOffice =
        officeFilter === 'ALL' || cpr.endUser === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [consolidatedPrs, searchTerm, officeFilter])

  const availableOffices = useMemo(() => {
    if (sourceType === 'APP_ITEM') {
      if (selectedAppRecord) {
        return Array.from(new Set(currentAppItems.map((i) => i.officeName)))
      }
      return Array.from(new Set(appRecords.map((i) => i.implementingUnit)))
    }
    return Array.from(new Set(consolidatedPrs.map((c) => c.endUser)))
  }, [sourceType, selectedAppRecord, currentAppItems, appRecords, consolidatedPrs])

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-default-900">
            {sourceType === 'APP_ITEM'
              ? selectedAppRecord
                ? `Select APP Item from ${selectedAppRecord.appNumber}`
                : 'Step 2.1: Select Annual Procurement Plan (APP)'
              : 'Select Approved Consolidated PR'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {sourceType === 'APP_ITEM'
              ? selectedAppRecord
                ? 'Choose the specific procurement item to generate this BAC Resolution for.'
                : 'Select an approved parent Annual Procurement Plan to browse its line items.'
              : 'Only approved Consolidated PRs available for BAC resolution are listed.'}
          </p>
        </div>

        {sourceType === 'APP_ITEM' && selectedAppRecord && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAppRecord(null)
              setSearchTerm('')
            }}
            className="gap-1.5 self-start sm:self-auto text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Switch Parent APP
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              sourceType === 'APP_ITEM'
                ? selectedAppRecord
                  ? `Search items in ${selectedAppRecord.appNumber} by description, mode, or office...`
                  : 'Search Annual Procurement Plans by APP #, title, fiscal year, or office...'
                : 'Search by CPR #, project description, end-user office...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {availableOffices.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="h-9 rounded-md border border-default-300 bg-white px-3 py-1 text-xs text-default-800 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Offices / Implementing Units</option>
              {availableOffices.map((office) => (
                <option key={office} value={office}>
                  {office}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tables depending on Source Type */}
      {sourceType === 'APP_ITEM' ? (
        !selectedAppRecord ? (
          /* Stage 1: Select Parent APP */
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {filteredAppRecords.map((app) => {
                const count = appItems.filter(
                  (i) => i.appNumber === app.appNumber,
                ).length
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppRecord(app)
                      setSearchTerm('')
                    }}
                    className="group relative cursor-pointer rounded-xl border border-default-200 bg-white p-4.5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground">
                            {app.appNumber}
                          </span>
                          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            FY {app.fiscalYear}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <p className="mt-2.5 text-xs text-default-700 font-medium line-clamp-2 leading-relaxed">
                      {app.title}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-default-100 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-default-600">
                        <PackageCheck className="h-3.5 w-3.5 text-primary" />
                        {count} eligible item(s)
                      </span>
                      <span className="font-bold text-emerald-700">
                        ₱
                        {app.totalBudget.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredAppRecords.length === 0 && (
              <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-8 text-center text-sm text-muted-foreground">
                No Annual Procurement Plans match your search criteria.
              </div>
            )}
          </div>
        ) : (
          /* Stage 2: Select Child APP Item */
          <div className="space-y-3">
            {/* Selected APP Context Header */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="font-bold text-default-900">
                  {selectedAppRecord.appNumber}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-default-700 font-medium truncate max-w-[400px]">
                  {selectedAppRecord.title}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-white text-primary border-primary/30"
              >
                {currentAppItems.length} Available Line Items
              </Badge>
            </div>

            <div className="overflow-hidden rounded-lg border border-default-200 bg-white max-h-[360px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-default-50 shadow-xs z-10">
                  <TableRow>
                    <TableHead className="w-12 text-center">Select</TableHead>
                    <TableHead className="w-[100px]">Item #</TableHead>
                    <TableHead>Project / Item Description</TableHead>
                    <TableHead>Office / Unit</TableHead>
                    <TableHead>Procurement Mode</TableHead>
                    <TableHead>Source of Fund</TableHead>
                    <TableHead className="text-right">Budget (ABC)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChildAppItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No items found in this APP matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChildAppItems.map((item) => {
                      const isSelected = selectedAppItem?.id === item.id
                      return (
                        <TableRow
                          key={item.id}
                          onClick={() => onSelectAppItem(item)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 hover:bg-primary/15'
                              : 'hover:bg-default-50'
                          }`}
                        >
                          <TableCell className="text-center">
                            <div
                              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-default-300 bg-white'
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 stroke-[3]" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-primary">
                            {item.itemNumber}
                          </TableCell>
                          <TableCell className="font-medium text-xs text-default-900 max-w-[260px] truncate">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-xs text-default-700">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.officeName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className="font-normal text-[11px] bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {item.modeOfProcurement}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-default-600">
                            <div className="flex items-center gap-1">
                              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate max-w-[140px]">
                                {item.sourceOfFund}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-xs text-emerald-700">
                            ₱
                            {item.abc.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      ) : (
        /* Consolidated PR Table */
        <div className="overflow-hidden rounded-lg border border-default-200 bg-white max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-default-50 shadow-xs z-10">
              <TableRow>
                <TableHead className="w-12 text-center">Select</TableHead>
                <TableHead className="w-[140px]">Consolidated PR #</TableHead>
                <TableHead>Project Title / Purpose</TableHead>
                <TableHead>Implementing Unit / End-User</TableHead>
                <TableHead>Procurement Mode</TableHead>
                <TableHead className="text-right">Total ABC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsolidatedPrs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-sm text-muted-foreground"
                  >
                    No approved Consolidated PRs match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsolidatedPrs.map((cpr) => {
                  const isSelected = selectedConsolidatedPr?.id === cpr.id
                  return (
                    <TableRow
                      key={cpr.id}
                      onClick={() => onSelectConsolidatedPr(cpr)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-default-50'
                      }`}
                    >
                      <TableCell className="text-center">
                        <div
                          className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-default-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 stroke-[3]" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-emerald-800">
                        {cpr.prNumber}
                        <div className="mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-800"
                          >
                            Combined Items
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs text-default-900 max-w-[260px] truncate">
                        {cpr.projectName || cpr.description}
                      </TableCell>
                      <TableCell className="text-xs text-default-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{cpr.endUser}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant="outline"
                          className="font-normal text-[11px] bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {cpr.modeOfProcurement}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs text-emerald-700">
                        ₱
                        {cpr.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
