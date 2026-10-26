/**
 * Procurement Library Page - V2
 * Leverages Dashtail UI design system for consistent visual design
 */

import { useNavigate, useSearch } from '@tanstack/react-router'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Package as PackageIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { ItemMasterTab } from '@/components/features/planning/procurement-library/tabs/ItemMasterTab'
import { ModesOfProcurementTab } from '@/components/features/planning/procurement-library/tabs/ModesOfProcurementTab'
import { PriceCatalogueTab } from '@/components/features/planning/procurement-library/tabs/PriceCatalogueTab'
import { UnitOfMeasurementTab } from '@/components/features/planning/procurement-library/tabs/UnitOfMeasurementTab'
import { SuppliersTab } from '@/components/features/planning/procurement-library/tabs/SuppliersTab'
import { ProcurementActivitiesTab } from '@/components/features/planning/procurement-library/tabs/ProcurementActivitiesTab'
import { SettingsTab } from '@/components/features/planning/procurement-library/tabs/SettingsTab'
import { ResolutionClausesTab } from '@/components/features/planning/procurement-library/tabs/ResolutionClausesTab'

const CatalogMasterPage = lazy(() =>
  import('@/features/planning/ppmp/catalog/components/CatalogMasterPage').then(
    (module) => ({ default: module.CatalogMasterPage }),
  ),
)

/**
 * Tab configuration with metadata
 */
const TAB_CONFIG = [
  {
    id: 'ItemMaster',
    label: 'Item Master',
    description: 'Manage procurement items and inventory',
    icon: '📦',
  },
  {
    id: 'catalog',
    label: 'Catalog',
    description: 'Manage the PPMP catalog workspace',
    icon: '🗂️',
  },
  {
    id: 'Modes',
    label: 'Modes of Procurement',
    description: 'Define procurement methods',
    icon: '🔄',
  },
  {
    id: 'Pricing',
    label: 'Price Catalogue',
    description: 'Manage price listings',
    icon: '💰',
  },
  {
    id: 'UOM',
    label: 'Unit of Measurement',
    description: 'Configure units of measurement',
    icon: '📏',
  },
  {
    id: 'Suppliers',
    label: 'Suppliers',
    description: 'Manage supplier information',
    icon: '🏢',
  },
  {
    id: 'Activities',
    label: 'Procurement Activities & Timeline',
    description: 'Define procurement activities and timelines',
    icon: '⏱️',
  },
  {
    id: 'ResolutionClauses',
    label: 'Resolution Clauses',
    description: 'Manage BAC resolution legal clause templates',
    icon: '📜',
  },
  {
    id: 'Settings',
    label: 'Settings',
    description: 'Manage categories and UNSPSC codes',
    icon: '⚙️',
  },
]

/**
 * Component mapping for tabs
 */
const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  'ItemMaster': ItemMasterTab,
  catalog: CatalogMasterPage,
  'Modes': ModesOfProcurementTab,
  'Pricing': PriceCatalogueTab,
  'UOM': UnitOfMeasurementTab,
  'Suppliers': SuppliersTab,
  'Activities': ProcurementActivitiesTab,
  'ResolutionClauses': ResolutionClausesTab,
  'Settings': SettingsTab,
}

export default function ProcurementLibraryPageV2() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v2/procurement-library' })

  const { tab } = search

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const hasDraggedRef = useRef(false)

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    checkScroll()

    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)

    const observer = new ResizeObserver(() => checkScroll())
    observer.observe(el)

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [checkScroll])

  // Automatically scroll active tab into view
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const activeEl = el.querySelector<HTMLElement>('[data-state="active"]')
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      })
    }
  }, [tab])

  const handleScroll = () => {
    checkScroll()
  }

  const scrollByAmount = (amount: number) => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  // Convert vertical mouse wheel to horizontal scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current
    if (!el) return
    if (e.deltaY !== 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY
      checkScroll()
    }
  }

  // Drag-to-scroll panning
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current
    if (!el) return
    setIsDragging(true)
    hasDraggedRef.current = false
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftRef.current = el.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const el = scrollContainerRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startXRef.current) * 1.2
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true
    }
    el.scrollLeft = scrollLeftRef.current - walk
    checkScroll()
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  const setActiveTab = (newTab: string) => {
    if (hasDraggedRef.current) {
      // Prevent tab switch when dragging
      return
    }
    navigate({
      to: `/v2/procurement-library`,
      search: { tab: newTab as typeof tab },
      replace: true,
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Procurement Library</CardTitle>
              <CardDescription className="text-base">
                Centralized reference library for standardized procurement data used in PPMP and APP planning
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <PackageIcon className="h-3.5 w-3.5 mr-1.5" /> Reference Library
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage and configure procurement reference data</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation with Left/Right Arrows, Dragging, and Wheel Scrolling */}
            <div className="relative mb-6 flex items-center group">
              {/* Left Arrow Button */}
              {canScrollLeft && (
                <div className="absolute left-0 z-10 flex h-full items-center bg-gradient-to-r from-card via-card/90 to-transparent pr-4 pl-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm bg-background hover:bg-muted border-border"
                    onClick={() => scrollByAmount(-260)}
                    title="Scroll Left"
                    aria-label="Scroll Left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Scrollable & Draggable Tab Strip */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className={cn(
                  'w-full overflow-x-auto scrollbar-hide py-1 px-1 transition-all select-none',
                  isDragging ? 'cursor-grabbing' : 'cursor-grab',
                )}
                style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
              >
                <TabsList className="inline-flex h-auto w-auto min-w-full justify-start gap-1.5 bg-muted/50 p-1.5 rounded-lg scrollbar-hide">
                  {TAB_CONFIG.map((t) => (
                    <TabsTrigger
                      key={t.id}
                      value={t.id}
                      className="shrink-0 px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap rounded-md"
                      title={t.description}
                    >
                      <span className="mr-1.5">{t.icon}</span>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Right Arrow Button */}
              {canScrollRight && (
                <div className="absolute right-0 z-10 flex h-full items-center bg-gradient-to-l from-card via-card/90 to-transparent pl-4 pr-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm bg-background hover:bg-muted border-border"
                    onClick={() => scrollByAmount(260)}
                    title="Scroll Right"
                    aria-label="Scroll Right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>


            {/* Tab Contents */}
            {TAB_CONFIG.map((tab) => {
              const TabComponent = TAB_COMPONENTS[tab.id]
              return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  {/* Tab content */}
                  {TabComponent &&
                    (tab.id === 'catalog' ? (
                      <Suspense
                        fallback={
                          <div className="flex h-64 items-center justify-center">
                            <Spinner size="lg" />
                          </div>
                        }
                      >
                        <TabComponent />
                      </Suspense>
                    ) : (
                      <TabComponent />
                    ))}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
