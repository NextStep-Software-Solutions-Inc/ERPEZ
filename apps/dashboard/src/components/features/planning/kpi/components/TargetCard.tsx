import { motion } from 'framer-motion'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { useState } from 'react'
import EditTargetSectionDialog from '../dialogs/EditTargetSectionDialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useKpiData } from '@/providers/KpiProvider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const accentVariants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const targetRowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  hover: { x: 4, transition: { duration: 0.2 } },
}

const quarterOrder: Record<string, number> = {
  '1st Quarter': 1,
  '2nd Quarter': 2,
  '3rd Quarter': 3,
  '4th Quarter': 4,
  Annual: 5,
}

const getQuarterOrder = (quarterName: string) =>
  quarterOrder[quarterName] ?? Number.MAX_SAFE_INTEGER

export function TargetCard() {
  const kpi = useKpiData()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  // Determine period type from targets
  const periodType =
    kpi.KPITargets.length > 0 ? kpi.KPITargets[0].period : 'Quarterly'

  // Sort targets in ascending order for Quarterly period type and filter out zero targetValue
  const sortedTargets = [...kpi.KPITargets]
    .sort((a, b) => {
      return getQuarterOrder(a.quarterName) - getQuarterOrder(b.quarterName)
    })
    .filter((target) => target.targetValue !== 0)

  // Calculate overall achieved percentage
  const sumTarget = sortedTargets.reduce((sum, t) => sum + t.targetValue, 0)
  const sumAchieved = sortedTargets.reduce(
    (sum, t) => sum + (t.targetValue - t.remainingTargetValue),
    0,
  )
  const overallPercent =
    sumTarget > 0 ? Math.round((sumAchieved / sumTarget) * 100) : 0

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      {/* Left accent bar */}
      <motion.div
        variants={accentVariants}
        initial="hidden"
        animate="show"
        className="absolute left-0 top-0 bottom-0 w-2 bg-linear-to-b from-emerald-400 to-teal-500 origin-top"
      />

      <div className="pl-6 pr-6 py-6">
        {/* Header */}
        <motion.div
          variants={rowVariants}
          initial="hidden"
          animate="show"
          className="flex flex-row justify-between items-center"
        >
          <div>
            <div className="flex flex-row gap-4 items-center">
              <h2 className="text-xl font-semibold text-foreground">Target</h2>
              <div className="flex flex-row gap-2 items-center">
                <motion.div
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                >
                  {kpi.isPercentage ? (
                    <Badge
                      className="bg-[#2563EB]/20 rounded-md text-[#2563EB] hover:bg-[#2563EB]/60"
                      variant={'outline'}
                    >
                      Percentage
                    </Badge>
                  ) : null}
                </motion.div>
                <motion.div
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                >
                  <Badge
                    className="bg-[#8A38F5]/20 rounded-md text-[#8A38F5] hover:bg-[#8A38F5]/60"
                    variant={'outline'}
                  >
                    Average
                  </Badge>
                </motion.div>
                <motion.div
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                >
                  {kpi.isTargetValueAllocable ? (
                    <Badge
                      className="bg-[#DDA63A]/20 rounded-md text-[#DDA63A] hover:bg-[#DDA63A]/60"
                      variant={'outline'}
                    >
                      Cascadable
                    </Badge>
                  ) : null}
                </motion.div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Performance target for {periodType}
            </p>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-muted"
                  aria-label="Target actions"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-2 bg-white">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-2" /> Edit
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>

        {/* Period badge */}
        <div className="flex justify-between items-center">
          <motion.div
            variants={rowVariants}
            initial="hidden"
            animate="show"
            className="mt-4"
          >
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Target Period
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {periodType}
              </Badge>
              {periodType === 'Quarterly' && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Overall: {overallPercent}%
                </Badge>
              )}
            </div>
          </motion.div>
        </div>

        {/* Target rows */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 space-y-3"
          role="list"
        >
          {sortedTargets.length > 0 ? (
            sortedTargets.map((target) => {
              const achieved = target.targetValue - target.remainingTargetValue
              const achievedPercent =
                target.targetValue > 0
                  ? Math.round((achieved / target.targetValue) * 100)
                  : 0

              return (
                <motion.div
                  key={target.id}
                  variants={targetRowVariants}
                  whileHover="hover"
                  className="rounded-lg border bg-muted/30 px-4 py-4 cursor-default  "
                  role="listitem"
                >
                  <div className="flex items-center justify-between mb-2">
                    {target.quarterName === 'Annual' ? (
                      <h3 className="text-md font-semibold">Annual Target</h3>
                    ) : (
                      <h3 className="text-md font-semibold">
                        {target.quarterName}
                      </h3>
                    )}
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {target.targetValue} {kpi.isPercentage ? '%' : ''}
                    </div>
                  </div>
                  <div className="relative mb-2  ">
                    <Progress
                      value={achievedPercent}
                      className="bg-gradient-to-b from-emerald-400 to-teal-500 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Achieved: {achievedPercent}%</span>
                    {kpi.isPercentage ? (
                      <span className="text-destructive">
                        Remaining: {100 - achievedPercent}%
                      </span>
                    ) : (
                      <span className="text-destructive">
                        Remaining: {target.remainingTargetValue}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })
          ) : (
            <motion.p
              variants={rowVariants}
              className="text-sm text-muted-foreground"
            >
              No targets defined
            </motion.p>
          )}
        </motion.div>
      </div>

      <EditTargetSectionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </motion.div>
  )
}
