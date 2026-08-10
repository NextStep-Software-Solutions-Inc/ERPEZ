import { ArrowUpDown } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFunctionTypesRequest } from '../handlers/getFunctionTypesRequest'
import { Actions } from './Actions'
import type { FiscalYear } from './types'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const useFunctionTypes = createQueryHookFromTemplate(getFunctionTypesRequest)

export const useDynamicColumns = (): Array<ColumnDef<FiscalYear>> => {
  const { data: functionTypes } = useFunctionTypes({
    pathParams: {},
    queryParams: {},
  })

  const baseColumns: Array<ColumnDef<FiscalYear>> = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'year',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Fiscal Year
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row, table }) => {
        const readonly = table.options.meta?.readonly
        const actions = table.options.meta?.actions
        const data = row.original
        return <Actions data={data} readonly={readonly} actions={actions} />
      },
    },
  ]

  // Add dynamic columns based on functionTypes
  if (functionTypes?.data && Array.isArray(functionTypes.data)) {
    const dynamicColumns: Array<ColumnDef<FiscalYear>> = (
      functionTypes.data as Array<string>
    ).map((functionType: string) => ({
      id: functionType.toLowerCase().replace(/\s+/g, ''),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {functionType}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      accessorFn: (row) => {
        const allocation = row.functionAllocations.find(
          (alloc) =>
            alloc.functionType.toLowerCase().replace(/\s+/g, '') ===
            functionType.toLowerCase().replace(/\s+/g, ''),
        )
        return allocation?.percentage || 0
      },
      cell: ({ getValue }) => {
        const value = getValue()
        return value ? `${value}%` : '-'
      },
    }))

    // Insert dynamic columns before status
    baseColumns.splice(-2, 0, ...dynamicColumns)
  }

  return baseColumns
}

export const Column: Array<ColumnDef<FiscalYear>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'fiscalYear',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fiscal Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'coreFunction',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Core Function
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const value = getValue() as number
      return value ? `${value}%` : '-'
    },
  },
  {
    accessorKey: 'strategicPriority',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Strategic Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const value = getValue() as number
      return value ? `${value}%` : '-'
    },
  },
  {
    accessorKey: 'mandatorySupportFunction',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Mandatory Support Function
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => {
      const value = getValue() as number
      return value ? `${value}%` : '-'
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },

  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions
      const data = row.original
      return <Actions data={data} readonly={readonly} actions={actions} />
    },
  },
]
