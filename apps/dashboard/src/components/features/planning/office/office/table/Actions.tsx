import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import DeleteOfficeDialog from '../dialog/DeleteOfficeDialog'
import UpdateOfficeDialog from '../dialog/UpdateOfficeDialog'
import type { MetaActions } from '@/types/global'
import type { Office } from './types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Route } from '@/routes/v1/planning/office'

interface ActionsProps {
  data: Office
  readonly?: boolean
  actions?: MetaActions
}

export function Actions({ data, readonly, actions }: ActionsProps) {
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
          <Link to="/planning/office/$officeId/" params={{ officeId: data.id }}>
            <Button variant="ghost" size="sm">
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
          </Link>

          {actions?.includes('write') && !readonly && (
            <EditOfficeLink office={data} />
          )}

          {actions?.includes('delete') && !readonly && (
            <DeleteOfficeLink officeId={data.id} />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const EditOfficeLink = ({ office }: { office: Office }) => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })

  const handleClose = () => {
    navigate({
      to: '/planning/office',
      search: {
        ...search,
        edit: undefined,
      },
    })
  }

  // Fix: Properly compare string values from URL search params
  const openEditDialog =
    typeof search.edit === 'string' &&
    search.edit === office.id &&
    search.tab === 'office'

  return (
    <>
      <Link
        to="/planning/office"
        search={{ ...search, edit: office.id, tab: 'office' }}
      >
        <Button variant="ghost" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </Link>

      <UpdateOfficeDialog
        officeId={office.id}
        office={office}
        open={openEditDialog}
        onOpenChange={(open) => open === false && handleClose()}
        onCancel={handleClose}
      />
    </>
  )
}

const DeleteOfficeLink = ({ officeId }: { officeId: string }) => {
  const navigate = useNavigate()
  const search = useSearch({
    from: Route.id,
  })

  const handleClose = () => {
    navigate({
      to: '/planning/office',
      search: {
        ...search,
        delete: undefined,
      },
    })
  }

  const openDeleteDialog = Boolean(search.delete) && search.tab === 'office'

  return (
    <>
      <Link
        to="/planning/office"
        search={{ ...search, delete: true, tab: 'office' }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </Link>

      <DeleteOfficeDialog
        ids={[officeId]}
        open={openDeleteDialog}
        onOpenChange={(open) => open === false && handleClose()}
        onCancel={handleClose}
      />
    </>
  )
}
