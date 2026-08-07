import { useEffect, useState, useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProcurementActivityTypes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import api from '@/services/api'
import { toast } from 'sonner'
import { Calendar, Search, MapPin, AlignLeft, CalendarDays, Loader2, Plus, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CalendarEvent {
  id: string
  projectId: string
  projectTitle: string
  procurementActivityTypeId: string
  procurementActivityTypeName: string
  startDate: string
  endDate: string
  venue: string
  status: string
  remarks: string
}

interface BiddingCalendarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bacResolutionId?: string | null
  bacResolutionNumber?: string | null
}

// Separate creation dialog form component
interface CreateCalendarEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bacResolutionId: string
  bacResolutionNumber?: string | null
  onSuccess: () => void
}

function CreateCalendarEventDialog({
  open,
  onOpenChange,
  bacResolutionId,
  bacResolutionNumber,
  onSuccess,
}: CreateCalendarEventDialogProps) {
  const [activityTypeId, setActivityTypeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [venue, setVenue] = useState('')
  const [remarks, setRemarks] = useState('')
  const [status, setStatus] = useState('Pending')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmCreate, setShowConfirmCreate] = useState(false)

  // Fetch Activity Types for dropdown
  const { data: activityTypesData } = useProcurementActivityTypes({
    pathParams: {},
    queryParams: {},
  })
  const activityTypes = activityTypesData?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityTypeId || !startDate || !endDate || !venue) {
      toast.error('Please fill in all required fields.')
      return
    }
    setShowConfirmCreate(true)
  }

  const handleConfirmCreate = async () => {
    setIsSubmitting(true)
    setShowConfirmCreate(false)

    try {
      await api.post(`/bac/projects/${bacResolutionId}/schedule`, {
        procurementActivityTypeId: activityTypeId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        venue,
        status,
        remarks,
      })

      toast.success('Bidding schedule created successfully.')
      // Reset form
      setActivityTypeId('')
      setStartDate('')
      setEndDate('')
      setVenue('')
      setRemarks('')
      setStatus('Pending')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to create bidding schedule.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showConfirmCreate}
        onOpenChange={onOpenChange}
        title={`Schedule for ${bacResolutionNumber || 'Resolution'}`}
        description="Add a new bidding activity event schedule on the master calendar for this project."
        size="lg"
        showCloseButton
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="dialogActivityType">Procurement Activity Type <span className="text-destructive">*</span></Label>
            <select
              id="dialogActivityType"
              value={activityTypeId}
              onChange={(e) => setActivityTypeId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">-- Select Activity Type --</option>
              {activityTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dialogStartDate">Start Date & Time <span className="text-destructive">*</span></Label>
              <Input
                id="dialogStartDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dialogEndDate">End Date & Time <span className="text-destructive">*</span></Label>
              <Input
                id="dialogEndDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dialogVenue">Venue <span className="text-destructive">*</span></Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dialogVenue"
                placeholder="Conference Room, Admin Building"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dialogRemarks">Remarks</Label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="dialogRemarks"
                placeholder="Enter any additional remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="pl-9 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Event
            </Button>
          </div>
        </form>
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showConfirmCreate}
        onOpenChange={setShowConfirmCreate}
        title="Schedule Bidding Activity?"
        description="Are you sure you want to add this event schedule to the Bidding Master Calendar?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={() => setShowConfirmCreate(false)}
      />
    </>
  )
}

export function BiddingCalendarDialog({
  open,
  onOpenChange,
  bacResolutionId,
  bacResolutionNumber,
}: BiddingCalendarDialogProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  // Sort State
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'title-asc' | 'title-desc'>('date-asc')

  // Fetch calendar events from API
  const fetchEvents = async (search = '') => {
    setIsLoadingEvents(true)
    try {
      const url = search
        ? `/bac/calendar-events?Search=${encodeURIComponent(search)}`
        : '/bac/calendar-events'
      const response = await api.get<any>(url)
      const rawData = response.data?.data
      // NOTE: The API contract returns either a wrapped { events: CalendarEvent[] } object
      // or a flat array of CalendarEvent[]. Handling both shapes for backwards compatibility / migration safety.
      // Normalize to flat array here.
      const parsedEvents = rawData && Array.isArray(rawData.events)
        ? rawData.events
        : (Array.isArray(rawData) ? rawData : [])
      setEvents(parsedEvents)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load bidding calendar events.')
    } finally {
      setIsLoadingEvents(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchEvents(searchQuery)
    }
  }, [open, searchQuery])

  // Computed Sorted Events for Visual Organization
  const sortedEvents = useMemo(() => {
    const arr = Array.isArray(events) ? events : []
    return [...arr].sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      } else if (sortBy === 'date-desc') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      } else if (sortBy === 'title-asc') {
        return a.projectTitle.localeCompare(b.projectTitle)
      } else {
        return b.projectTitle.localeCompare(a.projectTitle)
      }
    })
  }, [events, sortBy])

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !createDialogOpen}
        onOpenChange={onOpenChange}
        title="Bidding Master Calendar"
        description="View all procurement calendar activity events and manage schedules."
        size="xl"
        showCloseButton
      >
        <div className="space-y-6">
          {/* Header Action Bar with Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-4">
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calendar events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </div>
            </div>

            {bacResolutionId && (
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Schedule {bacResolutionNumber || 'Resolution'}
              </Button>
            )}
          </div>

          {/* Events List View */}
          <div className="space-y-4">
            {isLoadingEvents ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching calendar events...</p>
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/5">
                No bidding calendar events found.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-default-200 rounded-xl p-4 space-y-3 bg-card hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 border-b pb-2">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {event.projectTitle}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Activity: <span className="font-medium text-foreground">{event.procurementActivityTypeName}</span>
                        </p>
                      </div>
                      <Badge variant="soft" color="secondary" className="capitalize text-xs">
                        {event.status || 'Scheduled'}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-default-400" />
                        <span>
                          {new Date(event.startDate).toLocaleString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(event.endDate).toLocaleString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-default-400" />
                        <span>Venue: <span className="font-medium text-foreground">{event.venue}</span></span>
                      </div>
                      {event.remarks && (
                        <div className="flex items-start gap-2 bg-muted/20 p-2 rounded-lg mt-1 border border-default-100">
                          <AlignLeft className="h-3.5 w-3.5 text-default-400 mt-0.5" />
                          <p className="leading-relaxed">Remarks: {event.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ResponsiveDialogDashtail>

      {/* Creation form dialog modal opened separately */}
      {bacResolutionId && (
        <CreateCalendarEventDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          bacResolutionId={bacResolutionId}
          bacResolutionNumber={bacResolutionNumber}
          onSuccess={() => fetchEvents(searchQuery)}
        />
      )}
    </>
  )
}
