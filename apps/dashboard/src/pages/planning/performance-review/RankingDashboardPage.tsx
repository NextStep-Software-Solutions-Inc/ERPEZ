/**
 * Performance Review – Step 5: Ranking Dashboard
 * Displays FINALIZED records sorted by final rating (leaderboard).
 * Filters by sector / cluster + Excel export placeholder.
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet,
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  Zap,
  TrendingUp,
  Users,
} from 'lucide-react'
import { AdjectivalBadge } from '@/features/planning/performance-review/components/AdjectivalBadge'
import { WorkflowStatusBadge } from '@/features/planning/performance-review/components/WorkflowStatusBadge'
import { OPCRSelectionRequired } from '@/features/planning/performance-review/components/OPCRSelectionRequired'
import { usePerformanceReviewStore } from '@/features/planning/performance-review/store/performanceReviewStore'
import {
  getAdjectivalRating,
  type EvaluationSession,
  type OPCRReference,
  type RankingRow,
} from '@/features/planning/performance-review/types'

function generateRankingFromSessions(
  sessions: EvaluationSession[],
  availableOpcrs: OPCRReference[],
): RankingRow[] {
  const opcrById = new Map(availableOpcrs.map((opcr) => [opcr.id, opcr]))

  return sessions
    .filter(
      (session) =>
        session.status === 'FINALIZED' && session.finalRatingScore !== null,
    )
    .map((session) => {
      const opcr = opcrById.get(session.opcrId)
      const finalScore = session.finalRatingScore ?? 0

      return {
        id: session.id,
        sessionId: session.id,
        rateeName: session.rateeName,
        deliveryUnitName: session.deliveryUnitName,
        sector: opcr?.sector ?? 'Unassigned Sector',
        cluster: opcr?.cluster ?? 'Unassigned Cluster',
        finalRatingScore: finalScore,
        adjectivalRating:
          session.adjectivalRating ?? getAdjectivalRating(finalScore),
        fiscalYear: session.fiscalYear,
        status: session.status,
        rank: 0,
      }
    })
    .sort((a, b) => b.finalRatingScore - a.finalRatingScore)
    .map((row, index) => ({ ...row, rank: index + 1 }))
}

// ── Rank badge icons ───────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </TooltipTrigger>
          <TooltipContent>1st Place</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  if (rank === 2)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Medal className="h-5 w-5 text-slate-400" />
          </TooltipTrigger>
          <TooltipContent>2nd Place</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  if (rank === 3)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Award className="h-5 w-5 text-amber-600" />
          </TooltipTrigger>
          <TooltipContent>3rd Place</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground w-6 h-6 text-xs font-bold">
      {rank}
    </span>
  )
}

export default function RankingDashboardPage() {
  const { sessionCache, currentSession, availableOpcrs } =
    usePerformanceReviewStore()

  if (!currentSession) {
    return <OPCRSelectionRequired />
  }

  const [search, setSearch] = useState('')
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)
  const [exportOpen, setExportOpen] = useState(false)

  const sessions = useMemo(() => {
    const cachedSessions = Object.values(sessionCache)
    if (
      currentSession &&
      !cachedSessions.some((session) => session.id === currentSession.id)
    ) {
      return [...cachedSessions, currentSession]
    }
    return cachedSessions
  }, [currentSession, sessionCache])

  const ranking = useMemo(
    () => generateRankingFromSessions(sessions, availableOpcrs),
    [availableOpcrs, sessions],
  )

  const filtered = useMemo(() => {
    return ranking.filter((row) => {
      const matchesSearch =
        row.rateeName.toLowerCase().includes(search.toLowerCase()) ||
        row.deliveryUnitName.toLowerCase().includes(search.toLowerCase())
      const matchesCluster = !selectedCluster || row.cluster === selectedCluster
      return matchesSearch && matchesCluster
    })
  }, [search, selectedCluster, ranking])

  const handleExcelExport = () => {
    setExportOpen(true)
  }

  const topThree = filtered.slice(0, 3)

  // If no cluster selected, show cluster selection
  if (!selectedCluster) {
    const uniqueClusters = Array.from(
      new Set(ranking.map((r) => r.cluster).filter(Boolean)),
    )
    const highestScore =
      ranking.length > 0
        ? Math.max(...ranking.map((r) => r.finalRatingScore)).toFixed(2)
        : '—'

    return (
      <div className="space-y-8">
        {/* Page Header with Background */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 p-8 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
            <Trophy className="h-48 w-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6" />
              <h1 className="text-4xl font-bold">Performance Ranking</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Explore cluster-based agency rankings and performance insights
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Clusters</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {uniqueClusters.length}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Agencies</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {ranking.length}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Highest Score</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {highestScore}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {ranking.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Trophy className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">
                No finalized performance reviews yet.
              </p>
              <p className="text-sm">
                Rankings will appear after PMT finalization posts real
                evaluation scores.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cluster List */}
        {ranking.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
              Select Your Cluster
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueClusters.map((cluster, idx) => {
                const clusterRankings = ranking.filter(
                  (r) => r.cluster === cluster,
                )
                const topScore = Math.max(
                  ...clusterRankings.map((r) => r.finalRatingScore),
                )
                const avgScore =
                  clusterRankings.reduce(
                    (sum, r) => sum + r.finalRatingScore,
                    0,
                  ) / clusterRankings.length
                const topAgency = clusterRankings.find(
                  (r) => r.finalRatingScore === topScore,
                )

                // Color schemes for each cluster
                const colorSchemes = [
                  {
                    bg: 'from-blue-50 to-cyan-50',
                    border: 'border-blue-200',
                    accent: 'bg-blue-100 text-blue-700',
                    badge: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: 'text-blue-500',
                    dot: 'bg-blue-500',
                  },
                  {
                    bg: 'from-purple-50 to-pink-50',
                    border: 'border-purple-200',
                    accent: 'bg-purple-100 text-purple-700',
                    badge: 'bg-purple-100 text-purple-700 border-purple-200',
                    icon: 'text-purple-500',
                    dot: 'bg-purple-500',
                  },
                  {
                    bg: 'from-emerald-50 to-teal-50',
                    border: 'border-emerald-200',
                    accent: 'bg-emerald-100 text-emerald-700',
                    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    icon: 'text-emerald-500',
                    dot: 'bg-emerald-500',
                  },
                  {
                    bg: 'from-amber-50 to-orange-50',
                    border: 'border-amber-200',
                    accent: 'bg-amber-100 text-amber-700',
                    badge: 'bg-amber-100 text-amber-700 border-amber-200',
                    icon: 'text-amber-500',
                    dot: 'bg-amber-500',
                  },
                  {
                    bg: 'from-rose-50 to-red-50',
                    border: 'border-rose-200',
                    accent: 'bg-rose-100 text-rose-700',
                    badge: 'bg-rose-100 text-rose-700 border-rose-200',
                    icon: 'text-rose-500',
                    dot: 'bg-rose-500',
                  },
                  {
                    bg: 'from-indigo-50 to-blue-50',
                    border: 'border-indigo-200',
                    accent: 'bg-indigo-100 text-indigo-700',
                    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                    icon: 'text-indigo-500',
                    dot: 'bg-indigo-500',
                  },
                ]
                const colors = colorSchemes[idx % colorSchemes.length]

                return (
                  <button
                    key={cluster}
                    onClick={() => setSelectedCluster(cluster)}
                    className="group text-left h-full transition-all duration-300 hover:scale-105 focus:outline-none"
                  >
                    <Card
                      className={`h-full border-2 ${colors.border} bg-gradient-to-br ${colors.bg} hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
                    >
                      {/* Decorative background element */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 ${colors.dot} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-all`}
                      />

                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.accent} font-bold text-lg group-hover:scale-110 transition-transform`}
                          >
                            {idx + 1}
                          </div>
                          <div className="text-right">
                            <Trophy
                              className={`h-5 w-5 ${colors.icon} opacity-60 group-hover:opacity-100 transition-opacity`}
                            />
                          </div>
                        </div>
                        <CardTitle className="text-xl text-slate-900 group-hover:text-slate-800 transition-colors">
                          {cluster}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-5 relative z-10">
                        {/* Agency Count */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">
                              Agencies
                            </span>
                            <Badge
                              className={`${colors.badge} border`}
                              variant="outline"
                            >
                              {clusterRankings.length} total
                            </Badge>
                          </div>
                          <div
                            className={`h-2 bg-slate-200 rounded-full overflow-hidden`}
                          >
                            <div
                              className={`h-full bg-gradient-to-r ${colors.bg.replace('from-', 'from-').replace('to-', 'to-')} group-hover:opacity-100 opacity-80 transition-all`}
                              style={{
                                width: `${(clusterRankings.length / ranking.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Scores Section */}
                        <div className="border-t border-slate-200 pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 font-medium">
                              Highest Score
                            </span>
                            <span
                              className={`text-2xl font-black ${colors.icon}`}
                            >
                              {topScore.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 font-medium">
                              Average Score
                            </span>
                            <span className="font-semibold text-slate-700">
                              {avgScore.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Top Agency */}
                        {topAgency && (
                          <div
                            className={`rounded-lg ${colors.accent} ${colors.badge.split(' ')[0]} border ${colors.badge.split('border-')[1]} p-3 text-xs`}
                          >
                            <p className="font-semibold mb-1">Top Agency</p>
                            <p className="truncate opacity-80">
                              {topAgency.rateeName}
                            </p>
                          </div>
                        )}

                        {/* View Button */}
                        <div className="flex items-center justify-between pt-2 group/btn">
                          <span className="text-xs text-slate-500 font-medium">
                            View Rankings
                          </span>
                          <ChevronRight
                            className={`h-4 w-4 ${colors.icon} group-hover/btn:translate-x-1 transition-transform`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Cluster selected - show the rankings for this cluster
  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCluster(null)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clusters
          </Button>
          <div>
            <h2 className="text-lg font-semibold">
              {selectedCluster} Performance Ranking
            </h2>
            <p className="text-sm text-muted-foreground">
              Leaderboard of finalized OPCR evaluations sorted by final rating
              score.
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExcelExport}>
          <Sheet className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>
      {/* Podium top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[topThree[1], topThree[0], topThree[2]].map((row, podiumIdx) => {
            const podiumRanks = [2, 1, 3]
            return (
              <Card
                key={row.id}
                className={`flex flex-col items-center justify-end pb-4 pt-6 text-center ${podiumIdx === 1 ? 'ring-2 ring-primary' : ''}`}
              >
                <RankBadge rank={podiumRanks[podiumIdx]} />
                <p className="mt-2 text-sm font-semibold leading-tight">
                  {row.rateeName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.deliveryUnitName}
                </p>
                <p className="mt-2 text-3xl font-black text-primary">
                  {row.finalRatingScore.toFixed(2)}
                </p>
                <AdjectivalBadge rating={row.adjectivalRating} />
              </Card>
            )
          })}
        </div>
      )}
      {/* Filters */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ratee or delivery unit…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Rankings Table */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Full Rankings
            </CardTitle>
            <Badge color="secondary">{filtered.length} records</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="py-2 w-12">Rank</TableHead>
                <TableHead className="py-2">Ratee</TableHead>
                <TableHead className="py-2">Delivery Unit</TableHead>
                <TableHead className="py-2">Cluster</TableHead>
                <TableHead className="py-2">Final Score</TableHead>
                <TableHead className="py-2">Rating</TableHead>
                <TableHead className="py-2">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground text-sm"
                  >
                    No records match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow key={row.id} className="text-sm">
                    <TableCell className="py-2">
                      <RankBadge rank={row.rank} />
                    </TableCell>
                    <TableCell className="py-2 font-medium">
                      {row.rateeName}
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground">
                      {row.deliveryUnitName}
                    </TableCell>
                    <TableCell className="py-2 text-muted-foreground">
                      {row.cluster || '—'}
                    </TableCell>
                    <TableCell className="py-2 font-bold text-primary text-base">
                      {row.finalRatingScore.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-2">
                      <AdjectivalBadge rating={row.adjectivalRating} />
                    </TableCell>
                    <TableCell className="py-2">
                      <WorkflowStatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Excel Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excel Export</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="flex justify-center">
              <div className="text-5xl">📊</div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Excel export functionality is being developed. We're connecting
                the xlsx/sheetjs library to provide powerful export
                capabilities.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>What's next:</strong> Soon you'll be able to export
                performance rankings to Excel with custom formatting.
              </p>
            </div>
          </div>
          <Button onClick={() => setExportOpen(false)} className="w-full">
            Got it
          </Button>
        </DialogContent>
      </Dialog>{' '}
    </div>
  )
}
