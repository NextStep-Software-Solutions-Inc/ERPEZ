'use client'

import { Search, Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { createPositionDialogAtom } from '../atoms'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MetaActions } from '@/types/global'
import type { OrgUnit } from '@/services/mock/orgUnits'
import PermissionCheck from '@/components/PermissionCheck'

interface PositionToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  actions: MetaActions
  selectedOrgUnitId?: string
  subUnits?: OrgUnit[]
  selectedSubUnitId?: string | null
  onSubUnitChange?: (unitId: string | null) => void
}

export default function PositionToolbar({
  searchValue,
  onSearchChange,
  actions,
  selectedOrgUnitId,
  subUnits = [],
  selectedSubUnitId,
  onSubUnitChange,
}: PositionToolbarProps) {
  const openCreatePositionDialog = useSetAtom(createPositionDialogAtom)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateClick = () => {
    setIsLoading(true)
    openCreatePositionDialog({
      isOpen: true,
      showUnsavedWarning: false,
      selectedOrgUnitId: selectedOrgUnitId,
    })
    // Reset loading state after dialog is shown
    setTimeout(() => setIsLoading(false), 100)
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b bg-default-50/30 w-full">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400" />
        <Input
          placeholder="Search by title, code, or grade..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Spacer - keeps only search floated left */}
      <div className="flex-1" />

      {/* Filters and Actions on the right */}
      {subUnits && subUnits.length > 0 && (
        <Select value={selectedSubUnitId || 'all'} onValueChange={(value) => onSubUnitChange?.(value === 'all' ? null : value)}>
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {subUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Create Button - Right aligned */}
      {Array.isArray(actions) && actions.includes('write') ? (
        <PermissionCheck action="write" actions={actions}>
          <Button 
            onClick={handleCreateClick} 
            size="sm" 
            className="gap-2 h-9 whitespace-nowrap"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isLoading ? 'Opening...' : 'Add'}
          </Button>
        </PermissionCheck>
      ) : (
        <Button 
          onClick={handleCreateClick} 
          size="sm" 
          className="gap-2 h-9 whitespace-nowrap"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isLoading ? 'Opening...' : 'Add'}
        </Button>
      )}
    </div>
  )
}
