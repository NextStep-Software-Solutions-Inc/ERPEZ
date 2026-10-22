import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { usePurchaseRequestStore } from '../store/purchaseRequestStore'
import { PurchaseRequest } from '../types'
import { useUpdatePurchaseRequest } from '../handlers/hooks'

const editPRSchema = z.object({
  date: z.date(),
  prNumber: z.string().min(1),
  description: z.string().optional(),
  purpose: z.string().min(1),
})

type EditPRFormData = z.infer<typeof editPRSchema>

interface EditPRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pr: PurchaseRequest | null
  onSuccess?: (pr: PurchaseRequest) => void
}

// Combobox removed to match Create PR modal (UACS and Fund Cluster fields removed)

export function EditPRModal({ open, onOpenChange, pr, onSuccess }: EditPRModalProps) {
  const { updatePurchaseRequest } = usePurchaseRequestStore()
  const { mutateAsync: updateApi } = useUpdatePurchaseRequest()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditPRFormData>({
    resolver: zodResolver(editPRSchema),
    defaultValues: {
      date: new Date(),
      prNumber: '',
      description: '',
      purpose: '',
    },
  })

  // When PR prop changes (open edit), populate form with PR values
  useEffect(() => {
    if (!pr) return
    try {
      const dateObj = pr.headerDetails.date ? new Date(pr.headerDetails.date) : new Date()
      // Only reset the editable fields present in the Create modal
      form.reset({
        date: dateObj,
        prNumber: pr.headerDetails.prNumber || '',
        description: pr.headerDetails.description || '',
        purpose: pr.headerDetails.purpose || '',
      })
    } catch (e) {
      // ignore and leave defaults
    }
  }, [pr])

  const onSubmit = async (data: EditPRFormData) => {
    if (!pr) return
    setIsSubmitting(true)
    try {
      const requestedDate = format(data.date, 'yyyy-MM-dd')
      
      await updateApi({
        pathParams: { id: pr.id },
        queryParams: { id: pr.id },
        payload: {
          prNumber: data.prNumber,
          description: data.description ?? '',
          purpose: data.purpose,
          ...(pr.headerDetails.procurementCategoryId ? { procurementCategoryId: pr.headerDetails.procurementCategoryId } : {}),
          requestedDate: requestedDate,
        }
      })

      const updated: Partial<PurchaseRequest> = {
        // Preserve any existing headerDetails keys (including uacs/fundCluster)
        headerDetails: {
          ...pr.headerDetails,
          date: requestedDate,
          prNumber: data.prNumber,
          description: data.description ?? '',
          purpose: data.purpose,
        },
        updatedAt: new Date().toISOString(),
      }

      updatePurchaseRequest(pr.id, updated)

      // reflect change to caller
      const merged = { ...pr, ...updated, headerDetails: { ...pr.headerDetails, ...(updated.headerDetails || {}) } } as PurchaseRequest

      toast({ title: 'Purchase Request updated', description: `${data.prNumber} saved.` })
      onOpenChange(false)
      onSuccess?.(merged)
    } catch {
      toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit Purchase Request`}
      description={`Edit header details for ${pr?.headerDetails.prNumber || ''}`}
      fitContent={true}
      className="max-w-[800px] w-full"
      footer={null}
      showCloseButton
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PR Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: Date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PR Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PR-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the purpose of this PR..." className="resize-none" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <FormControl>
                  <Textarea placeholder="Explain the purpose and justification..." className="resize-none" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  )
}
