import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Search, Users, History, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Person } from '@/services/mock/personnel'

interface PersonnelTableProps {
  personnel: Person[]
  isLoading: boolean
  positions: Position[]
  searchQuery: string
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function PersonnelTable({
  personnel,
  isLoading,
  positions,
  searchQuery,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PersonnelTableProps) {
  return (
    <>
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-default-50">
            <TableRow className="border-default-200">
              <TableHead className="font-semibold text-default-500 uppercase text-[10px] tracking-wider h-12 pl-6">Active Incumbent</TableHead>
              <TableHead className="font-semibold text-default-500 uppercase text-[10px] tracking-wider h-12">Official Designation</TableHead>
              <TableHead className="font-semibold text-default-500 uppercase text-[10px] tracking-wider h-12">Nature of Appt.</TableHead>
              <TableHead className="text-right font-semibold uppercase text-[10px] tracking-wider h-12 pr-6 text-default-500">Ledger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-medium text-default-400 uppercase tracking-widest">Retrieving Service Records...</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && personnel?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <Users className="h-12 w-12 text-default-300" />
                    <p className="text-sm font-medium text-default-500">No Incumbents Assigned</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && personnel && personnel.length > 0 && personnel.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <Search className="h-12 w-12 text-default-300" />
                    <p className="text-sm font-medium text-default-500">No personnel found matching "{searchQuery}"</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {personnel?.map((person: Person) => {
              const position = positions?.find(p => p.id === person.positionId)
              return (
                <TableRow key={person.id} className="hover:bg-default-50/50 transition-all group border-default-100">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-default-100 rounded-md flex items-center justify-center font-bold text-default-600 text-[10px]">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-default-900 group-hover:text-primary transition-colors">{person.name}</div>
                        <div className="flex gap-1.5 mt-0.5">
                          {person.status !== 'active' && (
                            <span className="text-[9px] text-warning font-semibold uppercase tracking-tight bg-warning/5 px-1.5 py-0.5 rounded border border-warning/20">
                              {person.status}
                            </span>
                          )}
                          <span className="text-[9px] text-default-400 font-medium uppercase bg-default-100 px-1.5 py-0.5 rounded">
                            {person.employmentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-default-700 uppercase tracking-tight">{position?.title || 'UNASSIGNED ITEM'}</div>
                    <div className="text-[10px] font-mono text-default-400 mt-0.5">{position?.itemNumber || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="soft" className="text-[9px] font-semibold uppercase tracking-wider">
                      {person.employmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-default-300 hover:text-primary hover:bg-primary/5">
                      <History className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && personnel.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-t border-default-200 bg-default-50/50">
          <div className="flex items-center gap-2 text-sm text-default-600 font-medium">
            <span>Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              onPageSizeChange(Number(value))
              onPageChange(0)
            }}>
              <SelectTrigger className="h-9 w-20 text-sm border-default-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-default-600 font-medium">
            Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, personnel.length)} of {personnel.length}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm"
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, pageIdx) => (
                <Button
                  key={pageIdx}
                  variant={pageIdx === currentPage ? 'soft' : 'outline'}
                  size="sm"
                  className={`h-9 w-9 p-0 text-sm font-medium ${pageIdx === currentPage ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => onPageChange(pageIdx)}
                >
                  {pageIdx + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm"
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
