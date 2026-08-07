'use client'

import { Search, Plus } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { createOfficeDialogAtom } from '../atoms'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { MetaActions } from '@/types/global'
import PermissionCheck from '@/components/PermissionCheck'

interface OrgUnitToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  actions: MetaActions
  selectedOrgUnitId?: string
}

export default function OrgUnitToolbar({
  searchValue,
  onSearchChange,
  actions,
  selectedOrgUnitId,
}: OrgUnitToolbarProps) {
  const openCreateOfficeDialog = useSetAtom(createOfficeDialogAtom)

  const handleCreateClick = () => {
    openCreateOfficeDialog({
      isOpen: true,
      showUnsavedWarning: false,
      parentUnitId: selectedOrgUnitId,
    })
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b bg-default-50/30">
      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400" />
        <Input
          placeholder="Search office..."
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
            New Office
          </Button>
        </PermissionCheck>
      ) : (
        <Button onClick={handleCreateClick} size="sm" className="gap-2 h-9 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          New Office
        </Button>
      )}
    </div>
  )
}
