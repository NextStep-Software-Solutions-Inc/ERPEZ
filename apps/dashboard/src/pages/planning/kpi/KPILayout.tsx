import { useNavigate, useSearch } from '@tanstack/react-router'
import { PageContainer } from '@/components/PageContainer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface KPILayoutProps {
  children: React.ReactNode
}

export default function KPILayout({ children }: KPILayoutProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/kpi/' })

  const { tab } = search

  const setActiveTab = (newTab: string) => {
    navigate({
      to: `/planning/kpi`,
      search: { ...search, tab: newTab as typeof tab, page: 1 }, // Reset to page 1 when changing tabs
      replace: true,
    })
  }

  return (
    <PageContainer
      title="KPI Management"
      description="Manage and configure Key Performance Indicators"
      forTable
    >
      {/* Tab Navigation */}
      <Tabs value={tab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex relative top-4 w-[500px]">
          <TabsTrigger value="kpi">KPI</TabsTrigger>
          <TabsTrigger value="function-allocation">
            Function Allocation
          </TabsTrigger>
          <TabsTrigger value="kpi-assignment-for-du">
            KPI Assignment for DU
          </TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </PageContainer>
  )
}
