import { createColumnHelper } from '@tanstack/react-table'
import type { FundingSource } from '../types/fundingSourceTypes'
import type { OrganizationCode } from '../types/organizationCodeTypes'
import type { LocationCode } from '../types/locationCodeTypes'
import type { MfoPap } from '../types/mfoPapTypes'
import type { ObjectCode } from '../types/objectCodeTypes'
import {
  FundingSourceActions,
  OrganizationActions,
  LocationActions,
  MfoPapActions,
  ObjectCodeActions,
} from './Actions'
import { formatFundSourceType } from '@/utils/formatters'

// ============ Funding Source Columns ============
export function createFundingSourceColumns(options: {
  onEdit?: (item: FundingSource) => void
  onDelete?: (item: FundingSource) => void
}) {
  const columnHelper = createColumnHelper<FundingSource>()

  return [
    columnHelper.accessor('code', {
      id: 'code',
      cell: (info) => (
        <div className="font-mono font-medium">{info.getValue()}</div>
      ),
      header: 'Code',
      size: 120,
    }),
    columnHelper.accessor('name', {
      id: 'name',
      cell: (info) => <div>{info.getValue()}</div>,
      header: 'Name',
      size: 200,
    }),
    columnHelper.accessor('type', {
      id: 'type',
      cell: (info) => <div className="text-sm text-gray-600">{formatFundSourceType(info.getValue())}</div>,
      header: 'Type',
      size: 150,
    }),
    columnHelper.display({
      id: 'parentId',
      cell: (props) => (
        <div className="text-sm">{props.row.original.parentId || '-'}</div>
      ),
      header: 'Parent ID',
      size: 150,
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue()
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
      header: 'Status',
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (props) => (
        <FundingSourceActions
          item={props.row.original}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
        />
      ),
      header: 'Actions',
      size: 60,
    }),
  ]
}

// ============ Organization Code Columns ============
export function createOrganizationColumns(options: {
  onEdit?: (item: OrganizationCode) => void
  onDelete?: (item: OrganizationCode) => void
}) {
  const columnHelper = createColumnHelper<OrganizationCode>()

  return [
    columnHelper.accessor('code', {
      id: 'code',
      cell: (info) => (
        <div className="font-mono font-medium">{info.getValue()}</div>
      ),
      header: 'Code',
      size: 140,
    }),
    columnHelper.accessor('name', {
      id: 'name',
      cell: (info) => <div>{info.getValue()}</div>,
      header: 'Name',
      size: 220,
    }),
    columnHelper.accessor('description', {
      id: 'type',
      cell: (info) => <div className="text-sm text-gray-600">{info.getValue()}</div>,
      header: 'Type',
      size: 150,
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue()
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
      header: 'Status',
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (props) => (
        <OrganizationActions
          item={props.row.original}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
        />
      ),
      header: 'Actions',
      size: 60,
    }),
  ]
}

// ============ Location Code Columns ============
export function createLocationColumns(options: {
  onEdit?: (item: LocationCode) => void
  onDelete?: (item: LocationCode) => void
}) {
  const columnHelper = createColumnHelper<LocationCode>()

  return [
    columnHelper.accessor('code', {
      id: 'code',
      cell: (info) => (
        <div className="font-mono font-medium">{info.getValue()}</div>
      ),
      header: 'Code',
      size: 120,
    }),
    columnHelper.accessor('name', {
      id: 'name',
      cell: (info) => <div>{info.getValue()}</div>,
      header: 'Name',
      size: 200,
    }),
    columnHelper.accessor('description', {
      id: 'region',
      cell: (info) => <div className="text-sm text-gray-600">{info.getValue() || '-'}</div>,
      header: 'Region',
      size: 150,
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue()
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
      header: 'Status',
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (props) => (
        <LocationActions
          item={props.row.original}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
        />
      ),
      header: 'Actions',
      size: 60,
    }),
  ]
}

// ============ MFO/PAP Columns ============
export function createMfoPapColumns(options: {
  onEdit?: (item: MfoPap) => void
  onDelete?: (item: MfoPap) => void
}) {
  const columnHelper = createColumnHelper<MfoPap>()

  return [
    columnHelper.accessor('code', {
      id: 'code',
      cell: (info) => (
        <div className="font-mono font-medium">{info.getValue()}</div>
      ),
      header: 'Code',
      size: 120,
    }),
    columnHelper.accessor('name', {
      id: 'name',
      cell: (info) => <div>{info.getValue()}</div>,
      header: 'Name',
      size: 200,
    }),
    columnHelper.accessor('description', {
      id: 'program',
      cell: (info) => <div className="text-sm text-gray-600">{info.getValue() || '-'}</div>,
      header: 'Program',
      size: 150,
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue()
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
      header: 'Status',
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (props) => (
        <MfoPapActions
          item={props.row.original}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
        />
      ),
      header: 'Actions',
      size: 60,
    }),
  ]
}

// ============ Object Code Columns ============
export function createObjectCodeColumns(options: {
  onEdit?: (item: ObjectCode) => void
  onDelete?: (item: ObjectCode) => void
}) {
  const columnHelper = createColumnHelper<ObjectCode>()

  // Color mapping for expense classes
  const expenseClassBadgeColor = (expenseClass?: string) => {
    switch (expenseClass) {
      case 'PS':
        return 'bg-green-100 text-green-800'
      case 'MOOE':
        return 'bg-blue-100 text-blue-800'
      case 'CO':
        return 'bg-purple-100 text-purple-800'
      case 'FE':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return [
    columnHelper.accessor('code', {
      id: 'code',
      cell: (info) => (
        <div className="font-mono font-medium">{info.getValue()}</div>
      ),
      header: 'Code',
      size: 130,
    }),
    columnHelper.accessor('name', {
      id: 'name',
      cell: (info) => <div>{info.getValue()}</div>,
      header: 'Name',
      size: 200,
    }),
    columnHelper.display({
      id: 'expenseClass',
      cell: (info) => {
        const value = info.row.original.expenseClass
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseClassBadgeColor(value)}`}
          >
            {value || 'N/A'}
          </span>
        )
      },
      header: 'Expense Class',
      size: 140,
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue()
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
      header: 'Status',
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (props) => (
        <ObjectCodeActions
          item={props.row.original}
          onEdit={options.onEdit}
          onDelete={options.onDelete}
        />
      ),
      header: 'Actions',
      size: 60,
    }),
  ]
}
