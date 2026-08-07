import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAtom } from 'jotai'
import { bacWorkspaceTabAtom } from '../atoms'
import type { BACWorkspace } from '../types'
import { EPATab } from './bac-tabs/EPATab'
import { MoPTab } from './bac-tabs/MoPTab'
import { RemarksTab } from './bac-tabs/RemarksTab'
import { MilestonesTab } from './bac-tabs/MilestonesTab'
import { ProcurementStrategyTab } from './bac-tabs/ProcurementStrategyTab'
import { ProjectChecklistTab } from './bac-tabs/ProjectChecklistTab'

interface BACWorkspaceProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: BACWorkspace) => void
  readOnly?: boolean
}

export function BACWorkspace({
  workspace,
  onUpdate,
  readOnly = false,
}: BACWorkspaceProps) {
  const [activeTab, setActiveTab] = useAtom(bacWorkspaceTabAtom)
  const [localWorkspace, setLocalWorkspace] = useState(workspace)

  // Sync localWorkspace when workspace prop changes (e.g., from SelectPPMPDialog consolidation)
  useEffect(() => {
    console.log('🔄 BACWorkspace: workspace prop updated, syncing localWorkspace...')
    console.log('📊 New workspace lineItems count:', workspace.lineItems?.length || 0)
    setLocalWorkspace(workspace)
  }, [workspace])

  const handleUpdate = (updates: Partial<BACWorkspace>) => {
    const updated = { ...localWorkspace, ...updates }
    setLocalWorkspace(updated)
    onUpdate?.(updated)
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
      <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 sm:grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="checklist" className="text-xs px-2 py-1.5 whitespace-nowrap">Checklist</TabsTrigger>
        <TabsTrigger value="mop" className="text-xs px-2 py-1.5 whitespace-nowrap">MoP</TabsTrigger>
        <TabsTrigger value="schedules" className="text-xs px-2 py-1.5 whitespace-nowrap">Milestones</TabsTrigger>
        <TabsTrigger value="strategy" className="text-xs px-2 py-1.5 whitespace-nowrap">Strategy</TabsTrigger>
        <TabsTrigger value="remarks" className="text-xs px-2 py-1.5 whitespace-nowrap">Remarks</TabsTrigger>
        <TabsTrigger value="epa" className="text-xs px-2 py-1.5 whitespace-nowrap">EPA</TabsTrigger>
      </TabsList>

      <TabsContent value="checklist" className="space-y-4">
        <ProjectChecklistTab
          workspace={localWorkspace}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="mop" className="space-y-4">
        <MoPTab
          workspace={localWorkspace}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="schedules" className="space-y-4">
        <MilestonesTab
          workspace={localWorkspace}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="strategy" className="space-y-4">
        <ProcurementStrategyTab
          workspace={localWorkspace}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="remarks" className="space-y-4">
        <RemarksTab
          workspace={localWorkspace}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="epa" className="space-y-4">
        <EPATab
          workspace={localWorkspace}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>
    </Tabs>
  )
}
