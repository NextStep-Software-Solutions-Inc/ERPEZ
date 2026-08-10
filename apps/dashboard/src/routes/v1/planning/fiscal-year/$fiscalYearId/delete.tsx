import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import DeleteFiscalYearDialog from '@/components/features/planning/fiscal-year/dialog/DeleteFunctionPercentageDialog'

export const Route = createFileRoute(
  '/v1/planning/fiscal-year/$fiscalYearId/delete',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const search = useSearch({
    from: Route.id,
  })
  const { fiscalYearId } = useParams({
    from: Route.id,
  })

  const handleCancel = () => {
    router.navigate({ to: '/planning/kpi', replace: true, search: search })
  }
  const ids = fiscalYearId.split(',')

  return (
    <DeleteFiscalYearDialog
      open
      ids={ids}
      onCancel={handleCancel}
      onSuccess={handleCancel}
    />
  )
}
