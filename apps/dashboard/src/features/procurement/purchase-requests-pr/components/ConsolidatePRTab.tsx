/**
 * Consolidate PR Tab
 * Merge approved PRs by category and assign Mode of Procurement
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Download, FileText } from 'lucide-react'
import { useConsolidatedPrs } from '@/features/procurement/consolidated-pr/handlers/hooks'
import { PurchaseRequest } from '../types'
import { useState, useMemo } from 'react'
import { ExportComingSoonDialog } from '@/components/ExportComingSoonDialog'

interface ConsolidatePRTabProps {
  onCreateClick: () => void
  onViewDetails: (pr: PurchaseRequest) => void
}

export function ConsolidatePRTab({
  onCreateClick,
  onViewDetails,
}: ConsolidatePRTabProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)

  const { data: cprListResponse } = useConsolidatedPrs({
    pathParams: {},
    queryParams: { PageSize: 100 },
  })

  // Map API list items to minimal PurchaseRequest shape the table rows expect
  const consolidatedPRs: PurchaseRequest[] = useMemo(() => {
    if (!cprListResponse?.data) return []
    return cprListResponse.data.map((item) => ({
      id: item.id,
      type: 'consolidated' as const,
      status: item.status.toLowerCase().includes('approved') ? 'for-bac-utilization' : ('draft' as any),
      headerDetails: {
        prNumber: item.cprNumber,
        description: item.description,
        date: item.consolidationDate,
        purpose: '',
        officeId: '',
        officeName: '',
      },
      items: [],
      totalAmount: 0,
      createdAt: item.consolidationDate,
      updatedAt: item.consolidationDate,
      createdBy: '',
    } as PurchaseRequest))
  }, [cprListResponse])

  // Calculate statistics
  const totalConsolidatedAmount = consolidatedPRs.reduce(
    (sum, pr) => sum + pr.totalAmount,
    0,
  )

  // Match the filter logic used in the "Approved/For BAC" stat card
  const approvedCount = consolidatedPRs.filter(
    (pr) => pr.status === 'approved' || pr.status === 'for-bac-utilization'
  ).length
  const draftCount = consolidatedPRs.filter((pr) => pr.status === 'draft').length

  return (
    <div className="space-y-6">
      {/* Enhanced Header - Similar to Manage PR */}
      <Card className="rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-white p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-white shadow">
                <FileText className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-foreground">Consolidate PRs</h2>
                  <span className="inline-flex items-center text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">Consolidation</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Purchase request consolidation workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button onClick={onCreateClick} size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Add Consolidated PR
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Total Consolidated PRs
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-purple-50 flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold">{consolidatedPRs.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Draft</div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-slate-50 flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="text-3xl font-bold">{draftCount}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Approved/For BAC</div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-emerald-50 flex items-center justify-center shadow-sm">
                  <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold">
                  {approvedCount}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg hover:shadow-lg transition">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-blue-50 flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">₱{totalConsolidatedAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Box */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <p className="font-medium text-blue-900">Consolidation Workflow:</p>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Create a new Consolidated PR record</li>
              <li>Add approved individual PRs by category, month, and fund</li>
              <li>The system automatically aggregates identical items</li>
              <li>Set the appropriate Mode of Procurement (MOP) for each category</li>
              <li>Submit for final approval and BAC utilization</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Consolidated PRs Table */}
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-slate-100/50">
          <CardTitle className="text-lg">Consolidated PRs</CardTitle>
          <CardDescription>List of consolidated PRs</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {consolidatedPRs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                No consolidated PRs yet
              </p>
              <Button onClick={onCreateClick} variant="outline" size="sm">
                Create Your First Consolidated PR
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>PR ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedPRs.map((pr) => (
                    <TableRow key={pr.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {pr.headerDetails.prNumber || pr.id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {pr.headerDetails.date 
                          ? new Date(pr.headerDetails.date).toLocaleDateString()
                          : new Date(pr.createdAt).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {pr.headerDetails.description || pr.headerDetails.purpose || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          color={
                            pr.status === 'draft' 
                              ? 'secondary' 
                              : pr.status === 'approved' || pr.status === 'for-bac-utilization'
                              ? 'success'
                              : 'default'
                          }
                          variant={pr.status === 'draft' ? undefined : 'outline'}
                          className="text-xs font-semibold"
                        >
                          {pr.status === 'draft' 
                            ? 'DRAFT' 
                            : pr.status === 'for-bac-utilization'
                            ? 'APPROVED/FOR BAC UTILIZATION'
                            : pr.status.toUpperCase()
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => onViewDetails(pr)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Coming Soon Dialog (shared component) */}
      <ExportComingSoonDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        entityLabel="Consolidated PR details"
      />
    </div>
  )
}
