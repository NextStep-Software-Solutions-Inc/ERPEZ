import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/v1/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-10 h-screen">
      <p>
        Temporary Page for overview that will be used to redirect users to the
        appropriate section.
      </p>
      <Button>
        <Link to="/planning">Go to Planning Overview</Link>
      </Button>
    </div>
  )
}
