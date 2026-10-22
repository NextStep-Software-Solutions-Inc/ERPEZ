/**
 * PPMP Management Route
 * Renders a unified My PPMPs page with all statuses in a single table + filter.
 */

import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { MyPpmpsPage } from '@/features/planning/ppmp/pages/MyPpmpsPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'
import { ppmpManagementSearchSchema } from './constants'

export const Route = createFileRoute('/v2/(planning)/ppmp/')({
  validateSearch: (search) => ppmpManagementSearchSchema.parse(search),
  component: PPMPManagementPage,
})

function PPMPManagementPage() {
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Ppmp.View}
      message="You do not have permission to view PPMPs."
    >
      <div className="w-full space-y-6 pb-10">
        {/* Header - match KPI Library styling */}
        <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-3xl">
                  Project Procurement Management Plan
                </CardTitle>
                <CardDescription className="text-base">
                  Manage department and project-level procurement plans, items, and
                  timelines
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-fit px-3 py-1 font-semibold"
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Procurement
                  Planning
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <MyPpmpsPage searchParams={searchParams} navigate={navigate} />
      </div>
    </RoutePermissionGuard>
  )
}
