import { useNavigate, useSearch } from '@tanstack/react-router'
import { PageContainer } from '@/components/PageContainer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FundLayoutProps {
  children: React.ReactNode
}

export default function FundLayout({ children }: FundLayoutProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/fund/' })

  const { tab } = search

  const setActiveTab = (newTab: string) => {
    navigate({
      to: `/planning/fund`,
      search: { ...search, tab: newTab as typeof tab, page: 1 }, // Reset to page 1 when changing tabs
      replace: true,
    })
  }

  return (
    <PageContainer
      title="Fund Management"
      description="Manage and configure Funds"
      forTable
    >
      {/* Tab Navigation */}
      <Tabs value={tab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex relative top-4 w-[500px]">
          <TabsTrigger value="fund-source">Fund Source</TabsTrigger>
          <TabsTrigger value="fund-receiving">Fund Receiving</TabsTrigger>
          <TabsTrigger value="budget-allocation">Budget Allocation</TabsTrigger>
          <TabsTrigger value="fund-monitoring">Fund Monitoring</TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </PageContainer>
  )
}
