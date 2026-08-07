import { useState } from 'react'
import { AdministrativeLevelDialogs } from './dialogs/AdministrativeLevelDialogs'
import type { AdministrativeLevel } from '@/components/features/planning/organizational-structure/types'

export default function AdministrativeLevelDialogManager() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AdministrativeLevel | null>(null)
  const [deleteItem, setDeleteItem] = useState<AdministrativeLevel | null>(null)

  return (
    <AdministrativeLevelDialogs
      createOpen={createOpen}
      onCreateOpenChange={setCreateOpen}
      editingItem={editingItem}
      onEditingItemChange={setEditingItem}
      deleteItem={deleteItem}
      onDeleteItemChange={setDeleteItem}
    />
  )
}