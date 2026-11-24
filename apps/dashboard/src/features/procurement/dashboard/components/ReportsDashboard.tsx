import { useState } from 'react'
import {
  Award,
  Clock,
  FileSignature,
  FileText,
  Layers,
  Send,
  ShoppingBag,
  ShoppingCart,
  Zap
} from 'lucide-react'
import { PRReportTable } from './report-tables/PRReportTable'
import { ConsolidatedPRTable } from './report-tables/ConsolidatedPRTable'
import { RFQReportTable } from './report-tables/RFQReportTable'
import { NOAReportTable } from './report-tables/NOAReportTable'
import { NTPReportTable } from './report-tables/NTPReportTable'
import { POReportTable } from './report-tables/POReportTable'
import { ContractReportTable } from './report-tables/ContractReportTable'
import { DirectContractingTable } from './report-tables/DirectContractingTable'
import { DirectAcquisitionTable } from './report-tables/DirectAcquisitionTable'
import type { DashboardFiltersV2 } from '../types/dashboardV2'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ReportsDashboardProps {
  filters: DashboardFiltersV2
}

export function ReportsDashboard({ filters }: ReportsDashboardProps) {
  const [activeReport, setActiveReport] = useState<string>('prs')

  return (
    <div className="space-y-4">
      <Tabs value={activeReport} onValueChange={setActiveReport} className="w-full">
        <div className="overflow-x-auto pb-1 mb-2">
          <TabsList className="h-10 bg-muted/70 p-1 inline-flex w-auto gap-1">
            <TabsTrigger value="prs" className="text-xs gap-1.5 h-8 px-3">
              <FileText className="w-3.5 h-3.5" />
              Purchase Requests
            </TabsTrigger>
            <TabsTrigger value="cprs" className="text-xs gap-1.5 h-8 px-3">
              <Layers className="w-3.5 h-3.5" />
              Consolidated PRs
            </TabsTrigger>
            <TabsTrigger value="rfqs" className="text-xs gap-1.5 h-8 px-3">
              <Send className="w-3.5 h-3.5" />
              RFQs
            </TabsTrigger>
            <TabsTrigger value="noas" className="text-xs gap-1.5 h-8 px-3">
              <Award className="w-3.5 h-3.5" />
              Notices of Award
            </TabsTrigger>
            <TabsTrigger value="ntps" className="text-xs gap-1.5 h-8 px-3">
              <Clock className="w-3.5 h-3.5" />
              Notices to Proceed
            </TabsTrigger>
            <TabsTrigger value="pos" className="text-xs gap-1.5 h-8 px-3">
              <ShoppingCart className="w-3.5 h-3.5" />
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger value="contracts" className="text-xs gap-1.5 h-8 px-3">
              <FileSignature className="w-3.5 h-3.5" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="dc" className="text-xs gap-1.5 h-8 px-3">
              <Zap className="w-3.5 h-3.5" />
              Direct Contracting
            </TabsTrigger>
            <TabsTrigger value="da" className="text-xs gap-1.5 h-8 px-3">
              <ShoppingBag className="w-3.5 h-3.5" />
              Direct Acquisition
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="prs">
          <PRReportTable filters={filters} />
        </TabsContent>
        <TabsContent value="cprs">
          <ConsolidatedPRTable filters={filters} />
        </TabsContent>
        <TabsContent value="rfqs">
          <RFQReportTable filters={filters} />
        </TabsContent>
        <TabsContent value="noas">
          <NOAReportTable filters={filters} />
        </TabsContent>
        <TabsContent value="ntps">
          <NTPReportTable filters={filters} />
        </TabsContent>
        <TabsContent value="pos">
          <POReportTable filters={filters} />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractReportTable filters={filters} />
        </TabsContent>
        <TabsContent value="dc">
          <DirectContractingTable filters={filters} />
        </TabsContent>
        <TabsContent value="da">
          <DirectAcquisitionTable filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
