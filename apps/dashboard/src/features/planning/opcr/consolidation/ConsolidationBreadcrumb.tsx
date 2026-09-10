import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type ConsolidateSubTab = 'selection' | 'consolidated'

interface ConsolidationBreadcrumbProps {
  consolidateSubTab: ConsolidateSubTab
  opcrId?: string
  opcrConsolidationId?: string
  functionTypeId?: string
  functionCategory?: string
  kpiAssignmentId?: string
  kpiId?: string
  onClickRoot: () => void
  onClickConsolidation?: () => void
  onClickOpcr?: () => void
  onClickFunctionType?: () => void
  onClickFunctionCategory?: () => void
  onClickKpiAssignment?: () => void
}

/**
 * Selection Stage Breadcrumb
 * Shows navigation for OPCR selection and detail views
 *
 * Examples:
 * - OPCR Selection
 * - OPCR Selection / OPCR Details
 * - OPCR Selection / OPCR Details / Core Functions
 * - OPCR Selection / OPCR Details / Core Functions / KPI Assignment
 */
function SelectionStageBreadcrumb({
  opcrId,
  functionTypeId,
  functionCategory,
  kpiAssignmentId,
  kpiId,
  onClickRoot,
  onClickOpcr,
  onClickFunctionType,
  onClickFunctionCategory,
}: Omit<
  ConsolidationBreadcrumbProps,
  | 'consolidateSubTab'
  | 'opcrConsolidationId'
  | 'onClickConsolidation'
  | 'onClickSubTab'
  | 'onClickKpiAssignment'
>) {
  const isOPCRDetailView = !!opcrId
  const isFunctionTypeView = !!functionTypeId && !!opcrId
  const isFunctionCategoryView = !!functionCategory && !!opcrId
  const isKPIAssignmentView = !!kpiAssignmentId && !!opcrId
  const isKPIDetailView =
    !!kpiId && (!!functionTypeId || !!functionCategory) && !!opcrId

  const functionTypeLabels: Record<string, string> = {
    STRATEGIC: 'Strategic Functions',
    CORE: 'Core Functions',
    SUPPORT: 'Support Functions',
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {/* Root: OPCR Selection */}
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={onClickRoot}
            className="cursor-pointer hover:text-primary"
          >
            OPCR Selection
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Level 2: OPCR Details */}
        {isOPCRDetailView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onClickOpcr}
                className="cursor-pointer hover:text-primary"
              >
                OPCR Details
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 3: Function Type */}
        {isFunctionTypeView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onClickFunctionType}
                className={`${
                  isKPIDetailView
                    ? 'cursor-pointer hover:text-primary'
                    : 'cursor-default'
                }`}
              >
                {functionTypeLabels[functionTypeId] ||
                  `Function Type: ${functionTypeId}`}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 3 (Alternative): Function Category */}
        {isFunctionCategoryView && !isFunctionTypeView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onClickFunctionCategory}
                className={`${
                  isKPIAssignmentView
                    ? 'cursor-pointer hover:text-primary'
                    : 'cursor-default'
                }`}
              >
                {functionCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 4: KPI Assignment */}
        {isKPIAssignmentView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="cursor-default">
                KPI Assignment #{kpiAssignmentId.substring(0, 8)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 4: KPI Details */}
        {isKPIDetailView && !isKPIAssignmentView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="cursor-default">
                KPI #{kpiId?.substring(0, 8)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Consolidated OPCRs Breadcrumb
 * Shows navigation for consolidation records and OPCR detail views
 *
 * Examples:
 * - Consolidated OPCRs
 * - Consolidated OPCRs / Consolidation #1
 * - Consolidated OPCRs / Consolidation #1 / OPCR Details
 * - Consolidated OPCRs / Consolidation #1 / OPCR Details / Core Functions
 * - Consolidated OPCRs / Consolidation #1 / OPCR Details / Core Functions / KPI Assignment
 */
function ConsolidatedOPCRsBreadcrumb({
  opcrId,
  opcrConsolidationId,
  functionTypeId,
  functionCategory,
  kpiAssignmentId,
  kpiId,
  onClickRoot,
  onClickConsolidation,
  onClickOpcr,
  onClickFunctionType,
  onClickFunctionCategory,
}: Omit<
  ConsolidationBreadcrumbProps,
  'consolidateSubTab' | 'onClickSubTab' | 'onClickKpiAssignment'
> & {
  onClickConsolidation?: () => void
}) {
  const isConsolidationDetailView = !!opcrConsolidationId
  const isOPCRDetailView = !!opcrId
  const isFunctionTypeView = !!functionTypeId && !!opcrId
  const isFunctionCategoryView = !!functionCategory && !!opcrId
  const isKPIAssignmentView = !!kpiAssignmentId && !!opcrId
  const isKPIDetailView =
    !!kpiId && (!!functionTypeId || !!functionCategory) && !!opcrId

  const functionTypeLabels: Record<string, string> = {
    STRATEGIC: 'Strategic Functions',
    CORE: 'Core Functions',
    SUPPORT: 'Support Functions',
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {/* Root: Consolidated OPCRs */}
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={onClickRoot}
            className="cursor-pointer hover:text-primary"
          >
            Consolidated OPCRs
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Level 2: Consolidation Details */}
        {isConsolidationDetailView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onClickConsolidation}
                className="cursor-pointer hover:text-primary"
              >
                Consolidation Details
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 3: OPCR Details */}
        {isOPCRDetailView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onClickOpcr}
                className="cursor-pointer hover:text-primary"
              >
                OPCR Details
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 4: Function Type */}
        {isFunctionTypeView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onClickFunctionType}
                className={`${
                  isKPIDetailView
                    ? 'cursor-pointer hover:text-primary'
                    : 'cursor-default'
                }`}
              >
                {functionTypeLabels[functionTypeId] ||
                  `Function Type: ${functionTypeId}`}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 4 (Alternative): Function Category */}
        {isFunctionCategoryView && !isFunctionTypeView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onClickFunctionCategory}
                className={`${
                  isKPIAssignmentView
                    ? 'cursor-pointer hover:text-primary'
                    : 'cursor-default'
                }`}
              >
                {functionCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 5: KPI Assignment */}
        {isKPIAssignmentView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="cursor-default">
                KPI Assignment #{kpiAssignmentId.substring(0, 8)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {/* Level 5: KPI Details */}
        {isKPIDetailView && !isKPIAssignmentView && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="cursor-default">
                KPI #{kpiId?.substring(0, 8)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Consolidation Breadcrumb Navigator
 * Renders appropriate breadcrumb based on consolidation subtab
 * Makes breadcrumbs clickable to navigate back to each level
 *
 * Navigation Flow:
 * - consolidateSubTab (selection/consolidated)
 * - → opcrId (OPCR detail)
 * - → functionCategory (Function category filter)
 * - → kpiAssignmentId (KPI Assignment detail)
 */
export function ConsolidationBreadcrumb({
  consolidateSubTab,
  opcrId,
  opcrConsolidationId,
  functionTypeId,
  functionCategory,
  kpiAssignmentId,
  kpiId,
  onClickRoot,
  onClickConsolidation,
  onClickOpcr,
  onClickFunctionType,
  onClickFunctionCategory,
  // onClickKpiAssignment is reserved for future use
}: ConsolidationBreadcrumbProps) {
  if (consolidateSubTab === 'selection') {
    return (
      <SelectionStageBreadcrumb
        opcrId={opcrId}
        functionTypeId={functionTypeId}
        functionCategory={functionCategory}
        kpiAssignmentId={kpiAssignmentId}
        kpiId={kpiId}
        onClickRoot={onClickRoot}
        onClickOpcr={onClickOpcr}
        onClickFunctionType={onClickFunctionType}
        onClickFunctionCategory={onClickFunctionCategory}
      />
    )
  }

  return (
    <ConsolidatedOPCRsBreadcrumb
      opcrId={opcrId}
      opcrConsolidationId={opcrConsolidationId}
      functionTypeId={functionTypeId}
      functionCategory={functionCategory}
      kpiAssignmentId={kpiAssignmentId}
      kpiId={kpiId}
      onClickRoot={onClickRoot}
      onClickConsolidation={onClickConsolidation}
      onClickOpcr={onClickOpcr}
      onClickFunctionType={onClickFunctionType}
      onClickFunctionCategory={onClickFunctionCategory}
    />
  )
}
