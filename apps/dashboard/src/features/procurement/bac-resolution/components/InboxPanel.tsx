import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BacResolutionCard } from './BacResolutionCard'
import type {
  BacResolution,
  BacResolutionInboxFilter,
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'

interface InboxPanelProps {
  inboxCards: {
    status: BacResolutionInboxFilter
    label: string
    count: number
  }[]
  isLoading: boolean
  resolutions: BacResolution[]
  filteredResolutions: BacResolution[]
  selectedResolutionId: string | null
  setSelectedResolutionId: (id: string) => void
  searchValue: string
  setSearchValue: (v: string) => void
  filter: BacResolutionInboxFilter
  setFilter: (v: BacResolutionInboxFilter) => void
  role: BacResolutionRole
  workspaceScope: BacResolutionWorkspaceScope
  bacListRoutePath: BacResolutionListRoutePath
  onEdit?: (resolution: BacResolution) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
}

export function InboxPanel({
  inboxCards,
  isLoading,
  resolutions,
  filteredResolutions,
  selectedResolutionId,
  setSelectedResolutionId,
  searchValue,
  setSearchValue,
  filter,
  setFilter,
  role,
  workspaceScope,
  bacListRoutePath,
  onEdit,
  onDelete,
  onViewDetails,
}: InboxPanelProps) {
  return (
    <>
      <Card className="border border-default-200 shadow-sm">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-primary" />
              Combined Inbox
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {filteredResolutions.length} result(s)
            </p>
          </div>
          <div className="space-y-3">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search resolution number, description, or PR number"
            />
            <Select
              value={filter}
              onValueChange={(value) =>
                setFilter(value as BacResolutionInboxFilter)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {inboxCards.map((statusOption) => (
                  <SelectItem
                    key={statusOption.status}
                    value={statusOption.status}
                  >
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 flex flex-row overflow-x-scroll gap-4">
          {isLoading && resolutions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Loading BAC Resolutions...
            </p>
          ) : filteredResolutions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-6 text-sm text-muted-foreground">
              No BAC Resolutions match the current search and filter.
            </div>
          ) : (
            filteredResolutions.map((resolution) => {
              const isActive = resolution.id === selectedResolutionId
              return (
                <BacResolutionCard
                  key={resolution.id}
                  resolution={resolution}
                  isActive={isActive}
                  onSelect={() => setSelectedResolutionId(resolution.id)}
                  role={role}
                  workspaceScope={workspaceScope}
                  bacListRoutePath={bacListRoutePath}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              )
            })
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default InboxPanel
