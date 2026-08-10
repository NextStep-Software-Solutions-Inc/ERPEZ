import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import DeleteDuKpiAssignmentDialog from '@/components/features/planning/kpi-assignment-for-du/dialog/DeleteDuKpiAssignmentDialog'

export const Route = createFileRoute(
  '/v1/planning/kpi-assignment-for-du/$kpiAssignmentForDuId/delete',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const search = useSearch({
    from: Route.id,
  })
  const { kpiAssignmentForDuId } = useParams({
    from: Route.id,
  })

  const handleCancel = () => {
    router.navigate({
      to: '/planning/kpi-assignment-for-du',
      replace: true,
      search: search,
    })
  }

  return (
    <DeleteDuKpiAssignmentDialog
      open
      ids={[kpiAssignmentForDuId]}
      onCancel={handleCancel}
      onSuccess={handleCancel}
    />
  )
}
