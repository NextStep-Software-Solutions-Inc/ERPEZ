/**
 * SupplementalAPPsTable - Task 3.8
 * Displays all supplemental APPs linked to a master APP
 * Shows: Name, Quarter, Status, Created By, Item Count, Total Amount, Actions
 */

import { useState, useCallback } from 'react'
import { MoreVertical, Eye, Trash2, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '../utils/appExportFormatter'
import { getMockSupplementalAPPs } from '../utils/supplementalNaming'

interface SupplementalAPP {
  id: string
  originalAppId: string
  supplementalNumber: number
  supplementalName: string
  appCode: string
  quarter: string
  status: 'Draft' | 'Submitted' | 'Approved' | 'Locked' | 'Rejected'
  createdAt: string
  createdBy: string
  itemCount: number
  totalAmount: number
}

interface SupplementalAPPsTableProps {
  masterAppId: string
  onViewDetails?: (supplemental: SupplementalAPP) => void
  onEdit?: (supplemental: SupplementalAPP) => void
  onDelete?: (supplemental: SupplementalAPP) => void
}

/**
 * Status badge styling
 */
function getStatusBadgeVariant(status: SupplementalAPP['status']) {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-800'
    case 'Submitted':
      return 'bg-blue-100 text-blue-800'
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Locked':
      return 'bg-purple-100 text-purple-800'
    case 'Rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Status icon
 */
function getStatusIcon(status: SupplementalAPP['status']) {
  switch (status) {
    case 'Approved':
    case 'Locked':
      return <CheckCircle className="h-4 w-4" />
    case 'Rejected':
    case 'Draft':
      return <AlertCircle className="h-4 w-4" />
    default:
      return null
  }
}

export function SupplementalAPPsTable({
  masterAppId,
  onViewDetails,
  onEdit,
  onDelete,
}: SupplementalAPPsTableProps) {
  const [supplementals, setSupplementals] = useState<SupplementalAPP[]>(() =>
    getMockSupplementalAPPs(masterAppId)
  )

  const handleDelete = useCallback(
    (supplemental: SupplementalAPP) => {
      setSupplementals((prev) => prev.filter((s) => s.id !== supplemental.id))
      onDelete?.(supplemental)
    },
    [onDelete]
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (supplementals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No supplemental APPs created yet</p>
            <p className="text-gray-400 text-xs mt-1">Use "Create Supplemental APP" button to add amendments</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplemental APPs</CardTitle>
        <CardDescription>All supplemental APPs linked to this master APP</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Supplemental Name</TableHead>
                <TableHead className="text-center">Quarter</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplementals.map((supplemental) => (
                <TableRow key={supplemental.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{supplemental.supplementalName}</p>
                      <p className="text-xs text-gray-500">{supplemental.appCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{supplemental.quarter}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(supplemental.status)}
                      <Badge className={getStatusBadgeVariant(supplemental.status)}>
                        {supplemental.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {supplemental.itemCount} item{supplemental.itemCount !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {formatCurrency(supplemental.totalAmount)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{supplemental.createdBy}</TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {formatDate(supplemental.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewDetails?.(supplemental)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {supplemental.status === 'Draft' && (
                          <DropdownMenuItem
                            onClick={() => onEdit?.(supplemental)}
                            className="flex items-center gap-2"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {supplemental.status === 'Draft' && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(supplemental)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-900">Status Legend:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Badge className="bg-gray-100 text-gray-800">Draft</Badge> - Under preparation
            </div>
            <div>
              <Badge className="bg-blue-100 text-blue-800">Submitted</Badge> - Awaiting approval
            </div>
            <div>
              <Badge className="bg-green-100 text-green-800">Approved</Badge> - By HoPE
            </div>
            <div>
              <Badge className="bg-purple-100 text-purple-800">Locked</Badge> - Final/Published
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
