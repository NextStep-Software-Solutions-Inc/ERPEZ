import { useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OpcrSelectionUI from './OpcrSelectionUI'
import ConsolidatedOPCRsListUI from './ConsolidatedOPCRsListUI'

/**
 * Consolidate OPCR Tab
 * Two-tab interface for OPCR consolidation:
 * - Selection Stage: Select approved OPCRs for consolidation
 * - Consolidated OPCRs: View and manage consolidation records
 *
 * URL Navigation:
 * - ?tab=consolidate&consolidateSubTab=selection (default)
 * - ?tab=consolidate&consolidateSubTab=consolidated
 * - Detail levels: opcrId, opcrConsolidationId, functionTypeId appended as needed
 */
export default function ConsolidateOPCRTab() {
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const navigate = useNavigate({ from: '/v2/commitments' })

  // Read consolidateSubTab from URL, default to 'selection'
  const activeTab = ((searchParams.consolidateSubTab as string) ??
    'selection') as 'selection' | 'consolidated'

  const handleTabChange = (newTab: string) => {
    // Preserve only pagination params, reset detail-level params when switching subtabs
    navigate({
      search: (prev) => ({
        tab: prev.tab,
        consolidateSubTab: newTab as 'selection' | 'consolidated',
        pageSize: prev.pageSize,
        pageNumber: prev.pageNumber,
        // All detail-level params are removed: opcrId, opcrConsolidationId, functionTypeId, etc.
      }),
    })
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto gap-1.5 rounded-xl bg-muted/70 dark:bg-slate-950/60 border border-border/60 p-1.5">
          <TabsTrigger
            value="selection"
            className="whitespace-nowrap py-2 px-3 text-sm rounded-lg data-[state=active]:bg-card dark:data-[state=active]:bg-slate-800 data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <span className="hidden sm:inline mr-1.5">🔍</span>
            Selection Stage
          </TabsTrigger>
          <TabsTrigger
            value="consolidated"
            className="whitespace-nowrap py-2 px-3 text-sm rounded-lg data-[state=active]:bg-card dark:data-[state=active]:bg-slate-800 data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <span className="hidden sm:inline mr-1.5">✅</span>
            Consolidated OPCRs
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="selection" className="space-y-4">
          <OpcrSelectionUI />
        </TabsContent>

        <TabsContent value="consolidated" className="space-y-4">
          <ConsolidatedOPCRsListUI />
        </TabsContent>
      </Tabs>
    </div>
  )
}
