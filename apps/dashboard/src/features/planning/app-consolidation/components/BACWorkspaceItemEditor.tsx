import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BACLineItem } from '../types'
import { MoPTabItem } from './bac-tabs/MoPTabItem'
import { MilestonesTabItem } from './bac-tabs/MilestonesTabItem'
import { RemarksTabItem } from './bac-tabs/RemarksTabItem'
import { EPATabItem } from './bac-tabs/EPATabItem'
import { ProcurementStrategyTabItem } from './bac-tabs/ProcurementStrategyTabItem'

interface BACWorkspaceItemEditorProps {
  lineItem: BACLineItem
  onUpdate?: (lineItem: BACLineItem) => void
  readOnly?: boolean
}

/**
 * BACWorkspaceItemEditor - Single Item Editor Component
 *
 * Provides focused tabs for editing a single BAC line item.
 * Mirrors the structure of BACWorkspace but operates on individual items.
 *
 * Tabs included:
 * - Mode of Procurement
 * - Procurement Schedule Milestones
 * - Bid Evaluation Criteria
 * - Procurement Strategy/Tools
 * - Remarks
 * - EPA Eligibility
 */
export function BACWorkspaceItemEditor({
  lineItem,
  onUpdate,
  readOnly = false,
}: BACWorkspaceItemEditorProps) {
  const [activeTab, setActiveTab] = useState('mop')
  const [localItem, setLocalItem] = useState(lineItem)

  // Sync local state with prop changes
  useEffect(() => {
    setLocalItem(lineItem)
  }, [lineItem])

  const handleUpdate = (updates: Partial<BACLineItem>) => {
    const updated = { ...localItem, ...updates }
    setLocalItem(updated)
    onUpdate?.(updated)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5 gap-1 h-auto p-1">
        <TabsTrigger value="mop" className="text-xs px-2 py-1.5 whitespace-nowrap">Procurement Details</TabsTrigger>
        <TabsTrigger value="milestones" className="text-xs px-2 py-1.5 whitespace-nowrap">Milestones</TabsTrigger>
        <TabsTrigger value="strategy" className="text-xs px-2 py-1.5 whitespace-nowrap">Strategy & Evaluation</TabsTrigger>
        <TabsTrigger value="remarks" className="text-xs px-2 py-1.5 whitespace-nowrap">Remarks</TabsTrigger>
        <TabsTrigger value="epa" className="text-xs px-2 py-1.5 whitespace-nowrap">EPA</TabsTrigger>
      </TabsList>

      <TabsContent value="mop" className="space-y-4 mt-4">
        <MoPTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="milestones" className="space-y-4 mt-4">
        <MilestonesTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="strategy" className="space-y-4 mt-4">
        <ProcurementStrategyTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="remarks" className="space-y-4 mt-4">
        <RemarksTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="epa" className="space-y-4 mt-4">
        <EPATabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>
    </Tabs>
  )
}
