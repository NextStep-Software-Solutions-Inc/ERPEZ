import { useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { getCategoryVisuals } from '@/pages/planning/commitments/utils/functions'
import type { OPCR, OPCRDetails } from '../types/type.opcr'

interface FunctionTypeFilterWrapperProps {
  opcr: OPCRDetails | null
  children?: React.ReactNode
}

/**
 * Function Type Filter Wrapper
 * Renders function type cards or passes through to KPI detail view
 *
 * URL Navigation:
 * - Without functionTypeId: Show function type cards
 * - With functionTypeId: Render filtered content (delegated to children)
 */
export function FunctionTypeFilterWrapper({
  opcr,
  children,
}: FunctionTypeFilterWrapperProps) {
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const navigate = useNavigate({ from: '/v2/commitments' })

  // Read functionTypeId from URL
  const functionTypeId =
    (searchParams.functionTypeId as string | undefined) ?? undefined

  // Build function types array from enum

  // If functionTypeId is set, render children (filtered view)
  if (functionTypeId && children) {
    return <>{children}</>
  }

  // Otherwise, show function type cards
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Function Type Categories
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a function type to view KPIs and activities
        </p>
      </div>

      {/* Function Type Cards */}
      <div className="space-y-4">
        {Object.values(FunctionCategory).map((category) => {
          const visuals = getCategoryVisuals(category)
          const IconComponent = visuals.icon

          return (
            <Button
              key={category}
              className={`group relative h-auto overflow-hidden bg-card dark:bg-slate-900/65 border border-border rounded-xl p-6 text-left transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:bg-muted/40 dark:hover:bg-slate-800/75 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full border-l-4 ${visuals.leftBorderColor}`}
              onClick={() => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    functionTypeId: category,
                  }),
                })
              }}
              variant="ghost"
            >
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between w-full">
                {/* Left Content */}
                <div className="flex items-center gap-5 flex-1">
                  <div
                    className={`p-4 rounded-xl shrink-0 ${visuals.iconBgColor}`}
                  >
                    <IconComponent className={`h-7 w-7 ${visuals.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">
                      {visuals.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {visuals.description}
                    </p>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex items-center gap-6 shrink-0 ml-6">
                  <Badge
                    variant="outline"
                    className={`${visuals.badgeBgColor} ${visuals.badgeTextColor} ${visuals.badgeBorderColor}`}
                  >
                    {opcr?.opcrItems?.filter(
                      (kpi) => kpi.functionCategory === category,
                    ).length === 0 ? (
                      <span>0 KPI</span>
                    ) : (
                      <span>
                        {
                          opcr?.opcrItems?.filter(
                            (kpi) => kpi.functionCategory === category,
                          ).length
                        }{' '}
                        KPI
                      </span>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-6">
                  <Badge>View Details</Badge>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
