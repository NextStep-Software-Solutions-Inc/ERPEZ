import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import type { FundingSource } from '../types/fundingSourceTypes'
import type { OrganizationCode } from '../types/organizationCodeTypes'
import type { LocationCode } from '../types/locationCodeTypes'
import type { MfoPap } from '../types/mfoPapTypes'
import type { ObjectCode } from '../types/objectCodeTypes'

// ============ Funding Source Actions ============
export function FundingSourceActions({
  item,
  onEdit,
  onDelete,
}: {
  item: FundingSource
  onEdit?: (item: FundingSource) => void
  onDelete?: (item: FundingSource) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onEdit?.(item)
          }}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onDelete?.(item)
          }}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============ Organization Code Actions ============
export function OrganizationActions({
  item,
  onEdit,
  onDelete,
}: {
  item: OrganizationCode
  onEdit?: (item: OrganizationCode) => void
  onDelete?: (item: OrganizationCode) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onEdit?.(item)
          }}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onDelete?.(item)
          }}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============ Location Code Actions ============
export function LocationActions({
  item,
  onEdit,
  onDelete,
}: {
  item: LocationCode
  onEdit?: (item: LocationCode) => void
  onDelete?: (item: LocationCode) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onEdit?.(item)
          }}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onDelete?.(item)
          }}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============ MFO/PAP Actions ============
export function MfoPapActions({
  item,
  onEdit,
  onDelete,
}: {
  item: MfoPap
  onEdit?: (item: MfoPap) => void
  onDelete?: (item: MfoPap) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onEdit?.(item)
          }}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onDelete?.(item)
          }}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============ Object Code Actions ============
export function ObjectCodeActions({
  item,
  onEdit,
  onDelete,
}: {
  item: ObjectCode
  onEdit?: (item: ObjectCode) => void
  onDelete?: (item: ObjectCode) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onEdit?.(item)
          }}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false)
            onDelete?.(item)
          }}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
