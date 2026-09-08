import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, FileText, Loader2, Filter } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ResolutionClause, ResolutionClauseType } from '../types'

interface ResolutionClausesTableProps {
  clauses: ResolutionClause[]
  isLoading?: boolean
  canManage?: boolean
  onCreate?: () => void
  onEdit?: (clause: ResolutionClause) => void
  onDelete?: (clause: ResolutionClause) => void
}

export function ResolutionClausesTable({
  clauses,
  isLoading = false,
  canManage = false,
  onCreate,
  onEdit,
  onDelete,
}: ResolutionClausesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | ResolutionClauseType>('ALL')

  const filteredClauses = useMemo(() => {
    return clauses.filter((c) => {
      const matchesType =
        typeFilter === 'ALL' || (c.clauseType || 'Whereas') === typeFilter
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.body.toLowerCase().includes(query)
      return matchesType && matchesSearch
    })
  }, [clauses, typeFilter, searchTerm])

  const getClauseTypeBadge = (type: ResolutionClauseType | string) => {
    const norm = (type || 'Whereas').toLowerCase()
    if (norm === 'whereas') {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 font-semibold text-[11px]">
          WHEREAS
        </Badge>
      )
    }
    if (norm === 'nowtherefore') {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-[11px]">
          NOW, THEREFORE
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-[11px]">
        RESOLVED
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: Search, Type Filter & Create Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clauses by title or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={typeFilter}
              onValueChange={(val) => setTypeFilter(val as 'ALL' | ResolutionClauseType)}
            >
              <SelectTrigger className="text-xs h-9 w-[180px]">
                <SelectValue placeholder="All Clause Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs font-medium">All Types ({clauses.length})</SelectItem>
                <SelectItem value="Whereas" className="text-xs font-medium">WHEREAS Clauses</SelectItem>
                <SelectItem value="NowTherefore" className="text-xs font-medium">NOW, THEREFORE Clauses</SelectItem>
                <SelectItem value="Resolved" className="text-xs font-medium">RESOLVED Clauses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {canManage && onCreate && (
          <Button onClick={onCreate} size="sm" className="gap-1.5 text-xs shrink-0 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            New Clause Template
          </Button>
        )}
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-default-200 bg-white dark:bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-default-50/80">
            <TableRow>
              <TableHead className="w-[140px] text-xs font-bold text-default-800">Clause Type</TableHead>
              <TableHead className="w-[280px] text-xs font-bold text-default-800">Name / Title</TableHead>
              <TableHead className="text-xs font-bold text-default-800">Legal Phrasing Body</TableHead>
              {canManage && (
                <TableHead className="w-[110px] text-right text-xs font-bold text-default-800">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="py-12 text-center text-xs text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                  Loading resolution clauses...
                </TableCell>
              </TableRow>
            ) : filteredClauses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="py-10 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium">No resolution clause templates found.</p>
                    {canManage && onCreate && (
                      <Button variant="outline" size="sm" onClick={onCreate} className="text-xs gap-1">
                        <Plus className="h-3.5 w-3.5" /> Add First Clause
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TooltipProvider>
                {filteredClauses.map((clause) => (
                  <TableRow key={clause.id} className="hover:bg-default-50/60 transition-colors">
                    <TableCell className="py-3 align-top">
                      {getClauseTypeBadge(clause.clauseType)}
                    </TableCell>
                    <TableCell className="py-3 align-top font-semibold text-xs text-foreground">
                      {clause.name}
                    </TableCell>
                    <TableCell className="py-3 align-top">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-muted-foreground font-serif line-clamp-2 leading-relaxed cursor-help">
                            {clause.body}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="start"
                          color="secondary"
                          className="max-w-md p-3 text-xs leading-relaxed bg-white dark:bg-card border border-default-200 text-default-900 shadow-md"
                        >
                          <p className="font-semibold mb-1 text-default-900">{clause.name}</p>
                          <p className="font-serif text-default-700 leading-relaxed whitespace-pre-wrap">{clause.body}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    {canManage && (
                      <TableCell className="py-3 text-right align-top">
                        <div className="flex items-center justify-end gap-1">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(clause)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Edit Clause"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(clause)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Delete Clause"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TooltipProvider>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
