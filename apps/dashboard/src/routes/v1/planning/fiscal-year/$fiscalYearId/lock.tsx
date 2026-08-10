import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { useState } from 'react'
import LockFunctionAllocationDialog from '@/components/features/planning/function-allocation/dialog/LockFunctionAllocationDialog'

export const Route = createFileRoute(
  '/v1/planning/fiscal-year/$fiscalYearId/lock',
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

  const [open, setOpen] = useState(true)
  const ids = fiscalYearId.split(',')

  const handleCancel = () => {
    setOpen(false)
    router.navigate({ to: '/planning/kpi', replace: true, search: search })
  }

  return (
    <LockFunctionAllocationDialog
      ids={ids}
      open={open}
      onOpenChange={setOpen}
      onCancel={handleCancel}
    />
  )
}
