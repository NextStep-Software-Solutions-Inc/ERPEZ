import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UserCheck } from 'lucide-react'

interface DirectContractingFormProps {
  dcNumber: string
  setDcNumber: (v: string) => void
  dcName: string
  setDcName: (v: string) => void
  resolutionId: string
  setResolutionId: (v: string) => void
  supplierId: string
  setSupplierId: (v: string) => void
  deadline: string
  setDeadline: (v: string) => void
  isEdit?: boolean
  autoDCNumber: string
  resolutionOptions: Array<{
    id: string
    number: string
    label: string
    prNumbers: string[]
    endUser: string
    amount: number
  }>
  suppliersList: Array<{
    id: string
    name: string
  }>
}

export function DirectContractingForm({
  dcNumber,
  setDcNumber,
  dcName,
  setDcName,
  resolutionId,
  setResolutionId,
  supplierId,
  setSupplierId,
  deadline,
  setDeadline,
  isEdit = false,
  autoDCNumber,
  resolutionOptions,
  suppliersList,
}: DirectContractingFormProps) {
  const selectedRes = resolutionOptions.find((r) => r.id === resolutionId)

  const filteredResolutions = useMemo(() => {
    return resolutionOptions.filter((r) => r.id && r.id.trim() !== '')
  }, [resolutionOptions])

  const filteredSuppliers = useMemo(() => {
    return suppliersList.filter((s) => s.id && s.id.trim() !== '')
  }, [suppliersList])

  return (
    <div className="space-y-5 py-2">
      <div>
        <label className="text-sm font-semibold">
          Direct Contracting Name <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="e.g. Specialized Software Upgrade 2026"
          value={dcName}
          onChange={(e) => setDcName(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">
            Direct Contracting number <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder={autoDCNumber}
            value={dcNumber}
            onChange={(e) => setDcNumber(e.target.value)}
            className="mt-1.5"
            disabled={isEdit}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">
            Submission Deadline <span className="text-destructive">*</span>
          </label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">
          BAC Resolution <span className="text-destructive">*</span>
        </label>
        <Select
          value={resolutionId || undefined}
          onValueChange={setResolutionId}
          disabled={isEdit}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select approved resolution..." />
          </SelectTrigger>
          <SelectContent>
            {filteredResolutions.length > 0 ? (
              filteredResolutions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  <div className="flex flex-col gap-1 items-start">
                    <span className="font-medium">{r.number}</span>
                    <div className="flex flex-wrap gap-1">
                      {r.prNumbers.map((pr) => (
                        <Badge
                          key={pr}
                          variant="soft"
                          color="secondary"
                          className="text-[10px] py-0 px-1"
                        >
                          {pr}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No approved resolutions available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <label className="text-sm font-bold text-amber-900 flex items-center gap-2">
          <UserCheck className="h-4 w-4" /> Single Supplier Assignment
        </label>
        <p className="text-xs text-amber-800 mt-1 mb-3">
          Direct Contracting requires exactly one registered supplier of
          proprietary/exclusive items.
        </p>
        <Select value={supplierId || undefined} onValueChange={setSupplierId}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select the exclusive supplier..." />
          </SelectTrigger>
          <SelectContent>
            {filteredSuppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {resolutionId && selectedRes && (
        <div className="text-xs space-y-1 p-3 bg-muted rounded">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Linked PR:</span>
            <span className="font-medium">
              {selectedRes.prNumbers.join(', ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Office:</span>
            <span className="font-medium">{selectedRes.endUser}</span>
          </div>
          <div className="flex justify-between border-t mt-1 pt-1">
            <span className="text-muted-foreground font-semibold">
              Total ABC:
            </span>
            <span className="font-bold text-primary">
              ₱{selectedRes.amount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
