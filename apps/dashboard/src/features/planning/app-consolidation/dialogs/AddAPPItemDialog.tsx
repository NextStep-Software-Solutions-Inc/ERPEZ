import { useState, useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { addAPPItemDialogOpenAtom, currentAppAtom } from '../atoms'
import api from '@/services/api'
import { useQueryClient } from '@tanstack/react-query'
import { getAPPDetailRequest } from '../handlers/getAPPDetailRequest'
import {
  AddAPPItemFormFields,
  PPMPItemOption,
  ProcurementModeOption,
  FundSourceOption,
  OfficeOption,
  AddAPPItemFormData
} from './AddAPPItemFormFields'

export function AddAPPItemDialog() {
  const [open, setOpen] = useAtom(addAPPItemDialogOpenAtom)
  const [currentApp] = useAtom(currentAppAtom)
  const { appId } = useParams({ from: '/v2/(planning)/app-consolidation/$appId' })
  const queryClient = useQueryClient()

  const [ppmpItems, setPpmpItems] = useState<PPMPItemOption[]>([])
  const [procurementModes, setProcurementModes] = useState<ProcurementModeOption[]>([])
  const [fundSources, setFundSources] = useState<FundSourceOption[]>([])
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [saving, setSaving] = useState(false)

  const [attachedIdsFromApi, setAttachedIdsFromApi] = useState<Set<string>>(new Set())

  // Compute set of PPMP item IDs already attached to the current APP
  const attachedPpmpItemIds = useMemo(() => {
    const ids = new Set<string>(attachedIdsFromApi)
    if (currentApp?.APPItems) {
      currentApp.APPItems.forEach((item: any) => {
        if (item.ppmpItemId) ids.add(item.ppmpItemId)
        if (item.PPMPItemId) ids.add(item.PPMPItemId)
        if (item.ppmpItem?.id) ids.add(item.ppmpItem.id)
      })
    }
    if (currentApp?.bac?.lineItems) {
      currentApp.bac.lineItems.forEach((item: any) => {
        if (item.ppmpItemId) ids.add(item.ppmpItemId)
        if (item.PPMPItemId) ids.add(item.PPMPItemId)
      })
    }
    return ids
  }, [currentApp, attachedIdsFromApi])

  const [formData, setFormData] = useState<AddAPPItemFormData>({
    ppmpItemId: '',
    itemNameOverride: '',
    procurementModeId: '',
    fundSourceId: '',
    officeId: '',
    papCode: '',
    generalDescription: '',
    procurementStartDate: '',
    procurementEndDate: '',
    remarks: '',
    isEarlyProcurementActivity: false,
    isOutsourced: false,
    bidEvaluationCriteria: 'LCRB',
    procurementStrategies: [],
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        ppmpItemId: '',
        itemNameOverride: '',
        procurementModeId: '',
        fundSourceId: '',
        officeId: '',
        papCode: '',
        generalDescription: '',
        procurementStartDate: '',
        procurementEndDate: '',
        remarks: '',
        isEarlyProcurementActivity: false,
        isOutsourced: false,
        bidEvaluationCriteria: 'LCRB',
        procurementStrategies: [],
      })
    }
  }, [open])

  // Fetch dropdown options when dialog opens
  useEffect(() => {
    if (open && appId) {
      setLoadingOptions(true)
      Promise.all([
        api.get(`/apps/${appId}`)
          .then((res) => {
            const appData = res.data?.data || res.data
            const appItems = appData?.APPItems || appData?.appItems || []
            const ids = new Set<string>()
            appItems.forEach((item: any) => {
              if (item.ppmpItemId) ids.add(item.ppmpItemId)
              if (item.PPMPItemId) ids.add(item.PPMPItemId)
              if (item.ppmpItem?.id) ids.add(item.ppmpItem.id)
            })
            setAttachedIdsFromApi(ids)
          })
          .catch(() => {}),
        api.get(`/apps/${appId}/available-ppmp-items`)
          .then((res) => (res.data?.data || (Array.isArray(res.data) ? res.data : [])) as PPMPItemOption[])
          .catch(() => []),
        api.get('/procurement-modes', { params: { PageNumber: 1, PageSize: 1000 } })
          .then((res) => (res.data?.data || (Array.isArray(res.data) ? res.data : [])) as ProcurementModeOption[])
          .catch(() => []),
        api.get('/fund-sources', { params: { PageNumber: 1, PageSize: 1000 } })
          .then((res) => (res.data?.data || (Array.isArray(res.data) ? res.data : [])) as FundSourceOption[])
          .catch(() => []),
        api.get('/offices', { params: { PageNumber: 1, PageSize: 1000 } })
          .then((res) => (res.data?.data || (Array.isArray(res.data) ? res.data : [])) as OfficeOption[])
          .catch(() => []),
      ])
        .then(([_appDetail, ppmpItemsData, modesData, fundsData, officesData]) => {
          setPpmpItems(ppmpItemsData)
          setProcurementModes(modesData)
          setFundSources(fundsData)
          setOffices(officesData)
        })
        .catch((err) => {
          console.error('Error fetching option lists:', err)
          toast.error('Failed to load available PPMP items')
        })
        .finally(() => {
          setLoadingOptions(false)
        })
    }
  }, [open, appId])

  const handleStrategyToggle = (strategy: string) => {
    setFormData(prev => {
      const current = prev.procurementStrategies
      let updated: string[] = []
      if (strategy === 'NotApplicable' || strategy === 'NA') {
        updated = current.includes('NotApplicable') || current.includes('NA') ? [] : ['NotApplicable']
      } else {
        const withoutNA = current.filter(s => s !== 'NotApplicable' && s !== 'NA')
        updated = current.includes(strategy)
          ? withoutNA.filter(s => s !== strategy)
          : [...withoutNA, strategy]
      }
      return { ...prev, procurementStrategies: updated }
    })
  }

  const handleSave = async () => {
    const selectedItem = ppmpItems.find((i) => i.id === formData.ppmpItemId)
    const effectiveOfficeId = formData.officeId || selectedItem?.PPMP?.officeId || (offices.length > 0 ? offices[0].id : '')
    const effectiveFundSourceId = formData.fundSourceId || selectedItem?.PPMP?.fundSourceId || (fundSources.length > 0 ? fundSources[0].id : '')

    if (!formData.ppmpItemId || !formData.procurementModeId) {
      toast.error('Please select a PPMP Item and Procurement Mode (*)')
      return
    }

    if (attachedPpmpItemIds.has(formData.ppmpItemId)) {
      toast.error('The selected PPMP Item is already attached to this APP. Please select another item.')
      return
    }

    setSaving(true)
    const payload = {
      appId: appId,
      ppmpItemId: formData.ppmpItemId,
      procurementModeId: formData.procurementModeId,
      fundSourceId: effectiveFundSourceId,
      officeId: effectiveOfficeId,
      papCode: formData.papCode || '',
      remarks: formData.remarks || '',
      itemNameOverride: formData.itemNameOverride?.trim() || null,
      generalDescription: formData.generalDescription?.trim() || null,
      startOfProcurementOverride: formData.procurementStartDate ? `${formData.procurementStartDate}T00:00:00.000Z` : null,
      endOfProcurementOverride: formData.procurementEndDate ? `${formData.procurementEndDate}T00:00:00.000Z` : null,
      isEarlyProcurementActivity: formData.isEarlyProcurementActivity,
      isOutsourced: formData.isOutsourced,
      bidEvaluationCriteria: formData.bidEvaluationCriteria,
      procurementStrategies: formData.procurementStrategies,
    }

    try {
      const response = await api.post('/app-items', payload)
      if (response.data?.succeeded !== false) {
        toast.success('APP Item added successfully')
        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/apps') || query.queryKey[0].startsWith('/ppmps')),
        })
        setOpen(false)
      } else {
        toast.error(response.data?.message || 'Failed to add APP Item')
      }
    } catch (err: any) {
      console.error('Error saving APP Item:', err)
      const serverMsg = err.response?.data?.message || err.response?.data?.errors?.[0] || err.message || 'An error occurred while saving'

      if (err.response?.status === 409) {
        toast.error(serverMsg || '⚠ PPMP item is already attached to this APP. Please select another PPMP item.')
        queryClient.invalidateQueries({
          queryKey: [`/apps/${appId}/available-ppmp-items`]
        })
        queryClient.invalidateQueries({
          queryKey: [`/apps/${appId}`]
        })
      } else {
        toast.error(`Save failed: ${serverMsg}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const isSelectedPpmpAttached = formData.ppmpItemId ? attachedPpmpItemIds.has(formData.ppmpItemId) : false
  const isSaveDisabled = saving || loadingOptions || !formData.ppmpItemId || !formData.procurementModeId || isSelectedPpmpAttached

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[999] pointer-events-auto max-h-[90vh] overflow-y-auto" size='lg'>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add APP Item</DialogTitle>
          <DialogDescription>Consolidate a project procurement item into this Annual Procurement Plan.</DialogDescription>
        </DialogHeader>

        {loadingOptions ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Loading dropdown configurations...</p>
          </div>
        ) : (
          <AddAPPItemFormFields
            formData={formData}
            setFormData={setFormData}
            ppmpItems={ppmpItems}
            procurementModes={procurementModes}
            fundSources={fundSources}
            offices={offices}
            handleStrategyToggle={handleStrategyToggle}
            attachedPpmpItemIds={attachedPpmpItemIds}
          />
        )}

        <DialogFooter className="mt-6 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save APP Item'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
