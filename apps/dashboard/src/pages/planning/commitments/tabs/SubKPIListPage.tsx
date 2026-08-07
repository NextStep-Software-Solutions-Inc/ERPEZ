import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Eye, Search } from 'lucide-react'
import { KPITarget } from './types'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { useState, useMemo } from 'react'
import { normalizeFunctionType } from '../utils/functions'

interface SubKPIListPageProps {
  parentKPI: KPITarget
  onBack: () => void
  onViewSubKPI: (subKpi: KPITarget) => void
}

const getDimensionClasses = (indicator: string) => {
  switch (indicator) {
    case 'Quality':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'Efficiency':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Timeliness':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getFunctionTypeClasses = (functionType: FunctionCategory | string) => {
  const normalized = normalizeFunctionType(functionType)
  switch (normalized) {
    case FunctionCategory.STRATEGIC:
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case FunctionCategory.CORE:
      return 'bg-green-100 text-green-800 border-green-300'
    case FunctionCategory.SUPPORT:
      return 'bg-orange-100 text-orange-800 border-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export function SubKPIListPage({
  parentKPI,
  onBack,
  onViewSubKPI,
}: SubKPIListPageProps) {
  // Selection state
  const [selectedSubKPIs, setSelectedSubKPIs] = useState<Set<string>>(new Set())

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Define number of sub-KPIs for each KPI ID
  const subKPICountByKpiId: { [key: string]: number } = {
    '101': 3, // Cost Reduction: 3 sub-KPIs
    '102': 5, // Customer Satisfaction: 5 sub-KPIs
    '103': 2, // Process Improvement: 2 sub-KPIs
  }

  const subKPICount = subKPICountByKpiId[parentKPI.kpiId] || 2 // Default to 2 if not specified

  // Generate mock Sub-KPI data based on count
  const allSubKPIs = Array.from({ length: subKPICount }, (_, i) => ({
    id: `${parentKPI.id}-sub-${i + 1}`,
    kpiId: parentKPI.kpiId,
    parentKPIId: parentKPI.id,
    kpiName: `${parentKPI.kpiName} - Component ${String.fromCharCode(65 + i)}`,
    name: `${parentKPI.kpiName} - Component ${String.fromCharCode(65 + i)}`,
    description: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} component of the main KPI`,
    dimension: parentKPI.dimension || 'Quality',
    dimensionCriteria: parentKPI.dimensionCriteria || [],
    functionType: parentKPI.functionType || FunctionCategory.STRATEGIC,
    timelineType: parentKPI.timelineType || 'Quarterly',
    office: parentKPI.office || 'Planning',
    fiscalYear: parentKPI.fiscalYear,
    isPercentage:
      parentKPI.isPercentage !== undefined ? parentKPI.isPercentage : true,
    isFixed: parentKPI.isFixed !== undefined ? parentKPI.isFixed : false,
    isTargetAllocable:
      parentKPI.isTargetAllocable !== undefined
        ? parentKPI.isTargetAllocable
        : true,
    isAverage: parentKPI.isAverage !== undefined ? parentKPI.isAverage : false,
    isGlobal: parentKPI.isGlobal !== undefined ? parentKPI.isGlobal : false,
    isActive: true,
    parentKPI: parentKPI,
    weight: 0,
    isMandatory:
      parentKPI.isMandatory !== undefined ? parentKPI.isMandatory : false,
    isWeightLocked: false,
    isLocked: false,
    createdBy: parentKPI.createdBy || 'Planning',
    lastUpdated: parentKPI.lastUpdated || new Date().toISOString(),
    targetPeriods:
      parentKPI.targetPeriods && parentKPI.targetPeriods.length > 0
        ? parentKPI.targetPeriods
        : [
            {
              id: 1,
              periodName: 'Q1',
              value: 0,
              startDate: '2025-01-01',
              endDate: '2025-03-31',
              isLocked: false,
            },
            {
              id: 2,
              periodName: 'Q2',
              value: 0,
              startDate: '2025-04-01',
              endDate: '2025-06-30',
              isLocked: false,
            },
            {
              id: 3,
              periodName: 'Q3',
              value: 0,
              startDate: '2025-07-01',
              endDate: '2025-09-30',
              isLocked: false,
            },
            {
              id: 4,
              periodName: 'Q4',
              value: 0,
              startDate: '2025-10-01',
              endDate: '2025-12-31',
              isLocked: false,
            },
          ],
    status: 'Active',
  })) as unknown as KPITarget[]

  // Filter sub-KPIs based on search term
  const filteredSubKPIs = useMemo(() => {
    return allSubKPIs.filter(
      (subKpi) =>
        subKpi.kpiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subKpi.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [allSubKPIs, searchTerm])

  const handleSelectSubKPI = (subKpiId: string, checked: boolean) => {
    const newSelected = new Set(selectedSubKPIs)
    if (checked) {
      newSelected.add(subKpiId)
    } else {
      newSelected.delete(subKpiId)
    }
    setSelectedSubKPIs(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubKPIs(new Set(filteredSubKPIs.map((subKpi) => subKpi.id)))
    } else {
      setSelectedSubKPIs(new Set())
    }
  }

  const isAllSelected =
    filteredSubKPIs.length > 0 &&
    filteredSubKPIs.every((subKpi) => selectedSubKPIs.has(subKpi.id))
  const isIndeterminate =
    filteredSubKPIs.some((subKpi) => selectedSubKPIs.has(subKpi.id)) &&
    !isAllSelected

  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 gap-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to KPI List
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sub-KPIs</h2>
        <p className="text-gray-600 mt-2">
          Sub-KPIs for:{' '}
          <span className="font-semibold">{parentKPI.kpiName}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Sub-KPI by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sub-KPI Table */}
      {filteredSubKPIs.length > 0 ? (
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        isAllSelected
                          ? true
                          : isIndeterminate
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all Sub-KPIs"
                    />
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    Sub-KPI Name
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    Dimension
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    Function Type
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    Description
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubKPIs.map((subKpi) => (
                  <TableRow key={subKpi.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedSubKPIs.has(subKpi.id)}
                        onCheckedChange={(checked) =>
                          handleSelectSubKPI(subKpi.id, checked as boolean)
                        }
                        aria-label={`Select Sub-KPI ${subKpi.kpiName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {subKpi.kpiName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getDimensionClasses(subKpi.dimension)}
                      >
                        {subKpi.dimension}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getFunctionTypeClasses(subKpi.functionType)}
                      >
                        {subKpi.functionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {subKpi.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          subKpi.isActive
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }
                      >
                        {subKpi.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewSubKPI(subKpi)}
                        className="gap-2 text-purple-600 border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No Sub-KPIs found
            {searchTerm ? ' matching your search' : ' for this KPI'}.
          </p>
        </div>
      )}
    </div>
  )
}
