/**
 * KPI Tags Display Component
 * Centralized component for displaying all KPI tags (function category, compliance, development goals, distribution behavior)
 * Supports both expanded and compact views with overflow handling
 *
 * @reference See documentations/master-kpi-tagging-system.md for usage patterns
 */

import {
  FunctionCategory,
  ComplianceTag,
  DevelopmentGoal,
  TargetDistributionBehavior,
  getComplianceTagColor,
  getDistributionBehaviorColor,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Info } from 'lucide-react'
import { getDevelopmentGoalColor } from '../utils/kpiTagColors'
import { getDistributionBehaviorLabel } from '../utils/kpiDistributionBehavior.ts'

interface KpiTagsDisplayProps {
  functionCategory: FunctionCategory
  isGAD?: boolean
  complianceTags?: ComplianceTag[]
  developmentGoals?: DevelopmentGoal[]
  targetDistributionBehavior?: TargetDistributionBehavior | null
  variant?: 'compact' | 'expanded'
  maxComplianceTags?: number
  maxDevelopmentGoals?: number
}

export function KpiTagsDisplay({
  functionCategory,
  isGAD = false,
  complianceTags = [],
  developmentGoals = [],
  targetDistributionBehavior,
  variant = 'expanded',
  maxComplianceTags = variant === 'compact' ? 2 : 5,
  maxDevelopmentGoals = variant === 'compact' ? 3 : 10,
}: KpiTagsDisplayProps) {
  const funcCategoryColor: Record<FunctionCategory, string> = {
    [FunctionCategory.STRATEGIC]: 'bg-blue-100 text-blue-800',
    [FunctionCategory.CORE]: 'bg-green-100 text-green-800',
    [FunctionCategory.SUPPORT]: 'bg-amber-100 text-amber-800',
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Function Category and GAD */}
      <Badge
        variant="outline"
        className={`text-xs ${funcCategoryColor[functionCategory]}`}
      >
        {functionCategory}
      </Badge>
      {isGAD && (
        <Badge variant="outline" className="bg-pink-100 text-pink-800 text-xs">
          GAD
        </Badge>
      )}

      {/* Compliance Tags */}
      {complianceTags.slice(0, maxComplianceTags).map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={`text-xs ${getComplianceTagColor(tag)}`}
        >
          {tag}
        </Badge>
      ))}
      {complianceTags.length > maxComplianceTags && (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs">
          +{complianceTags.length - maxComplianceTags}
        </Badge>
      )}

      {/* Popover for SDG and Divisible (Horizontal Layout Requirement) */}
      {(developmentGoals.length > 0 || targetDistributionBehavior) && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted rounded-full"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 shadow-lg" side="top">
            <div className="space-y-3">
              {developmentGoals.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Development Goals
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {developmentGoals
                      .slice(0, maxDevelopmentGoals)
                      .map((goal) => (
                        <Badge
                          key={goal}
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${getDevelopmentGoalColor(goal)}`}
                        >
                          {goal}
                        </Badge>
                      ))}
                    {developmentGoals.length > maxDevelopmentGoals && (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0"
                      >
                        +{developmentGoals.length - maxDevelopmentGoals}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {targetDistributionBehavior && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Target Distribution
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${getDistributionBehaviorColor(targetDistributionBehavior)}`}
                    >
                      {getDistributionBehaviorLabel(targetDistributionBehavior)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
