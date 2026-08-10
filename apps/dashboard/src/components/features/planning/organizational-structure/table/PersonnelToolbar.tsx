'use client'

import { Search, Plus } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { createPersonnelDialogAtom } from '@/components/features/planning/organizational-structure/atoms'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { MetaActions } from '@/types/global'
import PermissionCheck from '@/components/PermissionCheck'

interface PersonnelToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  actions: MetaActions
}

export default function PersonnelToolbar({
  searchValue,
  onSearchChange,
  actions,
}: PersonnelToolbarProps) {
  const openCreatePersonnelDialog = useSetAtom(createPersonnelDialogAtom)

  const handleCreateClick = () => {
    openCreatePersonnelDialog({
      isOpen: true,
      showUnsavedWarning: false,
    })
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b bg-default-50/30 w-full">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400" />
        <Input
          placeholder="Search personnel..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Spacer - pushes button to the right */}
      <div className="flex-1" />

      {/* Create Button - Right aligned */}
      {Array.isArray(actions) && actions.includes('write') ? (
        <PermissionCheck action="write" actions={actions}>
          <Button onClick={handleCreateClick} size="sm" className="gap-2 h-9 whitespace-nowrap">
            <Plus className="h-4 w-4" />
             Add
          </Button>
        </PermissionCheck>
      ) : (
        <Button onClick={handleCreateClick} size="sm" className="gap-2 h-9 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      )}
    </div>
  )
}
