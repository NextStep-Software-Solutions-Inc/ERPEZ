/**
 * SubObjectCodeTable
 * Displays object codes in a hierarchical view showing parent-child relationships
 */

import { useMemo, useState } from 'react'
import { ChevronRight, ChevronDown, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ObjectCode } from '../../code-segments/types/objectCodeTypes'
import { expenseClassColors } from '../../code-segments/utils/expenseClassColors'

interface SubObjectCodeTableProps {
  data: ObjectCode[]
  onEdit?: (code: ObjectCode) => void
  onDelete?: (code: ObjectCode) => void
  onAddChild?: (parentCode: ObjectCode) => void
  readonly?: boolean
}

/**
 * Builds a hierarchical tree of object codes
 */
function buildHierarchy(codes: ObjectCode[]): ObjectCode[] {
  // Only show top-level codes (no parent)
  return codes.filter((code) => !code.parentId).map((parent) => ({
    ...parent,
    children: codes.filter((code) => code.parentId === parent.id),
  }))
}

export function SubObjectCodeTable({
  data,
  onEdit,
  onDelete,
  onAddChild,
  readonly = false,
}: SubObjectCodeTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const hierarchy = useMemo(() => buildHierarchy(data), [data])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const renderCode = (code: ObjectCode, level: number = 0) => {
    const hasChildren = code.children && code.children.length > 0
    const isExpanded = expandedIds.has(code.id)

    return (
      <div key={code.id}>
        <div
          className={`grid grid-cols-12 gap-2 px-4 py-3 border-b items-center hover:bg-gray-50 cursor-pointer transition ${
            level > 0 ? 'bg-blue-50/30' : ''
          }`}
          onClick={() => {
            // Toggle expansion when clicking the row (if it has children)
            if (hasChildren) {
              toggleExpanded(code.id)
            }
          }}
        >
          {/* Toggle Column (col-span-1) */}
          <div className="col-span-1 flex justify-center">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(code.id)
                }}
                className="p-1 hover:bg-gray-200 rounded inline-flex transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : null}
          </div>

          {/* Code Column (col-span-1) */}
          <div className="col-span-1 flex justify-center">
            <div
              className="font-mono font-semibold text-sm truncate"
              style={{ marginLeft: `${level * 12}px` }}
            >
              {code.code}
            </div>
          </div>

          {/* Name Column (col-span-5) */}
          <div className="col-span-5">
            <div className="font-medium text-sm">{code.name}</div>
            {code.description && <div className="text-xs text-gray-500">{code.description}</div>}
          </div>

          {/* Expense Class Column (col-span-2) */}
          <div className="col-span-2 flex justify-center">
            <div className="flex items-center gap-2">
              <Badge
                color="secondary"
                variant="soft"
                className={`text-white font-semibold ${expenseClassColors[code.expenseClass]}`}
              >
                {code.expenseClass}
              </Badge>
              {hasChildren && (
                <Badge variant="outline">
                  {code.children?.length || 0}
                </Badge>
              )}
            </div>
          </div>

          {/* Status Column (col-span-1) */}
          <div className="col-span-1 flex justify-center">
            <Badge color={code.isActive ? 'success' : 'destructive'} variant="outline">
              {code.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Actions Column (col-span-2) */}
          <div className="col-span-2 flex justify-center" onClick={(e) => e.stopPropagation()}>
            {!readonly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAddChild?.(code)}>
                    <span>Add Child Code</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(code)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(code)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Render Children if Expanded */}
        {hasChildren && isExpanded && code.children?.map((child) => renderCode(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100 font-semibold text-sm border-b">
        <div className="col-span-1 flex justify-center" />
        <div className="col-span-1 flex justify-center">Code</div>
        <div className="col-span-5">Name</div>
        <div className="col-span-2 flex justify-center">Expense Class</div>
        <div className="col-span-1 flex justify-center">Status</div>
        <div className="col-span-2 flex justify-center">Actions</div>
      </div>
      <div>
        {hierarchy.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">No object codes found</div>
        ) : (
          hierarchy.map((code) => renderCode(code, 0))
        )}
      </div>
    </div>
  )
}
