/**
 * Master KPI Data Table Row Actions
 */

import { Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MasterKPI } from '../types'
import { motion } from 'framer-motion'

interface DataTableRowActionsProps {
  row: Row<MasterKPI>
  onView: (kpi: MasterKPI) => void
  onEdit: (kpi: MasterKPI) => void
  onDelete: (kpi: MasterKPI) => void
}

export function DataTableRowActions({
  row,
  onView,
  onEdit,
  onDelete,
}: DataTableRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row.original)}
          title="View"
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row.original)}
          title="Edit"
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row.original)}
          title="Delete"
          className="h-8 w-8 p-0 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
}
