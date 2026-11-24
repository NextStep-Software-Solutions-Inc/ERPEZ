import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  AlertCircle,
  Eye,
  Files,
  ListChecks,
  Pencil,
  Plus,
  Search,
} from 'lucide-react'
import { Column } from '../master-documents/table'
import { getProfileEnvelopeCount } from '../utils'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import type { MasterDoc, Profile } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

interface MasterSetupTabProps {
  masterDocs: Array<MasterDoc>
  profiles: Array<Profile>
  onAddDocument: () => void
  onEditDocument: (doc: MasterDoc) => void
  onDeleteDocument: (doc: MasterDoc) => void
  onViewTemplate: (doc: MasterDoc) => void
  onAddProfile: () => void
  onEditProfile: (profile: Profile) => void
  onViewProfile: (profile: Profile) => void
}

export function MasterSetupTab({
  masterDocs,
  profiles,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onViewTemplate,
  onAddProfile,
  onEditProfile,
  onViewProfile,
}: MasterSetupTabProps) {
  const [activeAdminView, setActiveAdminView] = useState<
    'documents' | 'profiles'
  >('documents')
  const [search, setSearch] = useState('')
  const [envelopeFilter, setEnvelopeFilter] = useState<'all' | '1' | '2'>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filteredMasterDocs = useMemo(() => {
    const searchText = search.toLowerCase()

    return masterDocs.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchText) ||
        doc.description.toLowerCase().includes(searchText) ||
        doc.templateFile.toLowerCase().includes(searchText)

      const matchesEnvelope =
        envelopeFilter === 'all' || doc.envelope.toString() === envelopeFilter

      return matchesSearch && matchesEnvelope
    })
  }, [envelopeFilter, masterDocs, search])

  const columns = useMemo(
    () =>
      Column({
        onViewTemplate,
        onEdit: onEditDocument,
        onDelete: onDeleteDocument,
      }),
    [onDeleteDocument, onEditDocument, onViewTemplate],
  )

  const table = useReactTable({
    data: filteredMasterDocs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const pageCount = Math.max(table.getPageCount(), 1)

  return (
    <div className="space-y-8">
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm flex gap-3 text-muted-foreground">
        <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground">Admin Workflow Rules:</strong> Use
          the table below to register documents, assign technical envelope
          classifications, and attach standardized GPPB fillable templates.
          Supplier upload fields are dynamically determined by your
          configurations here.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 p-1">
        <Button
          type="button"
          variant={activeAdminView === 'documents' ? 'default' : 'ghost'}
          className="gap-2"
          onClick={() => setActiveAdminView('documents')}
        >
          <Files className="h-4 w-4" />
          Master Documents
        </Button>
        <Button
          type="button"
          variant={activeAdminView === 'profiles' ? 'default' : 'ghost'}
          className="gap-2"
          onClick={() => setActiveAdminView('profiles')}
        >
          <ListChecks className="h-4 w-4" />
          Checklist Profiles
          <Badge variant="outline" className="bg-background">
            {profiles.length}
          </Badge>
        </Button>
      </div>

      {activeAdminView === 'documents' && (
        <Card className="border shadow-xs bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-foreground">
                  GPPB Master Documents Database
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Register document specifications, envelope classifications, and standardized templates globally.
                </CardDescription>
              </div>
              <Button onClick={onAddDocument} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Document Type
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search master document titles & terms..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    table.setPageIndex(0)
                  }}
                  className="pl-9 h-9 bg-background"
                />
              </div>
              <Select
                value={envelopeFilter}
                onValueChange={(val) => {
                  setEnvelopeFilter(val as 'all' | '1' | '2')
                  table.setPageIndex(0)
                }}
              >
                <SelectTrigger className="w-[190px] h-9 bg-background">
                  <SelectValue placeholder="All Envelopes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Envelopes</SelectItem>
                  <SelectItem value="1">Envelope 1: Technical</SelectItem>
                  <SelectItem value="2">Envelope 2: Financial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-background shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/60 border-b">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3.5">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className="hover:bg-muted/40 transition-colors border-b last:border-b-0"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`text-left relative py-3 ${
                              cell.column.id !== 'select' &&
                              cell.column.id !== 'actions'
                                ? 'pl-6'
                                : ''
                            } ${
                              cell.column.id === 'actions' ? 'text-right' : ''
                            }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center justify-center py-12">
                          <Search className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold">
                            No master documents found
                          </h3>
                          <p className="text-muted-foreground">
                            Try adjusting your search or add a new document type.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-row items-center justify-between space-x-2 pt-2">
              <div className="text-muted-foreground text-xs">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="text-muted-foreground text-xs">
                Page{' '}
                {Math.min(table.getState().pagination.pageIndex + 1, pageCount)}{' '}
                of {pageCount}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeAdminView === 'profiles' && (
        <Card className="border shadow-xs bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-foreground">
                  Reusable Checklist Profiles
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Bundle master documents into reusable project category blueprints.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddProfile}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create Profile
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="border shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col bg-card overflow-hidden"
                >
                  <CardHeader className="p-4 pb-3 border-b bg-muted/15 h-[126px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      {profile.procurementCategory ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold py-0.5 px-2 h-5 bg-secondary/80 text-secondary-foreground"
                        >
                          {profile.procurementCategory}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium py-0.5 px-2 h-5 text-muted-foreground"
                        >
                          All Categories
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title={`Edit ${profile.name}`}
                        aria-label={`Edit ${profile.name}`}
                        onClick={() => onEditProfile(profile)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-0.5">
                      <CardTitle
                        className="text-sm font-bold text-foreground line-clamp-1"
                        title={profile.name}
                      >
                        {profile.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {profile.description || 'Standard checklist profile specifications and requirements.'}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border bg-muted/30 p-2 flex flex-col items-center justify-center">
                        <div className="text-sm font-bold text-foreground">
                          {profile.itemCount}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight font-semibold mt-0.5">
                          Total Docs
                        </div>
                      </div>
                      <div className="rounded-lg border border-info/20 bg-info/5 p-2 flex flex-col items-center justify-center">
                        <div className="text-sm font-bold text-info">
                          {profile.techCount}
                        </div>
                        <div className="text-[10px] text-info/80 uppercase tracking-tight font-semibold mt-0.5">
                          Technical
                        </div>
                      </div>
                      <div className="rounded-lg border border-warning/20 bg-warning/5 p-2 flex flex-col items-center justify-center">
                        <div className="text-sm font-bold text-warning">
                          {profile.finCount}
                        </div>
                        <div className="text-[10px] text-warning/80 uppercase tracking-tight font-semibold mt-0.5">
                          Financial
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 h-8 text-xs w-full font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                        onClick={() => onViewProfile(profile)}
                      >
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        View Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
