import { useEffect, useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useCanGoBack,
  useNavigate,
  useParams,
  useRouter,
} from '@tanstack/react-router'
import { MoveLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getKpiDetailsRequest } from '@/components/features/planning/kpi/handlers/getKpiDetailsRequest'
import {
  KpiBasicInfoCard,
  ModeOfVerificationCard,
  PerformanceMeasureCard,
  TargetCard,
  TargetAssignmentCard,
} from '@/components/features/planning/kpi/components'
import { OPCRActivityTab } from '@/components/features/planning/opcrActivity/OPCRActivityTab'
import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/PageContainer'
import { KpiProvider } from '@/providers/KpiProvider'

const useKpiDetails = createQueryHookFromTemplate(getKpiDetailsRequest)

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
      staggerChildren: 0.08,
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const tabContentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
}

const getTabOrder = (opcrActivity: boolean = false) => {
  const baseTabs = ['basic', 'performance', 'target', 'assignment', 'verification']
  return opcrActivity ? [...baseTabs, 'activity'] : baseTabs
}

interface KpiDetailsPageProps {
  kpiId: string
  /** When true, this page displays a SubKPI (hides View Sub-KPI link, changes back button text) */
  isSubKpi?: boolean
  /** Parent KPI ID, required when isSubKpi is true for proper navigation */
  parentKpiId?: string
  /** When true, the page is in read-only mode (no edit/delete actions) */
  readOnly?: boolean
  /** When true, this is the DU view (affects back button navigation) */
  isDuView?: boolean
  /** When true, this will add another tab for OPCR Activity */
  opcrActivity?: boolean
}

function KpiDetailsPage({
  kpiId,
  isSubKpi = false,
  parentKpiId,
  isDuView = false,
  opcrActivity = false,

}: KpiDetailsPageProps) {
  const params = useParams({ strict: false })
  const deliveryUnitId = params.deliveryUnitId
  const opcrId = params.opcrId
  const functionType = params.functionType
  const [activeTab, setActiveTab] = useState('basic')
  const [direction, setDirection] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const navigate = useNavigate()

  const { data: kpi, isLoading } = useKpiDetails({
    pathParams: { id: kpiId },
    queryParams: {},
  })

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const handleTabChange = (newTab: string) => {
    const tabOrder = getTabOrder(opcrActivity)
    const oldIndex = tabOrder.indexOf(activeTab)
    const newIndex = tabOrder.indexOf(newTab)
    setDirection(newIndex > oldIndex ? 1 : -1)
    setActiveTab(newTab)
  }


  const handleViewSubKpi = () => {
    let to: string
    if (isSubKpi && parentKpiId) {
      to = `/planning/kpi/${parentKpiId}/subKpi/`
    } else if (isDuView && deliveryUnitId && !opcrActivity) {
      to = `/planning/${deliveryUnitId}/opcr/kpi/${kpiId}/subKpi/`
      // console.log({ to: `/planning/${deliveryUnitId}/opcr/kpi/${kpiId}/subKpi/$kpiId` })
    } else if (isDuView && opcrActivity && deliveryUnitId && opcrId && functionType) {
      to = `/planning/${deliveryUnitId}/opcr/${opcrId}/kpi/${functionType}/${kpiId}/subKpi/`
    } else {
      to = `/planning/kpi/${kpiId}/subKpi/`
    }
    navigate({ to })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!kpi?.data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          {isSubKpi ? 'Sub-KPI' : 'KPI'} not found
        </p>
      </div>
    )
  }

  const kpiData = kpi.data

  return (
    <KpiProvider kpiData={kpiData}>
      <PageContainer
        title={kpiData.name}
        description={kpiData.description}
        backTo
        actions={
          !isSubKpi ?
            <Button variant={'ghost'} className='p-0 text-blue-700 underline' onClick={handleViewSubKpi}>View Sub-KPI</Button>
            : undefined}>
        <motion.div
          variants={prefersReducedMotion ? undefined : pageVariants}
          initial="hidden"
          animate="show"
          className=" space-y-6"
        >

          {/* Metadata Badges */}
          <motion.div
            variants={prefersReducedMotion ? undefined : headerVariants}
            className="flex flex-wrap gap-2"
          >
            {kpiData.status && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Status: {kpiData.status}
              </Badge>
            )}
            {(kpiData as any).isGAD && (
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                ⚥ GAD Indicator
              </Badge>
            )}
            {(kpiData as any).distributionBehavior && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Distribution: {(kpiData as any).distributionBehavior}
              </Badge>
            )}
            {(kpiData as any).isOptInAvailable && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✓ Opt-In Available
              </Badge>
            )}
            {(kpiData as any).monitoringFrequency && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Monitoring: {(kpiData as any).monitoringFrequency}
              </Badge>
            )}
          </motion.div>

          {/* Tabs */}
          <motion.div
            variants={prefersReducedMotion ? undefined : headerVariants}
          >
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="bg-muted/60">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="performance">Performance Measure</TabsTrigger>
                <TabsTrigger value="target">Target</TabsTrigger>
                <TabsTrigger value="assignment">Target Assignment</TabsTrigger>
                <TabsTrigger value="verification">
                  Mode of Verification
                </TabsTrigger>
                {opcrActivity && (
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                )}
              </TabsList>

              {/* Tab content with AnimatePresence */}
              <div className="mt-4 relative">
                <AnimatePresence mode="wait" custom={direction}>
                  {activeTab === 'basic' && (
                    <motion.div
                      key="basic"
                      custom={direction}
                      variants={
                        prefersReducedMotion ? undefined : tabContentVariants
                      }
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <TabsContent value="basic" forceMount className="mt-0">
                        <KpiBasicInfoCard />
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'performance' && (
                    <motion.div
                      key="performance"
                      custom={direction}
                      variants={
                        prefersReducedMotion ? undefined : tabContentVariants
                      }
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <TabsContent
                        value="performance"
                        forceMount
                        className="mt-0"
                      >
                        <PerformanceMeasureCard />
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'target' && (
                    <motion.div
                      key="target"
                      custom={direction}
                      variants={
                        prefersReducedMotion ? undefined : tabContentVariants
                      }
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <TabsContent value="target" forceMount className="mt-0">
                        <TargetCard />
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'assignment' && (
                    <motion.div
                      key="assignment"
                      custom={direction}
                      variants={
                        prefersReducedMotion ? undefined : tabContentVariants
                      }
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <TabsContent value="assignment" forceMount className="mt-0">
                        <TargetAssignmentCard />
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'verification' && (
                    <motion.div
                      key="verification"
                      custom={direction}
                      variants={
                        prefersReducedMotion ? undefined : tabContentVariants
                      }
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <TabsContent
                        value="verification"
                        forceMount
                        className="mt-0"
                      >
                        <ModeOfVerificationCard />
                      </TabsContent>
                    </motion.div>
                  )}

                  {opcrActivity && activeTab === 'activity' && (
                    <motion.div
                      key="activity"
                      custom={direction}
                      variants={
                        prefersReducedMotion ? undefined : tabContentVariants
                      }
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <OPCRActivityTab
                        kpiId={kpiId}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
    </PageContainer>
    </KpiProvider>
  )
}

export default KpiDetailsPage

export const BackButton = () => {
  const canGoBack = useCanGoBack()
  const router = useRouter()

  const handleBack = () => {
    if (canGoBack) {
      router.history.back()
    }
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBack}
      className="gap-2"
      disabled={!canGoBack}
    >
      <MoveLeft className="w-4 h-4" />
      Back to Previous Page
    </Button>
  )
}
