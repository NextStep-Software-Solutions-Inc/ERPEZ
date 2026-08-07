import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getCategoryVisuals } from '@/pages/planning/commitments/utils/functions'
import type { FunctionCategory } from '@/features/planning/master-kpi/types'
import type { OfficeGroup } from '@/features/planning/kpi-assignment/types/grouping.types'

interface StrategicTargetBreadcrumbProps {
  officeId?: string
  selectedOffice?: OfficeGroup
  fiscalYearId?: string
  functionCategory?: FunctionCategory
  isLevel4View?: boolean
  onClickRoot: () => void
  onClickOffice: () => void
  onClickFiscalYear: () => void
  onClickFunctionCategory: () => void
}

export function StrategicTargetBreadcrumb({
  officeId,
  selectedOffice,
  fiscalYearId,
  functionCategory,
  isLevel4View,
  onClickRoot,
  onClickOffice,
  onClickFiscalYear,
  onClickFunctionCategory,
}: StrategicTargetBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {/* Root: Strategic Target by Office */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <button
              onClick={onClickRoot}
              className="cursor-pointer hover:text-primary bg-none border-none p-0 font-normal text-foreground"
            >
              Strategic Target by Office
            </button>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Level 2: Office Name */}
        {officeId && selectedOffice && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  onClick={onClickOffice}
                  className="cursor-pointer hover:text-primary bg-none border-none p-0 font-normal text-foreground"
                >
                  {selectedOffice.name}
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 3: Fiscal Year */}
        {fiscalYearId && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  onClick={onClickFiscalYear}
                  className="cursor-pointer hover:text-primary bg-none border-none p-0 font-normal text-foreground"
                >
                  Fiscal Year {fiscalYearId}
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 4: Function Category */}
        {functionCategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  onClick={onClickFunctionCategory}
                  className="cursor-pointer hover:text-primary bg-none border-none p-0 font-normal text-foreground"
                >
                  {getCategoryVisuals(functionCategory).title}
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 5: KPI Details */}
        {isLevel4View && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="cursor-default">
                KPI Details
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
