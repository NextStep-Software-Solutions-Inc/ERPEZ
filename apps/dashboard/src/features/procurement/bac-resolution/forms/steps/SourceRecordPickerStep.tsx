import { useState, useMemo } from 'react'
import { Search, Filter, Check, Building2, Wallet, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AppItemLink, ConsolidatedPrLink, ProcurementSourceType } from '../../types'

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

  const filteredAppItems = useMemo(() => {
    return appItems.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.appNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.modeOfProcurement.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesOffice = officeFilter === 'ALL' || item.officeName === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [appItems, searchTerm, officeFilter])

  const filteredConsolidatedPrs = useMemo(() => {
    return consolidatedPrs.filter((cpr) => {
      const matchesSearch =
        cpr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.endUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.modeOfProcurement.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesOffice = officeFilter === 'ALL' || cpr.endUser === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [consolidatedPrs, searchTerm, officeFilter])

  const availableOffices = useMemo(() => {
    if (sourceType === 'APP_ITEM') {
      return Array.from(new Set(appItems.map((i) => i.officeName)))
    }
    return Array.from(new Set(consolidatedPrs.map((c) => c.endUser)))
  }, [sourceType, appItems, consolidatedPrs])

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-default-900">
            {sourceType === 'APP_ITEM' ? 'Select Eligible APP Item' : 'Select Approved Consolidated PR'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {sourceType === 'APP_ITEM'
              ? 'Only approved APP procurement items available for BAC resolution are listed.'
              : 'Only approved Consolidated PRs available for BAC resolution are listed.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              sourceType === 'APP_ITEM'
                ? 'Search by APP #, item description, office, or procurement mode...'
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
        <div className="overflow-hidden rounded-lg border border-default-200 bg-white max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-default-50 shadow-xs z-10">
              <TableRow>
                <TableHead className="w-12 text-center">Select</TableHead>
                <TableHead className="w-[140px]">APP / Item Ref</TableHead>
                <TableHead>Project / Item Description</TableHead>
                <TableHead>Office / Implementing Unit</TableHead>
                <TableHead>Procurement Mode</TableHead>
                <TableHead>Source of Fund</TableHead>
                <TableHead className="text-right">Estimated Budget (ABC)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No eligible APP Items match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppItems.map((item) => {
                  const isSelected = selectedAppItem?.id === item.id
                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => onSelectAppItem(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-default-50'
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
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-primary">
                        {item.appNumber}
                        <div className="text-[11px] font-normal text-muted-foreground">
                          {item.itemNumber}
                        </div>
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
                        <Badge variant="outline" className="font-normal text-[11px] bg-blue-50 text-blue-700 border-blue-200">
                          {item.modeOfProcurement}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-default-600">
                        <div className="flex items-center gap-1">
                          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[140px]">{item.sourceOfFund}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs text-emerald-700">
                        ₱{item.abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
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
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
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
                        isSelected ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-default-50'
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
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-emerald-800">
                        {cpr.prNumber}
                        <div className="mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-800">
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
                        <Badge variant="outline" className="font-normal text-[11px] bg-purple-50 text-purple-700 border-purple-200">
                          {cpr.modeOfProcurement}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs text-emerald-700">
                        ₱{cpr.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
