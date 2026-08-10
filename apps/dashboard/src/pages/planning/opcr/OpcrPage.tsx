import { useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useLocation } from '@tanstack/react-router'
import type { MetaActions } from '@/types/global'
import { Column, Toolbar } from '@/features/planning/opcr'
import { TemplateTable } from '@/components/TemplateTable'
import { getOPCRsRequest } from '@/features/planning/opcr/handlers/getOPCRsRequest'
import { 
  cleanupOpcrStorage,
  opcrTableStatesAtom,
} from '@/features/planning/opcr/atoms'
import OpcrDialogManager from '@/features/planning/opcr/dialogs/OpcrDialogManager'
import { ROLE } from '@/lib/role'

const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)

function OpcrPage() {
  const location = useLocation()
  const [tableStates, setTableStates] = useAtom(opcrTableStatesAtom)

  // Fetch OPCRs with pagination
  const { data: opcrs } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      pageNumber: 1,
    },
  })

  const data = useMemo(() => {
    return opcrs?.data || []
  }, [opcrs])

  // Cleanup localStorage when leaving the OPCR route
  useEffect(() => {
    return () => {
      // Check if we're navigating away from the OPCR page
      const isLeavingOpcrPage = !window.location.pathname.startsWith('/planning/opcr')

      if (isLeavingOpcrPage) {
        cleanupOpcrStorage()
      }
    }
  }, [location.pathname])

  const actions: MetaActions = ROLE === 'super_admin'
    ? ['read']
    : ['write', 'read', 'delete'] 
  return (
    <>
      <TemplateTable
        title="OPCR"
        description="Office Performance Commitment Review"
        columns={Column}
        data={data}
        actions={actions}
        readonly={false}
        role={ROLE}
        toolbar={(table) => (
          <Toolbar table={table} showColumnVisibility />
        )}
        columnVisibility={tableStates.columnVisibility}
        onColumnVisibilityChange={(updater) => {
          const newVisibility =
            typeof updater === 'function'
              ? updater(tableStates.columnVisibility)
              : updater
          setTableStates((prev) => ({
            ...prev,
            columnVisibility: newVisibility,
          }))
        }}
        sorting={tableStates.sorting}
        onSortingChange={(updater) => {
          const newSorting =
            typeof updater === 'function'
              ? updater(tableStates.sorting)
              : updater
          setTableStates((prev) => ({ ...prev, sorting: newSorting }))
        }}
        columnFilters={tableStates.columnFilters}
        onColumnFiltersChange={(updater) => {
          const newFilters =
            typeof updater === 'function'
              ? updater(tableStates.columnFilters)
              : updater
          setTableStates((prev) => ({ ...prev, columnFilters: newFilters }))
        }}
        globalFilter={tableStates.globalFilter}
        onGlobalFilterChange={(value) => {
          setTableStates((prev) => ({ ...prev, globalFilter: value }))
        }}
      />

      {/* Dialog Manager */}
      <OpcrDialogManager />
    </>
  )
}

export default OpcrPage
