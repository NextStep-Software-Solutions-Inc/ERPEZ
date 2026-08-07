/**
 * ItemDetailTabs
 * Lazy-loaded 4-tab content wrapper for the item detail panel.
 */

import { useAtom } from 'jotai'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { detailPanelActiveTabAtom } from '../atoms/selectedItemAtom'
import { OverviewTab } from './OverviewTab'
import { PriceHistoryTab } from './PriceHistoryTab'
import { AuditLogTab } from './AuditLogTab'
import { ReferencesTab } from './ReferencesTab'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'price-history', label: 'Price History' },
  { id: 'audit-log', label: 'Audit Log' },
  { id: 'references', label: 'References' },
] as const

export function ItemDetailTabs() {
  const [activeTab, setActiveTab] = useAtom(detailPanelActiveTabAtom)

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      className="flex flex-col flex-1 min-h-0"
    >
      <TabsList className="w-full justify-start h-9 rounded-none border-b border-border bg-transparent px-0 gap-0 shrink-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs font-medium px-3 h-full"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex-1 overflow-y-auto min-h-0 pt-4">
        <TabsContent value="overview" className="m-0 h-full">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="price-history" className="m-0 h-full">
          <PriceHistoryTab />
        </TabsContent>
        <TabsContent value="audit-log" className="m-0 h-full">
          <AuditLogTab />
        </TabsContent>
        <TabsContent value="references" className="m-0 h-full">
          <ReferencesTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}
