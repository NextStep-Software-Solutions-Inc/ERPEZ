import { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calculator,
  CheckCircle2,
  ExternalLink,
  Info,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  PROCUREMENT_CARD_REGISTRY,
  type CardDetailInfo,
} from '../constants/procurementCardInfoRegistry'

interface CardInfoTooltipProps {
  infoKey?: string
  customInfo?: CardDetailInfo
  className?: string
  iconClassName?: string
}

export function CardInfoTooltip({
  infoKey,
  customInfo,
  className = '',
  iconClassName = 'w-3.5 h-3.5',
}: CardInfoTooltipProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const info: CardDetailInfo | undefined =
    customInfo || (infoKey ? PROCUREMENT_CARD_REGISTRY[infoKey] : undefined)

  if (!info) return null

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsTooltipOpen(false)
    setIsModalOpen(true)
  }

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleOpenModal}
              aria-label={`View details for ${info.title}`}
              className={`inline-flex items-center justify-center text-muted-foreground/60 hover:text-primary transition-colors focus:outline-hidden rounded-full p-0.5 hover:bg-primary/10 ${className}`}
            >
              <Info className={iconClassName} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            sideOffset={6}
            color="secondary"
            className="w-72 p-3 text-left shadow-xl border border-border/80 bg-popover/98 backdrop-blur-md rounded-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1.5 border-b border-border/50 pb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                  {info.category}
                </span>
                <span className="text-[10px] text-muted-foreground">Click ℹ️ for modal</span>
              </div>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                {info.shortDescription}
              </p>
              <button
                type="button"
                onClick={handleOpenModal}
                className="w-full pt-1.5 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <span>View Full Details &amp; Compliance</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Detailed Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="lg" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
                {info.category}
              </Badge>
              {info.regulatoryBasis && (
                <Badge variant="secondary" className="text-[10px] font-medium text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                  Statutory Rule
                </Badge>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              {info.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {info.shortDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* 1. Purpose & Operational Context */}
            <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Purpose &amp; Executive Significance</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-5">
                {info.purpose}
              </p>
            </div>

            {/* 2. Formula & Data Sources */}
            <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <Calculator className="w-4 h-4 text-indigo-500" />
                <span>Calculation Formula &amp; Data Sources</span>
              </div>
              <div className="text-muted-foreground pl-5 font-mono text-[11px] bg-background/80 p-2 rounded border border-border/40">
                {info.formulaOrSources}
              </div>
            </div>

            {/* 3. Regulatory Basis (RA 9184 / GPPB) */}
            {info.regulatoryBasis && (
              <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <Scale className="w-4 h-4 text-amber-500" />
                  <span>Legal &amp; Regulatory Framework (RA 9184 / GPPB / COA)</span>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-5">
                  {info.regulatoryBasis}
                </p>
              </div>
            )}

            {/* 4. Thresholds & Action Guidelines */}
            <div className="space-y-2 pt-1">
              <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-primary" />
                Operational Status Benchmarks &amp; Recommended Actions
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                {/* Good / Green */}
                <div className="p-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-950 dark:text-emerald-100 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Optimal / Compliant
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {info.thresholdsAndActions.good}
                  </p>
                </div>

                {/* Warning / Amber */}
                <div className="p-2.5 rounded-md border border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-100 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Cautionary Threshold
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {info.thresholdsAndActions.warning}
                  </p>
                </div>

                {/* Critical / Red */}
                <div className="p-2.5 rounded-md border border-rose-500/20 bg-rose-500/5 text-rose-950 dark:text-rose-100 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Critical / Action Required
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {info.thresholdsAndActions.critical}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
