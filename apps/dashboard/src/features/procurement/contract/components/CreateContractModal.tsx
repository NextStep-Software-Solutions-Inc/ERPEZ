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
import {
  CalendarIcon,
  Search,
  Building2,
  DollarSign,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { useContractStore, Contract, NOA } from '../store/contractStore'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const createContractSchema = z.object({
  contractDate: z.date({ message: 'Contract date is required' }),
  contractNumber: z.string().min(1, 'Contract number is required'),
  description: z.string().nonempty('Description is required'),
  noaId: z.string().min(1, 'NOA selection is required'),
})

type CreateContractFormData = z.infer<typeof createContractSchema>

// UUID helper
function generateUUID(): string {
  const nativeId = (globalThis as any).crypto?.randomUUID?.()
  if (typeof nativeId === 'string') return nativeId
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface CreateContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (contractId: string) => void
  initialContract?: Contract | null
}

export function CreateContractModal({
  open,
  onOpenChange,
  onSuccess,
  initialContract = null,
}: CreateContractModalProps) {
  const {
    contracts,
    addContract,
    updateContract,
    getApprovedNOAs,
    getNOAById,
  } = useContractStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedNOA, setSelectedNOA] = useState<NOA | null>(null)
  const [noaSearchOpen, setNoaSearchOpen] = useState(false)
  const [noaSearchQuery, setNoaSearchQuery] = useState('')

  // Approved NOAs are sourced from Manage NOA.
  const linkedNoaIds = new Set(
    contracts
      .filter((contract) => contract.id !== initialContract?.id)
      .map((contract) => contract.noaId),
  )
  const approvedNOAs = getApprovedNOAs().filter(
    (noa) => !linkedNoaIds.has(noa.id) || noa.id === initialContract?.noaId,
  )

  const form = useForm<CreateContractFormData>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      contractDate: new Date(),
      contractNumber: '',
      description: '',
      noaId: '',
    },
  })

  // Watch noaId changes to update selected NOA
  const watchedNoaId = form.watch('noaId')
  useEffect(() => {
    if (watchedNoaId) {
      const noa = getNOAById(watchedNoaId)
      setSelectedNOA(noa || null)
    } else {
      setSelectedNOA(null)
    }
  }, [watchedNoaId, getNOAById])

  // Initialize form when editing
  useEffect(() => {
    if (initialContract) {
      form.reset({
        contractDate: initialContract.contractDate
          ? new Date(initialContract.contractDate)
          : new Date(),
        contractNumber: initialContract.contractNumber,
        description: initialContract.description || '',
        noaId: initialContract.noaId,
      })
      const noa = getNOAById(initialContract.noaId)
      setSelectedNOA(noa || null)
    } else {
      // reset when modal closes
      if (!open) {
        form.reset({
          contractDate: new Date(),
          contractNumber: '',
          description: '',
          noaId: '',
        })
        setSelectedNOA(null)
        setNoaSearchQuery('')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContract, open])

  const onSubmit = async (data: CreateContractFormData) => {
    setIsSubmitting(true)
    try {
      if (!selectedNOA) {
        toast({
          title: 'Error',
          description: 'Please select a valid NOA',
        })
        setIsSubmitting(false)
        return
      }

      const contract: Contract = {
        id: initialContract?.id || generateUUID(),
        contractDate: format(data.contractDate, 'yyyy-MM-dd'),
        contractNumber: data.contractNumber,
        description: data.description || '',
        noaId: selectedNOA.id,
        noaNumber: selectedNOA.noaNumber,
        supplierName: selectedNOA.supplierName,
        supplierId: selectedNOA.supplierId,
        totalAmount: selectedNOA.totalAmount,
        items: selectedNOA.items.map((item) => ({ ...item })),
        category: selectedNOA.category,
        status: 'draft',
        createdAt: initialContract?.createdAt || new Date().toISOString(),
        modeOfProcurement: selectedNOA.modeOfProcurement,
        wfpScope: selectedNOA.wfpScope,
        projectTitle: selectedNOA.projectTitle,
        linkedNoticeOfAward: selectedNOA.linkedNoticeOfAward,
      }

      if (initialContract) {
        updateContract(initialContract.id, contract)
        toast({
          title: 'Contract Updated',
          description: `${contract.contractNumber} has been updated successfully.`,
        })
      } else {
        addContract(contract)
        toast({
          title: 'Contract Created',
          description: `${contract.contractNumber} has been created as draft.`,
        })
      }

      onOpenChange(false)
      if (onSuccess) onSuccess(contract.id)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create contract. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter NOAs based on search query
  const searchFilteredNOAs = approvedNOAs.filter((noa) => {
    const query = noaSearchQuery.toLowerCase()
    return (
      noa.noaNumber.toLowerCase().includes(query) ||
      noa.supplierName.toLowerCase().includes(query) ||
      noa.description?.toLowerCase().includes(query) ||
      noa.category.toLowerCase().includes(query)
    )
  })

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialContract ? 'Edit Contract' : 'Create Contract'}
      description={
        initialContract
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
                <FormLabel className="text-sm font-medium">
                  Description
                </FormLabel>
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

          {/* NOA Selection */}
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
                      >
                        {field.value
                          ? selectedNOA?.noaNumber || '-- Select NOA --'
                          : '-- Select NOA --'}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="p-2">
                      <Input
                        placeholder="Search approved NOA by number, supplier, or category..."
                        value={noaSearchQuery}
                        onChange={(e) => setNoaSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                        Approved NOAs from Manage NOA
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {searchFilteredNOAs.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            No approved unlinked NOA found.
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
                                <span className="font-medium">
                                  {noa.noaNumber}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  {noa.category}
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground mt-1">
                                {noa.supplierName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ₱ {noa.totalAmount.toLocaleString()} •{' '}
                                {format(new Date(noa.noaDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Auto-filled Supplier and Amount (Read-only) */}
          {selectedNOA && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Auto-filled from NOA</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Supplier
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedNOA.supplierName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-sm font-semibold">
                      ₱ {selectedNOA.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Items
                    </p>
                    <p className="text-sm font-semibold">
                      {selectedNOA.items.length} item(s)
                    </p>
                  </div>
                </div>
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
                ? 'Creating...'
                : initialContract
                  ? 'Update Contract'
                  : 'Create Contract'}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  )
}
