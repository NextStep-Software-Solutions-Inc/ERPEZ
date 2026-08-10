import ProjectTab from './tab/ProjectTab'
import PerformanceMeasureTab from './tab/PerformanceMeasureTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageContainer } from '@/components/PageContainer'


export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="Manage system configuration and master data"
      forTable
    >
      <Tabs defaultValue="projects" className="w-full ">
        <TabsList className="flex relative top-4 w-[300px]">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="performance-measures">
            Performance Measures
          </TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <ProjectTab />
        </TabsContent>
        <TabsContent value="performance-measures">
          <PerformanceMeasureTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
