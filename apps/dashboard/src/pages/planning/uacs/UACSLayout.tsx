import { useNavigate, useSearch } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface UACSLayoutProps {
  children: React.ReactNode
}

/**
 * UACS Library Layout Component
 * 
 * Provides the main tabbed navigation for the UACS Library module.
 * Three main sections:
 * 1. Code Segments - CRUD operations for 5 core UACS elements
 * 2. Rules & Validation - Define and manage validation rules
 * 3. Data Management - Import/export and synchronization
 */
export default function UACSLayout({ children }: UACSLayoutProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v2/(planning)/uacs-library/' })

  const { tab = 'code-segments' } = search

  const setActiveTab = (newTab: string) => {
    navigate({
      to: `/v2/uacs-library`,
      search: { ...search, tab: newTab as typeof tab, page: 1 },
      replace: true,
    })
  }

  return (
    <PageContainer forTable hideHeader>
      {/* Header - match Fiscal Year & Policies styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-4">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">UACS Library</CardTitle>
              <CardDescription className="text-base">
                Unified Accounts Code Structure — Centralized management for financial codes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> UACS
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tab Navigation */}
      <Tabs value={tab} onValueChange={setActiveTab} className="w-full border-b mb-4 min-w-0">
        <TabsList className="flex relative top-4 w-full max-w-[600px] mb-5 overflow-x-auto">
          <TabsTrigger value="code-segments">Code Segments</TabsTrigger>
          <TabsTrigger value="rules">Rules & Validation</TabsTrigger>
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </PageContainer>
  )
}
