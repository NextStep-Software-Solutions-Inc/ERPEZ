/**
 * Fiscal Year Management Section
 * 
 * Handles creation, editing, and deletion of fiscal years.
 * Separate component to keep AppFormPage focused on planning workflow.
 */

import { useAtom } from 'jotai'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TemplateTable } from '@/components/TemplateTable'
import type { MetaActions } from '@/types/global'
import {
  AppFiscalYearDialogManager,
  AppFiscalYearColumns,
  Toolbar,
  appFiscalYearTableStatesAtom,
} from '@/components/features/planning/annual-performance-planning/fiscal-year'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'

interface FiscalYearSectionProps {
  fiscalYears: AppFiscalYear[]
  onCreated: (data: AppFiscalYear) => void
  onUpdated: (data: AppFiscalYear) => void
  onDeleted: () => void
}

export function FiscalYearSection({
  fiscalYears,
  onCreated,
  onUpdated,
  onDeleted,
}: FiscalYearSectionProps) {
  const [tableStates, setTableStates] = useAtom(appFiscalYearTableStatesAtom)
  const actions: MetaActions = ['write', 'delete', 'read']

  const handleColumnVisibilityChange = (updater: any) => {
    const newVisibility =
      typeof updater === 'function'
        ? updater(tableStates.columnVisibility)
        : updater
    setTableStates((prev: any) => ({
      ...prev,
      columnVisibility: newVisibility,
    }))
  }

  const handleSortingChange = (updater: any) => {
    const newSorting =
      typeof updater === 'function' ? updater(tableStates.sorting) : updater
    setTableStates((prev: any) => ({ ...prev, sorting: newSorting }))
  }

  const handleColumnFiltersChange = (updater: any) => {
    const newFilters =
      typeof updater === 'function'
        ? updater(tableStates.columnFilters)
        : updater
    setTableStates((prev: any) => ({
      ...prev,
      columnFilters: newFilters,
    }))
  }

  const handleGlobalFilterChange = (value: string) => {
    setTableStates((prev: any) => ({ ...prev, globalFilter: value }))
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                📅
              </span>
              Fiscal Years Management
            </CardTitle>
            <CardDescription className="mt-1">
              Create and manage fiscal years. These define the temporal scope
              for your performance planning.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TemplateTable
          columns={AppFiscalYearColumns}
          data={fiscalYears}
          actions={actions}
          readonly={false}
          toolbar={(table) => <Toolbar table={table} showColumnVisibility />}
          forTab
          fixedPageSize={5}
          columnVisibility={tableStates.columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          sorting={tableStates.sorting}
          onSortingChange={handleSortingChange}
          columnFilters={tableStates.columnFilters}
          onColumnFiltersChange={handleColumnFiltersChange}
          globalFilter={tableStates.globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
        />
        <AppFiscalYearDialogManager
          allFiscalYears={fiscalYears}
          onCreated={onCreated}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      </CardContent>
    </Card>
  )
}
