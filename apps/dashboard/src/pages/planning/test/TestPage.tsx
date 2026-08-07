import TestKpiPage from '../kpi/TestKpiPage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageContainer } from '@/components/PageContainer'

function TestPage() {
  return (
    <PageContainer title="Test" description="KPI Test" forTable>
      <Tabs defaultValue="kpi" className="w-full ">
        <TabsList className="flex relative top-4 bg-gray-300 ">
          <TabsTrigger value="kpi">KPI</TabsTrigger>
          <TabsTrigger value="fiscal-year">Fiscal Year</TabsTrigger>
          <TabsTrigger value="kpi-assignment">
            KPI Assignment for Dus
          </TabsTrigger>
        </TabsList>
        <TabsContent value="kpi">
          <TestKpiPage />
        </TabsContent>
        <TabsContent value="fiscal-year">
          <>content</>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

export default TestPage
