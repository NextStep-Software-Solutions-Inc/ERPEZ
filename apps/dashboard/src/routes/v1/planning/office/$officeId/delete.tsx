import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import DeleteOfficeDialog from '@/components/features/planning/office/office/dialog/DeleteOfficeDialog'

export const Route = createFileRoute('/v1/planning/office/$officeId/delete')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const search = useSearch({
    from: Route.id,
  })

  const { officeId } = useParams({
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
    <DeleteOfficeDialog
      open
      ids={[officeId]}
      onCancel={handleCancel}
      onSuccess={handleCancel}
    />
  )
}
