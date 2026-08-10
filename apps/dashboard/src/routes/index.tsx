import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-10 h-screen">
      <p>Welcome to the Dashboard</p>
      <Button>
        <Link to="/v1/overview">Go to Overview</Link>
      </Button>
    </div>
  )
}
