import { Button } from '@/components/ui/button'
import {
  Target,
  ArrowLeft,
  ArrowRight,
  Share2,
  Printer,
  FileText,
} from 'lucide-react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
// import { KPITarget } from './types'
import { Badge } from '@/components/ui/badge'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { getCategoryVisuals } from '../utils/functions'
import { useNavigate, useSearch } from '@tanstack/react-router'

interface FunctionTypeListPageProps {
  fiscalYear: number
  allKPIs: Array<{ functionType: FunctionCategory }>
  title?: string
  subtitle?: string
  onExportPDF?: () => void
  onExportExcel?: () => void
  onSubmitForPMT?: () => Promise<void> | void
  onSelectFunctionType?: (category: FunctionCategory) => void
  onBack?: () => void
}

export function FunctionTypeListPage({
  fiscalYear,
  allKPIs,
  subtitle,
  onExportPDF,
  onExportExcel,
  onSubmitForPMT,
  onSelectFunctionType,
  onBack,
}: FunctionTypeListPageProps) {
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const navigation = useNavigate({ from: '/v2/commitments' })

  // Build function types array from enum
  const functionTypes = Object.values(FunctionCategory).map((category) => ({
    id: category,
    ...getCategoryVisuals(category),
  }))

  // Count KPIs per function category based on kpi's functionType
  const getFunctionCategoryKPICount = (category: FunctionCategory): number => {
    return allKPIs.filter((kpi) => kpi.functionType === category).length
  }
  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => {
          if (onBack) {
            onBack()
          } else {
            navigation({
              search: { tab: 'strategicTarget', fiscalYearId: undefined },
              replace: true,
            })
          }
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Page Title and Description */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Strategic Targets
            </h2>
          </div>
          <p className="text-base text-gray-500">
            {subtitle || 'Select a Function Type to view KPIs'}
          </p>
        </div>

        {/* Export popover aligned to Strategic Targets header (submit button present) */}
        <div className="flex items-center gap-3">
          {(onExportPDF || onExportExcel) && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-44 p-2">
                <div className="flex flex-col gap-2">
                  {onExportPDF && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => onExportPDF()}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  )}
                  {onExportExcel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => onExportExcel()}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {onSubmitForPMT && (
            <Button
              variant="default"
              size="sm"
              className="bg-primary-600 text-white hover:bg-primary-700"
              onClick={() => onSubmitForPMT()}
            >
              For PMT Review
            </Button>
          )}
        </div>
      </div>

      {/* Function Type Cards List */}
      <div className="space-y-6">
        {functionTypes.map((functionType) => {
          const kpiCount = getFunctionCategoryKPICount(functionType.id)
          const IconComponent = functionType.icon

          return (
            <Button
              key={functionType.id}
              className={`group relative h-30 overflow-hidden bg-white border border-gray-200 rounded-lg p-8 text-left transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full border-l-4 ${functionType.leftBorderColor}`}
              onClick={() => {
                if (onSelectFunctionType) {
                  onSelectFunctionType(functionType.id)
                } else {
                  navigation({
                    search: {
                      ...searchParams,
                      functionCategory: functionType.id,
                      strategicTargetTabView: 'KeyPerformanceIndicator',
                    },
                  })
                }
              }}
            >
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between w-full">
                {/* Left Content */}
                <div className="flex items-center gap-6 flex-1 ">
                  <div
                    className={`p-4 rounded-lg shrink-0 ${functionType.iconBgColor}`}
                  >
                    <IconComponent
                      className={`h-8 w-8 ${functionType.iconColor}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {functionType.title}
                    </h3>
                    <p className="text-base text-gray-500 mt-2">
                      {functionType.description}
                    </p>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex items-center gap-6 shrink-0 ml-6">
                  <Badge
                    variant="outline"
                    className={`text-base font-semibold whitespace-nowrap px-4 py-2 ${functionType.badgeBgColor} ${functionType.badgeTextColor} ${functionType.badgeBorderColor}`}
                  >
                    {kpiCount} KPI{kpiCount !== 1 ? 's' : ''}
                  </Badge>
                  <ArrowRight className="h-6 w-6 text-gray-300 group-hover:text-gray-600 transition-colors shrink-0" />
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Empty State */}
      {allKPIs.length === 0 && (
        <div className="text-center py-16 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">
            No strategic targets found for Fiscal Year {fiscalYear}.
          </p>
        </div>
      )}
    </div>
  )
}
