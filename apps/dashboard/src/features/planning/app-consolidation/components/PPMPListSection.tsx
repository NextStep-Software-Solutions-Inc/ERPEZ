import { useState } from 'react'
import { toast } from 'sonner'
import type { AppMaster, PPMPItem } from '../types'
import type { APPItemFromAPI } from '../handlers/getAPPDetailRequest'
import { APPOverviewCard } from './APPOverviewCard'
import { ConsolidatedPPMPsCard } from './ConsolidatedPPMPsCard'
import { ConsolidatedAPPItemsCard } from './ConsolidatedAPPItemsCard'
import { PPMPDeleteDialog } from './PPMPDeleteDialog'
import { PPMPDetailsDialog } from '../dialogs'

interface PPMPListSectionProps {
  app: AppMaster
  isDraft: boolean
  status?: string
  onAddPPMP: () => void
  onRemovePPMP?: (ppmpId: string) => void
}

export function PPMPListSection({
  app,
  isDraft,
  status,
  onAddPPMP,
  onRemovePPMP,
}: PPMPListSectionProps) {
  const [ppmpSearchTerm, setPpmpSearchTerm] = useState('')
  const [itemSearchTerm, setItemSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; itemId?: string }>({ show: false })
  const [selectedItem, setSelectedItem] = useState<PPMPItem | null>(null)
  const [selectedAppItemId, setSelectedAppItemId] = useState<string | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const isCurrentlyDraft = isDraft || status === 'Draft'
  const canDelete = isCurrentlyDraft

  // Handle viewing item details
  const handleViewDetails = (item: APPItemFromAPI) => {
    const mappedItem: PPMPItem = {
      id: item.id,
      code: item.code || item.papCode || item.ppmpItemId || item.id?.substring(0, 10) || '',
      description: item.ppmpItemName || item.description || 'No description provided',
      unit: item.unit || 'unit',
      quantity: item.quantity || 0,
      unitCost: item.unitCost || 0,
      totalAmount: item.totalAmount || (item.quantity * item.unitCost) || 0,
      modeOfProcurement: item.procurementModeName || item.modeOfProcurement || '',
      fundSource: item.fundSourceName || item.fundSource || '',
      itemCategory: item.itemCategory || '',
      office: item.officeName || item.office || '',
      allotmentClass: item.allotmentClass || 'CO',
    }
    setSelectedItem(mappedItem)
    setSelectedAppItemId(item.id)
    setShowDetailsDialog(true)
  }

  const handleDeletePPMP = (itemId: string) => {
    setDeleteConfirm({ show: true, itemId })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.itemId) {
      onRemovePPMP?.(deleteConfirm.itemId)
      toast.success('PPMP source removed successfully')
      setDeleteConfirm({ show: false })
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. APP OVERVIEW DETAILS CARD */}
      <APPOverviewCard app={app} />

      {/* 2. CONSOLIDATED PPMP SOURCES CARD */}
      <ConsolidatedPPMPsCard
        appPpmps={app.appPpmps || []}
        isCurrentlyDraft={isCurrentlyDraft}
        canDelete={canDelete}
        ppmpSearchTerm={ppmpSearchTerm}
        setPpmpSearchTerm={setPpmpSearchTerm}
        onAddPPMP={onAddPPMP}
        onRemovePPMP={handleDeletePPMP}
      />

      {/* 3. CONSOLIDATED APP ITEMS CARD */}
      <ConsolidatedAPPItemsCard
        APPItems={app.APPItems}
        bacLineItems={app.bac?.lineItems}
        aggregationItems={app.aggregationResults?.items}
        isCurrentlyDraft={isCurrentlyDraft}
        canDelete={canDelete}
        itemSearchTerm={itemSearchTerm}
        setItemSearchTerm={setItemSearchTerm}
        onViewDetails={handleViewDetails}
      />

      {/* Details Dialog */}
      <PPMPDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        selectedItem={selectedItem}
        appItemId={selectedAppItemId}
      />

      {/* Delete Confirmation Dialog */}
      <PPMPDeleteDialog
        open={deleteConfirm.show}
        onOpenChange={(show: boolean) => setDeleteConfirm({ show })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
