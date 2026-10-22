import type { OrgUnit } from '@/services/mock/orgUnits'

interface UnitDetailsMetadataProps {
  unit: OrgUnit
}

export function UnitDetailsMetadata({ unit }: UnitDetailsMetadataProps) {
  return (
    <>
      {/* Financial & Location Segment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Metadata (LEFT) */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wider">Financial Metadata</h3>
          <div className="bg-default-50 rounded-lg p-4 border border-default-200 flex flex-col justify-between h-full min-h-[120px]">
            <div>
              <p className="text-[10px] font-medium text-default-400 uppercase mb-1">UACS Organization Code</p>
              <p className="font-mono text-sm font-semibold text-primary">{unit.uacsCode || 'UNASSIGNED'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-default-400 uppercase mb-1">Responsibility Center</p>
              <p className="font-mono text-sm font-semibold text-default-900">{unit.responsibilityCenter || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-default-400 uppercase mb-1">Budget Cost Center</p>
              <p className="font-mono text-sm font-semibold text-default-700">{unit.budgetingCostCenter || '—'}</p>
            </div>
          </div>
        </div>

        {/* Geographic Location (RIGHT) */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wider">Agency Location</h3>
          <div className="bg-default-50 rounded-lg p-4 border border-default-200 flex flex-col justify-center h-full min-h-[120px]">
            <div className="mb-3">
              <p className="text-[10px] font-medium text-default-400 uppercase mb-1">Satellite / Cluster</p>
              <p className="text-sm font-semibold text-default-900">{unit.cluster ?? 'No satellite/cluster'}</p>
            </div>

            {unit.address && (
              <div className="mb-3">
                <p className="text-[10px] font-medium text-default-400 uppercase mb-1">Address</p>
                <p className="text-sm font-semibold text-default-900">{unit.address}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-medium text-default-400 uppercase mb-1">Jurisdiction</p>
              <p className="text-sm font-medium text-default-700">
                {[unit.municipality, unit.province, unit.region].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Row (Category / Admin Level / Procurement / Parent) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-default-400 uppercase">Category</p>
          <p className="font-medium text-sm text-default-700">{unit.categoryName ?? unit.category ?? '—'}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium text-default-400 uppercase">Administrative Level</p>
          <p className="font-medium text-sm text-default-700">{unit.administrativeLevelName ?? unit.level ?? '—'}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium text-default-400 uppercase">Procurement Workflow</p>
          <p className="font-medium text-sm text-default-700">{unit.procurementWorkflow ?? '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-default-400 uppercase">Parent Office</p>
          <p className="font-medium text-sm text-default-700">{unit.parentOfficeName ?? '—'}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-medium text-default-400 uppercase">Organization</p>
          <p className="font-medium text-sm text-default-700">{unit.organizationName ?? '—'}</p>
        </div>
      </div>
    </>
  )
}
