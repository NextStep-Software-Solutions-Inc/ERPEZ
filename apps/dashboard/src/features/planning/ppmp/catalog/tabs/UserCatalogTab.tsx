/**
 * UserCatalogTab
 * Browse Catalog tab for regular users
 * Features: live catalog queries, search, item details panel
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
import { useNonCSEItems } from '../hooks/useNonCSEItemQueries'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'

export function UserCatalogTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const setRequestDialogOpen = useSetAtom(requestItemDialogOpenAtom)

  const filterString = searchTerm ? `Name@=*${searchTerm}|Description@=*${searchTerm}` : undefined
  const { data, isLoading } = useNonCSEItems({
    filters: filterString,
    pageSize: 100,
  })

  const items: NONCSEItem[] = data?.data || []
  const total = data?.totalRows || items.length

  return (
    <div className="space-y-6">
      {/* Header with title and action button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Browse Catalog</h2>
          <p className="text-sm text-muted-foreground">
            {total} items in catalog
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
          placeholder="Search catalog by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Catalog Table */}
      <UserCatalogTable data={items} total={total} isLoading={isLoading} />

      {/* Detail Panel & Dialogs */}
      <UserCatalogDetailPanel />
      <RequestItemDialog />
    </div>
  )
}
