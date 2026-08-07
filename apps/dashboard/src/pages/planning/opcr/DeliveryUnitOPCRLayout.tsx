import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { PageContainer } from '@/components/PageContainer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DeliveryUnitOPCRLayoutProps {
  children: React.ReactNode
}

export default function DeliveryUnitOPCRLayout({ children }: DeliveryUnitOPCRLayoutProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v1/planning/$deliveryUnitId/opcr/' })
  const { deliveryUnitId } = useParams({ from: '/v1/planning/$deliveryUnitId/opcr/' })

  const { tab } = search

  const setActiveTab = (newTab: string) => {
    navigate({
      to: `/planning/$deliveryUnitId/opcr`,
      params: { deliveryUnitId },
      search: { ...search, tab: newTab as typeof tab, page: 1 }, // Reset to page 1 when changing tabs
      replace: true,
    })
  }

  return (
    <PageContainer
      title="OPCR Management"
      description="Office Performance Commitment Review Management"
      forTable
    >
      {/* Tab Navigation */}
      <Tabs value={tab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex relative top-4 w-fit">
          <TabsTrigger value="kpi">KPI</TabsTrigger>
          <TabsTrigger value="opcr">OPCR</TabsTrigger>
          <TabsTrigger value="consolidate">Consolidate</TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </PageContainer>
  )
}
