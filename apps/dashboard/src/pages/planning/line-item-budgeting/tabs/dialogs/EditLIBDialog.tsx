import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { Loader2, AlertCircle } from 'lucide-react'
import { getLIBRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getLIBRequest'
import { updateLIBRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/updateLIBRequest'
import { getStatusBadgeColor } from '@/features/planning/line-item-budgeting/line-item-budget/utils'

const useGetLIB = createQueryHookFromTemplate(getLIBRequest)
const useUpdateLIB = createMutationHookFromTemplate(updateLIBRequest)

const EDITABLE_STATUSES = ['Draft', 'Proposed', 'Returned']

interface EditLIBDialogProps {
  libId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditLIBDialog({
  libId,
  open,
  onOpenChange,
  onSuccess,
}: EditLIBDialogProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateLIB, isPending: isUpdating } = useUpdateLIB()

  // Fetch complete details of the selected LIB
  const { data: libResponse, isLoading } = useGetLIB({
    pathParams: { id: libId || '' },
    queryParams: {},
    enabled: open && !!libId,
  })

  const lib = libResponse?.data
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  // Sync form state when LIB data loads or changes
  useEffect(() => {
    if (lib) {
      setName(lib.name || '')
      setNameError(null)
    }
  }, [lib])

  const isStatusEditable = lib?.status ? EDITABLE_STATUSES.includes(lib.status) : true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!libId) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Line-Item Budget name is required')
      return
    }

    setNameError(null)

    try {
      await updateLIB({
        pathParams: { id: libId },
        payload: {
          name: trimmedName,
        },
      })

      toast.success('Line-Item Budget updated successfully!')
      void queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/libs'),
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err instanceof Error
            ? err.message
            : 'Failed to update Line-Item Budget'
      toast.error(errorMsg || 'Failed to update Line-Item Budget')
    }
  }

  const fiscalYearDisplay =
    typeof lib?.fiscalYear === 'string'
      ? lib.fiscalYear
      : lib?.fiscalYear?.year
        ? String(lib.fiscalYear.year)
        : 'N/A'

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Line-Item Budget"
      description="Update metadata and title for this Line-Item Budget."
      size="lg"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-lib-form"
            disabled={isUpdating || isLoading || !isStatusEditable}
            className="bg-primary-600 hover:bg-primary-700 text-white min-w-[120px]"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      }
    >
      <div className="p-2 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500">Loading LIB details...</p>
          </div>
        ) : lib ? (
          <>
            {/* Status Alert if Not Editable */}
            {!isStatusEditable && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Editing Restricted</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Only LIBs with status &quot;Draft&quot;, &quot;Proposed&quot;, or &quot;Returned&quot; can be edited.
                    Current status is &quot;{lib.status}&quot;.
                  </p>
                </div>
              </div>
            )}

            {/* Read-only Reference Information Card */}
            <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    LIB Number
                  </span>
                  <p className="text-sm font-bold text-gray-900 font-mono">
                    {lib.libNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getStatusBadgeColor(lib.status || '')} font-semibold px-2.5 py-0.5`}
                  >
                    {lib.status}
                  </Badge>
                  <Badge variant="outline" className="font-medium bg-white">
                    {lib.sourceType}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-gray-500 font-medium">Fiscal Year:</span>
                  <p className="font-semibold text-gray-800">{fiscalYearDisplay}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Office:</span>
                  <p className="font-semibold text-gray-800 truncate" title={lib.office?.name}>
                    {lib.office?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Fund Source:</span>
                  <p className="font-semibold text-gray-800 truncate" title={lib.fundSource?.name}>
                    {lib.fundSource?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Scope:</span>
                  <p className="font-semibold text-gray-800">{lib.scope || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Level:</span>
                  <p className="font-semibold text-gray-800">{lib.level || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Editable Form Fields */}
            <form id="edit-lib-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lib-name" className="text-sm font-medium text-gray-900">
                  Line-Item Budget Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lib-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) setNameError(null)
                  }}
                  disabled={!isStatusEditable || isUpdating}
                  placeholder="e.g. FY 2026 NMMEIC Line Item Budget"
                  className="w-full text-sm"
                />
                {nameError && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {nameError}
                  </p>
                )}
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500">
            LIB details not found.
          </div>
        )}
      </div>
    </ResponsiveDialogDashtail>
  )
}
