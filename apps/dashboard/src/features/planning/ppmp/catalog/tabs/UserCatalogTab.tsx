/**
 * UserCatalogTab
 * Browse Library tab for regular users
 * Features: search, sorting, pagination-like scroll, item details panel
 */

import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { requestItemDialogOpenAtom } from '../atoms/requestAtoms'
import { UserCatalogTable } from '../tables/UserCatalogTable'
import { UserCatalogDetailPanel } from '../panels/UserCatalogDetailPanel'
import { RequestItemDialog } from '../dialogs/RequestItemDialog'
import { useFilteredCatalog } from '../hooks/useRequestFilters'

export function UserCatalogTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const setRequestDialogOpen = useSetAtom(requestItemDialogOpenAtom)
  const { items: filteredItems, total } = useFilteredCatalog(searchTerm)

  return (
    <div className="space-y-6">
      {/* Header with title and action button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Browse Library</h2>
          <p className="text-sm text-muted-foreground">
            {total} items available for request
          </p>
        </div>
        <Button onClick={() => setRequestDialogOpen(true)} size="lg">
          + Request Item
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search catalog by name, category, or specification..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Catalog Table */}
      <UserCatalogTable data={filteredItems} total={total} isLoading={false} />

      {/* Detail Panel & Dialogs */}
      <UserCatalogDetailPanel />
      <RequestItemDialog />
    </div>
  )
}
