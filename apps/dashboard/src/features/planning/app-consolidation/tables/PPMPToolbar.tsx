import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import type { PPMPItem } from '../types'

interface PPMPToolbarProps {
  table?: Table<PPMPItem>
  searchTerm: string
  onSearchChange: (value: string) => void
  isDraft: boolean
  status?: string
  onAddPPMP: () => void
}

export function PPMPToolbar({
  searchTerm,
  onSearchChange,
  isDraft,
  status,
  onAddPPMP,
}: PPMPToolbarProps) {
  const canAddPPMP = isDraft || status === 'pending' || status === 'draft'

  return (
    <div className="flex items-center justify-between w-full gap-2 pointer-events-auto relative z-10">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search items by code, description, office..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => onSearchChange('')}>
            Clear
          </Button>
        )}
      </div>
      {canAddPPMP && (
        <Button 
          onClick={() => {
            onAddPPMP()
          }}
          className="pointer-events-auto cursor-pointer relative z-10"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add PPMP
        </Button>
      )}
    </div>
  )
}
