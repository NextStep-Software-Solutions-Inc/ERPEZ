import { useNavigate } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
// Use the index route for search/navigation helpers –
// the top-level `organization.tsx` file has been removed to avoid
// duplicate route collisions. The index route lives in the same folder.
import { Route } from '@/routes/v2/_planning/organization/index'

interface OrganizationLayoutProps {
  children: React.ReactNode
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const navigate = useNavigate()
  const search = Route.useSearch()

  const { tab } = search

  const setActiveTab = (newTab: string) => {
    navigate({
      to: Route.fullPath,
      search: { ...search, tab: newTab as typeof tab, page: 1 },
      replace: true,
    })
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Card — consistent with Direct Acquisition styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Organization Structure</CardTitle>
              <CardDescription className="text-base">
                Manage and configure Organization Structure.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <Building2 className="h-3.5 w-3.5 mr-1.5" /> Organization
            </Badge>
          </div>
        </CardHeader>
      </Card>

    {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Organizational Data</CardTitle>
            <CardDescription>Manage and configure organizational units, staffing, and reporting</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={tab} onValueChange={setActiveTab}>
            <TabsList className="grid-cols-5 gap-2 p-0 w-fit">
              <TabsTrigger value="structural-management" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Structural Management</TabsTrigger>
              <TabsTrigger value="staffing-and-plantilla" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Staffing and Plantilla</TabsTrigger>
              <TabsTrigger value="personnel-reporting" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Personnel Reporting</TabsTrigger>
              <TabsTrigger value="operational-roles" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Operational Roles</TabsTrigger>
              <TabsTrigger value="settings" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
            </TabsList>
            {children}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
