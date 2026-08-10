/**
 * AddIoEBlockDialog
 * Modal for adding a new Item of Expenditure block to an existing Activity block.
 */

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { addIoEBlockRequest, getIoEBlocksRequest } from '../handlers'
import type { ItemOfExpenditure, PPMP, PPMPActivityBlock } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface AddIoEBlockDialogProps {
  ppmp: PPMP
  activity: PPMPActivityBlock
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddIoEBlockDialog({
  ppmp,
  activity,
  open,
  onOpenChange,
  onSuccess,
}: AddIoEBlockDialogProps) {
  const [ioEs, setIoEs] = useState<Array<ItemOfExpenditure>>([])
  const [selectedIoEId, setSelectedIoEId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcurable, setIsProcurable] = useState(true)

  const alreadyAddedIoEIds = useMemo(() => {
    const added = new Set<string>()
    for (const activityBlock of ppmp.activityBlocks) {
      for (const block of activityBlock.ioEBlocks) {
        added.add(block.ioEId)
      }
    }
    return added
  }, [ppmp.activityBlocks])

  useEffect(() => {
    if (!open) return

    const loadIoEs = async () => {
      setIsLoading(true)
      setError(null)
      setSelectedIoEId('')
      setIsProcurable(true)

      try {
        const result = await getIoEBlocksRequest.fetcher({
          data: { activityId: activity.activityId },
        })
        setIoEs(result)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load items of expenditure.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadIoEs()
  }, [activity.activityId, open])

  const availableIoEs = ioEs.filter((ioe) => !alreadyAddedIoEIds.has(ioe.id))

  const handleSubmit = async () => {
    if (!selectedIoEId) return

    setIsMutating(true)
    setError(null)
    try {
      await addIoEBlockRequest.fetcher({
        data: {
          ppmpId: ppmp.id,
          activityBlockId: activity.id,
          ioEId: selectedIoEId,
          isProcurable,
        },
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add Item of Expenditure block.',
      )
    } finally {
      setIsMutating(false)
    }
  }

  const handleClose = () => {
    setSelectedIoEId('')
    setError(null)
    setIsProcurable(true)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Item of Expenditure</DialogTitle>
            <DialogDescription>
              Add a new Item of Expenditure block under{' '}
              <span className="font-medium">{activity.activityName}</span>.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading items of expenditure...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <Alert
                  variant="outline"
                  className="border-destructive/50 bg-destructive/5"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Budget Activity
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <div className="font-medium">{activity.activityName}</div>
                  <div className="text-xs text-muted-foreground">
                    {activity.activityCode}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Item of Expenditure
                </div>
                <Select value={selectedIoEId} onValueChange={setSelectedIoEId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an Item of Expenditure" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIoEs.length === 0 ? (
                      <div className="px-3 py-1.5 text-sm text-muted-foreground">
                        No available items of expenditure
                      </div>
                    ) : (
                      availableIoEs.map((ioe) => (
                        <SelectItem key={ioe.id} value={ioe.id}>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{ioe.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {ioe.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedIoEId && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Procurement Type
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsProcurable(true)}
                      className={cn(
                        'rounded-lg border px-3 py-3 text-sm transition-all',
                        isProcurable
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-foreground/50',
                      )}
                    >
                      Procurable
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsProcurable(false)}
                      className={cn(
                        'rounded-lg border px-3 py-3 text-sm transition-all',
                        !isProcurable
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-foreground/50',
                      )}
                    >
                      Non-procurable
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedIoEId || isMutating}
                >
                  {isMutating ? 'Adding…' : 'Add Item of Expenditure'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </TooltipProvider>
    </Dialog>
  )
}
