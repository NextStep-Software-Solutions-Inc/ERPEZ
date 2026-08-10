import { motion } from 'framer-motion'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { KpiActionMenu } from './KpiActionMenu'
import { SubKpiCard } from './SubKpiCard'
import { KpiDetailsSection } from './KpiDetailsSection'
import type { KPI } from '@/components/features/planning/kpi/types'
import { getSubKpisRequest } from '@/components/features/planning/kpi/subKpi/handlers/getSubKpisRequest'
import { getDuKpiAssignmentsRequest } from '@/components/features/planning/kpi-assignment-for-du/handlers/getDuKpiAssignmentsRequest'
import AddOPCRActivityDialog from '@/components/features/planning/opcrActivity/dialogs/AddOPCRActivityDialog'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import {
  cardHoverVariants,
  cardVariants,
  containerVariants,
} from '@/utils/animation'
import { useKpiDelete } from '@/hooks/useKpiDelete'

interface KpiAccordionItemProps {
  kpi: KPI
  index: number
  colors: {
    border: string
    text: string
    badge: string
  }
  prefersReducedMotion: boolean
}

const useSubKpis = createQueryHookFromTemplate(getSubKpisRequest)
const useDuKpiAssignments = createQueryHookFromTemplate(
  getDuKpiAssignmentsRequest,
)

export function KpiAccordionItem({
  kpi,
  index,
  colors,
  prefersReducedMotion,
}: KpiAccordionItemProps) {
  const { deliveryUnitId, opcrId, functionType } = useParams({
    from: '/v1/planning/$deliveryUnitId/opcr/$opcrId/kpi/$functionType/',
  })
  const navigate = useNavigate()
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteSubKpiDialogOpen, setDeleteSubKpiDialogOpen] = useState<
    string | null
  >(null)
  const { deleteKpi, isPending } = useKpiDelete()

  const { data: subKpisData, isLoading: isLoadingSubKpis } = useSubKpis({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 999,
      filters: `parentKPIId==${kpi.id}`,
    },
  })

  const { data: kpiAssignmentsData } = useDuKpiAssignments({
    pathParams: {},
    queryParams: { filters: `kpiId==${kpi.id}` },
  })

  const subKpis = subKpisData?.data || []
  const hasSubKpis = subKpis.length > 0

  const handleNavigateToKpi = () => {
    navigate({
      to: `/planning/${deliveryUnitId}/opcr/${opcrId}/kpi/${functionType}/${kpi.id}`,
    })
  }

  const handleDeleteKpi = () => {
    deleteKpi(kpi.id, () => setDeleteDialogOpen(false))
  }

  const handleDeleteSubKpi = (subKpiId: string) => {
    deleteKpi(subKpiId, () => setDeleteSubKpiDialogOpen(null))
  }
  if (!isLoadingSubKpis && !hasSubKpis) {
    return (
      <div className="px-6">
        <motion.div
          initial={prefersReducedMotion ? 'show' : 'hidden'}
          animate="show"
          variants={cardVariants}
          whileHover={
            prefersReducedMotion ? undefined : (cardHoverVariants.hover as any)
          }
        >
          <div
            className={cn(
              'border rounded-lg px-4',
              colors.border,
              'border-l-4',
            )}
          >
            <div className="flex items-start justify-between w-full pr-4 py-4">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{kpi.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className="border-blue-600 rounded-sm w-14"
                  variant={'outline'}
                >
                  <p className="text-xs font-light text-blue-600">KPI</p>
                </Badge>
                <KpiActionMenu
                  onView={handleNavigateToKpi}
                  onRemove={() => setDeleteDialogOpen(true)}
                />
              </div>
            </div>
            <div className="space-y-4 pb-4">
              <KpiDetailsSection kpi={kpi} />
            </div>
          </div>
        </motion.div>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                KPI "{kpi.name}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteKpi}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AddOPCRActivityDialog
          open={addActivityDialogOpen}
          onOpenChange={setAddActivityDialogOpen}
          kpiId={kpi.id}
          opcrId={opcrId}
          deliveryUnitId={deliveryUnitId}
          dukpiAssignmentId={kpiAssignmentsData?.data[0]?.id || ''}
        />
      </div>
    )
  }
  return (
    <div className="px-6">
      <motion.div
        initial={prefersReducedMotion ? 'show' : 'hidden'}
        animate="show"
        variants={cardVariants}
        whileHover={
          prefersReducedMotion ? undefined : (cardHoverVariants.hover as any)
        }
      >
        <AccordionItem
          value={`kpi-${index}`}
          className={cn('border rounded-lg px-4', colors.border, 'border-l-4')}
        >
          <AccordionTrigger className="hover:no-underline flex-row-reverse justify-end">
            <div className="flex items-start justify-between w-full pl-4">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{kpi.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className="border-blue-600 rounded-sm w-14"
                  variant={'outline'}
                >
                  <p className="text-xs font-light text-blue-600">KPI</p>
                </Badge>
                <KpiActionMenu
                  onView={handleNavigateToKpi}
                  onAdd={() => setAddActivityDialogOpen(true)}
                  onRemove={() => setDeleteDialogOpen(true)}
                />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <KpiDetailsSection kpi={kpi} />
              {isLoadingSubKpis ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : hasSubKpis ? (
                <motion.div
                  initial={prefersReducedMotion ? 'show' : 'hidden'}
                  animate="show"
                  variants={containerVariants}
                  className="space-y-2"
                >
                  <div className={cn('space-y-2 pl-6 border-l-2 ml-2')}>
                    {subKpis.map((subKpi: KPI) => (
                      <SubKpiCard
                        key={subKpi.id}
                        subKpi={subKpi}
                        prefersReducedMotion={prefersReducedMotion}
                        onView={() => console.log('View Sub-KPI:', subKpi.id)}
                        onAddActivity={() =>
                          console.log('Add Activity:', subKpi.id)
                        }
                        onDelete={() => setDeleteSubKpiDialogOpen(subKpi.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No sub-KPIs for this KPI
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </motion.div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the KPI
              "{kpi.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKpi}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {deleteSubKpiDialogOpen && (
        <AlertDialog
          open={!!deleteSubKpiDialogOpen}
          onOpenChange={(open) => !open && setDeleteSubKpiDialogOpen(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                Sub-KPI and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteSubKpi(deleteSubKpiDialogOpen)}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AddOPCRActivityDialog
        open={addActivityDialogOpen}
        onOpenChange={setAddActivityDialogOpen}
        kpiId={kpi.id}
        opcrId={opcrId}
        deliveryUnitId={deliveryUnitId}
        dukpiAssignmentId={kpiAssignmentsData?.data[0]?.id || ''}
      />
    </div>
  )
}
