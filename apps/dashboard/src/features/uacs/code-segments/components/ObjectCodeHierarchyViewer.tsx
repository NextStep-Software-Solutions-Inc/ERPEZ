import { useState, useMemo, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  searchQuery?: string
}

/**
 * Builds hierarchical tree from flat ObjectCode array.
 * Retains all nodes by treating any node whose parent is not in the array as a top-level node.
 */
function buildHierarchy(codes: ObjectCode[]): HierarchyNode[] {
  const codeMap = new Map<string, ObjectCode>()
  const codeByCleanCode = new Map<string, ObjectCode>()

  codes.forEach((code) => {
    codeMap.set(code.id, code)
    const clean = code.code.replace(/[\s-]+/g, '')
    if (clean) codeByCleanCode.set(clean, code)
  })

  // Precompute parentId for codes that have no parentId but match a parent code prefix (e.g. 50604050 00 -> 50604050)
  const resolvedParentIdMap = new Map<string, string>()
  codes.forEach((c) => {
    if (c.parentId && codeMap.has(c.parentId)) {
      resolvedParentIdMap.set(c.id, c.parentId)
      return
    }
    const cleanCode = c.code.replace(/[\s-]+/g, '')
    if (cleanCode.length > 8) {
      const parentPrefix = cleanCode.slice(0, 8)
      const parentCandidate = codeByCleanCode.get(parentPrefix)
      if (parentCandidate && parentCandidate.id !== c.id) {
        resolvedParentIdMap.set(c.id, parentCandidate.id)
      }
    }
  })

  const buildNode = (code: ObjectCode, level: number): HierarchyNode => {
    const children = codes
      .filter((c) => (resolvedParentIdMap.get(c.id) || c.parentId) === code.id)
      .map((c) => buildNode(c, level + 1))
      .sort((a, b) => a.code.localeCompare(b.code))

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

  // Top-level codes: those without parent or whose parent is not in the dataset
  return codes
    .filter((code) => {
      const pId = resolvedParentIdMap.get(code.id) || code.parentId
      return !pId || !codeMap.has(pId)
    })
    .map((code) => buildNode(code, 0))
    .sort((a, b) => a.code.localeCompare(b.code))
}

/**
 * Highlights matching query terms in text
 */
function highlightMatch(text: string, query?: string) {
  if (!query?.trim() || !text) return text
  const q = query.trim()
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded-xs">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function ObjectCodeHierarchyViewer({
  items,
  onEdit,
  onDelete,
  onAddChild,
  searchQuery,
}: ObjectCodeHierarchyViewerProps) {
  const [manualCollapsedNodes, setManualCollapsedNodes] = useState<Set<string>>(new Set())
  const [manualExpandedNodes, setManualExpandedNodes] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const hierarchyData = useMemo(() => buildHierarchy(items), [items])

  // Reset page and manual expand/collapse states when search or items change
  useEffect(() => {
    setPage(1)
    setManualCollapsedNodes(new Set())
    setManualExpandedNodes(new Set())
  }, [items.length, searchQuery])

  // Filter hierarchy tree to only matching nodes and their ancestor chains when searching
  const filteredHierarchyData = useMemo(() => {
    const query = searchQuery?.trim().toLowerCase()
    if (!query) return hierarchyData

    const filterTree = (nodes: HierarchyNode[]): HierarchyNode[] => {
      const result: HierarchyNode[] = []
      for (const node of nodes) {
        const selfMatch =
          node.code.toLowerCase().includes(query) ||
          node.name.toLowerCase().includes(query)
        const matchingChildren = node.children ? filterTree(node.children) : []

        if (selfMatch || matchingChildren.length > 0) {
          result.push({
            ...node,
            children: matchingChildren.length > 0 ? matchingChildren : (selfMatch ? node.children : undefined),
          })
        }
      }
      return result
    }

    return filterTree(hierarchyData)
  }, [hierarchyData, searchQuery])

  const totalRootCount = filteredHierarchyData.length
  const totalPages = Math.max(1, Math.ceil(totalRootCount / pageSize))
  const paginatedNodes = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return filteredHierarchyData.slice(startIndex, startIndex + pageSize)
  }, [filteredHierarchyData, page, pageSize])

  const isNodeExpanded = (nodeId: string): boolean => {
    const isSearching = Boolean(searchQuery?.trim())
    if (isSearching) {
      // Auto-expand all matching branches when searching, unless manually collapsed by user
      return !manualCollapsedNodes.has(nodeId)
    }
    // Collapsed by default when not searching, unless manually expanded by user
    return manualExpandedNodes.has(nodeId)
  }

  const toggleNode = (nodeId: string) => {
    const isSearching = Boolean(searchQuery?.trim())
    if (isSearching) {
      setManualCollapsedNodes((prev) => {
        const next = new Set(prev)
        if (next.has(nodeId)) {
          next.delete(nodeId)
        } else {
          next.add(nodeId)
        }
        return next
      })
    } else {
      setManualExpandedNodes((prev) => {
        const next = new Set(prev)
        if (next.has(nodeId)) {
          next.delete(nodeId)
        } else {
          next.add(nodeId)
        }
        return next
      })
    }
  }

  const getExpenseClassBadgeColor = (expenseClass: string) => {
    const colors = expenseClassColors as any
    return colors[expenseClass] || 'bg-gray-100 text-gray-800'
  }

  const getRowBackgroundColor = (level: number) => {
    if (level === 0) return 'bg-white'
    return level % 2 === 0 ? 'bg-blue-50/20' : 'bg-slate-50/50'
  }

  const renderNode = (node: HierarchyNode, codeItem: ObjectCode | undefined) => {
    const hasChildren = Boolean(node.children && node.children.length > 0)
    const isExpanded = isNodeExpanded(node.id)

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50/90 transition border-b ${getRowBackgroundColor(node.level)}`}
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
              className="flex items-center justify-center w-5 h-5 mt-0.5 hover:bg-gray-300 rounded transition-colors flex-shrink-0"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold text-gray-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {highlightMatch(node.code, searchQuery)}
              </span>
              <Badge
                className={`text-white font-semibold ${getExpenseClassBadgeColor(node.expenseClass)}`}
              >
                {node.expenseClass}
              </Badge>
              {hasChildren && (
                <Badge variant="outline" className="text-xs font-semibold bg-indigo-50 text-indigo-700 border-indigo-200">
                  {node.children!.length} {node.children!.length === 1 ? 'child' : 'children'}
                </Badge>
              )}
              <Badge color={node.isActive ? 'success' : 'destructive'} variant="outline" className="text-xs">
                {node.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-sm font-medium text-gray-800 mt-1">
              {highlightMatch(node.name, searchQuery)}
            </div>

            {/* Include codes of each children */}
            {hasChildren && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Child Codes:
                </span>
                {node.children!.slice(0, 8).map((child) => {
                  const isMatch =
                    Boolean(searchQuery?.trim()) &&
                    (child.code.toLowerCase().includes(searchQuery!.trim().toLowerCase()) ||
                      child.name.toLowerCase().includes(searchQuery!.trim().toLowerCase()))
                  return (
                    <span
                      key={child.id}
                      className={`font-mono text-[11px] font-medium px-1.5 py-0.5 rounded border transition-colors ${
                        isMatch
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-slate-200'
                      }`}
                      title={`${child.code} - ${child.name}`}
                    >
                      {highlightMatch(child.code, searchQuery)}
                    </span>
                  )
                })}
                {node.children!.length > 8 && (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-dashed border-slate-200">
                    +{node.children!.length - 8} more
                  </span>
                )}
              </div>
            )}
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

        {/* Children rendering */}
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
    <div className="border rounded-lg overflow-hidden bg-white shadow-xs">
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Hierarchy View</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Organized by parent-child relationships with expense class categorization and child code listings
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Total root groups: <strong className="text-gray-900">{totalRootCount}</strong>
        </div>
      </div>

      <div>
        {paginatedNodes.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No object codes found</p>
          </div>
        ) : (
          paginatedNodes.map((node) => {
            const codeItem = items.find((item) => item.id === node.id)
            return renderNode(node, codeItem)
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalRootCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val))
                setPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-18 text-xs bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground ml-2">
              Showing {Math.min((page - 1) * pageSize + 1, totalRootCount)}–
              {Math.min(page * pageSize, totalRootCount)} of {totalRootCount} root groups
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-white"
              onClick={() => setPage(1)}
              disabled={page <= 1}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-white"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-white"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-white"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
