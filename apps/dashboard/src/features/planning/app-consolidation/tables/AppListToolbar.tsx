import { useAtom } from 'jotai'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Download } from 'lucide-react'
import { appListFilterAtom, appExportLoadingAtom, createAPPDialogOpenAtom } from '../atoms'
import { toast } from 'sonner'
import type { Table } from '@tanstack/react-table'
import type { AppListResponse } from '../handlers/getAPPListRequest'

interface AppListToolbarProps {
  table?: Table<AppListResponse>
  showColumnVisibility?: boolean
}

export function AppListToolbar({}: AppListToolbarProps) {
  const [filter, setFilter] = useAtom(appListFilterAtom)
  const [exportLoading] = useAtom(appExportLoadingAtom)
  const [, setCreateDialogOpen] = useAtom(createAPPDialogOpenAtom)

  const handleExport = async () => {
    try {
      // TODO: Implement export functionality
      toast.success('Export started')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const handleCreateNew = () => {
    setCreateDialogOpen(true)
  }

  return (
    <>
      {/* Search and Controls - First Row */}
      <div className="flex flex-row space-x-2 items-center w-full">
        <Input
          placeholder="Search APPs..."
          value={filter.searchTerm}
          onChange={(e) =>
            setFilter({ ...filter, searchTerm: e.target.value })
          }
          className="max-w-sm"
        />

        {/* Fiscal Year Filter */}
        <Select
          value={filter.fiscalYear?.toString()}
          onValueChange={(value) =>
            setFilter({ ...filter, fiscalYear: parseInt(value) })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Fiscal Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">FY 2024</SelectItem>
            <SelectItem value="2025">FY 2025</SelectItem>
            <SelectItem value="2026">FY 2026</SelectItem>
            <SelectItem value="2027">FY 2027</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filter.status}
          onValueChange={(value) =>
            setFilter({ ...filter, status: value as 'all' | 'Draft' | 'For Review' | 'Approved' | 'Published' })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="For Review">For Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Buttons - Grouped on the right */}
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={handleCreateNew}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Indicative APP
          </Button>
        </div>
      </div>
    </>
  )
}
