import type { MetaActions } from '@/types/global'
import type {Project} from '@/components/features/planning/settings/projects';
import { TemplateTable } from '@/components/TemplateTable'
import {
  Column,
  
  Toolbar
} from '@/components/features/planning/settings/projects'

const generateFakeProject = (count: number): Array<Project> => {
  return Array.from({ length: count }, (_, index) => ({
    id: `Project-${index + 1}`,
    projectName: `Project Name ${index + 1}`,
    description: `Description for Project ${index + 1}`,
  }))
}

export default function ProjectTab() {
  const actions: MetaActions = ['write', 'delete']
  const data = generateFakeProject(50)

  return (
    <TemplateTable
      actions={actions}
      columns={Column}
      data={data}
      readonly={false}
      toolbar={(table) => <Toolbar table={table} />}
      forTab={true}
    />
  )
}
