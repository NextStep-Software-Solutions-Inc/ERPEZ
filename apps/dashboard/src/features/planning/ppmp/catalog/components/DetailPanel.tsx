/**
 * DetailPanel
 * Slide-over (Sheet) panel displaying full item detail, tabs, and quick actions.
 * Open/close is driven by selectedItemIdAtom.
 */

import { useAtom, useSetAtom } from 'jotai'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  selectedItemIdAtom,
  detailPanelActiveTabAtom,
} from '../atoms/selectedItemAtom'
import { useItemDetail } from '../hooks/useItemDetail'
import { ItemDetailHeader } from './ItemDetailHeader'
import { ItemDetailTabs } from './ItemDetailTabs'
import { DetailPanelFooter } from './DetailPanelFooter'

export function DetailPanel() {
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom)
  const setActiveTab = useSetAtom(detailPanelActiveTabAtom)
  const { data: response, isLoading } = useItemDetail()
  const item = response?.data ?? null

  const isOpen = selectedItemId !== null

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedItemId(null)
      // Reset tab to overview for next open
      setActiveTab('overview')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-[500px] max-w-full flex flex-col gap-0 p-0 overflow-hidden"
        overlayClass="bg-black/20"
      >
        {/* Hidden accessible title required by Radix */}
        <SheetHeader className="sr-only">
          <SheetTitle>{item?.name ?? 'Item Detail'}</SheetTitle>
        </SheetHeader>

        {/* Scrollable content area */}
        <div className="flex flex-col flex-1 min-h-0 px-5 pt-8 pb-4 gap-4">
          {/* Header: name, code, status, lock, tags */}
          <ItemDetailHeader
            item={item ?? null}
            isLoading={isLoading}
          />

          {/* Tabs: lazy-loaded on activation */}
          <ItemDetailTabs />

          {/* Footer: quick actions */}
          <DetailPanelFooter />
        </div>
      </SheetContent>
    </Sheet>
  )
}
