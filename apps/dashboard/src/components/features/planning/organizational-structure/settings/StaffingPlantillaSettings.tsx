import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PositionTypesTab } from './PositionTypesTab'
import { SalaryGradesTab } from './SalaryGradesTab'
import { PlantillaTypesTab } from './PlantillaTypesTab'
import { StepsTab } from './StepsTab'

export function StaffingPlantillaSettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="position-types">
        <TabsList className="grid-cols-4">
          <TabsTrigger value="position-types">Position Types</TabsTrigger>
          <TabsTrigger value="salary-grades">Salary Grades</TabsTrigger>
          <TabsTrigger value="plantilla-types">Plantilla Types</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
        </TabsList>

        <PositionTypesTab />
        <SalaryGradesTab />
        <PlantillaTypesTab />
        <StepsTab />
      </Tabs>
    </div>
  )
}
