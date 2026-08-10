import { useEffect, useMemo } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useLocation, useParams } from '@tanstack/react-router'
import type { KpiTargetAssignments } from '@/components/features/planning/kpi-assignment-for-du'
import { getDeliveryUnitRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest'
import { OPCRKpiAccordionView } from '@/features/planning/opcr/OPCRKpiAccordionView'
import { filterUniqueKpis } from '@/utils/kpi'

const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest)

interface DeliveryUnitOPCRTabProps {
  opcrSearch?: string
}

function DeliveryUnitOPCRTab({ opcrSearch }: DeliveryUnitOPCRTabProps) {
  const location = useLocation()
  const { deliveryUnitId } = useParams({ from: '/v1/planning/$deliveryUnitId/opcr/' })

  const { data: deliveryUnit, isLoading } = useDeliveryUnit({
    pathParams: {
      id: deliveryUnitId,
    },
    queryParams: {},
  })

  const kpis = useMemo(() => {
    const uniqueAssignments = filterUniqueKpis(deliveryUnit?.data.kpiTargetAssignments || [])
    return uniqueAssignments.flatMap((assignment: KpiTargetAssignments) => assignment.KPI) || []
  }, [deliveryUnit])

  // Cleanup localStorage when leaving the OPCR page
  useEffect(() => {
    return () => {
      // Check if we're navigating away from the delivery-unit OPCR page
      const isLeavingOpcrPage = !window.location.pathname.startsWith('/planning/')

      if (isLeavingOpcrPage) {
        // Cleanup if needed
      }
    }
  }, [location.pathname])

  return (
    <OPCRKpiAccordionView
      kpis={kpis}
      deliveryUnitId={deliveryUnitId}
      opcrId=""
      isLoading={isLoading}
    />
  )
}

