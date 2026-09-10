/**
 * PPMPGuidelinesModal
 * Full-screen modal displaying complete NGPA PPMP guidelines reference
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { X, FileText, Scale } from 'lucide-react'
import {
  NGPA_PPMP_GUIDELINES,
  getAllColumnGuidelines,
} from '../lib/ngpaGuidelinesReference'

interface PPMPGuidelinesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PPMPGuidelinesModal({
  open,
  onOpenChange,
}: PPMPGuidelinesModalProps) {
  const guidelines = getAllColumnGuidelines()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b border-border bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl font-bold">
                {NGPA_PPMP_GUIDELINES.title}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {NGPA_PPMP_GUIDELINES.description}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="gap-1">
                <Scale className="h-3 w-3" />
                {NGPA_PPMP_GUIDELINES.authority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-130px)]">
          <div className="p-6 space-y-6">
            {guidelines.map((guideline) => (
              <div
                key={guideline.columnNumber}
                className="pb-6 border-b border-border last:border-b-0 space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="font-bold text-blue-700 text-sm">
                      {guideline.columnNumber}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-foreground leading-tight">
                      {guideline.columnName}
                    </h3>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2 ml-13">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Guidelines & Notes
                    </p>
                    <p className="text-sm text-foreground leading-relaxed mt-1">
                      {guideline.notes}
                    </p>
                  </div>

                  {/* Basis Section */}
                  {guideline.basis && (
                    <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                        Legal Basis
                      </p>
                      <p className="text-xs text-amber-800 mt-1">
                        {guideline.basis}
                      </p>
                    </div>
                  )}

                  {/* Examples Section */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Examples by Project Type
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Goods Example */}
                      {guideline.examples.goods && (
                        <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-3">
                          <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded mb-2">
                            Goods
                          </span>
                          <p className="text-xs text-green-900 leading-relaxed">
                            {guideline.examples.goods}
                          </p>
                        </div>
                      )}

                      {/* Infrastructure Example */}
                      {guideline.examples.infrastructure && (
                        <div className="bg-orange-50/50 border border-orange-200/50 rounded-lg p-3">
                          <span className="inline-block text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded mb-2">
                            Infrastructure
                          </span>
                          <p className="text-xs text-orange-900 leading-relaxed">
                            {guideline.examples.infrastructure}
                          </p>
                        </div>
                      )}

                      {/* Consulting Example */}
                      {guideline.examples.consulting && (
                        <div className="bg-violet-50/50 border border-violet-200/50 rounded-lg p-3">
                          <span className="inline-block text-xs font-bold text-violet-700 bg-violet-100 px-2 py-1 rounded mb-2">
                            Consulting
                          </span>
                          <p className="text-xs text-violet-900 leading-relaxed">
                            {guideline.examples.consulting}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
