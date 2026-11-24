import { useState, useEffect } from 'react'
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
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  CalendarIcon,
  Search,
  Building2,
  DollarSign,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  useCreateContract,
  useUpdateContract,
  useGetAvailableNoasForContract,
} from '../handlers/hooks'
import type { AvailableNoaForContract, ContractListItem, ContractDetail } from '../types'

const createContractSchema = z.object({
  contractDate: z.date({ message: 'Contract date is required' }),
  contractNumber: z.string().min(1, 'Contract number is required'),
  description: z.string().nonempty('Description is required'),
  noaId: z.string().min(1, 'NOA selection is required'),
})

type CreateContractFormData = z.infer<typeof createContractSchema>

interface CreateContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (contractId: string) => void
  /** Pass a ContractListItem or ContractDetail when editing an existing draft/returned contract */
  initialContract?: ContractListItem | ContractDetail | null
}

export function CreateContractModal({
  open,
  onOpenChange,
  onSuccess,
  initialContract = null,
}: CreateContractModalProps) {
  const { toast } = useToast()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedNOA, setSelectedNOA] = useState<AvailableNoaForContract | null>(null)
  const [noaSearchOpen, setNoaSearchOpen] = useState(false)
  const [noaSearchQuery, setNoaSearchQuery] = useState('')

  const isEditing = !!initialContract

  // Fetch available NOAs from the real API
  const { data: availableNoas = [], isLoading: noasLoading } = useGetAvailableNoasForContract(open)

  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract(initialContract?.id)

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<CreateContractFormData>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      contractDate: new Date(),
      contractNumber: '',
      description: '',
      noaId: '',
    },
  })

  // Update selectedNOA when noaId changes
  const watchedNoaId = form.watch('noaId')
  useEffect(() => {
    if (watchedNoaId) {
      const noa = availableNoas.find((n) => n.id === watchedNoaId) ?? null
      setSelectedNOA(noa)
    } else {
      setSelectedNOA(null)
    }
  }, [watchedNoaId, availableNoas])

  // Initialize form when editing
  useEffect(() => {
    if (initialContract && open) {
      form.reset({
        contractDate: initialContract.contractDate
          ? new Date(initialContract.contractDate)
          : new Date(),
        contractNumber: initialContract.contractNumber,
        description: initialContract.description || '',
        noaId: initialContract.noticeOfAwardId,
      })
      // For editing, selectedNOA lookup happens via the watchedNoaId effect above
    } else if (!open) {
      form.reset({
        contractDate: new Date(),
        contractNumber: '',
        description: '',
        noaId: '',
      })
      setSelectedNOA(null)
      setNoaSearchQuery('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContract, open])

  const onSubmit = async (data: CreateContractFormData) => {
    try {
      if (isEditing && initialContract) {
        await updateMutation.mutateAsync({
          contractNumber: data.contractNumber,
          contractDate: format(data.contractDate, 'yyyy-MM-dd'),
          description: data.description,
        })
        toast({
          title: 'Contract Updated',
          description: `${data.contractNumber} has been updated.`,
        })
        onOpenChange(false)
        if (onSuccess) onSuccess(initialContract.id)
      } else {
        const newId = await createMutation.mutateAsync({
          noticeOfAwardId: data.noaId,
          contractNumber: data.contractNumber,
          contractDate: format(data.contractDate, 'yyyy-MM-dd'),
          description: data.description,
        })
        const contractId = typeof newId === 'string' ? newId : String(newId)
        toast({
          title: 'Contract Created',
          description: `${data.contractNumber} has been created as Draft.`,
        })
        onOpenChange(false)
        if (onSuccess && contractId) onSuccess(contractId)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save contract. Please try again.',
      })
    }
  }

  // Filter NOAs based on search query
  const searchFilteredNOAs = availableNoas.filter((noa) => {
    const query = noaSearchQuery.toLowerCase()
    return (
      noa.noaNumber.toLowerCase().includes(query) ||
      noa.supplierName.toLowerCase().includes(query) ||
      (noa.projectTitle ?? '').toLowerCase().includes(query) ||
      (noa.modeOfProcurement ?? '').toLowerCase().includes(query)
    )
  })

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Contract' : 'Create Contract'}
      description={
        isEditing
          ? 'Update contract information'
          : 'Create a new contract by linking an approved NOA'
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Contract Date */}
          <FormField
            control={form.control}
            name="contractDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">
                  Contract Date <span className="text-destructive">*</span>
                </FormLabel>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        setIsDatePickerOpen(false)
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contract Number */}
          <FormField
            control={form.control}
            name="contractNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Contract Number <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., CONTRACT-2026-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter contract description"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* NOA Selection — hidden when editing (NOA cannot change after creation) */}
          {!isEditing && (
            <FormField
              control={form.control}
              name="noaId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium">
                    Link NOA <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover open={noaSearchOpen} onOpenChange={setNoaSearchOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                          disabled={noasLoading}
                        >
                          {noasLoading
                            ? 'Loading available NOAs...'
                            : field.value
                              ? selectedNOA?.noaNumber || '-- Select NOA --'
                              : '-- Select NOA --'}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverPrimitive.Content
                      side="bottom"
                      align="start"
                      sideOffset={4}
                      avoidCollisions={false}
                      className={cn(
                        'z-[99999] w-[var(--radix-popover-trigger-width)] min-w-[340px] rounded-md border bg-popover p-0 text-popover-foreground shadow-xl outline-none',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
                      )}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="p-2">
                        <Input
                          placeholder="Search by NOA number, supplier, or project..."
                          value={noaSearchQuery}
                          onChange={(e) => setNoaSearchQuery(e.target.value)}
                          className="mb-2"
                        />
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                          Approved NOAs available for contract
                        </div>
                        <div
                          ref={(el) => {
                            if (el) {
                              el.onwheel = (e) => e.stopPropagation()
                            }
                          }}
                          onWheel={(e) => e.stopPropagation()}
                          className="max-h-[250px] overflow-y-auto"
                        >
                          {searchFilteredNOAs.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              {noasLoading ? 'Loading...' : 'No approved unlinked NOA found.'}
                            </div>
                          ) : (
                            searchFilteredNOAs.map((noa) => (
                              <div
                                key={noa.id}
                                onClick={() => {
                                  field.onChange(noa.id)
                                  setNoaSearchOpen(false)
                                }}
                                className="flex flex-col items-start py-3 px-2 cursor-pointer hover:bg-accent rounded-md transition-colors"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">{noa.noaNumber}</span>
                                  {noa.noticeOfAwardType && (
                                    <Badge variant="outline" className="ml-2">
                                      {noa.noticeOfAwardType}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground mt-1">
                                  {noa.supplierName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {noa.projectTitle && `${noa.projectTitle} • `}
                                  ₱ {noa.totalAmount.toLocaleString()} •{' '}
                                  {noa.noaDate ? format(new Date(noa.noaDate), 'MMM dd, yyyy') : '—'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </PopoverPrimitive.Content>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Linked NOA Information / Auto-filled Supplier and Amount (Read-only) */}
          {(selectedNOA || isEditing) && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{isEditing ? 'Linked Notice of Award' : 'Auto-filled from NOA'}</span>
                </div>
                {(selectedNOA?.noaNumber || initialContract?.noaNumber) && (
                  <Badge variant="outline" className="text-xs">
                    {selectedNOA?.noaNumber || initialContract?.noaNumber}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(selectedNOA?.supplierName || initialContract?.supplierName) && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Supplier</p>
                      <p className="text-sm font-semibold">
                        {selectedNOA?.supplierName || initialContract?.supplierName}
                      </p>
                    </div>
                  </div>
                )}

                {(selectedNOA?.projectTitle || initialContract?.projectTitle) && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Project</p>
                      <p className="text-sm font-semibold">
                        {selectedNOA?.projectTitle || initialContract?.projectTitle}
                      </p>
                    </div>
                  </div>
                )}

                {(selectedNOA?.totalAmount !== undefined || initialContract?.totalAmount !== undefined) && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-semibold">
                        ₱ {(selectedNOA?.totalAmount ?? initialContract?.totalAmount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing ? 'Updating...' : 'Creating...'
                : isEditing
                  ? 'Update Contract'
                  : 'Create Contract'}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  )
}
