import { motion } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { MoreHorizontal, Pencil } from 'lucide-react'
import { useState } from 'react'
import EditKpiBasicInfoDialog from '../dialogs/EditKpiBasicInfoDialog'
import { SdgPill } from './SdgPill'
import { Badge } from '@/components/ui/badge'
import { SDGS } from '@/components/lib/sdgs'
import { splitPascalCase } from '@/lib/utils'
import { useKpiData } from '@/providers/KpiProvider'
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
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
}

const sdgContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
}

export function KpiBasicInfoCard() {
  const kpi = useKpiData()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  // Map SDG IDs to display data
  const sdgDisplay = kpi.SDGs.map((sdg, index) => {
    const sdgData = SDGS.find((s) => s.name === sdg.name || s.title === sdg.name)
    return {
      id: index + 1,
      label: sdg.name,
      color: sdgData?.color || '#6B7280',
    }
  })

  const functionTypeColor =
    kpi.functionType === 'Strategic Function'
      ? 'bg-linear-to-r from-emerald-400 to-teal-500'
      : kpi.functionType === 'Core Function'
        ? 'bg-linear-to-r from-blue-400 to-indigo-500'
        : 'bg-linear-to-r from-amber-400 to-orange-500'

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
        <motion.div variants={rowVariants} initial="hidden" animate="show" className='flex flex-row justify-between items-center'>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Basic Information
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Core details about this KPI
            </p>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-muted"
                  aria-label="Sub-KPI actions"
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
                      setEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-2" /> Edit
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>

        {/* Content grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8"
        >
          {/* Row 1 */}
          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              KPI Function
            </div>
            <Badge
              className={`${functionTypeColor} text-white border-none px-3 py-1`}
            >
              {splitPascalCase(kpi.functionType)}
            </Badge>
          </motion.div>

          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Office Mandated
            </div>
            <div className="text-foreground font-medium">
              {kpi.isOfficeMandate ? 'Yes' : 'No'}
            </div>
          </motion.div>

          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Project
            </div>
            <div className="text-foreground">
              {kpi.MFOPAP?.name || 'N/A'}
            </div>
          </motion.div>

          {/* Row 2 */}
          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Status
            </div>
            <Badge variant="outline" className="px-2 py-1 bg-blue-50">
              {(kpi as any).status || 'N/A'}
            </Badge>
          </motion.div>

          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Distribution Behavior
            </div>
            <div className="text-foreground">
              {(kpi as any).distributionBehavior || 'N/A'}
            </div>
          </motion.div>

          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Opt-In Available
            </div>
            <Badge variant="outline" className="px-2 py-1">
              {(kpi as any).isOptInAvailable ? 'Yes' : 'No'}
            </Badge>
          </motion.div>

          {/* Row 3 */}
          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Primary Attribute</div>
            <div className="text-foreground"> 
              {kpi.Attributes[0]?.name || 'N/A'}
            </div>
          </motion.div>

          <motion.div variants={rowVariants}>
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Gender and Development (GAD)
            </div>
            <Badge 
              variant="outline" 
              className={`px-2 py-1 ${(kpi as any).isGAD ? 'bg-rose-50' : 'bg-gray-50'}`}
            >
              {(kpi as any).isGAD ? '✓ GAD Indicator' : 'Non-GAD'}
            </Badge>
          </motion.div>

          <motion.div variants={rowVariants} className="md:col-span-1">
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Monitoring Frequency
            </div>
            <div className="text-foreground">
              {(kpi as any).monitoringFrequency || 'N/A'}
            </div>
          </motion.div>

          {/* Row 4 - Mandatory Classification */}
          <motion.div variants={rowVariants} className="md:col-span-3">
            <div className="text-sm font-medium text-muted-foreground mb-1.5">
              Mandatory Classification Code
            </div>
            <div className="text-foreground">
              {kpi.Attributes[1]?.name || 'N/A'}
            </div>
          </motion.div>
        </motion.div>

        {/* SDG Section */}
        <motion.div
          variants={rowVariants}
          initial="hidden"
          animate="show"
          className="mt-8"
        >
          <div className="text-sm font-medium text-muted-foreground mb-3">
            Sustainable Development Goals
          </div>
          <motion.div
            variants={sdgContainerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-2"
          >
            {sdgDisplay.map((sdg) => (
              <SdgPill
                key={sdg.id}
                // id={sdg.id}
                label={sdg.label}
                color={sdg.color}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Program Linkage Section */}
        {kpi.MFOPAP && (
          <motion.div
            variants={rowVariants}
            initial="hidden"
            animate="show"
            className="mt-8 p-4 bg-muted/30 rounded-lg border border-muted"
          >
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Linked Program (MFOPAP)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Program Name
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {kpi.MFOPAP.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Code
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {kpi.MFOPAP.code}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Type
                </p>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {kpi.MFOPAP.type}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Status
                </p>
                <Badge 
                  variant="outline" 
                  className={`px-2 py-1 text-xs ${kpi.MFOPAP.isActive ? 'bg-green-50' : 'bg-gray-50'}`}
                >
                  {kpi.MFOPAP.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <EditKpiBasicInfoDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </motion.div>
  )
}
