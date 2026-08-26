import { useMemo, useState } from 'react'
import { Download, Search, FileText, ListChecks, PackageOpen, Receipt, Building2, AlertTriangle } from 'lucide-react'
import { PageContainerDashtail } from '@/components/v2'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'
import { toast } from 'sonner'
import { formatCurrencyPHP } from '@/utils/formatters'
import {
  useConsolidatedPr,
  useEligiblePrs,
  useUpdateConsolidatedPrItem,
  useSubmitConsolidatedPr,
  useAddPrsToConsolidatedPr,
  useProcurementModes,
} from '@/features/procurement/consolidated-pr/handlers/hooks'
import type { EligiblePr } from '@/features/procurement/consolidated-pr/types/apiTypes'
import { BacResolutionStatusBadge } from '@/features/procurement/bac-resolution/components'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConsolidatedPrDetailsPageProps {
  consolidatedPrId: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = formatCurrencyPHP

function formatStatusLabel(status: string) {
  return status
    .split(/[-_]/)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ConsolidatedPrDetailsPage({
  consolidatedPrId,
}: ConsolidatedPrDetailsPageProps) {
  // ─── Dialog state ──────────────────────────────────────────────────────────
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addSearchTerm, setAddSearchTerm] = useState('')
  const [selectedPrIds, setSelectedPrIds] = useState<string[]>([])

  // ─── API ───────────────────────────────────────────────────────────────────
  const { data: cprResponse, isLoading } = useConsolidatedPr({
    pathParams: { id: consolidatedPrId },
    queryParams: {}
  })

  const { data: eligiblePrsResponse } = useEligiblePrs({
    pathParams: { id: consolidatedPrId },
    enabled: addOpen,
  })

  const { data: procurementModesResponse } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  const updateItemMutation = useUpdateConsolidatedPrItem()
  const submitMutation = useSubmitConsolidatedPr()
  const addPrsMutation = useAddPrsToConsolidatedPr()

  // ─── Derived data ──────────────────────────────────────────────────────────
  const consolidatedPr = cprResponse?.data ?? null
  const eligiblePrs: EligiblePr[] = eligiblePrsResponse?.data ?? []

  const mopOptions = useMemo(
    () =>
      (procurementModesResponse?.data ?? [])
        .filter((m) => m.isActive && !m.isArchived)
        .map((m) => ({ value: m.id as string, label: m.name as string })),
    [procurementModesResponse],
  )

  const linkedBacResolutions = useMemo(() => {
    if (!consolidatedPr) return []
    return []
  }, [consolidatedPr])

  const owningBacResolution = linkedBacResolutions[0] ?? null

  const filteredEligiblePrs = useMemo(() => {
    if (!addSearchTerm.trim()) return eligiblePrs
    const q = addSearchTerm.toLowerCase()
    return eligiblePrs.filter(
      (pr) =>
        pr.prNumber?.toLowerCase().includes(q) ||
        pr.officeName?.toLowerCase().includes(q),
    )
  }, [eligiblePrs, addSearchTerm])

  const selectedCount = selectedPrIds.length

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleOpenAdd() {
    setSelectedPrIds([])
    setAddSearchTerm('')
    setAddOpen(true)
  }

  function handleTogglePr(id: string) {
    setSelectedPrIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleAddPrs() {
    if (selectedPrIds.length === 0) return
    toast.promise(
      addPrsMutation.mutateAsync(
        {
          pathParams: { id: consolidatedPrId },
          queryParams: {},
          payload: {
            purchaseRequestIds: selectedPrIds,
          },
        },
        {
          onSuccess: () => {
            setAddOpen(false)
          },
        },
      ),
      {
        loading: 'Adding PRs to Consolidated PR...',
        success: 'PRs added to the Consolidated PR.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to add the selected PRs.',
      },
    )
  }

  function handleUpdateItemMop(
    itemId: string,
    procurementModeId: string,
    allowPartial: boolean,
  ) {
    toast.promise(
      updateItemMutation.mutateAsync({
        pathParams: { id: consolidatedPrId, itemId },
        queryParams: {},
        payload: { procurementModeId: procurementModeId || undefined, allowPartial },
      }),
      {
        loading: 'Updating item settings...',
        success: 'Item settings updated.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to update the item.',
      },
    )
  }

  function handleSubmit() {
    if (!consolidatedPr) return

    const allLinkedItems = consolidatedPr.prs?.flatMap((pr) => pr.items) ?? []
    const missingMopItems = allLinkedItems.filter((item) => !item.procurementModeId)

    if (missingMopItems.length > 0) {
      const missingNames = missingMopItems.map((i) => i.name)
      const preview = missingNames.slice(0, 3).join(', ')
      const extra = missingNames.length > 3 ? ` (+${missingNames.length - 3} more)` : ''
      toast.error('Missing Mode of Procurement', {
        description: `Please set Mode of Procurement for: ${preview}${extra}.`,
      })
      return
    }

    toast.promise(
      submitMutation.mutateAsync({
        pathParams: { id: consolidatedPrId },
      }),
      {
        loading: 'Submitting Consolidated PR...',
        success: 'Consolidated PR submitted for BAC processing.',
        error: (err: unknown) =>
          err instanceof Error ? err.message : 'Failed to submit the Consolidated PR.',
      },
    )
  }

  // ─── Loading / empty states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <PageContainerDashtail
        title="Consolidated PR Details"
        description="Loading..."
        backTo="/v2/consolidate-prs"
        backLabel="Back to Consolidated PRs"
        titleIcon={<PackageOpen className="h-5 w-5 text-primary" />}
        headerVariant="branded"
        headerSize="small"
      >
        <p className="text-sm text-muted-foreground">Loading Consolidated PR…</p>
      </PageContainerDashtail>
    )
  }

  if (!consolidatedPr) {
    return (
      <PageContainerDashtail
        title="Consolidated PR Details"
        description="Unable to locate the selected Consolidated PR."
        backTo="/v2/consolidate-prs"
        backLabel="Back to Consolidated PRs"
        titleIcon={<PackageOpen className="h-5 w-5 text-primary" />}
        headerVariant="branded"
        headerSize="small"
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Consolidated PR {consolidatedPrId} was not found.
          </AlertDescription>
        </Alert>
      </PageContainerDashtail>
    )
  }

  const isDraft = consolidatedPr.status?.toUpperCase() === 'DRAFT'

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PageContainerDashtail
      title={consolidatedPr.cprNumber ?? consolidatedPr.id}
      description={
        consolidatedPr.purpose ??
        consolidatedPr.description ??
        'Consolidated PR details'
      }
      backTo="/v2/consolidate-prs"
      backLabel="Back to Consolidated PRs"
      titleIcon={<PackageOpen className="h-5 w-5 text-primary" />}
      headerVariant="branded"
      headerSize="small"
      actions={
        <div className="flex items-center gap-2">
          {isDraft && (
            <Button variant="outline" size="sm" onClick={handleOpenAdd}>
              Add Agency/Office PR
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!isDraft}>
            Submit
          </Button>
        </div>
      }
      contentClassName="space-y-6"
    >
      {/* ── Summary card ─────────────────────────────────────────────── */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Consolidated PR Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Description
            </p>
            <p className="mt-2 text-sm font-medium">
              {consolidatedPr.description ?? 'No description provided.'}
            </p>
          </div>

          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Purpose
            </p>
            <p className="mt-2 text-sm font-medium">
              {consolidatedPr.purpose ?? 'No purpose provided.'}
            </p>
          </div>

          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Amount
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <p className="font-medium">
                ₱{formatCurrency(
                  consolidatedPr.prs?.reduce((sum, pr) => sum + pr.totalAmount, 0) ?? 0,
                )}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-default-200 bg-default-50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Owning BAC Resolution
            </p>
            <p className="mt-2 font-medium">
              {'Not linked yet'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {'This Consolidated PR has not been assigned to a BAC Resolution.'}
            </p>
          </div>

          <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap gap-2 pt-1">
            <Badge variant="soft">
              Status: {formatStatusLabel(consolidatedPr.status)}
            </Badge>
            <Badge variant="outline">
              Record: {consolidatedPr.cprNumber ?? consolidatedPr.id}
            </Badge>
            <Badge variant="outline">
              Source PRs: {consolidatedPr.prs?.length ?? 0}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {linkedBacResolutions.length > 1 && (
        <Alert color="destructive" variant="soft">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Multiple BAC Resolutions currently reference this Consolidated PR.
            The new workflow only allows one owner and should be corrected in the
            BAC workspace.
          </AlertDescription>
        </Alert>
      )}

      {/* ── BAC ownership card ───────────────────────────────────────── */}
      {owningBacResolution && (
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">
              BAC ownership and workflow state
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <BacResolutionStatusBadge status={consolidatedPr.status} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Selected PR Items ─────────────────────────────────────────── */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-primary" />
            Selected PR Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!consolidatedPr.prs || consolidatedPr.prs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isDraft
                ? 'No PRs added yet. Use "Add Agency/Office PR" to select approved PRs.'
                : 'No PRs in this consolidation.'}
            </p>
          ) : (
            consolidatedPr.prs.map((linkedPr, index) => (
              <div key={linkedPr.purchaseRequestId}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="space-y-4">
                  {/* PR header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{linkedPr.prNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {linkedPr.officeName} · {linkedPr.items.length} item(s)
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">
                        {linkedPr.prType === 'OutOfStock' || linkedPr.prType === 'out-of-stock'
                          ? 'Out of Stock'
                          : 'Non-CSE'}
                      </Badge>
                      <Badge variant="outline">
                        ₱{formatCurrency(linkedPr.totalAmount)}
                      </Badge>
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="overflow-x-auto rounded-lg border border-default-200">
                    <Table>
                      <TableHeader className="bg-default-50">
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Fund</TableHead>
                          {MONTH_NAMES.map((m) => (
                            <TableHead key={m} className="text-center">
                              {m}
                            </TableHead>
                          ))}
                          <TableHead className="text-center">Total Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead className="text-right">Total Amount</TableHead>
                          <TableHead>Mode of Procurement</TableHead>
                          <TableHead className="text-center">Allow Partial</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {linkedPr.items.map((item) => {
                          const itemId = item.consolidatedPRItemId ?? item.prItemId

                          return (
                            <TableRow key={itemId}>
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell>{item.category ?? '—'}</TableCell>
                              <TableCell>{item.fund ?? '—'}</TableCell>

                              {/* Monthly quantity columns */}
                              {MONTH_NAMES.map((month, idx) => {
                                const monthKey = String(idx + 1).padStart(2, '0')
                                const qty =
                                  (item.monthlyQuantities as Record<string, number>)[monthKey] ?? 0
                                return (
                                  <TableCell key={month} className="text-center">
                                    {qty > 0 ? `${qty} ${item.unit}` : `0 ${item.unit}`}
                                  </TableCell>
                                )
                              })}

                              <TableCell className="text-center font-semibold">
                                <Badge variant="outline">
                                  {item.totalQuantity} {item.unit}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                ₱{formatCurrency(item.unitPrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                ₱{formatCurrency(item.totalAmount)}
                              </TableCell>

                              {/* Mode of Procurement */}
                              <TableCell>
                                {isDraft ? (
                                  <Select
                                    value={item.procurementModeId ?? ''}
                                    onValueChange={(val) =>
                                      handleUpdateItemMop(
                                        itemId,
                                        val,
                                        item.allowPartial ?? false,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-44">
                                      <SelectValue placeholder="Select MOP" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mopOptions.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span>
                                    {item.procurementModeId
                                      ? (mopOptions.find((o) => o.value === item.procurementModeId)?.label ?? '—')
                                      : '—'}
                                  </span>
                                )}
                              </TableCell>

                              {/* Allow Partial */}
                              <TableCell className="text-center">
                                {isDraft ? (
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={item.allowPartial ?? false}
                                      disabled={!item.procurementModeId}
                                      onCheckedChange={(checked) =>
                                        handleUpdateItemMop(
                                          itemId,
                                          item.procurementModeId ?? '',
                                          checked === true,
                                        )
                                      }
                                    />
                                  </div>
                                ) : (
                                  <span>
                                    {typeof item.allowPartial === 'boolean'
                                      ? item.allowPartial
                                        ? 'Yes'
                                        : 'No'
                                      : '—'}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── BAC Resolution Context ───────────────────────────────────── */}
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            BAC Resolution Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {linkedBacResolutions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No BAC Resolutions currently reference this Consolidated PR.
            </p>
          ) : (
            linkedBacResolutions.map((resolution, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {resolution}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {resolution}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Resolution date: {resolution}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <BacResolutionStatusBadge status={resolution} />
                    <Badge variant="outline">
                      ₱{resolution}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Add Agency/Office PR Dialog ──────────────────────────────── */}
      <ResponsiveDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Agency/Office PR"
        description="Select approved PRs to add to this Consolidated PR"
        size="4xl"
        showCloseButton
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPrs}
              disabled={selectedCount === 0 || addPrsMutation.isPending}
              className="gap-2"
            >
              Add Selected PRs ({selectedCount})
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-6">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by PR number or office…"
              value={addSearchTerm}
              onChange={(e) => setAddSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-default-50">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={
                        filteredEligiblePrs.length > 0 &&
                        filteredEligiblePrs.every((pr) =>
                          selectedPrIds.includes(pr.purchaseRequestId),
                        )
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPrIds(
                            filteredEligiblePrs.map((pr) => pr.purchaseRequestId),
                          )
                        } else {
                          setSelectedPrIds([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>PR Number</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEligiblePrs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No approved PRs available to add.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEligiblePrs.map((pr) => (
                    <TableRow key={pr.purchaseRequestId}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedPrIds.includes(pr.purchaseRequestId)}
                          onCheckedChange={() =>
                            handleTogglePr(pr.purchaseRequestId)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {pr.prNumber}
                      </TableCell>
                      <TableCell>{pr.officeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pr.prType === 'OutOfStock' || pr.prType === 'out-of-stock'
                            ? 'Out of Stock'
                            : 'Non-CSE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ₱{formatCurrency(pr.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ResponsiveDialog>

      {/* ── Export Dialog ────────────────────────────────────────────── */}
      <ExportComingSoonDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </PageContainerDashtail>
  )
}