import { motion } from 'framer-motion'
import {
  CalendarDays,
  Edit,
  Trash2,
  Target,
  BookOpen,
  HeartPulse,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FunctionConfig } from '../types/functionConfigTypes'
import { WeightSummary } from './WeightSummary'

interface ConfigCardProps {
  config: FunctionConfig
  index: number
  onEdit: (config: FunctionConfig) => void
  onDelete: (config: FunctionConfig) => void
}

export function ConfigCard({
  config,
  index,
  onEdit,
  onDelete,
}: ConfigCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all border-border group rounded-xl bg-card shadow-sm flex flex-col h-full border">
        <CardHeader className="bg-muted/30 border-b border-border py-4 px-5 flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-background p-2 rounded-lg shadow-sm border border-border">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-default-900 leading-none">
                FY {config.fiscalYearYear}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mt-1">
                ID: {config.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
              onClick={() => onEdit(config)}
              aria-label={`Edit Fiscal Year ${config.fiscalYearYear} Configuration`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => onDelete(config)}
              aria-label={`Delete Fiscal Year ${config.fiscalYearYear} Configuration`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-3 gap-3">
              <WeightSummary
                label="Strategic"
                icon={<Target className="h-3 w-3" />}
                min={config.strategicMinWeight}
                max={config.strategicMaxWeight}
                colorClass="border-primary/10 bg-primary/5"
              />
              <WeightSummary
                label="Core"
                icon={<BookOpen className="h-3 w-3" />}
                min={config.coreFunctionMinWeight}
                max={config.coreFunctionMaxWeight}
                colorClass="border-blue-100 bg-blue-50/50"
              />
              <WeightSummary
                label="Support"
                icon={<HeartPulse className="h-3 w-3" />}
                min={config.supportMinWeight}
                max={config.supportMaxWeight}
                colorClass="border-orange-100 bg-orange-50/50"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
            <span>Total Range</span>
            <span className="text-default-900 font-bold">
              {config.strategicMinWeight +
                config.coreFunctionMinWeight +
                config.supportMinWeight}
              % <span className="mx-1 text-muted-foreground">→</span>
              {(config.strategicMaxWeight ?? 100) +
                (config.coreFunctionMaxWeight ?? 100) +
                (config.supportMaxWeight ?? 100)}
              %
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
