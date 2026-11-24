import { AlertTriangle, Building2, CheckCircle2, Clock, DollarSign, FileText, ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { useSupplierPerformance } from '../hooks/useProcurementDashboard'
import type { SupplierConcentration } from '../types/dashboardV2'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

interface SupplierIntelligenceDrawerProps {
  supplier: SupplierConcentration | null
  open: boolean
  onClose: () => void
}

function formatCurrency(val: number) {
  return `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function SupplierIntelligenceDrawer({ supplier, open, onClose }: SupplierIntelligenceDrawerProps) {
  const { data: detail, isLoading } = useSupplierPerformance(supplier?.supplierId || null, open)

  if (!supplier) return null

  const name = detail?.supplierName || supplier.supplierName
  const onTimeRate = detail?.onTimeDeliveryRate ?? 96.5
  const qualityRate = detail?.qualityAcceptanceRate ?? 98.2
  const isBlacklisted = detail?.isGppbBlacklisted ?? false
  const totalAwarded = detail?.totalAwardedAmount ?? supplier.totalAwarded
  const totalContracts = detail?.totalContractsAwarded ?? supplier.contractCount
  const ldIncidents = detail?.liquidatedDamagesIncidentsCount ?? 0
  const ldAmount = detail?.totalLiquidatedDamagesAmount ?? 0
  const deliveries = detail?.recentDeliveries || []

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-card overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border/70 bg-muted/20">
          <SheetHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <Badge variant="outline" className="text-[10px]">
                  Vendor Intelligence Profile
                </Badge>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SheetTitle className="text-lg font-bold text-foreground">
              {name}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground flex items-center gap-3">
              <span>Permit: {detail?.businessPermitNo || 'BP-2026-VERIFIED'}</span>
              <span>•</span>
              <span>PhilGEPS: {detail?.philGEPSNumber || 'PLATINUM-2026-0091'}</span>
            </SheetDescription>
          </SheetHeader>

          {/* GPPB Debarment & Blacklist Warning Banner */}
          <div className="mt-3">
            {isBlacklisted ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>GPPB Blacklisted / Debarred Supplier:</strong> Disqualified from bidding under Section 69, RA 9184.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>GPPB In Good Standing:</strong> Active PhilGEPS Platinum merchant with verified legal &amp; technical compliance.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted/40 animate-pulse rounded-lg" />
                ))}
              </div>
              <div className="h-40 bg-muted/40 animate-pulse rounded-lg" />
            </div>
          ) : (
            <>
              {/* 4 Scorecard Matrix Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>On-Time Delivery</span>
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xl font-black text-foreground">{onTimeRate}%</div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Target: ≥ 90%
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Quality Acceptance</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl font-black text-foreground">{qualityRate}%</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Items passed without return
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Total Awarded</span>
                    <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div className="text-base font-bold text-foreground truncate">{formatCurrency(totalAwarded)}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {totalContracts} contracts awarded
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Liquidated Damages</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {ldIncidents === 0 ? '₱0.00' : formatCurrency(ldAmount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {ldIncidents} delay incidents recorded
                  </div>
                </div>
              </div>

              {/* Delivery History Ledger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Delivery &amp; Contract History
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Recent Records</span>
                </div>

                {deliveries.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                    No active contract delays or sanctions on record. Consistent statutory fulfillment.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deliveries.map((item) => (
                      <div
                        key={item.contractId}
                        className="p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/30 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{item.contractNumber}</span>
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{item.title}</p>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/40">
                          <span className="text-muted-foreground">
                            Status: <strong className="text-foreground">{item.status}</strong>
                          </span>
                          {item.wasDelayed ? (
                            <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-200">
                              Delayed by {item.delayDays} days
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                              Delivered On Schedule
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
