import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { ShieldAlert } from 'lucide-react'

export function AccessDeniedFallback({
  role,
  message,
}: {
  role?: string
  message?: string
}) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-xs">
      <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        Access Denied
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {message ||
          (role
            ? `Your active role (${role}) does not have permission to access this module.`
            : 'You do not have the required permissions to view or manage this module. Please contact your administrator if you require access.')}
      </p>
      <div className="flex gap-3">
        <Link to="/">
          <Button variant="outline">Go Home</Button>
        </Link>
        <Link to="/v2/dashboard">
          <Button variant="default">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
