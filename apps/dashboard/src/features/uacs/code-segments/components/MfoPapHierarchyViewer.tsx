import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { MfoPap } from '../types/mfoPapTypes'
import type { MfoPapType } from '../types/commonTypes'

interface HierarchyNode {
  id: string
  code: string
  name: string
  type: MfoPapType
  level: number
  children?: HierarchyNode[]
}

interface MfoPapHierarchyViewerProps {
  items: MfoPap[]
  onEdit?: (item: MfoPap) => void
  onDelete?: (item: MfoPap) => void
  onAddChild?: (parentItem: MfoPap) => void
}

/**
 * Builds hierarchical tree from flat MfoPap array
 * Uses parentId to establish parent-child relationships
 */
function buildHierarchy(mfoPaps: MfoPap[]): HierarchyNode[] {
  const buildNode = (mfoPap: MfoPap, level: number): HierarchyNode => {
    const children = mfoPaps
      .filter((m) => m.parentId === mfoPap.id)
      .map((m) => buildNode(m, level + 1))

    return {
      id: mfoPap.id,
      code: mfoPap.code,
      name: mfoPap.name,
      type: mfoPap.type,
      level,
      children: children.length > 0 ? children : undefined,
    }
  }

  // Only top-level items (no parent)
  return mfoPaps
    .filter((m) => !m.parentId)
    .map((m) => buildNode(m, 0))
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function MfoPapHierarchyViewer({
  items,
  onEdit,
  onDelete,
  onAddChild,
}: MfoPapHierarchyViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const hierarchyData = useMemo(() => buildHierarchy(items), [items])

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getTypeColor = (type: MfoPapType) => {
    switch (type) {
      case 'PROGRAM':
        return 'bg-blue-50 border-l-4 border-blue-400'
      case 'ACTIVITY':
        return 'bg-purple-50 border-l-4 border-purple-400'
      case 'PROJECT':
        return 'bg-green-50 border-l-4 border-green-400'
    }
  }

  const getTypeBadgeColor = (type: MfoPapType) => {
    switch (type) {
      case 'PROGRAM':
        return 'bg-blue-100 text-blue-800'
      case 'ACTIVITY':
        return 'bg-purple-100 text-purple-800'
      case 'PROJECT':
        return 'bg-green-100 text-green-800'
    }
  }

  const renderNode = (node: HierarchyNode, mfoItem: MfoPap | undefined) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-3 rounded cursor-pointer hover:bg-gray-100 transition ${getTypeColor(node.type)}`}
          onClick={() => {
            // Toggle expansion when clicking the row (if it has children)
            if (hasChildren) {
              toggleNode(node.id)
            }
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="flex items-center justify-center w-6 h-6 hover:bg-gray-300 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(node.type)}`}
              >
                {node.type}
              </span>
              <span className="font-mono text-sm font-medium">{node.code}</span>
            </div>
            <div className="text-sm text-gray-700 mt-1">{node.name}</div>
          </div>

          <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {node.type !== 'PROJECT' && (
                  <DropdownMenuItem
                    onClick={() => {
                      if (mfoItem) onAddChild?.(mfoItem)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Add Child</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    if (mfoItem) onEdit?.(mfoItem)
                  }}
                >
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (mfoItem) onDelete?.(mfoItem)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => {
              const childItem = items.find((item) => item.id === child.id)
              return renderNode(child, childItem)
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2 border rounded-lg p-4 bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">MFO/PAP Hierarchy</h3>
        <p className="text-sm text-gray-600">
          Program → Activity → Project structure
        </p>
      </div>
      <div className="space-y-1">
        {hierarchyData.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No MFO/PAP items available</p>
        ) : (
          hierarchyData.map((node) => {
            const mfoItem = items.find((item) => item.id === node.id)
            return renderNode(node, mfoItem)
          })
        )}
      </div>
    </div>
  )
}
