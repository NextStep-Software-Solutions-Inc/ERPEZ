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
import type { AppMaster } from '../types'

interface ToolbarProps<TData extends { id: string | number } = any> {
  table: Table<TData>
  showColumnVisibility?: boolean
}

export default function Toolbar({ }: ToolbarProps<AppMaster>) {
  const [filter, setFilter] = useAtom(appListFilterAtom)
  const [, setExportLoading] = useAtom(appExportLoadingAtom)
  const [, setCreateDialogOpen] = useAtom(createAPPDialogOpenAtom)

  const handleExport = async () => {
    setExportLoading(true)
    try {
      // TODO: Implement export functionality
      toast.success('Export started')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <>
      {/* Search and Clear - First Row */}
      <div className="flex flex-row space-x-2">
        <Input
          placeholder="Search APPs..."
          value={filter.searchTerm}
          onChange={(e) =>
            setFilter({ ...filter, searchTerm: e.target.value })
          }
          className="max-w-sm"
        />
        <Button
          variant="ghost"
          onClick={() => setFilter({ ...filter, searchTerm: '' })}
        >
          Clear
        </Button>
      </div>

      {/* Filters and Actions - Second Row */}
      <div className="grow flex items-center justify-between gap-1">
        {/* Filters - Left Side */}
        <div className="flex items-center gap-2">
          <Select
            value={filter.status}
            onValueChange={(value) =>
              setFilter({ ...filter, status: value as any })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending-review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.fiscalYear.toString()}
            onValueChange={(value) =>
              setFilter({ ...filter, fiscalYear: parseInt(value) })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">FY 2024</SelectItem>
              <SelectItem value="2025">FY 2025</SelectItem>
              <SelectItem value="2026">FY 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions - Right Side */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Indicative APP
          </Button>
        </div>
      </div>
    </>
  )
}
