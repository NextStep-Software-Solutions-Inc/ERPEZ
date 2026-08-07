import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import UpdateOrganizationalClusterDialog from '../dialog/UpdateOrganizationalClusterDialog'
import type { MetaActions } from '@/types/global'
import type { Cluster } from './types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Route } from '@/routes/v1/planning/office'

interface ActionsProps {
  data: Cluster
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

          {actions?.includes('read') && !readonly && (
            <Link
              to="/planning/office/$clusterId"
              params={{ clusterId: data.id }}
            >
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
            </Link>
          )}

          {actions?.includes('write') && !readonly && (
            <EditClusterLink cluster={data} />
          )}
          {actions?.includes('delete') && !readonly && (
            <DeleteClusterLink clusterId={data.id} />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const EditClusterLink = ({ cluster }: { cluster: Cluster }) => {
  const navigate = useNavigate()
  const search = useSearch({ from: Route.id })

  const handleClose = () => {
    navigate({
      to: '/planning/office',
      search: {
        ...search,
        edit: undefined,
      },
    })
  }

  const openEditDialog =
    typeof search.edit === 'string' && search.edit === cluster.id

  return (
    <>
      <Link to="/planning/office" search={{ ...search, edit: cluster.id }}>
        <Button variant="ghost" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </Link>

      <UpdateOrganizationalClusterDialog
        clusterId={cluster.id}
        cluster={cluster}
        open={openEditDialog}
        onOpenChange={(open) => open === false && handleClose()}
        onCancel={handleClose}
      />
    </>
  )
}

const DeleteClusterLink = ({ clusterId }: { clusterId: string }) => {
  const navigate = useNavigate()
  const search = useSearch({ from: Route.id })

  const handleClose = () => {
    navigate({
      to: '/planning/office',
      search: {
        ...search,
        delete: undefined,
      },
    })
  }

  const openDeleteDialog = Boolean(search.delete)

  return (
    <>
      <Link to="/planning/office" search={{ ...search, delete: true }}>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </Link>

      <DeleteOrganizationalClusterDialog
        ids={[clusterId]}
        open={openDeleteDialog}
        onOpenChange={(open) => open === false && handleClose()}
        onCancel={handleClose}
      />
    </>
  )
}
