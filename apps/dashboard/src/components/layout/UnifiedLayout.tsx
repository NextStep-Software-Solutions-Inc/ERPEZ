import { useMemo } from 'react'
import { Outlet, useLocation } from '@tanstack/react-router'
import { UnifiedAppSidebar } from '../UnifiedAppSidebar'
import { SearchForm } from '../SearchForm'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { navigationGroup } from '@/data/navigation-group'

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return { label, href }
  })
  return breadcrumbs
}

export default function UnifiedLayout() {
  const location = useLocation()
  const breadcrumbs = useMemo(
    () => generateBreadcrumbs(location.pathname),
    [location.pathname],
  )
  // const { role } = useKeycloak();
  // const navigationLinks = roleNavigationMap[role as UserRole];
  // const displayName = ROLE_DISPLAY_NAMES[role as UserRole];

  return (
    <SidebarProvider>
      <UnifiedAppSidebar
        navigationLinks={navigationGroup}
        tenant={'ERP Super Admin'}
        tenantOrganization={'Enterprise'}
      />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex flex-row justify-between h-16 shrink-0 items-center gap-2 border-b px-4 bg-white dark:bg-background">
          <div className="flex flex-row items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                    <BreadcrumbItem className="hidden md:block">
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div>
            <SearchForm />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 min-h-0 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
