import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import {
  AlertCircle,
  Eye,
  Files,
  ListChecks,
  Pencil,
  Plus,
  Search,
} from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Column } from '../master-documents/table'
import type { MasterDoc, Profile } from '../types'
import { getProfileEnvelopeCount } from '../utils'

interface MasterSetupTabProps {
  masterDocs: MasterDoc[]
  profiles: Profile[]
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const filteredMasterDocs = useMemo(() => {
    const searchText = search.toLowerCase()

    return masterDocs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchText) ||
        doc.description.toLowerCase().includes(searchText) ||
        doc.templateFile.toLowerCase().includes(searchText),
    )
  }, [masterDocs, search])

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
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                GPPB Master Documents Database
              </h3>
              <p className="text-xs text-muted-foreground">
                Register document specifications and templates globally.
              </p>
            </div>
            <Button onClick={onAddDocument} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Document Type
            </Button>
          </div>

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
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="rounded-md border flex-1 flex flex-col min-h-0">
            <Table>
              <TableHeader className="bg-transparent border rounded-t-3xl">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-gray-500">
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
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`text-left relative ${
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

          <div className="flex flex-row items-center justify-between space-x-2 py-4">
            <div className="text-muted-foreground text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="text-muted-foreground text-sm">
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
        </div>
      )}

      {activeAdminView === 'profiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Reusable Checklists Profiles
              </h3>
              <p className="text-xs text-muted-foreground">
                Bundle master documents into reusable project category
                blueprints.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddProfile}
              className="gap-1"
            >
              <Plus className="h-4.5 w-4.5" /> Create Profile
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => (
              <Card key={profile.id} className="border bg-muted/20">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <CardTitle className="text-sm font-bold">
                        {profile.name}
                      </CardTitle>
                      <CardDescription className="text-2xs line-clamp-2">
                        {profile.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-primary"
                      title={`Edit ${profile.name}`}
                      aria-label={`Edit ${profile.name}`}
                      onClick={() => onEditProfile(profile)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-2xs bg-background">
                      {profile.itemCount} Default Documents
                    </Badge>
                    <Badge variant="outline" className="text-2xs bg-info/5 border-info/20 text-info">
                      {profile.techCount} Tech
                    </Badge>
                    <Badge variant="outline" className="text-2xs bg-warning/5 border-warning/20 text-warning">
                      {profile.finCount} Fin
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => onViewProfile(profile)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
