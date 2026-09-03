import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Building2, ChevronRight, CalendarDays, Banknote, Clock, TrendingUp, FileText, Users, CheckCircle2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ModeOfProcurement, ProjectStatus, PublicProject } from '../types/portalTypes'
import api from '@/services/api'
import { mapBackendProjectToFrontend } from '../utils/projectMapper'

interface BACPublicPortalLandingProps {
  onViewProject: (project: PublicProject) => void
}

const MOP_LABELS: Record<ModeOfProcurement, string> = {
  'public-bidding': 'Public Bidding',
  svp: 'Small Value Procurement',
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'closing-soon': { label: 'Closing Soon', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  closed: { label: 'Closed', className: 'bg-slate-100 text-slate-500 border-slate-200' },
}

const MOP_FILTER_OPTIONS: { value: ModeOfProcurement | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'public-bidding', label: 'Public Bidding' },
  { value: 'svp', label: 'Small Value Procurement' },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr?: string) {
  if (!dateStr || isNaN(Date.parse(dateStr))) return '—'
  return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

function daysUntil(dateStr?: string) {
  if (!dateStr || isNaN(Date.parse(dateStr))) return 30
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function BACPublicPortalLanding({ onViewProject }: BACPublicPortalLandingProps) {
  const [search, setSearch] = useState('')
  const [mopFilter, setMopFilter] = useState<ModeOfProcurement | 'all'>('all')
  const [projects, setProjects] = useState<PublicProject[]>([])
  const [stats, setStats] = useState({ total: 0, publicBidding: 0, svp: 0, closingSoon: 0, closed: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/public/projects/stats')
        if (res.data && res.data.data) {
          const s = res.data.data
          setStats({
            total: s.activeProjects || 0,
            publicBidding: s.publicBidding || 0,
            svp: s.smallValueProcurement || 0,
            closingSoon: s.closingSoon || 0,
            closed: s.closed || 0,
          })
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        let modeParam = ''
        if (mopFilter === 'public-bidding') {
          modeParam = 'Public Bidding'
        } else if (mopFilter === 'svp') {
          modeParam = 'Small Value Procurement'
        }

        const params: any = {}
        if (search) params.search = search
        if (modeParam) params.mode = modeParam

        const res = await api.get('/api/public/projects', { params })
        if (res.data && res.data.data) {
          const mapped = res.data.data.map(mapBackendProjectToFrontend)
          setProjects(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [search, mopFilter])

  const filtered = projects


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a2a5e] via-[#1e3a8a] to-[#1a2a5e] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-sm font-medium tracking-wide uppercase">Bids and Awards Committee</p>
              <h1 className="text-3xl font-bold">Procurement Opportunities</h1>
              <p className="text-blue-200 mt-1 text-sm">
                University of Science and Technology of Southern Philippines
              </p>
            </div>
          </div>

          {/* Search Bar */}
            <div className="mt-8 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by project title or reference number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 text-base bg-white text-slate-900 border-0 shadow-lg rounded-xl placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-400"
            />
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Active Projects', value: stats.total, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
            { label: 'Public Bidding', value: stats.publicBidding, icon: Users, color: 'text-violet-600 bg-violet-50' },
            { label: 'Small Value Procurement', value: stats.svp, icon: FileText, color: 'text-teal-600 bg-teal-50' },
            { label: 'Closing Soon', value: stats.closingSoon, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Closed', value: stats.closed, icon: CheckCircle2, color: 'text-slate-400 bg-slate-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${stat.label === 'Closed' ? 'text-slate-400' : 'text-slate-800'}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          {MOP_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMopFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                mopFilter === opt.value
                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500">{filtered.length} project{filtered.length !== 1 ? 's' : ''} found</span>
        </div>

        {/* Project Cards */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Loading opportunities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No projects found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((project) => {
              const statusCfg = STATUS_CONFIG[project.status]
              const days = daysUntil(project.deadline)
              return (
                <div
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View project ${project.title}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
                  onClick={() => onViewProject(project)}
                  onKeyDown={(e) => {
                    const key = e.key || e.code
                    if (key === 'Enter' || key === ' ' || key === 'Space' || key === 'Spacebar') {
                      e.preventDefault()
                      onViewProject(project)
                    }
                  }}
                >
                  <div className="p-6 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${project.status === 'open' ? 'bg-emerald-500' : project.status === 'closing-soon' ? 'bg-amber-500' : 'bg-slate-400'} inline-block`} />
                          {statusCfg.label}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            project.mop === 'public-bidding'
                              ? 'border-violet-200 text-violet-700 bg-violet-50'
                              : 'border-teal-200 text-teal-700 bg-teal-50'
                          }`}
                        >
                          {MOP_LABELS[project.mop]}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                        {project.title}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          {project.referenceNo}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Banknote className="h-3.5 w-3.5" />
                          ABC: <span className="font-medium text-slate-700">{formatCurrency(project.approvedBudget)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Posted: {formatDate(project.postedOn)}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Deadline */}
                    <div className="shrink-0 text-right space-y-2">
                      <div className={`px-3 py-2 rounded-xl text-center ${project.status === 'closed' ? 'bg-slate-50 border border-slate-200' : days <= 7 ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'}`}>
                        <p className={`text-xs font-medium ${project.status === 'closed' ? 'text-slate-400' : days <= 7 ? 'text-red-500' : 'text-slate-500'}`}>Deadline</p>
                        <p className={`text-sm font-bold ${project.status === 'closed' ? 'text-slate-400' : days <= 7 ? 'text-red-600' : 'text-slate-700'}`}>
                          {project.status === 'closed' ? 'Closed' : days > 0 ? `${days}d left` : 'Today'}
                        </p>
                        <p className="text-xs text-slate-400">{formatDate(project.deadline)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 text-xs w-full justify-end"
                      >
                        View Details <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} University of Science and Technology of Southern Philippines — BAC Secretariat</p>
        <p className="mt-1">For inquiries, please contact the Bids and Awards Committee Secretariat</p>
      </div>
    </div>
  )
}
