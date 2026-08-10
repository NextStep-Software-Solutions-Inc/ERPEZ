import { useAtom } from 'jotai'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { codeRulesAtom, ruleBuilderDialogOpenAtom, selectedRuleAtom } from '../atoms/codeRulesAtom'
import type { CodeCombinationRule } from '../types/codeCombinationRuleTypes'
import { toast } from 'sonner'

export function CodeRulesTable() {
  const [codeRules, setCodeRules] = useAtom(codeRulesAtom)
  const [, setIsDialogOpen] = useAtom(ruleBuilderDialogOpenAtom)
  const [, setSelectedRule] = useAtom(selectedRuleAtom)
  const [deletingRule, setDeletingRule] = useState<CodeCombinationRule | undefined>()

  const columnHelper = createColumnHelper<CodeCombinationRule>()

  const handleEdit = (rule: CodeCombinationRule) => {
    setSelectedRule(rule)
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deletingRule) return

    setCodeRules(codeRules.filter((r) => r.id !== deletingRule.id))
    toast.success('Rule deleted successfully')
    setDeletingRule(undefined)
  }

  const columns = [
    columnHelper.accessor('name', {
      header: 'Rule Name',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      size: 180,
    }),
    columnHelper.accessor('conditions', {
      header: 'Conditions',
      cell: (info) => {
        const count = info.getValue().length
        return (
            <Badge variant="outline">
            {count} condition{count !== 1 ? 's' : ''}
          </Badge>
        )
      },
      size: 140,
    }),
    columnHelper.accessor('consequence.action', {
      header: 'Action',
      cell: (info) => {
        const value = info.getValue()
        return (
          <Badge className={`flex w-fit ${value === 'block' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {value === 'block' ? (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Block
              </>
            ) : (
              'Warn'
            )}
          </Badge>
        )
      },
      size: 120,
    }),
    columnHelper.accessor('consequence.errorMessage', {
      header: 'Message',
      cell: (info) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {info.getValue()}
        </span>
      ),
      size: 250,
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: (info) => (
        <Badge className={info.getValue() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleEdit(row.original)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeletingRule(row.original)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 80,
    }),
  ]

  const table = useReactTable({
    data: codeRules,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No rules defined yet. Create your first rule to get started.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletingRule} onOpenChange={(open) => !open && setDeletingRule(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule "{deletingRule?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
