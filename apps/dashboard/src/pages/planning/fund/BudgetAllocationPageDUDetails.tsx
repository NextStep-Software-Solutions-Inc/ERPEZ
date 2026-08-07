import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { 
  Calendar, 
  NotebookTabs, 
  User, 
  Wallet 
} from 'lucide-react'
import type { MetaActions } from '@/types/global'
import { PageContainer } from '@/components/PageContainer'
import { getDUAllocationRequest } from '@/components/features/planning/budget-allocation/handlers/getDUAllocationRequest'
import { getDUFundAllocationsRequest } from '@/components/features/planning/budget-allocation/handlers/getDUFundAllocationsRequest'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyPHP, formatDate, toSentenceCase } from '@/utils/formatters'

const useBudgetAllocation = createQueryHookFromTemplate(getDUAllocationRequest)
const useDUFundAllocations = createQueryHookFromTemplate(getDUFundAllocationsRequest)

interface BudgetAllocationPageDUDetailsProps {
  budgetAllocationId: string
  actions: MetaActions
}

export default function BudgetAllocationPageDUDetails({
  budgetAllocationId,
}: BudgetAllocationPageDUDetailsProps) {
  const { data: allocationData, isLoading } = useBudgetAllocation({
    pathParams: { id: budgetAllocationId },
    queryParams: {},
  })

  const allocation = allocationData?.data

  const { data: duFundAllocationsData } = useDUFundAllocations({
    pathParams: {},
    queryParams: { filters: `duAllocationId==${budgetAllocationId}`, pageSize: 1000 },
  })

  const groupedFunds = duFundAllocationsData?.data?.reduce((acc, fund) => {
    const sourceName = fund.receivedFund.fundSource.name
    if (!acc[sourceName]) {
      acc[sourceName] = []
    }
    acc[sourceName].push(fund)
    return acc
  }, {} as Record<string, Array<any>>) || {}

  if (isLoading) {
    return (
      <PageContainer title="Budget Allocation Details" backTo={true} backLabel="Back">
        <div className="flex items-center justify-center h-64 animate-pulse text-muted-foreground">
          Loading allocation details...
        </div>
      </PageContainer>
    )
  }

  if (!allocation) return null
  return (
    <PageContainer
      backTo={{
        to: '/planning/fund/$budgetAllocationId',
        params: { budgetAllocationId: allocation.deliveryUnit.id },
        search: { page: 'delivery-unit' },
      }}
      backLabel="Back to Budget Allocations"
    >
      <div className="space-y-6 mx-auto">
        
        {/* General Information Card */}
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">General Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Office Head */}
              <div className="col-span-1 space-y-6">

                <div className="flex gap-3">
                  <div className="p-2 rounded-md h-fit">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Office Head</p>
                    <p className="text-sm font-semibold">
                      {allocationData?.data?.deliveryUnit?.office?.officeHead || 'John Doe'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex gap-3">
                <div className="p-2 rounded-md h-fit">
                  <Wallet className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrencyPHP(allocation.amount)}
                  </p>
                </div>
              </div>

              {/* Date Assigned */}
              <div className="flex gap-3">
                <div className="p-2 rounded-md h-fit">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date Assigned</p>
                  <p className="text-sm font-semibold">
                    {formatDate(allocation.createdAt)}
                  </p>
                </div>
              </div>
              {/* Purpose set this to full width */}
                <div className="flex gap-1 md:col-span-3">
                  <div className="p-2 rounded-md h-fit">
                    <NotebookTabs className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                    <p className="text-sm font-semibold leading-relaxed">
                      {toSentenceCase(allocation.purpose) || 'N/A'}
                    </p>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Fund Received Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold px-1">Fund Received</h3>
          
          {Object.entries(groupedFunds).map(([sourceName, funds]) => (
            <Card key={sourceName} className="shadow-sm border-none">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-bold">{sourceName}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-4">
                {funds.map((fund) => {
                  const percentage = ((fund.amount / allocation.amount) * 100).toFixed(2)
                  return (
                    <div 
                      key={fund.id} 
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{toSentenceCase(fund.receivedFund.description)}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {percentage}% of total allocation
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">
                          {formatCurrencyPHP(fund.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
          
          {!duFundAllocationsData?.data?.length && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No funds associated with this allocation.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}