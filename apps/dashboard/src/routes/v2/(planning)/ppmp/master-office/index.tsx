import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { MasterOfficePpmpPage } from '@/features/planning/ppmp/pages/MasterOfficePpmpPage'

export const Route = createFileRoute('/v2/(planning)/ppmp/master-office/')({
  component: MasterOfficeRoute,
})

function MasterOfficeRoute() {
  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match unified PPMP layout */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">Project Procurement Management Plan</CardTitle>
              <CardDescription className="text-base font-normal">
                Manage your PPMP documents across all stages — draft, approval, and amendments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/v2/ppmp">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-muted-foreground hover:text-foreground bg-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to PPMP List
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      <MasterOfficePpmpPage />
    </div>
  )
}
