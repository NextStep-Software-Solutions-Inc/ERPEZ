/**
 * Step 3: OPCR Builder - Three-Step Target Setting Workflow
 *
 * Three-step process:
 * Step 3.1: Define Base KPI Targets (select KPIs + set base values)
 * Step 3.2: Assign Offices to KPIs (modal-based office assignment per KPI)
 * Step 3.3: Distribute & Adjust Targets (offices adjust targets per KPI-Office)
 */

import { useState, useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { step3FormDataAtom } from '../atoms'
import { BaseKPITargetsForm } from '../budget-distribution/form/BaseKPITargetsForm'
import { OfficeAssignmentDialog } from '../budget-distribution/dialog/OfficeAssignmentDialog'
import { KPIOfficeAssignmentPreview } from '../budget-distribution/form/KPIOfficeAssignmentPreview'

import api from '@/services/api'
import { useOrgUnits } from '@/pages/planning/organization/hooks/useOrgUnits'
import { useKpiAssignments } from '@/components/features/planning/kpi-assignment-for-office/hooks/useAssignKpiToOffice'
import { USE_MOCK_DATA, MOCK_ACTIVE_KPIS } from '../shared/utils/step3Mocks'
import type { ActivatedKPI, KPITarget } from '@/features/planning/annual-performance-planning/appTypes'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import {
  bulkUpdateBaseTargetsRequest,
  BulkUpdateBaseTargetsPayload,
} from '../target-distribution/handlers/bulkUpdateBaseTargetsRequest'

const useBulkUpdateBaseTargets = createMutationHookFromTemplate(bulkUpdateBaseTargetsRequest)

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
}

interface KPIOfficeAssignment {
  kpiId: string
  kpiCode: string
  kpiName: string
  assignedOfficeIds: Set<string>
  officeDistributions?: Map<string, number> // office ID -> distributed amount
  officeQuarterlyDistributions?: Map<
    string,
    { q1: number | null; q2: number | null; q3: number | null; q4: number | null }
  >
}

interface AppStep3FormProps {
  fiscalYearId: string
  activeKPIs?: ActivatedKPI[]
  onSubmit: (targets: KPITarget[]) => void
  onCancel?: () => void
  isLoading?: boolean
  isFiscalYearLocked?: boolean
  onTargetsUpdate?: (kpis: ActivatedKPI[]) => void
}

