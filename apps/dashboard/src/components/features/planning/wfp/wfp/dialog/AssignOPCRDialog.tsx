/**
 * Assign OPCR Dialog
 * Allows user to select and link an OPCR to a WFP in OPCR mode
 * This is the SPMS-compliant process where a WFP links to exactly ONE OPCR
 * 
 * See: documentations/feature-structure-pattern.md
 */
import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Loader } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { getOPCRsRequest } from '@/components/features/planning/wfp/opcr/handlers/getOPCRsRequest'
import type { OPCR } from '@/components/features/planning/wfp/opcr/table/types'

const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)

interface AssignOPCRDialogProps {
  open: boolean
  onClose: () => void
  wfpId: string
  onOPCRSelected: (opcr: OPCR) => void
  currentOPCRId?: string | null
}

function AssignOPCRDialog({
  open,
  onClose,
  wfpId,
  onOPCRSelected,
  currentOPCRId,
}: AssignOPCRDialogProps) {
  const [selectedOpcr, setSelectedOpcr] = useState<OPCR | null>(null)

  // Clean up selection when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedOpcr(null)
    }
  }, [open])

  // Fetch all OPCRs (no filtering by WFP ID - show all available OPCRs)
  const { data: opcrsData, isLoading } = useOPCRs({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 1000,
    },
  })

  const handleSelect = (opcr: OPCR) => {
    setSelectedOpcr(opcr)
  }

  const handleConfirm = () => {
    if (selectedOpcr) {

      onOPCRSelected(selectedOpcr)
      setSelectedOpcr(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select OPCR for WFP</DialogTitle>
          <DialogDescription>
            Choose which Office Performance Commitment and Review (OPCR) this WFP will use for planning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <Card className="border-amber-100 bg-amber-50/30">
              <CardContent className="pt-8 pb-8 flex items-center justify-center gap-4">
                <Loader className="h-5 w-5 text-amber-600 animate-spin" />
                <p className="text-amber-700">Loading available OPCRs...</p>
              </CardContent>
            </Card>
          ) : opcrsData?.data && opcrsData.data.length > 0 ? (
            <>
              <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
                {opcrsData.data.map((opcr) => (
                  <div
                    key={opcr.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedOpcr?.id === opcr.id
                        ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-300'
                        : currentOPCRId === opcr.id
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                    onClick={() => handleSelect(opcr)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{opcr.name}</h3>
                          {currentOPCRId === opcr.id && (
                            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-3 text-sm text-gray-600">
                          <span>
                            <span className="text-gray-500">Office: </span>
                            <span className="font-medium">{opcr?.office?.name || 'N/A'}</span>
                          </span>
                          <span>
                            <span className="text-gray-500">Status: </span>
                            <span className="font-medium text-amber-700">{opcr.status}</span>
                          </span>
                          <span>
                            <span className="text-gray-500">Budget: </span>
                            <span className="font-medium">${opcr.totalBudget?.toLocaleString() || 0}</span>
                          </span>
                        </div>
                      </div>
                      {selectedOpcr?.id === opcr.id && (
                        <CheckCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleConfirm}
                  disabled={!selectedOpcr}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Assign Selected OPCR
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-amber-100 bg-amber-50/30">
              <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center gap-4">
                <Plus className="h-12 w-12 text-amber-400" />
                <div className="text-center">
                  <p className="text-gray-600 font-medium">No OPCRs available</p>
                  <p className="text-sm text-gray-500">Please create an OPCR first</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignOPCRDialog
