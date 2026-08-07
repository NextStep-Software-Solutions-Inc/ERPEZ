import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useKpiData } from '@/providers/KpiProvider'

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
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const assignmentRowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export function TargetAssignmentCard() {
  const kpi = useKpiData()

  // Check if assignments exist
  const assignments = (kpi as any).assignments || []
  
  if (assignments.length === 0) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <motion.div
          variants={accentVariants}
          initial="hidden"
          animate="show"
          className="absolute left-0 top-0 bottom-0 w-2 bg-linear-to-b from-blue-400 to-indigo-500 origin-top"
        />

        <div className="pl-6 pr-6 py-6">
          <motion.div
            variants={rowVariants}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-xl font-semibold text-foreground">
              Target Assignment
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Office-level target allocations
            </p>
          </motion.div>

          <motion.div
            variants={rowVariants}
            initial="hidden"
            animate="show"
            className="mt-6"
          >
            <p className="text-sm text-muted-foreground text-center py-4">
              No target assignments available
            </p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Calculate totals
  const totalAnnual = assignments.reduce(
    (sum: number, a: any) => sum + (a.assignedTargetAnnual || 0),
    0
  )

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
        className="absolute left-0 top-0 bottom-0 w-2 bg-linear-to-b from-blue-400 to-indigo-500 origin-top"
      />

      <div className="pl-6 pr-6 py-6">
        {/* Header */}
        <motion.div
          variants={rowVariants}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-xl font-semibold text-foreground">
            Target Assignment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Office-level target allocations
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          variants={rowVariants}
          initial="hidden"
          animate="show"
          className="mt-6 p-4 bg-muted/40 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Assigned Target (Annual)
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {totalAnnual.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">
                Number of Offices
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {assignments.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Assignments list */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 space-y-4"
        >
          {assignments.map((assignment: any) => (
            <motion.div
              key={assignment.id}
              variants={assignmentRowVariants}
              initial="hidden"
              animate="show"
              className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {/* Office header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {assignment.officeName}
                  </p>
                </div>
                {assignment.isLocked && (
                  <Badge variant="outline" className="ml-2 gap-1">
                    <Lock className="h-3 w-3" />
                    Locked
                  </Badge>
                )}
              </div>

              {/* Target details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Annual Target
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {assignment.assignedTargetAnnual?.toFixed(2)}
                  </p>
                </div>

                {/* Quarterly targets if available */}
                {(assignment.assignedTargetQ1 ||
                  assignment.assignedTargetQ2 ||
                  assignment.assignedTargetQ3 ||
                  assignment.assignedTargetQ4) && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Quarterly Targets
                    </p>
                    <div className="flex gap-1">
                      {[
                        assignment.assignedTargetQ1,
                        assignment.assignedTargetQ2,
                        assignment.assignedTargetQ3,
                        assignment.assignedTargetQ4,
                      ].map((target: any, qIndex: number) => (
                        <span
                          key={qIndex}
                          className="text-xs px-2 py-1 bg-background rounded border"
                        >
                          {target ? target.toFixed(1) : '-'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {assignment.assignedTargetAnnual > 0 && (
                <div className="mt-3">
                  <Progress
                    value={Math.min(
                      100,
                      (assignment.assignedTargetAnnual /
                        (totalAnnual || 1)) *
                        100
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(
                      ((assignment.assignedTargetAnnual || 0) /
                        (totalAnnual || 1)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
