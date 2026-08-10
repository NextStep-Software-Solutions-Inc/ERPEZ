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
        <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted/50 p-2">
          <TabsTrigger value="selection" className="whitespace-nowrap text-sm">
            <span className="hidden sm:inline mr-1">🔍</span>
            Selection Stage
          </TabsTrigger>
          <TabsTrigger
            value="consolidated"
            className="whitespace-nowrap text-sm"
          >
            <span className="hidden sm:inline mr-1">✅</span>
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
