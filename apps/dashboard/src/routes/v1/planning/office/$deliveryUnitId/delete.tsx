import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import DeleteDeliveryUnitDialog from '@/components/features/planning/delivery-unit/dialog/DeleteDeliveryUnitDialog'

export const Route = createFileRoute('/v1/planning/office/$deliveryUnitId/delete')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const router = useRouter()
  const search = useSearch({
    from: Route.id,
  })

  const { deliveryUnitId } = useParams({
    from: Route.id,
  })

  const handleCancel = () => {
    router.navigate({
      to: '/planning/office',
      replace: true,
      search: search,
    })
  }

  return (
    <DeleteDeliveryUnitDialog
      open
      ids={[deliveryUnitId]}
      onCancel={handleCancel}
      onSuccess={handleCancel}
    />
  )
}
