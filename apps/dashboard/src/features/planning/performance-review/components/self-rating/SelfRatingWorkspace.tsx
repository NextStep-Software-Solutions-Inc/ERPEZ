import { useEffect, useMemo, useState } from 'react'

import { useNavigate, useSearch } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getOPCRsRequest } from '@/features/planning/opcr'
import type { OPCR } from '@/features/planning/opcr'

import { SelfRatingKpiAccordionTab } from './SelfRatingKpiAccordionTab'
import { SelfRatingSelectionPanel } from './SelfRatingSelectionPanel'
import { buildDeliveryUnits, buildFiscalYears, filterApprovedOpcrs } from '../../utils/selfRating'
import type { OPCRReference } from '../../types'

const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)

function normalizeStatus(value: string | null | undefined) {
  return (
    value
      ?.trim()
      .replace(/[\s-]+/g, '_')
      .toUpperCase() ?? ''
  )
}

function mapRatingProgress(ratingStatus: string | null | undefined) {
  const normalized = normalizeStatus(ratingStatus)
  const finalizationDone = ['FINALIZED', 'POSTED', 'APPROVED'].includes(
    normalized,
  )
  const selfRatingDone =
    finalizationDone ||
    [
      'SUBMITTED',
      'SUBMITTED_FOR_REVIEW',
      'FOR_REVIEW',
      'REVIEWED',
      'RATED',
    ].includes(normalized)

  return { selfRatingDone, finalizationDone }
}

function mapOPCRToReference(opcr: OPCR): OPCRReference {
  const fiscalYear = opcr.fiscalYear?.year ? String(opcr.fiscalYear.year) : ''
  const deliveryUnitId = opcr.deliveryUnit?.id ?? opcr.officeId ?? opcr.id
  const deliveryUnitName =
    opcr.deliveryUnit?.name?.trim() ||
    opcr.officeName?.trim() ||
    'Unassigned Office'
  const normalizedStatus = normalizeStatus(opcr.commitmentStatus ?? opcr.status)
  const progress = mapRatingProgress(opcr.ratingStatus)
  const kpiCount =
    opcr.kpiAssignmentCount ??
    opcr.dukpiTargetAssignments?.length ??
    opcr.activityCount ??
    0

  return {
    id: opcr.id,
    title:
      opcr.name?.trim() ||
      `OPCR ${fiscalYear || 'Unspecified FY'} - ${deliveryUnitName}`,
    fiscalYear,
    deliveryUnitId,
    deliveryUnitName,
    status: normalizedStatus.includes('DRAFT') ? 'DRAFT' : 'APPROVED',
    kpiCount,
    commitmentStatus: opcr.commitmentStatus,
    reviewStatus: opcr.reviewStatus,
    ...progress,
  }
}

export function SelfRatingWorkspace() {
  const navigate = useNavigate({ from: '/v2/performance-review' })
  const search = useSearch({ from: '/v2/performance-review' })
  const { officeId } = search

  const {
    data: opcrsData,
    isLoading,
    isError,
  } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      pageNumber: 1,
    },
  })

  const [selectedFiscalYear, setSelectedFiscalYear] = useState('')
  const [selectedDeliveryUnitId, setSelectedDeliveryUnitId] = useState('')
  const [selectedOpcr, setSelectedOpcr] = useState<OPCRReference | null>(null)

  const opcrReferences = useMemo(
    () => (opcrsData?.data ?? []).map(mapOPCRToReference),
    [opcrsData?.data],
  )

  const officeOptions = useMemo(
    () => buildDeliveryUnits(opcrReferences),
    [opcrReferences],
  )

  const officeScopedOpcrs = useMemo(
    () =>
      officeId
        ? opcrReferences.filter((opcr) => opcr.deliveryUnitId === officeId)
        : opcrReferences,
    [officeId, opcrReferences],
  )

  const fiscalYears = useMemo(
    () => buildFiscalYears(officeScopedOpcrs),
    [officeScopedOpcrs],
  )

  const deliveryUnits = useMemo(
    () => buildDeliveryUnits(officeScopedOpcrs),
    [officeScopedOpcrs],
  )

  useEffect(() => {
    if (selectedFiscalYear && !fiscalYears.includes(selectedFiscalYear)) {
      setSelectedFiscalYear('')
    }
  }, [fiscalYears, selectedFiscalYear])

  useEffect(() => {
    if (!selectedDeliveryUnitId) return
    const stillAvailable = deliveryUnits.some(
      (unit) => unit.id === selectedDeliveryUnitId,
    )
    if (!stillAvailable) setSelectedDeliveryUnitId('')
  }, [deliveryUnits, selectedDeliveryUnitId])

  useEffect(() => {
    if (
      selectedOpcr &&
      !officeScopedOpcrs.some((opcr) => opcr.id === selectedOpcr.id)
    ) {
      setSelectedOpcr(null)
    }
  }, [officeScopedOpcrs, selectedOpcr])

  const filteredOpcrs = useMemo(
    () =>
      filterApprovedOpcrs({
        opcrs: officeScopedOpcrs,
        selectedFiscalYear,
        selectedDeliveryUnitId,
        officeId,
      }),
    [officeId, officeScopedOpcrs, selectedDeliveryUnitId, selectedFiscalYear],
  )

  const handleStartEvaluation = () => {
    if (!selectedOpcr) return

    navigate({
      to: '/v2/performance-review',
      search: {
        tab: 'SelfRating',
        opcrId: selectedOpcr.id,
        officeId: officeId || undefined,
      },
    })
    setSelectedOpcr(null)
  }

  const handleOfficeChange = (value: string) => {
    const nextOfficeId = value === '_all' ? '' : value

    navigate({
      to: '/v2/performance-review',
      search: (prev) => ({
        ...prev,
        officeId: nextOfficeId || undefined,
        opcrId: undefined,
      }),
      replace: true,
    })
    setSelectedOpcr(null)
  }

  if (search.tab === 'SelfRating' && search.opcrId) {
    return <SelfRatingKpiAccordionTab />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 mb-2 animate-spin opacity-60" />
          <p className="font-medium">Loading approved OPCRs...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-800">
            <AlertTriangle className="mr-2 inline-block h-4 w-4" />
            Unable to refresh the OPCR list.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium">Office scope</p>
            {officeId ? (
              <Badge variant="outline" className="text-[11px]">
                Pinned from URL
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px]">
                All offices
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Pin the PMT/admin list to one office with a route-level filter.
          </p>
        </div>
        <Select value={officeId || '_all'} onValueChange={handleOfficeChange}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue placeholder="All offices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All offices</SelectItem>
            {officeOptions.map((office) => (
              <SelectItem key={office.id} value={office.id}>
                {office.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SelfRatingSelectionPanel
        fiscalYears={fiscalYears}
        deliveryUnits={deliveryUnits}
        filteredOpcrs={filteredOpcrs}
        selectedFiscalYear={selectedFiscalYear}
        selectedDeliveryUnitId={selectedDeliveryUnitId}
        selectedOpcr={selectedOpcr}
        onChangeFiscalYear={setSelectedFiscalYear}
        onChangeDeliveryUnit={setSelectedDeliveryUnitId}
        onSelectOpcr={setSelectedOpcr}
        onStartEvaluation={handleStartEvaluation}
      />
    </div>
  )
}
