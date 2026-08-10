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

    // Merge current search params with the updater result and build a clean search object
    const merged = { ...searchParams, ...next }
    const clean: PPMPManagementSearch = {
      view: (merged.view ?? 'department') as 'department' | 'office',
      pageNumber: (merged.pageNumber ?? 1) as number,
      pageSize: (merged.pageSize ?? 10) as number,
      searchQuery: merged.searchQuery ?? undefined,
      status: merged.status ?? undefined,
      fiscalYearId: merged.fiscalYearId ?? undefined,
      officeId: merged.officeId ?? undefined,
      lib: merged.lib && merged.lib !== 'all' ? merged.lib : undefined,
      sortBy: merged.sortBy ?? undefined,
      sortOrder: merged.sortOrder ?? undefined,
    }

    navigate({ search: clean })
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
