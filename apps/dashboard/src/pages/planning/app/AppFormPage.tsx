/**
 * Annual Performance Planning - Stepper & Breadcrumb Workflow Page
 *
 * 4-Step Sequential Workflow:
 * 1. Active KPIs: Select FY, activate & configure KPIs from master library
 * 2. Target Setting: Define agency-level base annual and quarterly targets
 * 3. Office Assignment: Distribute targets to delivery units / offices
 * 4. Review & Finalize: Verify matrix and commit assignments to OPCR
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import api from '@/services/api'
import { useOrgUnits } from '@/pages/planning/organization/hooks/useOrgUnits'
import { useKpiAssignments } from '@/components/features/planning/kpi-assignment-for-office/hooks/useAssignKpiToOffice'
import { useKPIs, useFiscalYears, transformKPIToInternal } from '@/features/planning/annual-performance-planning/hooks/useAPPQueries'

import {
  AppWorkflowStepper,
  type AppStepId,
} from '@/components/features/planning/annual-performance-planning/components/AppWorkflowStepper'
import AppStep2Form from '@/components/features/planning/annual-performance-planning/forms/AppStep2Form'
import { BaseKPITargetsForm } from '@/components/features/planning/annual-performance-planning/budget-distribution/form/BaseKPITargetsForm'
import {
  OfficeAssignmentStep,
  type KPIOfficeAssignmentResult,
} from '@/components/features/planning/annual-performance-planning/budget-distribution/form/OfficeAssignmentStep'
import { KPIOfficeAssignmentPreview } from '@/components/features/planning/annual-performance-planning/budget-distribution/form/KPIOfficeAssignmentPreview'

import type {
  ActivatedKPI,
  AppFiscalYear,
  KPITarget,
} from '@/features/planning/annual-performance-planning/appTypes'

interface BaseKPITarget {
  kpiId: string
  kpiCode: string
  kpiName: string
  aggregationMethod: string
  baseTargetValue: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  isSelected: boolean
  isLocked: boolean
  status?: string
  unitOfMeasure?: string
  measurementUnit?: string
}

export default function AppFormPage() {
  const queryClient = useQueryClient()

  // Navigation State (1: Active KPIs, 2: Target Setting, 3: Office Assignment, 4: Review)
  const [currentStep, setCurrentStep] = useState<AppStepId>(1)
  const [selectedFY, setSelectedFY] = useState<AppFiscalYear | undefined>(undefined)
  const [activatedKPIs, setActivatedKPIs] = useState<ActivatedKPI[]>([])
  const [kpiCount, setKpiCount] = useState(0)
  const [baseTargets, setBaseTargets] = useState<BaseKPITarget[]>([])
  const [kpiOfficeAssignments, setKpiOfficeAssignments] = useState<KPIOfficeAssignmentResult[]>([])
  const [, setSavedTargets] = useState<KPITarget[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch Fiscal Years
  const { data: fyResponse } = useFiscalYears({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  // Set default FY ONLY ONCE on initial load (does not overwrite when user intentionally clears)
  const [hasInitializedFY, setHasInitializedFY] = useState(false)
  useEffect(() => {
    if (!hasInitializedFY && fyResponse?.data && fyResponse.data.length > 0) {
      const activeFy = fyResponse.data.find((f: any) => f.status === 'Active') || fyResponse.data[0]
      if (activeFy) {
        setSelectedFY({
          id: activeFy.id,
          year: activeFy.year,
          description: activeFy.description,
          status: activeFy.status,
          isLocked: activeFy.isLocked || false,
        })
      }
      setHasInitializedFY(true)
    }
  }, [fyResponse?.data, hasInitializedFY])

  // Handle FY Change / Clear from Step 1 Toolbar
  const handleFiscalYearChange = useCallback((fy: AppFiscalYear | undefined) => {
    setSelectedFY(fy)
    if (!fy) {
      setActivatedKPIs([])
      setBaseTargets([])
      setKpiOfficeAssignments([])
      setKpiCount(0)
      setCurrentStep(1)
    }
  }, [])

  // Fetch Active KPIs for selected Fiscal Year
  const { data: kpisResponse } = useKPIs({
    pathParams: {},
    queryParams: selectedFY?.id
      ? { Filters: `fiscalYearId==${selectedFY.id}`, PageNumber: 1, PageSize: 1000 }
      : undefined,
  })

  // Fetch Offices
  const { data: offices = [] } = useOrgUnits()

  // Fetch Existing Office Assignments
  const { data: assignmentsResponse } = useKpiAssignments({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
      filters: selectedFY?.id ? `fiscalYearId==${selectedFY.id}` : undefined,
    },
  })

  // Sync Existing Office Assignments from backend
  useEffect(() => {
    if (assignmentsResponse?.data && Array.isArray(assignmentsResponse.data) && assignmentsResponse.data.length > 0) {
      const grouped = new Map<
        string,
        {
          kpiId: string
          kpiCode: string
          kpiName: string
          assignedOfficeIds: Set<string>
          officeDistributions: Map<string, number>
          officeQuarterlyDistributions: Map<
            string,
            { q1: number | null; q2: number | null; q3: number | null; q4: number | null }
          >
        }
      >()

      assignmentsResponse.data.forEach((item: any) => {
        const kpiId = item.fyActiveKPIId || item.FYActiveKPIId
        const kpiCode = item.fyActiveKPI?.code || item.FYActiveKPI?.code || ''
        const kpiName = item.fyActiveKPI?.name || item.FYActiveKPI?.name || ''
        const officeId = item.officeId
        const value = item.assignedTargetAnnual || 0
        const q1 = item.assignedTargetQ1 !== undefined ? item.assignedTargetQ1 : null
        const q2 = item.assignedTargetQ2 !== undefined ? item.assignedTargetQ2 : null
        const q3 = item.assignedTargetQ3 !== undefined ? item.assignedTargetQ3 : null
        const q4 = item.assignedTargetQ4 !== undefined ? item.assignedTargetQ4 : null

        if (kpiId) {
          if (!grouped.has(kpiId)) {
            grouped.set(kpiId, {
              kpiId,
              kpiCode,
              kpiName,
              assignedOfficeIds: new Set<string>(),
              officeDistributions: new Map<string, number>(),
              officeQuarterlyDistributions: new Map<
                string,
                { q1: number | null; q2: number | null; q3: number | null; q4: number | null }
              >(),
            })
          }

          const group = grouped.get(kpiId)!
          if (officeId) {
            group.assignedOfficeIds.add(officeId)
            group.officeDistributions.set(officeId, value)
            group.officeQuarterlyDistributions.set(officeId, { q1, q2, q3, q4 })
          }
        }
      })

      setKpiOfficeAssignments(Array.from(grouped.values()))
    }
  }, [assignmentsResponse])

  // Automatically populate active KPIs when loaded from query
  useEffect(() => {
    if (kpisResponse?.data && Array.isArray(kpisResponse.data) && kpisResponse.data.length > 0) {
      const transformed: ActivatedKPI[] = kpisResponse.data.map((apiKPI: any) => {
        const internal = transformKPIToInternal(apiKPI)
        return {
          ...apiKPI,
          ...internal,
          id: apiKPI.id,
          kpiId: apiKPI.id,
          kpiCode: apiKPI.code || (internal as any).kpiCode,
          kpiName: apiKPI.name || (internal as any).kpiName,
          fiscalYearId: selectedFY?.id || '',
          isLocked: Boolean(apiKPI.isLocked || selectedFY?.isLocked),
          aggregationMethod: apiKPI.defaultAggregation || internal.aggregationMethod || 'SUM',
          agencyTargetAnnual: apiKPI.agencyTargetAnnual ?? null,
          agencyTargetQ1: apiKPI.agencyTargetQ1 ?? null,
          agencyTargetQ2: apiKPI.agencyTargetQ2 ?? null,
          agencyTargetQ3: apiKPI.agencyTargetQ3 ?? null,
          agencyTargetQ4: apiKPI.agencyTargetQ4 ?? null,
          unitOfMeasure: apiKPI.unitOfMeasure || apiKPI.measurementUnit || 'Number',
          measurementUnit: apiKPI.measurementUnit || apiKPI.unitOfMeasure || 'Number',
          status: apiKPI.status || 'Draft',
        }
      })

      setActivatedKPIs(transformed)
      setKpiCount(transformed.length)

      // Initialize base targets from active KPIs if not yet configured
      setBaseTargets((prev) => {
        if (prev.length > 0) return prev
        return transformed.map((kpi) => ({
          kpiId: kpi.id,
          kpiCode: kpi.kpiCode || '',
          kpiName: kpi.kpiName,
          aggregationMethod: kpi.aggregationMethod || 'SUM',
          baseTargetValue: kpi.agencyTargetAnnual ?? null,
          q1: kpi.agencyTargetQ1 ?? null,
          q2: kpi.agencyTargetQ2 ?? null,
          q3: kpi.agencyTargetQ3 ?? null,
          q4: kpi.agencyTargetQ4 ?? null,
          isSelected: true,
          isLocked: kpi.isLocked || false,
          status: kpi.status || 'Draft',
          unitOfMeasure: kpi.unitOfMeasure,
          measurementUnit: kpi.measurementUnit,
        }))
      })
    }
  }, [kpisResponse?.data, selectedFY?.id, selectedFY?.isLocked])

  // Available offices list
  const availableOffices = useMemo(
    () =>
      offices.map((office) => ({
        id: office.id,
        name: office.name,
      })),
    [offices],
  )

  // Step 1 -> Step 2: Handle KPI Activation Submission
  const handleStep1Submit = (data: ActivatedKPI[]) => {
    setActivatedKPIs(data)
    setKpiCount(data.length)

    // Update base targets list
    const newBaseTargets: BaseKPITarget[] = data.map((kpi) => ({
      kpiId: kpi.id,
      kpiCode: kpi.kpiCode || '',
      kpiName: kpi.kpiName,
      aggregationMethod: kpi.aggregationMethod || 'SUM',
      baseTargetValue: kpi.agencyTargetAnnual ?? null,
      q1: kpi.agencyTargetQ1 ?? null,
      q2: kpi.agencyTargetQ2 ?? null,
      q3: kpi.agencyTargetQ3 ?? null,
      q4: kpi.agencyTargetQ4 ?? null,
      isSelected: true,
      isLocked: kpi.isLocked || false,
      status: kpi.status || 'Draft',
      unitOfMeasure: kpi.unitOfMeasure,
      measurementUnit: kpi.measurementUnit,
    }))
    setBaseTargets(newBaseTargets)
    setCurrentStep(2)
  }

  // Step 2 -> Step 3: Handle Base Targets Submission & API Save
  const handleStep2Submit = async (targets: BaseKPITarget[]) => {
    setIsSaving(true)
    try {
      const editableTargets = targets.filter((t: any) => {
        const statusLower = (t.status || '').toLowerCase()
        return !t.isLocked && statusLower !== 'assigned' && statusLower !== 'established'
      })

      if (editableTargets.length > 0) {
        const payload = editableTargets.map((t) => {
          const item: any = {
            fyActiveKPIId: t.kpiId,
            agencyTargetAnnual: t.baseTargetValue ?? 0,
          }
          if (t.q1 !== null && t.q1 !== undefined) item.agencyTargetQ1 = t.q1
          if (t.q2 !== null && t.q2 !== undefined) item.agencyTargetQ2 = t.q2
          if (t.q3 !== null && t.q3 !== undefined) item.agencyTargetQ3 = t.q3
          if (t.q4 !== null && t.q4 !== undefined) item.agencyTargetQ4 = t.q4
          return item
        })

        await api.put('/fy-active-kpis/targets/bulk', payload)
      }

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key) =>
              typeof key === 'string' &&
              (key.includes('kpi-assignments') ||
                key.includes('fy-active-kpis') ||
                key.includes('active-kpis') ||
                key.includes('/kpis')),
          ),
      })

      toast.success('KPI base targets updated successfully')
      setBaseTargets(targets)
      setCurrentStep(3)
    } catch (error: any) {
      console.error('Failed to update base targets:', error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        'Failed to update base targets'
      toast.error(errorMessage, { id: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  // Step 3 -> Step 4: Handle Office Assignment Submission
  const handleStep3Submit = (assignments: KPIOfficeAssignmentResult[]) => {
    setKpiOfficeAssignments(assignments)
    setCurrentStep(4)
  }

  // Step 4: Finalize & Save All Assignments to Backend
  const handleFinalSubmit = async () => {
    if (kpiOfficeAssignments.length === 0) {
      toast.error('No KPI office assignments available to save')
      return
    }

    const unassignedKPIs = kpiOfficeAssignments.filter(
      (assignment) => !assignment.assignedOfficeIds || assignment.assignedOfficeIds.size === 0,
    )

    if (unassignedKPIs.length > 0) {
      toast.error(
        `Please assign offices to all KPIs before saving: ${unassignedKPIs
          .map((k) => k.kpiCode || k.kpiName)
          .join(', ')}`,
      )
      return
    }

    setIsSaving(true)

    try {
      // Validate readiness if FY is selected
      if (selectedFY?.id) {
        try {
          const validationResponse = await api.get(
            `/fy-active-kpis/validate-for-assignment?fiscalYearId=${selectedFY.id}`,
          )
          const valData = validationResponse.data?.data
          if (valData && valData.isValid === false) {
            toast.error(
              `${valData.kpisWithoutTargets} out of ${valData.totalKPIs} activated KPIs still need targets set before saving office assignments.`,
            )
            setIsSaving(false)
            return
          }
        } catch (valErr: any) {
          console.warn('Assignment readiness check returned warning:', valErr)
        }
      }

      const baseTargetMap = new Map(baseTargets.map((t) => [t.kpiId, t]))

      const payload = kpiOfficeAssignments.map((assignment) => {
        const baseTarget = baseTargetMap.get(assignment.kpiId)
        const officeDistributions = assignment.officeDistributions || new Map<string, number>()
        const officeQuarterlyDistributions =
          assignment.officeQuarterlyDistributions ||
          new Map<string, { q1: number | null; q2: number | null; q3: number | null; q4: number | null }>()

        const officeAssignments = Array.from(assignment.assignedOfficeIds).map((officeId) => {
          const distributedValue = officeDistributions.get(officeId) || 0
          const quarterly = officeQuarterlyDistributions.get(officeId) || {
            q1: baseTarget?.q1 ?? null,
            q2: baseTarget?.q2 ?? null,
            q3: baseTarget?.q3 ?? null,
            q4: baseTarget?.q4 ?? null,
          }

          const item: any = {
            officeId,
            assignedTargetAnnual: distributedValue,
            isLocked: baseTarget?.isLocked || false,
          }
          if (quarterly.q1 !== null && quarterly.q1 !== undefined) item.assignedTargetQ1 = quarterly.q1
          if (quarterly.q2 !== null && quarterly.q2 !== undefined) item.assignedTargetQ2 = quarterly.q2
          if (quarterly.q3 !== null && quarterly.q3 !== undefined) item.assignedTargetQ3 = quarterly.q3
          if (quarterly.q4 !== null && quarterly.q4 !== undefined) item.assignedTargetQ4 = quarterly.q4
          return item
        })

        return {
          fyActiveKPIId: assignment.kpiId,
          officeAssignments,
        }
      })

      await api.post('/kpi-assignments/bulk', payload)

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key) =>
              typeof key === 'string' &&
              (key.includes('kpi-assignments') ||
                key.includes('fy-active-kpis') ||
                key.includes('active-kpis') ||
                key.includes('/kpis')),
          ),
      })

      setIsCompleted(true)
      toast.success('Active KPIs and Office Assignments saved successfully')
    } catch (error: any) {
      console.error('Error saving assignments:', error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        (Array.isArray(error?.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
        error?.message ||
        'Failed to save Active KPIs and Assignments'
      toast.error(errorMessage, { id: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Stepper Clicks
  const handleStepClick = useCallback(
    (stepId: AppStepId) => {
      if (!selectedFY && stepId > 1) {
        toast.error('Please select a Fiscal Year first before proceeding to target setting.')
        return
      }
      setCurrentStep(stepId)
    },
    [selectedFY],
  )

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header - match WFP and Market Scoping styling ── */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Annual Performance Planning</CardTitle>
              <CardDescription className="text-base">
                Configure performance planning parameters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Performance Plan
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Visual Stepper & Breadcrumbs Bar ── */}
      <AppWorkflowStepper
        currentStep={currentStep}
        onStepClick={handleStepClick}
        selectedFY={selectedFY}
        kpiCount={kpiCount}
        targetsCount={baseTargets.filter((t) => t.baseTargetValue !== null).length}
        assignmentsCount={kpiOfficeAssignments.reduce((acc, a) => acc + (a.assignedOfficeIds?.size || 0), 0)}
        isLocked={selectedFY?.isLocked || false}
        maxAccessibleStep={selectedFY ? 4 : 1}
      />

      {/* ── Step Content Views ── */}
      <div className="pt-2">
        {/* STEP 1: Active KPIs & Policies */}
        {currentStep === 1 && (
          <AppStep2Form
            onSubmit={handleStep1Submit}
            onFiscalYearChange={handleFiscalYearChange}
            onKPIsCountChange={setKpiCount}
            initialActiveKPIs={activatedKPIs}
            selectedFiscalYearId={selectedFY?.id}
          />
        )}

        {/* STEP 2: Base Target Setting */}
        {currentStep === 2 && (
          <BaseKPITargetsForm
            activeKPIs={activatedKPIs}
            onComplete={handleStep2Submit}
            onBack={() => setCurrentStep(1)}
            isSubmitting={isSaving}
            isFiscalYearLocked={selectedFY?.isLocked || false}
          />
        )}

        {/* STEP 3: Office Assignment & Distribution */}
        {currentStep === 3 && (
          <OfficeAssignmentStep
            baseTargets={baseTargets}
            availableOffices={availableOffices}
            initialAssignments={kpiOfficeAssignments}
            onComplete={handleStep3Submit}
            onBack={() => setCurrentStep(2)}
            isSubmitting={isSaving}
          />
        )}

        {/* STEP 4: Review & Finalize */}
        {currentStep === 4 && (
          <KPIOfficeAssignmentPreview
            availableOffices={availableOffices}
            kpiOfficeAssignments={kpiOfficeAssignments}
            baseTargets={baseTargets}
            onProceed={handleFinalSubmit}
            onBack={() => setCurrentStep(3)}
            isSubmitting={isSaving}
          />
        )}
      </div>
    </div>
  )
}
