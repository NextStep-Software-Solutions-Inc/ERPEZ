import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Building2, Upload } from 'lucide-react'

interface PlantillaPositionsTableProps {
  positions: Position[]
  isLoading: boolean
  units: OrgUnit[]
  onDelete: (id: string) => void
}

export function PlantillaPositionsTable({
  positions,
  isLoading,
  units,
  onDelete,
}: PlantillaPositionsTableProps) {
  return (
    <div className="rounded-lg border border-default-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-default-50">
          <TableRow className="border-default-200">
            <TableHead className="font-semibold text-[10px] uppercase tracking-wider text-default-500 h-12 pl-6">Plantilla Item No</TableHead>
            <TableHead className="font-semibold text-[10px] uppercase tracking-wider text-default-500 h-12">Official Designation & Unit</TableHead>
            <TableHead className="font-semibold text-[10px] uppercase tracking-wider text-default-500 h-12 text-center">Grade</TableHead>
            <TableHead className="font-semibold text-[10px] uppercase tracking-wider text-default-500 h-12">Item Status</TableHead>
            <TableHead className="font-semibold text-[10px] uppercase tracking-wider text-default-500 h-12 text-center">FTE</TableHead>
            <TableHead className="text-right font-semibold text-[10px] uppercase tracking-wider text-default-500 h-12 pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-medium text-default-400 uppercase tracking-widest">Compiling Plantilla Data...</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && positions?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <Search className="h-10 w-10 text-default-300" />
                  <p className="text-sm font-medium text-default-500">No results found for your query.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {positions?.map((item) => (
            <TableRow key={item.id} className="hover:bg-default-50/50 transition-all group border-default-100">
              <TableCell className="pl-6">
                <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 bg-primary/5 rounded border border-primary/10">
                  {item.itemNumber || 'N/A'}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm text-default-900">{item.title}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-default-500 font-medium">
                    <Building2 className="h-3 w-3 text-default-400" /> 
                    {units?.find(u => u.id === item.orgUnitId)?.name || 'UNASSIGNED'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-medium text-default-700 bg-background border-default-200">
                  {item.salaryGrade}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="soft" color={item.status === 'filled' ? 'success' : 'warning'} className="text-[10px] font-semibold uppercase">
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-default-900 text-center">
                <span className="text-sm">{item.authorizedFTE}</span>
              </TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-default-400 hover:text-default-900">
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/5"
                    onClick={() => onDelete(item.id)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
