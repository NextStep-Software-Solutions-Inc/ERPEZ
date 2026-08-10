/**
 * PPMP Management Route
 * Renders a unified My PPMPs page with all statuses in a single table + filter.
 */

import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { MyPpmpsPage } from '@/features/planning/ppmp/pages/MyPpmpsPage'
import { ppmpManagementSearchSchema } from './constants'

export const Route = createFileRoute('/v2/(planning)/ppmp/')({
  validateSearch: (search) => ppmpManagementSearchSchema.parse(search),
  component: PPMPManagementPage,
})

function PPMPManagementPage() {
  const searchParams = Route.useSearch()

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match KPI Library styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Project Procurement Management Plan</CardTitle>
              <CardDescription className="text-base">
                Manage your PPMP documents across all stages — draft, approval, and amendments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Procurement Planning
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <MyPpmpsPage searchParams={searchParams} />
    </div>
  )
}
