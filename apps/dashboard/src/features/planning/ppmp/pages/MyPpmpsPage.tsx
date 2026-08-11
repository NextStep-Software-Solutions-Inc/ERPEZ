import { lazy, Suspense } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PPMPManagementSearch } from '@/routes/v2/(planning)/ppmp/constants'

// Lazy load the tab components
const DepartmentPpmpTab = lazy(() => import('./tabs/DepartmentPpmpTab'))
const OfficePpmpTab = lazy(() => import('./tabs/OfficePpmpTab'))

interface MyPpmpsPageProps {
  searchParams: PPMPManagementSearch
}

export function MyPpmpsPage({ searchParams }: MyPpmpsPageProps) {
  const navigate = useNavigate({ from: '/v2/ppmp/' })
  const { view = 'department' } = searchParams

  const handleUpdateSearch = (
    updater: (prev: PPMPManagementSearch) => Partial<PPMPManagementSearch>,
  ) => {
    const next = updater(searchParams)
    navigate({
      search: (prev) => {
        const merged = {
          ...(prev as PPMPManagementSearch),
          ...next,
        } as Partial<PPMPManagementSearch>

        const clean: PPMPManagementSearch = {
          view: (merged.view as 'department' | 'office') ?? 'department',
          pageNumber: (merged.pageNumber as number) ?? 1,
          pageSize: (merged.pageSize as number) ?? 10,
          consolidated:
            (merged.consolidated as
              'all' | 'consolidated' | 'not_consolidated') ?? 'all',
        }

        if (merged.searchQuery) clean.searchQuery = merged.searchQuery
        if (merged.status && merged.status !== 'all')
          clean.status = merged.status
        if (merged.fiscalYearId) clean.fiscalYearId = merged.fiscalYearId
        if (merged.officeId) clean.officeId = merged.officeId
        if (merged.lib && merged.lib !== 'all') clean.lib = merged.lib
        if (merged.sortBy) clean.sortBy = merged.sortBy
        if (merged.sortOrder) clean.sortOrder = merged.sortOrder

        return clean
      },
    })
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/70 bg-white shadow-sm">
        <CardContent className="space-y-4 p-4">
          <Tabs
            value={view}
            onValueChange={(val) =>
              handleUpdateSearch(() => ({
                view: val as 'department' | 'office',
                pageNumber: 1,
                searchQuery: '',
                status: 'all',
                fiscalYearId: '',
                officeId: '',
                lib: 'all',
                consolidated: 'all',
              }))
            }
            className="w-full"
          >
            <TabsList className="flex border-b border-border/70 rounded-none bg-transparent h-auto p-0 gap-6 w-full justify-start mb-2">
              <TabsTrigger
                value="department"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground shadow-none"
              >
                Department Level
              </TabsTrigger>
              <TabsTrigger
                value="office"
                className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground shadow-none"
              >
                Office Level
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            {view === 'office' ? (
              <OfficePpmpTab
                searchParams={searchParams}
                handleUpdateSearch={handleUpdateSearch}
              />
            ) : (
              <DepartmentPpmpTab
                searchParams={searchParams}
                handleUpdateSearch={handleUpdateSearch}
              />
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
