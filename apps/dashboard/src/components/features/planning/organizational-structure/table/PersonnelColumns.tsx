'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { Personnel } from './types'
import PersonnelActions from './PersonnelActions'
import type { MetaActions } from '@/types/global'
import { formatRelativeDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Briefcase } from 'lucide-react'

export const createPersonnelColumns = (
  actions: MetaActions,
): ColumnDef<Personnel>[] => [
  {
    accessorKey: 'firstName',
    header: 'Personnel',
    cell: ({ row }) => {
      const firstName = row.getValue('firstName') as string
      const lastName = row.original.lastName
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-default-900 text-sm">{firstName} {lastName}</div>
            <div className="text-[10px] text-default-500 font-mono">{row.original.employeeNumber || 'N/A'}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'designation',
    header: 'Position',
    cell: ({ row }) => {
      const position = row.original.position
      const designation = row.getValue('designation') as string
      return (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-info flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-default-900">
              {position || designation || '-'}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-3.5 w-3.5 text-default-400 flex-shrink-0" />
          <a href={`mailto:${email}`} className="text-primary hover:underline truncate">
            {email || '-'}
          </a>
        </div>
      )
    },
  },
  {
    accessorKey: 'employmentStatus',
    header: 'Employment Status',
    cell: ({ row }) => {
      const empStatus = row.original.employmentStatus
      const statusColors: Record<string, string> = {
        'Permanent': 'bg-success/10 text-success',
        'Contractual': 'bg-warning/10 text-warning',
        'Casual': 'bg-info/10 text-info',
        'Coterminous': 'bg-purple-10 text-purple',
      }
      return (
        <Badge color="default" className={`text-[10px] font-semibold uppercase tracking-wider ${(empStatus && statusColors[empStatus]) || 'bg-default-100 text-default-700'}`}>
          {empStatus || 'N/A'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Current Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const isActive = status === 'active'
      return (
        <Badge color={isActive ? 'success' : 'secondary'} className="text-[10px] font-semibold uppercase">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }) => {
      const date = row.original.startDate as string | undefined
      return (
        <div className="text-sm text-default-600 whitespace-nowrap">
          {date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = row.original.updatedAt as string | undefined
      return (
        <div className="text-sm text-default-500 whitespace-nowrap">
          {date ? formatRelativeDate(date) : '-'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <PersonnelActions
        data={row.original}
        actions={actions}
      />
    ),
  },
] as const
