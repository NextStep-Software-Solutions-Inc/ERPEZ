'use client'

import { WorkflowMatrix } from '../../types/workflowMatrixTypes'

interface InlineEditableDepartmentCellProps {
  item: WorkflowMatrix
}

/**
 * Inline office label for workflow matrices.
 */
export function InlineEditableDepartmentCell({
  item,
}: InlineEditableDepartmentCellProps) {
  return (
    <span className="inline-flex min-w-[120px] px-2 py-1 font-medium text-slate-900">
      {item.officeName || 'Select Office'}
    </span>
  )
}
