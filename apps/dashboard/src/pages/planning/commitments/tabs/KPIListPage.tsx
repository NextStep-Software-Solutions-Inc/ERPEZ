import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Eye, Search, ChevronRight } from 'lucide-react'
import { KPITarget } from './types'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { KpiActionMenu } from '@/components/KpiActionMenu'
import { useState, useEffect, useMemo } from 'react'
import { normalizeFunctionType } from '../utils/functions'

interface KPIListPageProps {
  fiscalYear: number
  selectedFunctionType: FunctionCategory
  allKPIs: KPITarget[]
  onBack: () => void
  onViewKPI: (kpi: KPITarget) => void
  onViewSubKPIs: (kpi: KPITarget) => void
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

export function KPIListPage({
  fiscalYear,
  selectedFunctionType,
  allKPIs,
  onBack,
  onViewKPI,
  onViewSubKPIs,
}: KPIListPageProps) {
  // Selection state
  const [selectedKPIs, setSelectedKPIs] = useState<Set<string>>(new Set())

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Filter state
  const [dimensionFilter, setDimensionFilter] = useState<string>('all')

  // Filter KPIs by fiscal year, function type, and search term
  const filteredKPIs = useMemo(() => {
    let filtered = allKPIs.filter(
      (kpi) =>
        kpi.fiscalYear.year === fiscalYear &&
        kpi.functionType.toLowerCase() === selectedFunctionType.toLowerCase() &&
        kpi.kpiName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (dimensionFilter === 'all' || kpi.dimension === dimensionFilter),
    )

    // Remove duplicates based on kpiId + dimension + functionType + fiscalYear
    const seen = new Set<string>()
    filtered = filtered.filter((kpi) => {
      const key = `${kpi.kpiId}-${kpi.dimension}-${kpi.functionType}-${kpi.fiscalYear.id}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })

    // Sort by KPI Name (alphabetical), then Dimension order (Quality, Efficiency, Timeliness)
    const dimensionOrder = { Quality: 1, Efficiency: 2, Timeliness: 3 }
    filtered.sort((a, b) => {
      if (a.kpiName !== b.kpiName) {
        return a.kpiName.localeCompare(b.kpiName)
      }
      return dimensionOrder[a.dimension] - dimensionOrder[b.dimension]
    })

    return filtered
  }, [allKPIs, fiscalYear, selectedFunctionType, searchTerm, dimensionFilter])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Calculate pagination
  const totalItems = filteredKPIs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedKPIs = filteredKPIs.slice(startIndex, endIndex)

  // Calculate sub-KPI count for each KPI (must match SubKPIListPage)
  const getSubKPICount = (kpi: KPITarget): number => {
    const subKPICountByKpiId: { [key: string]: number } = {
      '101': 3, // Cost Reduction: 3 sub-KPIs
      '102': 5, // Customer Satisfaction: 5 sub-KPIs
      '103': 2, // Process Improvement: 2 sub-KPIs
    }
    return subKPICountByKpiId[kpi.kpiId] || 2 // Default to 2 if not specified
  }

  const handleSelectKPI = (kpiId: string, checked: boolean) => {
    const newSelected = new Set(selectedKPIs)
    if (checked) {
      newSelected.add(kpiId)
    } else {
      newSelected.delete(kpiId)
    }
    setSelectedKPIs(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKPIs(new Set(paginatedKPIs.map((kpi) => kpi.id)))
    } else {
      setSelectedKPIs(new Set())
    }
  }

  const isAllSelected =
    paginatedKPIs.length > 0 &&
    paginatedKPIs.every((kpi) => selectedKPIs.has(kpi.id))
  const isIndeterminate =
    paginatedKPIs.some((kpi) => selectedKPIs.has(kpi.id)) && !isAllSelected

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
    setSelectedKPIs(new Set())
  }, [fiscalYear, selectedFunctionType, searchTerm, dimensionFilter])

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
          Back
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">KPI List</h2>
          <Badge
            variant="outline"
            className={getFunctionTypeClasses(selectedFunctionType)}
          >
            {selectedFunctionType}
          </Badge>
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search KPI by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Filter by:
          </span>
          <Select value={dimensionFilter} onValueChange={setDimensionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Dimension" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dimensions</SelectItem>
              <SelectItem value="Quality">Quality</SelectItem>
              <SelectItem value="Efficiency">Efficiency</SelectItem>
              <SelectItem value="Timeliness">Timeliness</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Table */}
      {filteredKPIs.length > 0 ? (
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
                      aria-label="Select all KPIs"
                    />
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    KPI Name
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    Dimension
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold">
                    Description
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-center">
                    No. of Sub-KPI
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedKPIs.map((kpi) => (
                  <TableRow
                    key={`${kpi.kpiId}-${kpi.dimension}-${kpi.functionType}-${kpi.fiscalYear}`}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedKPIs.has(kpi.id)}
                        onCheckedChange={(checked) =>
                          handleSelectKPI(kpi.id, checked as boolean)
                        }
                        aria-label={`Select KPI ${kpi.kpiName} - ${kpi.dimension}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {kpi.kpiName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getDimensionClasses(kpi.dimension)}
                      >
                        {kpi.dimension}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {kpi.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {getSubKPICount(kpi)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <KpiActionMenu onView={() => onViewKPI(kpi)} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{' '}
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
                {totalItems} KPIs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No KPIs found for {selectedFunctionType} in Fiscal Year {fiscalYear}
            .
          </p>
        </div>
      )}
    </div>
  )
}
