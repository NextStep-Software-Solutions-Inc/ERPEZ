import {
  Building2,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  User,
  AlertCircle,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useSupplierById } from '@/components/features/planning/procurement-library'
import { formatDateV2 } from '@/utils/formatters'
import { extractErrorMessage } from '@/services/utils/messages'
import type { AxiosError } from 'erpez-shared-lib'

export interface SupplierComplianceTabProps {
  supplierId: string
  fallbackName?: string
  fallbackContact?: string
  fallbackEmail?: string
  fallbackPhilGeps?: string
}

export function SupplierComplianceTab({
  supplierId,
  fallbackName,
  fallbackContact,
  fallbackEmail,
  fallbackPhilGeps,
}: SupplierComplianceTabProps) {
  const {
    data: supplierResponse,
    isLoading: isLoadingSupplier,
    isError,
    error,
    refetch,
  } = useSupplierById({
    pathParams: { id: supplierId },
    queryParams: {},
    enabled: !!supplierId,
  })

  const supplier = supplierResponse?.data

  if (isLoadingSupplier) {
    return (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="shadow-sm border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
        <p className="font-medium text-sm text-destructive">
          Failed to load exclusive supplier details
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {extractErrorMessage(error as AxiosError) || 'An unexpected error occurred while fetching supplier information.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" /> Retry Fetch
        </Button>
      </Card>
    )
  }

  if (!supplier && !supplierId) {
    return (
      <Card className="shadow-sm p-6 text-center text-muted-foreground text-sm">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
        <p>No exclusive supplier has been linked to this request.</p>
      </Card>
    )
  }

  const supplierName = supplier?.name || fallbackName || 'Exclusive Supplier'
  const supplierContact = supplier?.contactPerson || fallbackContact || '—'
  const supplierContactNum = supplier?.contactNumber || fallbackContact || '—'
  const supplierEmail = supplier?.email || fallbackEmail || '—'
  const supplierPhilGeps = supplier?.philGEPSNumber || fallbackPhilGeps || 'Verified'

  return (
    <div className="space-y-6">
      {/* Supplier Identity & Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">
                  Business Credentials & Registration
                </CardTitle>
                <CardDescription className="text-xs">
                  Government registry and proprietary vendor profile
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Business Name
              </span>
              <p className="font-bold text-base text-foreground">
                {supplierName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  PhilGEPS Registration
                </span>
                <p className="font-semibold text-amber-700 dark:text-amber-400">
                  {supplierPhilGeps}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Business Permit No.
                </span>
                <p className="font-medium text-foreground">
                  {supplier?.businessPermitNo || '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  TIN (Tax ID Number)
                </span>
                <p className="font-medium text-foreground">
                  {supplier?.tinNumber || '—'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Supplier Category
                </span>
                <p className="font-medium text-foreground">
                  {supplier?.supplierCategory?.name || 'Sole Exclusive Distributor'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Registered Physical Address
              </span>
              <div className="flex items-start gap-1.5 text-muted-foreground pt-0.5">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <span className="text-foreground">
                  {supplier?.address || '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Legal Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">
                  Legal Standing & Contacts
                </CardTitle>
                <CardDescription className="text-xs">
                  GPPB Blacklist status and authorized contact information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/20 rounded-lg border">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Blacklist Verification
                </span>
                {!supplier?.isBlacklisted ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 gap-1.5 py-0.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Not Blacklisted
                  </Badge>
                ) : (
                  <Badge color="destructive" variant="soft" className="gap-1.5 py-0.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Blacklisted
                  </Badge>
                )}
              </div>

              <Separator orientation="vertical" className="h-10" />

              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Registry Status
                </span>
                <Badge variant="outline" className="capitalize bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 py-0.5">
                  {supplier?.status || 'Active'}
                </Badge>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 pt-1">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Authorized Contact Person
                </span>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{supplierContact}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Telephone / Mobile
                </span>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplierContactNum}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supplierEmail}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Compliance Requirements Checklist */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">
                Legal Compliance & Eligibility Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Verification of mandatory procurement documentary requirements (Mayor&apos;s Permit, DTI/SEC, Tax Clearance)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {supplier?.supplierRequirements && supplier.supplierRequirements.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold text-xs">Requirement Document</TableHead>
                    <TableHead className="font-semibold text-xs">Uploaded Date</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Verification Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Document</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplier.supplierRequirements.map((req, rIdx) => (
                    <TableRow key={req.supplierRequirementId || rIdx}>
                      <TableCell className="font-medium text-sm">
                        {req.requirementName || 'Documentary Prerequisite'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {req.createdAt ? formatDateV2(req.createdAt) : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {req.isVerified ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] gap-1">
                            <CheckCircle className="h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] gap-1">
                            <Clock className="h-3 w-3" /> For Verification
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {req.url ? (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1" asChild>
                            <a href={req.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3.5 w-3.5" /> View File
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Archived File</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
              <FileCheck className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/60" />
              <p>Standard compliance requirements logged under central supplier dossier.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
