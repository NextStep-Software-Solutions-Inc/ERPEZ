import { useMemo, useState, useEffect, useRef } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PPMPItem } from '../types'

interface PPMPSelectorProps {
  ppmpData: PPMPItem[]
  onSelect?: (items: PPMPItem[]) => void
}

const columnHelper = createColumnHelper<PPMPItem>()

export function PPMPSelector({
  ppmpData,
  onSelect,
}: PPMPSelectorProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [fundSourceFilter, setFundSourceFilter] = useState<string | null>(null)
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  // Extract unique fund sources and item categories - filter out nulls/undefined
  const fundSources = useMemo(
    () => Array.from(new Set(ppmpData.map((item) => item.fundSource).filter((s): s is string => !!s))),
    [ppmpData],
  )

  const itemCategories = useMemo(
    () => Array.from(new Set(ppmpData.map((item) => item.itemCategory).filter((c): c is string => !!c))),
    [ppmpData],
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
      }),
      columnHelper.accessor('code', {
        header: 'Code',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('office', {
        header: 'Office/Department',
        cell: (info) => info.getValue() || '—',
      }),
      columnHelper.accessor('fundSource', {
        header: 'Fund Source',
        cell: (info) => info.getValue() || '—',
      }),
      columnHelper.accessor('itemCategory', {
        header: 'Category',
        cell: (info) => info.getValue() || '—',
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Total Amount',
        cell: (info) =>
          `₱${info.getValue().toLocaleString('en-PH', { maximumFractionDigits: 2 })}`,
      }),
    ],
    [],
  )

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return ppmpData.filter((item) => {
      const matchesFundSource = !fundSourceFilter || item.fundSource === fundSourceFilter
      const matchesCategory = !itemCategoryFilter || item.itemCategory === itemCategoryFilter
      return matchesFundSource && matchesCategory
    })
  }, [ppmpData, fundSourceFilter, itemCategoryFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)

  const selectedCount = Object.values(rowSelection).filter(Boolean).length

  const onSelectRef = useRef(onSelect)
  
  // Update ref when onSelect changes
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Call onSelect when row selection changes
  useEffect(() => {
    onSelectRef.current?.(selectedRows)
  }, [rowSelection])

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Search & Filter</span>
          <span className="text-sm text-muted-foreground">
            {selectedCount} selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Global Search */}
          <div>
            <Input
              placeholder="Search by name or office..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Fund Source Filter */}
          <div>
            <Select value={fundSourceFilter || 'all'} onValueChange={(value) => setFundSourceFilter(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Fund Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fund Sources</SelectItem>
                {fundSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item Category Filter */}
          <div>
            <Select value={itemCategoryFilter || 'all'} onValueChange={(value) => setItemCategoryFilter(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {itemCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold">
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No items match your filters. Please adjust your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
