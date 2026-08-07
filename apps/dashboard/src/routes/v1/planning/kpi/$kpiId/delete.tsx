import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { openDeleteDialogAtom } from '@/components/features/planning/kpi/atoms/dialogAtoms'
import { getKpiRequest } from '@/components/features/planning/kpi/handlers/getKpiRequest'

const useKpi = createQueryHookFromTemplate(getKpiRequest)

export const Route = createFileRoute('/v1/planning/kpi/$kpiId/delete')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const search = useSearch({
    from: Route.id,
  })
  const { kpiId } = useParams({
    from: Route.id,
  })

  const openDeleteDialog = useSetAtom(openDeleteDialogAtom)

  // Fetch KPI data to pass to dialog
  const { data: kpi } = useKpi({
    pathParams: { id: kpiId },
    queryParams: {},
  })

  // Open dialog when KPI data is loaded
  useEffect(() => {
    if (kpi?.data) {
      openDeleteDialog([kpi.data])
      // Navigate back to prevent staying on this route
      void router.navigate({ to: '/planning/kpi', replace: true, search: search })
    }
  }, [kpi, openDeleteDialog, router, search])

  return null
}
