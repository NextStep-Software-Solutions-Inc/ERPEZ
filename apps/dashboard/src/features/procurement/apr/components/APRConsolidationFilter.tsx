/**
 * APR Consolidation Filter Component
 * Allows filtering by Categories, Months, and Funds
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

const CATEGORIES = ['Goods', 'Services', 'Infrastructure']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const FUNDS = ['General Fund', 'SEF', 'Trust Fund', 'Special Appropriations']

interface APRConsolidationFilterProps {
  selectedCategories?: string[]
  selectedMonths?: string[]
  selectedFunds?: string[]
  onCategoriesChange?: (categories: string[]) => void
  onMonthsChange?: (months: string[]) => void
  onFundsChange?: (funds: string[]) => void
}

export function APRConsolidationFilter({
  selectedCategories = [],
  selectedMonths = [],
  selectedFunds = [],
  onCategoriesChange,
  onMonthsChange,
  onFundsChange,
}: APRConsolidationFilterProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Categories Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 font-semibold">
          <ChevronDown className="h-4 w-4" />
          Categories
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={(checked) => {
                  if (onCategoriesChange) {
                    if (checked) {
                      onCategoriesChange([...selectedCategories, cat])
                    } else {
                      onCategoriesChange(
                        selectedCategories.filter((c) => c !== cat)
                      )
                    }
                  }
                }}
              />
              <Label htmlFor={`cat-${cat}`} className="cursor-pointer text-sm">
                {cat}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Months Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 font-semibold">
          <ChevronDown className="h-4 w-4" />
          Months
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2 max-h-48 overflow-y-auto">
          {MONTHS.map((month) => (
            <div key={month} className="flex items-center space-x-2">
              <Checkbox
                id={`month-${month}`}
                checked={selectedMonths.includes(month)}
                onCheckedChange={(checked) => {
                  if (onMonthsChange) {
                    if (checked) {
                      onMonthsChange([...selectedMonths, month])
                    } else {
                      onMonthsChange(
                        selectedMonths.filter((m) => m !== month)
                      )
                    }
                  }
                }}
              />
              <Label htmlFor={`month-${month}`} className="cursor-pointer text-sm">
                {month}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Funds Filter */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 font-semibold">
          <ChevronDown className="h-4 w-4" />
          Funds
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {FUNDS.map((fund) => (
            <div key={fund} className="flex items-center space-x-2">
              <Checkbox
                id={`fund-${fund}`}
                checked={selectedFunds.includes(fund)}
                onCheckedChange={(checked) => {
                  if (onFundsChange) {
                    if (checked) {
                      onFundsChange([...selectedFunds, fund])
                    } else {
                      onFundsChange(selectedFunds.filter((f) => f !== fund))
                    }
                  }
                }}
              />
              <Label htmlFor={`fund-${fund}`} className="cursor-pointer text-sm">
                {fund}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
