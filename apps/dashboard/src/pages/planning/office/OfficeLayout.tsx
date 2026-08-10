import { useNavigate, useSearch } from '@tanstack/react-router'
import { PageContainer } from '@/components/PageContainer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface OfficeLayoutProps {
  children: React.ReactNode
}

export default function OfficeLayout({ children }: OfficeLayoutProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/planning/office/' })

  const { tab } = search
  const activeTab = (tab as string) || 'office'

  const setActiveTab = (newTab: string) => {
    navigate({
      to: `/planning/office`,
      search: {
        ...search,
        tab: newTab as typeof tab,
        page: 1,
        limit: 10,
        sortOrder: 'asc',
      },
      replace: true,
    })
  }

  return (
    <PageContainer
      title="Office"
      description="Manage and configure Office."
      forTable
    >
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex relative top-4 w-[500px]">
          <TabsTrigger value="office">Office</TabsTrigger>
          <TabsTrigger value="delivery-unit">Delivery Unit</TabsTrigger>
          <TabsTrigger value="organizational-cluster">
            Organizational Cluster
          </TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </PageContainer>
  )
}
