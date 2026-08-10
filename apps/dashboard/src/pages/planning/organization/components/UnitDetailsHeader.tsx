import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Building2Icon, Hash, Trash2 } from 'lucide-react'
import type { OrgUnit } from '@/services/mock/orgUnits'

interface UnitDetailsHeaderProps {
  unit: OrgUnit
  onModifyClick: () => void
  onDeleteClick: () => void
  isUpdating: boolean
  isDeleting: boolean
}

export function UnitDetailsHeader({
  unit,
  onModifyClick,
  onDeleteClick,
  isUpdating,
  isDeleting,
}: UnitDetailsHeaderProps) {
  return (
    <CardHeader className="border-b bg-default-50/50 py-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4">
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Building2Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-default-900 leading-tight flex items-center gap-2">
              <div className="flex flex-col">
                <span>{unit.name}</span>
                {unit.organizationName && (
                  <span className="text-xs text-default-400 font-medium">{unit.organizationName}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge className="font-medium text-[10px] uppercase tracking-wider px-2 py-0.5">
                  {unit.type}
                </Badge>
                {unit.administrativeLevelName && (
                  <Badge className="text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {unit.administrativeLevelName}
                  </Badge>
                )}
              </div>
            </CardTitle>

            {unit.description && (
              <p className="mt-2 text-sm text-default-600">{unit.description}</p>
            )}

            <div className="flex items-center gap-4 mt-1 font-medium text-default-500 text-xs">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> CODE: <span className="text-default-700">{unit.code}</span>
              </span>
              <span className="h-1 w-1 bg-default-300 rounded-full" />
              <span className="flex items-center gap-1.5 italic">
                {unit.establishedVia || 'Established via Section 4 of AO No. 1'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 font-medium text-xs text-default-700" 
            onClick={onModifyClick}
            disabled={isUpdating}
          >
            Modify
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 font-medium text-xs text-destructive hover:bg-destructive/5 border-destructive/20"
            onClick={onDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
