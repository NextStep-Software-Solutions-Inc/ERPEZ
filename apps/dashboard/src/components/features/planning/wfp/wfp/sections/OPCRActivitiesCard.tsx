import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Target, MoreVertical, DollarSign, Calendar, ArrowUpRight, Plus, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { OPCR, OPCRActivity } from '../../opcr/table/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ActivityTargetsDisplay } from './ActivityTargetsDisplay'
import ImportOPCRActivitiesDialog from '../dialog/ImportOPCRActivitiesDialog'

interface OPCRActivitiesCardProps {
  linkedOPCR: OPCR
  wfpId: string
  onRefresh?: () => void
}

export const OPCRActivitiesCard = ({ linkedOPCR, wfpId, onRefresh }: OPCRActivitiesCardProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const activities = linkedOPCR?.activities || []
  const existingActivityIds = activities.map((a) => a.id)

  return (
    <>
      <Card className="shadow-sm border border-slate-200 bg-white overflow-hidden mb-6">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                OPCR Activities & Performance Targets
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Inherited activities from linked OPCR ({linkedOPCR.title || linkedOPCR.name || 'Selected OPCR'}). You can select, attach, or manually manage activities below.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-xs">
                {activities.length} Linked Activities
              </Badge>

              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm"
                onClick={() => setImportDialogOpen(true)}
              >
                <Target className="w-3.5 h-3.5" />
                Select / Attach OPCR Activities
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity: OPCRActivity) => (
                <ActivityCard key={activity.id} activity={activity} wfpId={wfpId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
              <Target className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No activities attached to this WFP yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                You can select and import activities from the linked OPCR or manually add custom objectives and activities.
              </p>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
                onClick={() => setImportDialogOpen(true)}
              >
                <Target className="w-3.5 h-3.5" />
                Select & Attach OPCR Activities
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ImportOPCRActivitiesDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        wfpId={wfpId}
        opcrId={linkedOPCR?.id}
        existingActivityIds={existingActivityIds}
        onSuccessImport={onRefresh}
      />
    </>
  )
}

// Sub-component: Enhanced Activity Card
const ActivityCard = ({ activity, wfpId }: { activity: OPCRActivity; wfpId: string }) => {
  const navigate = useNavigate()

  return (
    <Card className="shadow-sm hover:shadow-md transition-all border border-slate-200/80 bg-white">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base font-bold text-slate-800">{activity.name}</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none text-[11px] font-bold px-2 py-0.5">
                {activity.weight}% Weight
              </Badge>
            </div>
            {activity.description && (
              <p className="text-xs text-slate-600 line-clamp-2">{activity.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 gap-1.5"
              onClick={() =>
                navigate({
                  to: '/v2/(planning)/wfp/$wfpId/activity/$activityId/expenditures',
                  params: { wfpId, activityId: activity.id },
                })
              }
            >
              <Plus className="h-3.5 w-3.5" /> PPMP / Expenditures
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigate({
                      to: '/v2/(planning)/wfp/$wfpId/activity/$activityId/expenditures',
                      params: { wfpId, activityId: activity.id },
                    })
                  }
                  className="gap-2"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" /> View & Add PPMP Expenditures
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate({
                      to: '/v2/(planning)/wfp/$wfpId/activity/$activityId',
                      params: { wfpId, activityId: activity.id },
                    })
                  }
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4 text-purple-600" /> Manage Timelines (Q1–Q4)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Step 2: Performance Targets Display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500" /> Step 2: Quarterly Target % Distribution
            </span>
          </div>
          <ActivityTargetsDisplay activity={activity} />
        </div>

        {/* Step 3: PPMP Expenditure Summary Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Step 3: PPMP Budget Items</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">UACS object nodes & manual line items attached</span>
          </div>

          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-indigo-600 hover:text-indigo-800 font-semibold gap-1 self-end sm:self-auto"
            onClick={() =>
              navigate({
                to: '/v2/(planning)/wfp/$wfpId/activity/$activityId/expenditures',
                params: { wfpId, activityId: activity.id },
              })
            }
          >
            Manage PPMPs <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
