import { MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OfficeTypeSetting, PositionTypeSetting, SalaryGradeSetting, PlantillaTypeSetting, PMTMaximumSeatsSetting } from '../types'

type SettingData = OfficeTypeSetting | PositionTypeSetting | SalaryGradeSetting | PlantillaTypeSetting | PMTMaximumSeatsSetting

interface ActionsProps {
  data: SettingData
  onEdit?: (data: SettingData) => void
  onDelete?: (data: SettingData) => void
}

export function Actions({ data, onEdit, onDelete }: ActionsProps) {
  const readonly = false // Can be made dynamic based on role/permissions

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="p-2 flex flex-col gap-2 justify-start items-start">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(data)}
            >
              Edit
            </Button>
          )}
          {!readonly && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(data)}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
