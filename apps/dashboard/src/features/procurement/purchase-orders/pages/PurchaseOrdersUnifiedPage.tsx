import { useNavigate } from '@tanstack/react-router'
import { PurchaseOrderWorkspace } from '../components/PurchaseOrderWorkspace'

type PurchaseOrdersUnifiedPageProps = {
  initialMode?: 'all' | 'svp' | 'public-bidding' | 'direct-acquisition'
}

export function PurchaseOrdersUnifiedPage({ initialMode = 'all' }: PurchaseOrdersUnifiedPageProps) {
  const navigate = useNavigate()

  return (
    <PurchaseOrderWorkspace
      mode="all"
      role="procurement-staff"
      title="Purchase Orders"
      description="Unified management workspace for Purchase Orders across SVP, Public Bidding, and Direct Acquisition."
      defaultFilter="all"
      initialModeTab={initialMode}
      onModeTabChange={(tab) => {
        navigate({
          to: '/v2/purchase-orders',
          search: tab === 'all' ? {} : { mode: tab },
          replace: true,
        })
      }}
    />
  )
}
