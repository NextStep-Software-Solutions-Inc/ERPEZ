import { FileText, Layers, CheckCircle2 } from 'lucide-react'
import type { ProcurementSourceType } from '../../types'

interface SourceTypeSelectorStepProps {
  selectedSourceType: ProcurementSourceType | null
  onSelectSourceType: (type: ProcurementSourceType) => void
}

export function SourceTypeSelectorStep({
  selectedSourceType,
  onSelectSourceType,
}: SourceTypeSelectorStepProps) {
  return (
    <div className="space-y-6 py-2">
      <div>
        <h3 className="text-lg font-semibold text-default-900">
          Select Procurement Source
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the authoritative source from which this BAC Resolution originates. A Procurement Project context will be automatically created.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Path A: From APP Item */}
        <div
          onClick={() => onSelectSourceType('APP_ITEM')}
          className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all hover:border-primary hover:shadow-md ${
            selectedSourceType === 'APP_ITEM'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-default-200 bg-white'
          }`}
        >
          {selectedSourceType === 'APP_ITEM' && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-semibold text-blue-800 text-xs">
                  Path A — APP Driven
                </span>
              </div>
              <h4 className="mt-2 font-bold text-base text-default-900">
                From APP Item
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Create a BAC Resolution directly from an approved Annual Procurement Plan (APP) item without passing through PR Consolidation.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-default-100 p-2.5 text-xs text-default-600">
            <span className="font-semibold text-default-700">Workflow:</span> APP → APP Item → ProcurementProject → BAC Resolution → PR → Procurement Execution
          </div>
        </div>

        {/* Path B: From Consolidated PR */}
        <div
          onClick={() => onSelectSourceType('CONSOLIDATED_PR')}
          className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all hover:border-primary hover:shadow-md ${
            selectedSourceType === 'CONSOLIDATED_PR'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-default-200 bg-white'
          }`}
        >
          {selectedSourceType === 'CONSOLIDATED_PR' && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800 text-xs">
                  Path B — Consolidated PR Driven
                </span>
              </div>
              <h4 className="mt-2 font-bold text-base text-default-900">
                From Consolidated PR
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Create a BAC Resolution from an approved Consolidated Purchase Request (CPR) containing multiple combined PR items.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-default-100 p-2.5 text-xs text-default-600">
            <span className="font-semibold text-default-700">Workflow:</span> APP → APP Item → PR → Consolidated PR → ProcurementProject → BAC Resolution → Procurement Execution
          </div>
        </div>
      </div>
    </div>
  )
}
