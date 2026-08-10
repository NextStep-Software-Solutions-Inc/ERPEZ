import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Building2Icon, ChevronRight } from 'lucide-react'
import type { OrgUnit } from '@/services/mock/orgUnits'

export interface ReportingChainFilterProps {
  offices: OrgUnit[] | undefined
  selectedOfficeId: string | null
  onSelectOffice: (officeId: string | null) => void
}

/**
 * ReportingChainFilter - Filter component for selecting offices with reporting chain context
 * Displays parent-child relationships and allows selection for reporting chain configuration
 * Connected to Tab 1 Structural Management for office/division hierarchy
 */
export function ReportingChainFilter({
  offices,
  selectedOfficeId,
  onSelectOffice,
}: ReportingChainFilterProps) {
  const selectedOffice = offices?.find(o => o.id === selectedOfficeId)

  // Build a map of office relationships
  const officeHierarchy = useMemo(() => {
    if (!offices) return {}
    
    const map: Record<string, { parent?: OrgUnit; children: OrgUnit[] }> = {}
    
    offices.forEach(office => {
      if (!map[office.id]) {
        map[office.id] = { children: [] }
      }
    })

    offices.forEach(office => {
      if (office.parentId && map[office.parentId]) {
        map[office.parentId].children.push(office)
      } else if (office.parentId) {
        const parent = offices.find(o => o.id === office.parentId)
        if (!map[office.id]) map[office.id] = { children: [] }
        map[office.id].parent = parent
      }
    })

    return map
  }, [offices])

  // Group offices by hierarchy level
  const officesByLevel = useMemo(() => {
    if (!offices) return { parent: [], child: [] }

    const grouping = {
      parent: offices.filter(o => !o.parentId),
      child: offices.filter(o => o.parentId),
    }

    return grouping
  }, [offices])

  return (
    <div className="space-y-3 px-1">
      <div className="flex items-center gap-2">
        <Label htmlFor="reporting-chain-filter" className="text-[10px] font-semibold text-default-600 uppercase tracking-tight">
          Reporting Chain Office
        </Label>
        <Badge variant="soft" className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
          {selectedOffice ? 'configured' : 'pending'}
        </Badge>
      </div>

      <Select value={selectedOfficeId || ''} onValueChange={(value) => onSelectOffice(value || null)}>
        <SelectTrigger id="reporting-chain-filter" className="h-9 text-sm border-default-200 focus:ring-primary">
          <SelectValue placeholder="Select office for reporting chain..." />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {/* Parent Offices Group */}
          {officesByLevel.parent.length > 0 && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                  Parent Offices
                </p>
              </div>
              {officesByLevel.parent.map((office) => {
                const childCount = officeHierarchy[office.id]?.children.length || 0
                return (
                  <SelectItem key={office.id} value={office.id} className="pl-8">
                    <div className="flex items-center gap-2">
                      <Building2Icon className="h-3.5 w-3.5 text-primary/60" />
                      <span className="font-medium">{office.name}</span>
                      {childCount > 0 && (
                        <span className="text-[10px] text-default-400 ml-1">
                          ({childCount} division{childCount !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </>
          )}

          {/* Divider */}
          {officesByLevel.parent.length > 0 && officesByLevel.child.length > 0 && (
            <div className="my-1 h-px bg-default-200" />
          )}

          {/* Child Offices Group */}
          {officesByLevel.child.length > 0 && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                  Divisions / Sub-Units
                </p>
              </div>
              {officesByLevel.child.map((office) => {
                const parentOffice = offices?.find(o => o.id === office.parentId)
                return (
                  <SelectItem key={office.id} value={office.id} className="pl-12">
                    <div className="flex items-center gap-1.5 text-xs">
                      {parentOffice && (
                        <>
                          <span className="text-default-400 font-medium">{parentOffice.name}</span>
                          <ChevronRight className="h-3 w-3 text-default-300" />
                        </>
                      )}
                      <span className="font-medium text-default-900">{office.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </>
          )}

          {!offices || offices.length === 0 && (
            <div className="px-2 py-8 text-center">
              <p className="text-xs text-default-400 font-medium">
                No offices available. Create offices in Structural Management tab first.
              </p>
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Selected Office Context */}
      {selectedOffice && (
        <div className="mt-3 p-3 bg-default-50/50 rounded-lg border border-default-200 space-y-2">
          <p className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
            Selected Context
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-default-900">{selectedOffice.name}</span>
              <Badge variant="soft" className="text-[9px]">{selectedOffice.type}</Badge>
            </div>
            {selectedOffice.parentId && (
              <div className="text-xs text-default-500 flex items-center gap-1.5">
                <span className="text-default-400">Parent:</span>
                <span className="font-medium text-default-700">
                  {offices?.find(o => o.id === selectedOffice.parentId)?.name}
                </span>
              </div>
            )}
            {officeHierarchy[selectedOffice.id]?.children.length > 0 && (
              <div className="text-xs text-default-500">
                <span className="text-default-400">Sub-units:</span>
                <div className="mt-1 space-y-0.5">
                  {officeHierarchy[selectedOffice.id].children.map((child) => (
                    <div key={child.id} className="text-default-600 ml-2">
                      • {child.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportingChainFilter
