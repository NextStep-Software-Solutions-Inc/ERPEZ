import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Calendar, TrendingUp, MessageSquare, ShieldCheck } from 'lucide-react'
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-11 p-1 bg-slate-100/90 rounded-lg border border-slate-200">
        <TabsTrigger
          value="mop"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs rounded-md transition-all"
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Procurement Details</span>
        </TabsTrigger>
        <TabsTrigger
          value="milestones"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs rounded-md transition-all"
        >
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Milestones</span>
        </TabsTrigger>
        <TabsTrigger
          value="strategy"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs rounded-md transition-all"
        >
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Strategy & Tools</span>
        </TabsTrigger>
        <TabsTrigger
          value="remarks"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs rounded-md transition-all"
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Remarks</span>
        </TabsTrigger>
        <TabsTrigger
          value="epa"
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs rounded-md transition-all"
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">EPA</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mop" className="space-y-4 mt-4 focus-visible:outline-none">
        <MoPTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="milestones" className="space-y-4 mt-4 focus-visible:outline-none">
        <MilestonesTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="strategy" className="space-y-4 mt-4 focus-visible:outline-none">
        <ProcurementStrategyTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="remarks" className="space-y-4 mt-4 focus-visible:outline-none">
        <RemarksTabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>

      <TabsContent value="epa" className="space-y-4 mt-4 focus-visible:outline-none">
        <EPATabItem
          item={localItem}
          onUpdate={handleUpdate}
          readOnly={readOnly}
        />
      </TabsContent>
    </Tabs>
  )
}
