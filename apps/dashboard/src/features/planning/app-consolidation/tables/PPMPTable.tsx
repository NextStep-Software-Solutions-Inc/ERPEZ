import { TemplateTable } from '@/components/TemplateTable'
import type { PPMPItem } from '../types'
import { createPPMPColumns } from './PPMPColumns'
import { PPMPToolbar } from './PPMPToolbar'

interface PPMPTableProps {
  data: PPMPItem[]
  searchTerm: string
  onSearchChange: (value: string) => void
  isDraft: boolean
  status?: string
  canDelete: boolean
  onAddPPMP: () => void
  onViewDetails: (item: PPMPItem) => void
  onDelete: (itemId: string) => void
}

export function PPMPTable({
  data,
  searchTerm,
  onSearchChange,
  isDraft,
  status,
  canDelete,
  onAddPPMP,
  onViewDetails,
  onDelete,
}: PPMPTableProps) {
  const columns = createPPMPColumns({
    canDelete,
    onViewDetails,
    onDelete,
  })

  return (
    <TemplateTable
      columns={columns}
      data={data}
      toolbar={() => (
        <PPMPToolbar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          isDraft={isDraft}
          status={status}
          onAddPPMP={onAddPPMP}
        />
      )}
      actions={[]}
      readonly={!canDelete}
      fixedPageSize={10}
    />
  )
}
