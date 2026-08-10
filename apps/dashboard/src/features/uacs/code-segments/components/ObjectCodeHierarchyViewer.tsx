import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, MoreHorizontal, Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { ObjectCode } from '../types/objectCodeTypes'
import { expenseClassColors } from '../utils/expenseClassColors'

interface HierarchyNode {
  id: string
  code: string
  name: string
  expenseClass: string
  isActive: boolean
  level: number
  children?: HierarchyNode[]
}

interface ObjectCodeHierarchyViewerProps {
  items: ObjectCode[]
  onEdit?: (item: ObjectCode) => void
  onDelete?: (item: ObjectCode) => void
  onAddChild?: (parentItem: ObjectCode) => void
}

/**
 * Builds hierarchical tree from flat ObjectCode array
 */
function buildHierarchy(codes: ObjectCode[]): HierarchyNode[] {
  const codeMap = new Map<string, ObjectCode>()
  codes.forEach((code) => codeMap.set(code.id, code))

  const buildNode = (code: ObjectCode, level: number): HierarchyNode => {
    const children = codes
      .filter((c) => c.parentId === code.id)
      .map((c) => buildNode(c, level + 1))

    return {
      id: code.id,
      code: code.code,
      name: code.name,
      expenseClass: code.expenseClass,
      isActive: code.isActive,
      level,
      children: children.length > 0 ? children : undefined,
    }
  }

  // Only top-level codes (no parent)
  return codes
    .filter((code) => !code.parentId)
    .map((code) => buildNode(code, 0))
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function ObjectCodeHierarchyViewer({
  items,
  onEdit,
  onDelete,
  onAddChild,
}: ObjectCodeHierarchyViewerProps) {
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

  const getExpenseClassBadgeColor = (expenseClass: string) => {
    const colors = expenseClassColors as any
    return colors[expenseClass] || 'bg-gray-100 text-gray-800'
  }

  const getRowBackgroundColor = (level: number) => {
    if (level === 0) return 'bg-white'
    return level % 2 === 0 ? 'bg-blue-50/30' : 'bg-blue-50/50'
  }

  const renderNode = (node: HierarchyNode, codeItem: ObjectCode | undefined) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition border-b ${getRowBackgroundColor(node.level)}`}
          style={{ paddingLeft: `${16 + node.level * 24}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id)
            }
          }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="flex items-center justify-center w-5 h-5 hover:bg-gray-300 rounded transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold">{node.code}</span>
              <Badge
                className={`text-white font-semibold ${getExpenseClassBadgeColor(node.expenseClass)}`}
              >
                {node.expenseClass}
              </Badge>
              {hasChildren && (
                <Badge variant="outline" className="text-xs">
                  {node.children?.length || 0} children
                </Badge>
              )}
              <Badge color={node.isActive ? 'success' : 'destructive'} variant="outline" className="text-xs">
                {node.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-sm text-gray-700 mt-1">{node.name}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (codeItem) onAddChild?.(codeItem)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add Child Code</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (codeItem) onEdit?.(codeItem)
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (codeItem) onDelete?.(codeItem)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Children */}
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
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="mb-0">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-base font-semibold">Hierarchy View</h3>
          <p className="text-xs text-gray-600 mt-1">
            Organized by parent-child relationships with expense class categorization
          </p>
        </div>
      </div>
      <div>
        {hierarchyData.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">No object codes found</div>
        ) : (
          hierarchyData.map((node) => {
            const codeItem = items.find((item) => item.id === node.id)
            return renderNode(node, codeItem)
          })
        )}
      </div>
    </div>
  )
}