export default function AppStep3Form({
  fiscalYearId,
  activeKPIs = [],
  onSubmit,
  onCancel,
  isFiscalYearLocked = false,
  onTargetsUpdate,
}: AppStep3FormProps) {
  const queryClient = useQueryClient()
  const [, setFormData] = useAtom(step3FormDataAtom)
  const [step, setStep] = useState<'base' | 'offices' | 'review'>('base')
  const [baseTargets, setBaseTargets] = useState<BaseKPITarget[]>([])
  const [kpiOfficeAssignments, setKpiOfficeAssignments] = useState<KPIOfficeAssignment[]>([])
  const [officeAssignmentDialogOpen, setOfficeAssignmentDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch offices from GET /offices
  const { data: offices = [], isLoading: isOfficesLoading } = useOrgUnits()

  // Fetch existing assignments from GET /kpi-assignments?pageNumber=1&pageSize=100&filters=fiscalYearId==...
  const { data: assignmentsResponse, isLoading: isAssignmentsLoading } = useKpiAssignments({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
      filters: fiscalYearId ? `fiscalYearId==${fiscalYearId}` : undefined
    }
  })

  useEffect(() => {
    if (assignmentsResponse?.data && Array.isArray(assignmentsResponse.data) && assignmentsResponse.data.length > 0) {
      const grouped = new Map<string, {
        kpiId: string
        kpiCode: string
        kpiName: string
        assignedOfficeIds: Set<string>
        officeDistributions: Map<string, number>
        officeQuarterlyDistributions: Map<string, { q1: number | null, q2: number | null, q3: number | null, q4: number | null }>
      }>()

      assignmentsResponse.data.forEach((item: any) => {
        const kpiId = item.fyActiveKPIId
        const kpiCode = item.fyActiveKPI?.code || ''
        const kpiName = item.fyActiveKPI?.name || ''
        const officeId = item.officeId
        const value = item.assignedTargetAnnual || 0
        const q1 = item.assignedTargetQ1 !== undefined ? item.assignedTargetQ1 : null
        const q2 = item.assignedTargetQ2 !== undefined ? item.assignedTargetQ2 : null
        const q3 = item.assignedTargetQ3 !== undefined ? item.assignedTargetQ3 : null
        const q4 = item.assignedTargetQ4 !== undefined ? item.assignedTargetQ4 : null

        if (!grouped.has(kpiId)) {
          grouped.set(kpiId, {
            kpiId,
            kpiCode,
            kpiName,
            assignedOfficeIds: new Set<string>(),
            officeDistributions: new Map<string, number>(),
            officeQuarterlyDistributions: new Map<string, { q1: number | null, q2: number | null, q3: number | null, q4: number | null }>(),
          })
        }

        const group = grouped.get(kpiId)!
        group.assignedOfficeIds.add(officeId)
        group.officeDistributions.set(officeId, value)
        group.officeQuarterlyDistributions.set(officeId, { q1, q2, q3, q4 })
      })

      setKpiOfficeAssignments(Array.from(grouped.values()))
    }
  }, [assignmentsResponse])

  // Use mock data if enabled
  const mockMode = USE_MOCK_DATA

  // Build a map of KPI IDs that have existing office assignments from GET /kpi-assignments
  const assignedKPIsMap = useMemo(() => {
    const map = new Map<string, { status: string; isLocked: boolean }>()
    if (assignmentsResponse?.data && Array.isArray(assignmentsResponse.data)) {
      assignmentsResponse.data.forEach((item: any) => {
        const kpiId = item.fyActiveKPIId || item.FYActiveKPIId
        if (kpiId) {
          const isAssignmentLocked = Boolean(
            item.isLocked || 
            item.IsLocked || 
            item.fyActiveKPI?.isLocked || 
            item.FYActiveKPI?.isLocked ||
            (item.fyActiveKPI?.status || item.FYActiveKPI?.status || '').toLowerCase() === 'established'
          )
          const kpiStatus = isAssignmentLocked ? 'Assigned' : (item.fyActiveKPI?.status || item.FYActiveKPI?.status || 'TargetsSet')
          const current = map.get(kpiId)
          
          map.set(kpiId, {
            status: kpiStatus,
            isLocked: isAssignmentLocked || (current?.isLocked ?? false),
          })
        }
      })
    }
    return map
  }, [assignmentsResponse?.data])

  // Enrich active KPIs with existing assignment status and lock states
  const finalActiveKPIs = useMemo(() => {
    const rawList = mockMode
      ? (activeKPIs.length > 0 ? activeKPIs : MOCK_ACTIVE_KPIS)
      : activeKPIs

    return rawList.map((kpi) => {
      const kpiId = kpi.id || (kpi as any).kpiId
      const assignmentInfo = assignedKPIsMap.get(kpiId)
      const isLocked = isFiscalYearLocked || Boolean(kpi.isLocked || assignmentInfo?.isLocked)
      if (assignmentInfo) {
        return {
          ...kpi,
          status: assignmentInfo.status || kpi.status || 'TargetsSet',
          isLocked,
        }
      }
      return {
        ...kpi,
        isLocked,
      }
    })
  }, [mockMode, activeKPIs, assignedKPIsMap])

  const finalAvailableOffices = offices.map((office) => ({
    id: office.id,
    name: office.name,
  }))

  if (isOfficesLoading || isAssignmentsLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading planning data...</p>
        </div>
      </div>
    )
  }

  const handleBaseTargetsComplete = async (targets: BaseKPITarget[]) => {
    setIsSaving(true)
    try {
      // Filter out KPIs that are already assigned/established in OPCR as backend locks target updates for them
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
      
      // Invalidate queries so UI state updates seamlessly
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['fy-active-kpis'] }),
        queryClient.invalidateQueries({ queryKey: ['active-kpis'] }),
      ])
      
      toast.success('KPI base targets updated successfully')
    } catch (error: any) {
      console.error('Failed to update base targets:', error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        'Failed to update base targets'
      toast.error(errorMessage, { id: errorMessage })
      setIsSaving(false)
      return
    }
    setIsSaving(false)

    const updatedActiveKPIs: ActivatedKPI[] = finalActiveKPIs.map((kpi) => {
      const updatedTarget = targets.find((t) => t.kpiId === kpi.id || (t as any).kpiId === (kpi as any).kpiId)
      if (updatedTarget) {
        return {
          ...kpi,
          agencyTargetAnnual: updatedTarget.baseTargetValue ?? kpi.agencyTargetAnnual ?? null,
          agencyTargetQ1: updatedTarget.q1 ?? kpi.agencyTargetQ1 ?? null,
          agencyTargetQ2: updatedTarget.q2 ?? kpi.agencyTargetQ2 ?? null,
          agencyTargetQ3: updatedTarget.q3 ?? kpi.agencyTargetQ3 ?? null,
          agencyTargetQ4: updatedTarget.q4 ?? kpi.agencyTargetQ4 ?? null,
          status: updatedTarget.status || kpi.status || 'TargetsSet',
          isLocked: updatedTarget.isLocked || kpi.isLocked,
        }
      }
      return kpi
    })
    onTargetsUpdate?.(updatedActiveKPIs)

    setBaseTargets(targets)
    setOfficeAssignmentDialogOpen(true)
  }

  const handleOfficeAssignmentComplete = (assignments: Array<{
    kpiId: string
    kpiCode: string
    kpiName: string
    assignedOfficeIds: Set<string>
    officeDistributions?: Map<string, number>
    officeQuarterlyDistributions?: Map<
      string,
      { q1: number | null; q2: number | null; q3: number | null; q4: number | null }
    >
  }>) => {
    setKpiOfficeAssignments(assignments)
    setOfficeAssignmentDialogOpen(false)
    setStep('review')
  }

  const handleLockToggle = (kpiId: string, newLockState: boolean) => {
    setBaseTargets((prevTargets) =>
      prevTargets.map((target) =>
        target.kpiId === kpiId ? { ...target, isLocked: newLockState } : target
      )
    )
    const action = newLockState ? 'locked' : 'unlocked'
    toast.success(`KPI target ${action}`)
  }

  const handleReviewSubmit = async () => {
    // 1. Client-side validation: verify office assignments exist
    if (kpiOfficeAssignments.length === 0) {
      toast.error('No KPI office assignments available to save')
      return
    }

    const unassignedKPIs = kpiOfficeAssignments.filter(
      (assignment) => !assignment.assignedOfficeIds || assignment.assignedOfficeIds.size === 0
    )

    if (unassignedKPIs.length > 0) {
      toast.error(
        `Please assign offices to all KPIs before saving: ${unassignedKPIs
          .map((k) => k.kpiCode || k.kpiName)
          .join(', ')}`
      )
      return
    }

    setIsSaving(true)

    try {
      // 2. Validate readiness for assignment via backend API if fiscalYearId is provided
      if (fiscalYearId) {
        try {
          const validationResponse = await api.get(
            `/fy-active-kpis/validate-for-assignment?fiscalYearId=${fiscalYearId}`
          )
          const valData = validationResponse.data?.data
          if (valData && valData.isValid === false) {
            toast.error(
              `${valData.kpisWithoutTargets} out of ${valData.totalKPIs} activated KPIs still need targets set before saving office assignments.`
            )
            setIsSaving(false)
            return
          }
        } catch (valErr: any) {
          // If endpoint is not found or fails non-critically, log and continue to submit
          console.warn('Assignment readiness check returned error:', valErr)
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

      // 3. POST to the bulk assignments endpoint
      await api.post('/kpi-assignments/bulk', payload)

      // 4. Invalidate React Query cache to refresh active state indicators without page reload
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kpi-assignments'] }),
        queryClient.invalidateQueries({ queryKey: ['fy-active-kpis'] }),
        queryClient.invalidateQueries({ queryKey: ['active-kpis'] }),
      ])

      // Transform KPI office assignments into KPITarget format for saving/notifying parent
      const targets: KPITarget[] = []
      kpiOfficeAssignments.forEach((assignment) => {
        const baseTarget = baseTargetMap.get(assignment.kpiId)
        const officeDistributions = assignment.officeDistributions || new Map<string, number>()

        assignment.assignedOfficeIds.forEach((officeId) => {
          const distributedValue = officeDistributions.get(officeId) || 0
          targets.push({
            id: `target-${assignment.kpiId}-${officeId}`,
            fiscalYearId,
            activatedKPIId: assignment.kpiId,
            deliveryUnitId: officeId,
            officeId: officeId,
            targetValue: distributedValue,
            isLockedByPlanning: baseTarget?.isLocked || false,
            status: baseTarget?.isLocked ? 'Locked' : 'Pending',
            lastModifiedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        })
      })

      // Save form data
      setFormData({
        baseTargets,
        kpiOfficeAssignments,
        targets,
      })

      toast.success('Active KPIs and Office Assignments saved successfully')
      onSubmit(targets)
    } catch (error: any) {
      console.error('Error saving KPIs:', error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        (Array.isArray(error?.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
        error?.message ||
        'Failed to save Active KPIs'
      toast.error(errorMessage, { id: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <>
      {step === 'base' ? (
        <BaseKPITargetsForm
          activeKPIs={finalActiveKPIs}
          onComplete={handleBaseTargetsComplete}
          onCancel={onCancel}
          isSubmitting={isSaving}
          isFiscalYearLocked={isFiscalYearLocked}
        />
      ) : step === 'review' ? (
        <KPIOfficeAssignmentPreview
          availableOffices={finalAvailableOffices}
          kpiOfficeAssignments={kpiOfficeAssignments}
          baseTargets={baseTargets}
          onProceed={handleReviewSubmit}
          onBack={() => setStep('base')}
          onCancel={onCancel}
          isSubmitting={isSaving}
          onLockToggle={handleLockToggle}
        />
      ) : null}

      <OfficeAssignmentDialog
        open={officeAssignmentDialogOpen}
        baseTargets={baseTargets}
        availableOffices={finalAvailableOffices}
        onComplete={handleOfficeAssignmentComplete}
        onOpenChange={setOfficeAssignmentDialogOpen}
        initialAssignments={kpiOfficeAssignments}
      />
    </>
  )
}

