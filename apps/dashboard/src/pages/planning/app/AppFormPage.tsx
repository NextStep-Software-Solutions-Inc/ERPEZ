/**
 * Annual Performance Planning - Form-Based Page
 *
 * Complete workflow for planning:
 * 1. Select Fiscal Year via toolbar dropdown
 * 2. Activate & manage KPIs for the selected fiscal year
 * 3. Distribute targets across delivery units
 *
 * Follows fund-receiving pattern for consistency.
 */

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClipboardList, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AppStep2Form from '@/components/features/planning/annual-performance-planning/forms/AppStep2Form'
import AppStep3Form from '@/components/features/planning/annual-performance-planning/forms/AppStep3Form'
import type {
  ActivatedKPI,
  AppFiscalYear,
  KPITarget,
} from '@/features/planning/annual-performance-planning/appTypes'

export default function AppFormPage() {
  // Planning workflow state
  const [selectedFY, setSelectedFY] = useState<AppFiscalYear | undefined>(undefined)
  const [activatedKPIs, setActivatedKPIs] = useState<ActivatedKPI[]>([])
  const [kpiCount, setKpiCount] = useState(0)
  const [savedTargets, setSavedTargets] = useState<KPITarget[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState('kpis')

  // Planning workflow handlers
  const handleStep2Submit = (data: ActivatedKPI[]) => {
    setActivatedKPIs(data)
    setKpiCount(data.length)
    setActiveTab('targets')
  }

  const handleStep3Submit = (data: KPITarget[]) => {
    setSavedTargets(data)
    setIsCompleted(true)
    console.log('APP workflow completed with targets:', data)
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header - match KPI Library / Fiscal Year & Policies styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Annual Performance Planning</CardTitle>
              <CardDescription className="text-base">
                Configure performance planning parameters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Fiscal Year */}
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                {selectedFY ? `FY ${selectedFY.year}` : 'No FY Selected'}
              </Badge>

              {/* KPIs Count */}
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                {kpiCount} KPIs
              </Badge>

              {/* Status */}
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                {isCompleted ? '✅ Completed' : '⏱️ In Progress'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {/* Planning Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kpis">
              Active KPIs
            </TabsTrigger>
            <TabsTrigger value="targets">
              Distribute Targets
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: KPI Activation */}
          <TabsContent value="kpis" className="space-y-4">
            <AppStep2Form
              onSubmit={handleStep2Submit}
              onFiscalYearChange={setSelectedFY}
              onKPIsCountChange={setKpiCount}
              initialActiveKPIs={activatedKPIs}
              selectedFiscalYearId={selectedFY?.id}
            />
          </TabsContent>

          {/* Tab 2: Target Distribution */}
          <TabsContent value="targets" className="space-y-4">
            {activatedKPIs.length > 0 ? (
              <AppStep3Form
                fiscalYearId={selectedFY?.id || ''}
                activeKPIs={activatedKPIs}
                onSubmit={handleStep3Submit}
                isFiscalYearLocked={selectedFY?.isLocked || false}
                onTargetsUpdate={(updatedKPIs) => setActivatedKPIs(updatedKPIs)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-150 shadow-sm min-h-[350px]">
                <div className="rounded-full bg-amber-50 p-4 mb-4 text-amber-600 animate-pulse">
                  <ClipboardList className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Active KPIs
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-6 text-sm">
                  Before you can distribute targets across delivery units, you must first select and activate KPIs for the selected fiscal year in the Active KPIs tab.
                </p>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab('kpis')}
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                >
                  Go to Active KPIs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

