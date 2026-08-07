import { useEffect, useMemo, useState } from 'react'

import { useKeycloak } from '@/providers/KeycloakProvider'
import { useKpis } from '@/features/planning/master-kpi/handlers/hooks'
import { useKpiMeasurements } from '@/features/planning/kpi-measurement-configurator/handlers/hooks'
import {
  getOPCRItemsFromResponse,
  useGetOPCRItemsQuery,
  useOPCRs,
} from '@/lib/opcr'

import { usePerformanceReviewStore } from '../store/performanceReviewStore'
import { usePerformanceCalculation } from './usePerformanceCalculation'
import { useCreateOrUpdateRating } from './useRatingsAPI'
import type { OPCRReference } from '../types'
import {
  buildDeliveryUnits,
  buildFiscalYears,
  deriveCurrentUser,
  filterApprovedOpcrs,
  groupKPIsByCategory,
} from '../utils/selfRating'
import { validateSelfRatingSubmission } from '../utils/selfRatingValidation'
import { buildOPCRReferencesFromApi } from '../utils/opcrReferences'

export function useSelfRatingWorkspace() {
  const { keycloak, userName, email, firstName, lastName } = useKeycloak()
  const currentUser = useMemo(
    () =>
      deriveCurrentUser({
        keycloakSubject: keycloak?.subject,
        email,
        userName,
        firstName,
        lastName,
      }),
    [email, firstName, keycloak?.subject, lastName, userName],
  )

  const {
    currentSession,
    availableOpcrs,
    selectedFiscalYear,
    selectedDeliveryUnitId,
    setSelectedFiscalYear,
    setSelectedDeliveryUnitId,
    setAvailableOpcrs,
    returnToSelection,
    loadSession,
    updateSelfRating,
    updateActual,
    updateJustification,
    updateScaleType,
    updateRatingLevel,
    updateIsScaleEditable,
    updateIsMOVEditable,
    addMOVFile,
    removeMOVFile,
    addConfiguredMOVName,
    updateConfiguredMOVName,
    removeConfiguredMOVName,
    syncItemRatings,
    setSelfRatingId,
    submitForReview,
  } = usePerformanceReviewStore()

  const {
    data: opcrsData,
    isLoading: isOPCRsLoading,
    isError: isOPCRsError,
  } = useOPCRs({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const opcrs = opcrsData?.data ?? []

  const {
    data: opcrItemsData,
    isLoading: isOPCRItemsLoading,
    isError: isOPCRItemsError,
  } = useGetOPCRItemsQuery({
    pathParams: {},
    queryParams: {},
  })
  const opcrItems = useMemo(
    () => getOPCRItemsFromResponse(opcrItemsData),
    [opcrItemsData],
  )

  const opcrReferences = useMemo(
    () => buildOPCRReferencesFromApi(opcrs, opcrItems),
    [opcrs, opcrItems],
  )

  useEffect(() => {
    setAvailableOpcrs(opcrReferences)
  }, [opcrReferences, setAvailableOpcrs])

  const fiscalYears = useMemo(
    () => buildFiscalYears(availableOpcrs),
    [availableOpcrs],
  )

  const deliveryUnits = useMemo(
    () => buildDeliveryUnits(availableOpcrs),
    [availableOpcrs],
  )

  useEffect(() => {
    if (selectedFiscalYear && !fiscalYears.includes(selectedFiscalYear)) {
      setSelectedFiscalYear('')
    }
  }, [fiscalYears, selectedFiscalYear, setSelectedFiscalYear])

  useEffect(() => {
    if (!selectedDeliveryUnitId) return
    const stillAvailable = deliveryUnits.some(
      (unit) => unit.id === selectedDeliveryUnitId,
    )
    if (!stillAvailable) setSelectedDeliveryUnitId('')
  }, [deliveryUnits, selectedDeliveryUnitId, setSelectedDeliveryUnitId])

  const { data: measurementsData } = useKpiMeasurements({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const kpiMeasurements = measurementsData?.data ?? []

  const { data: kpisData } = useKpis({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const masterKpis = kpisData?.data ?? []

  const createOrUpdateRatingMutation = useCreateOrUpdateRating()

  const calc = usePerformanceCalculation(currentSession)
  const [selectedOpcr, setSelectedOpcr] = useState<OPCRReference | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [openAccordions, setOpenAccordions] = useState<string[]>([])

  const filteredOpcrs = useMemo(
    () =>
      filterApprovedOpcrs({
        opcrs: availableOpcrs,
        selectedFiscalYear,
        selectedDeliveryUnitId,
      }),
    [availableOpcrs, selectedDeliveryUnitId, selectedFiscalYear],
  )

  const isSelectionLoading = isOPCRsLoading || isOPCRItemsLoading
  const groupedKPIs = useMemo(
    () => groupKPIsByCategory(currentSession?.kpiItems),
    [currentSession?.kpiItems],
  )
  const isReadOnly =
    !!currentSession &&
    currentSession.status !== 'OPEN_FOR_RATING' &&
    currentSession.status !== 'REJECTED_FOR_REVISION'

  const handleStartEvaluation = () => {
    if (!selectedOpcr) return
    loadSession(
      selectedOpcr.id,
      currentUser.id,
      currentUser.name,
      kpiMeasurements,
      masterKpis,
      opcrItems,
    )
    setSelectedOpcr(null)
  }

  const handleUpdateSelfRating = async (
    kpiId: string,
    field: 'quality' | 'efficiency' | 'timeliness',
    value: number | null,
    fyActiveKPIMeasurementId?: string | null,
  ) => {
    updateSelfRating(kpiId, field, value)

    if (value === null || isReadOnly) return

    const kpiItem = currentSession?.kpiItems.find((item) => item.id === kpiId)
    if (!kpiItem) return

    const measurementId =
      fyActiveKPIMeasurementId || kpiItem.fyActiveKPIMeasurementId
    if (!measurementId) {
      console.error(
        'No fyActiveKPIMeasurementId found for rating',
        field,
        'on item',
        kpiId,
      )
      return
    }

    const payload = {
      opcrItemId: kpiItem.id,
      fyActiveKPIMeasurementId: measurementId,
      selfRating: value,
    }

    try {
      const result = await createOrUpdateRatingMutation.mutateAsync({
        itemId: kpiItem.id,
        payload,
      })
      if (result && result.id) {
        setSelfRatingId(kpiId, field, result.id)
      }
    } catch (error) {
      console.error('Failed to save rating:', error)
    }
  }

  const validateAndSubmit = () => {
    if (!currentSession) return
    const validationError = validateSelfRatingSubmission(currentSession, calc)
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setSubmitError(null)
    submitForReview(currentUser.id, currentUser.name)
  }

  const handleReturnToSelection = () => {
    setSelectedOpcr(null)
    returnToSelection()
  }

  return {
    currentSession,
    selectedFiscalYear,
    selectedDeliveryUnitId,
    setSelectedFiscalYear,
    setSelectedDeliveryUnitId,
    returnToSelection: handleReturnToSelection,
    selectedOpcr,
    setSelectedOpcr,
    fiscalYears,
    deliveryUnits,
    filteredOpcrs,
    isSelectionLoading,
    isOPCRItemsLoading,
    isOPCRItemsError,
    isOPCRsError,
    calc,
    groupedKPIs,
    openAccordions,
    setOpenAccordions,
    isReadOnly,
    submitError,
    validateAndSubmit,
    handleStartEvaluation,
    handleUpdateSelfRating,
    updateActual,
    updateJustification,
    updateScaleType,
    updateRatingLevel,
    updateIsScaleEditable,
    updateIsMOVEditable,
    addMOVFile,
    removeMOVFile,
    addConfiguredMOVName,
    updateConfiguredMOVName,
    removeConfiguredMOVName,
    syncItemRatings,
  }
}
