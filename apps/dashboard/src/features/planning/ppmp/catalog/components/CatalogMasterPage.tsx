/**
 * CatalogMasterPage
 * RBAC-enabled main page for Item Management (formerly "Non-CSE Item Catalog")
 *
 * Dual interface:
 * - User: Browse Library, View/Create Item Requests
 * - Admin: Master Library, Review Requests
 *
 * Features:
 * - Dynamic tab rendering based on role
 * - Role toggle in header (development/testing)
 * - Detail panels for both catalog and request tables
 * - Future-ready: isCSE flag on items prepares for CSE integration
 */

import { useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { Package, Settings2 } from 'lucide-react'
import { PageContainerDashtail } from '@/components/v2'
import { Button } from '@/components/ui/button'
import { userRoleAtom } from '../atoms/catalogAtoms'
import {
  bulkPricingDialogOpenAtom,
  selectedItemIdsAtom,
} from '../atoms/catalogDialogAtoms'
import { CreateItemDialog } from '../dialogs/CreateItemDialog'
import { EditItemDialog } from '../dialogs/EditItemDialog'
import { DeleteItemDialog } from '../dialogs/DeleteItemDialog'
import { BulkAdjustmentDialog } from '../dialogs/BulkAdjustmentDialog'
import { UserCatalogTab } from '../tabs/UserCatalogTab'
import { UserRequestsTab } from '../tabs/UserRequestsTab'
import { AdminCatalogTab } from '../tabs/AdminCatalogTab'
import { AdminRequestsTab } from '../tabs/AdminRequestsTab'

export function CatalogMasterPage() {
  const [userRole, setUserRole] = useAtom(userRoleAtom)
  const [activeTab, setActiveTab] = useState<string>(
    userRole === 'user' ? 'active-catalog' : 'master-catalog',
  )
  const [bulkPricingOpen, setBulkPricingOpen] = useAtom(
    bulkPricingDialogOpenAtom,
  )
  const selectedIds = useAtomValue(selectedItemIdsAtom)

  // Determine available tabs based on role
  const userTabs = [
    { id: 'active-catalog', label: 'Browse Catalog' },
    { id: 'my-requests', label: 'My Requests' },
  ]

  const adminTabs = [
    { id: 'master-catalog', label: 'Master Catalog' },
    { id: 'pending-queue', label: 'Request Queue' },
  ]

  const tabs = userRole === 'user' ? userTabs : adminTabs

  const handleRoleChange = (newRole: string) => {
    setUserRole(newRole as 'user' | 'admin')
    // Reset to first tab of new role
    setActiveTab(newRole === 'user' ? 'active-catalog' : 'master-catalog')
  }

  return (
    <PageContainerDashtail
      title="Item Catalog"
      description={
        userRole === 'user'
          ? 'Browse approved catalog items and submit requests for new items'
          : 'Manage master catalog items and review item requests from offices'
      }
      titleIcon={<Package className="h-5 w-5 text-primary" />}
      mode="tabbed"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabVariant="underline"
      animateTabs={true}
      actions={
        <div className="flex items-center gap-3">
          {/* Role Toggle (Dev/Testing) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md border border-border">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-1">Role:</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={userRole === 'user' ? 'default' : 'ghost'}
                className="text-xs px-2 py-1 h-auto"
                onClick={() => handleRoleChange('user')}
              >
                User
              </Button>
              <Button
                size="sm"
                variant={userRole === 'admin' ? 'default' : 'ghost'}
                className="text-xs px-2 py-1 h-auto"
                onClick={() => handleRoleChange('admin')}
              >
                Admin
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {/* Tab Content */}
      <div className="space-y-6">
        {/* USER INTERFACE */}
        {userRole === 'user' && (
          <>
            {activeTab === 'active-catalog' && <UserCatalogTab />}
            {activeTab === 'my-requests' && <UserRequestsTab />}
          </>
        )}

        {/* ADMIN INTERFACE */}
        {userRole === 'admin' && (
          <>
            {activeTab === 'master-catalog' && <AdminCatalogTab />}
            {activeTab === 'pending-queue' && <AdminRequestsTab />}
          </>
        )}
      </div>

      {/* ─── DIALOGS & MODALS ─────────────────────────────────────────────────── */}

      {/* Item CRUD Dialogs (Admin) */}
      <CreateItemDialog />
      <EditItemDialog />
      <DeleteItemDialog />

      {/* Bulk Operations (Admin) */}
      <BulkAdjustmentDialog
        open={bulkPricingOpen}
        onOpenChange={setBulkPricingOpen}
        selectedItemIds={selectedIds}
        onClose={() => setBulkPricingOpen(false)}
      />

      {/* Request Workflow Dialogs (User + Admin) */}
    </PageContainerDashtail>
  )
}
