import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useOPCRById } from '@/features/planning/opcr/hooks/useOPCR'
import { countKPIsByCategory, normalizeCategory } from '@/features/planning/opcr/utils/countKPIsByCategory'
import { getCategoryVisuals } from '../utils/functions'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { getStatusLabel } from '@/utils/formatters'
import OPCRItemKPIAccordion from '@/features/planning/opcr/components/OPCRItemKPIAccordion'
import { OPCRItem } from '@/features/planning/opcr/types/type.opcr'

interface OPCRDetailPageProps {
  opcrId: string
  onBack: () => void
  hideButton?: boolean
}

export default function OPCRDetailPage({
  opcrId,
  onBack,
  hideButton,
}: OPCRDetailPageProps) {
  const [expandedAccordionItems, setExpandedAccordionItems] = useState<
    string[]
  >([])
  const [createActivityDialogOpen, setCreateActivityDialogOpen] =
    useState(false)
  const [selectedKPIForActivity, setSelectedKPIForActivity] =
    useState<OPCRItem | null>(null)
  const navigation = useNavigate({ from: '/v2/commitments' })
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const { functionCategory } = searchParams
  const { data: opcrResponse, isLoading } = useOPCRById({
    pathParams: { id: opcrId },
    queryParams: {},
  })
  const opcrData = opcrResponse?.data

  // Filter KPIs by selected category
  const filteredKPIs =
    functionCategory && opcrData?.opcrItems
      ? opcrData.opcrItems.filter((item) => {
          const itemCat =
            item.functionCategory ||
            item.kpiAssignment?.fyActiveKPI?.functionCategory
          return normalizeCategory(itemCat) === normalizeCategory(functionCategory)
        })
      : []

  // Helper to calculate quarterly targets from quarterly values
  const getQuarterlyTargets = (opcrItem: OPCRItem): Record<string, number> => {
    return {
      Q1: opcrItem.q1Target || 0,
      Q2: opcrItem.q2Target || 0,
      Q3: opcrItem.q3Target || 0,
      Q4: opcrItem.q4Target || 0,
      'Annual Target':
        (opcrItem.q1Target || 0) +
        (opcrItem.q2Target || 0) +
        (opcrItem.q3Target || 0) +
        (opcrItem.q4Target || 0),
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!opcrData) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No OPCR data available
      </div>
    )
  }

  const functionTypes = Object.values(FunctionCategory).map((category) => ({
    id: category,
    ...getCategoryVisuals(category),
  }))

  const getFunctionCategoryKPICount = (category: string): number => {
    return countKPIsByCategory(opcrData.opcrItems, category)
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      {!hideButton && (
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      )}

      {/* Page Title and Description */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {opcrData.name}
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              {opcrData.office?.name} • FY {opcrData.fiscalYear?.year}
            </p>
          </div>
          <p className="text-base text-gray-500">
            Status: {getStatusLabel(opcrData.commitmentStatus ?? 'Unknown')}
          </p>
        </div>
      </div>

      {/* Function Type Cards List */}
      {!functionCategory && (
        <div className="space-y-6">
          {functionTypes.map((functionType) => {
            const kpiCount = getFunctionCategoryKPICount(functionType.id)
            const IconComponent = functionType.icon

            return (
              <Button
                key={functionType.id}
                className={`group relative h-30 overflow-hidden bg-white border border-gray-200 rounded-lg p-8 text-left transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full border-l-4 ${functionType.leftBorderColor}`}
                onClick={() => {
                  navigation({
                    search: {
                      ...searchParams,
                      functionCategory: functionType.id,
                    },
                  })
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
      )}
      {functionCategory && (
        <>
          {/* KPIs Accordion Section */}
          <div className="space-y-4">
            {filteredKPIs && filteredKPIs.length > 0 ? (
              <OPCRItemKPIAccordion
                filteredKPIs={filteredKPIs}
                expandedAccordionItems={expandedAccordionItems}
                setExpandedAccordionItems={setExpandedAccordionItems}
                createActivityDialogOpen={createActivityDialogOpen}
                setCreateActivityDialogOpen={setCreateActivityDialogOpen}
                selectedKPIForActivity={selectedKPIForActivity}
                setSelectedKPIForActivity={setSelectedKPIForActivity}
                getQuarterlyTargets={getQuarterlyTargets}
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  No KPIs assigned to this OPCR
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
