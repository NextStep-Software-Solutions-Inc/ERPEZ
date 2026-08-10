/**
 * Master KPI Tree View Component
 * Displays KPIs in a hierarchical tree format with infinite nesting support
 */

import { useMemo } from 'react'
import { Archive, Edit, Eye, RotateCcw } from 'lucide-react'
import { KpiValueBadge, getFunctionCategoryBadge } from '../utils/kpiBadgeUtils'
import type { ReactNode } from 'react'
import type { MasterKPI } from '../types'
import { Tree } from '@/components/ui/tree'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface MasterKpiTreeViewProps {
  kpis: Array<MasterKPI>
  onView: (kpi: MasterKPI) => void
  onEdit: (kpi: MasterKPI) => void
  onArchive: (kpi: MasterKPI) => void
  onRestore?: (kpi: MasterKPI) => void
  isLoading?: boolean
}

interface KpiTreeNodeData {
  id: string
  label: string
  children?: Array<KpiTreeNodeData>
  kpi: MasterKPI
}

interface KpiTreeRenderNode {
  id: string
  label: ReactNode
  children?: Array<KpiTreeRenderNode>
  kpi: MasterKPI
}

/**
 * Maps a flat list of KPIs to a recursive tree structure
 */
const buildKpiTree = (kpis: Array<MasterKPI>): Array<KpiTreeNodeData> => {
  const kpiMap = new Map<string, KpiTreeNodeData>()
  const roots: Array<KpiTreeNodeData> = []

  // First pass: Create all nodes
  kpis.forEach((kpi) => {
    kpiMap.set(kpi.id, {
      id: kpi.id,
      label: `${kpi.code}: ${kpi.name}`,
      kpi,
      children: [],
    })
  })

  // Second pass: Build hierarchy
  kpis.forEach((kpi) => {
    const node = kpiMap.get(kpi.id)!
    if (kpi.parentKPIId && kpiMap.has(kpi.parentKPIId)) {
      kpiMap.get(kpi.parentKPIId)!.children?.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export function MasterKpiTreeView({
  kpis,
  onView,
  onEdit,
  onArchive,
  onRestore,
  isLoading = false,
}: MasterKpiTreeViewProps) {
  const treeData = useMemo(() => {
    const kpiTree = buildKpiTree(kpis)

    // Enhance label with KPI-specific UI elements
    const enhanceNode = (
      nodes: Array<KpiTreeNodeData>,
    ): Array<KpiTreeRenderNode> => {
      return nodes.map(
        (node): KpiTreeRenderNode => ({
          ...node,
          label: (
            <div className="flex items-center justify-between gap-4 w-full group">
              <div className="flex items-center gap-2 overflow-hidden">
                <Badge variant="outline" className="flex-none font-mono">
                  {node.kpi.code}
                </Badge>
                <span className="truncate" title={node.kpi.name}>
                  {node.kpi.name}
                </span>
                <KpiValueBadge
                  {...getFunctionCategoryBadge(node.kpi.tags.functionCategory)}
                />
                {node.kpi.isArchived && (
                  <Badge
                    variant="soft"
                    className="bg-orange-100 text-orange-800"
                  >
                    Archived
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(node.kpi)
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                {!node.kpi.isArchived && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(node.kpi)
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchive(node.kpi)
                      }}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                {node.kpi.isArchived && onRestore && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRestore(node.kpi)
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ),
          children: node.children ? enhanceNode(node.children) : undefined,
        }),
      )
    }

    return enhanceNode(kpiTree)
  }, [kpis, onView, onEdit, onArchive, onRestore])

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded-md w-full" />
        ))}
      </div>
    )
  }

  if (kpis.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No KPIs found matching your criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full bg-card rounded-md border p-4 shadow-sm min-h-[400px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          KPI Hierarchy
        </h3>
        <Badge variant="outline" className="font-normal text-xs">
          {kpis.length} Indicators
        </Badge>
      </div>
      <Tree
        data={treeData as unknown as Parameters<typeof Tree>[0]['data']}
        showLine
        checkable={false}
        className="w-full"
        // The tree component will use our fancy label components
      />
    </div>
  )
}
