import type { AppStatus } from '../types'

interface StatusBadgeProps {
  status: AppStatus
  className?: string
  showLabel?: boolean
}

/**
 * Color-coded status badge for APP workflow states
 * Shows current status with semantic color coding
 */
export function StatusBadge({ status, className = '', showLabel = true }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Draft':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          badge: 'bg-blue-100',
          border: 'border border-blue-200',
        }
      case 'Submitted':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          badge: 'bg-orange-100',
          border: 'border border-orange-200',
        }
      case 'Approved':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          badge: 'bg-green-100',
          border: 'border border-green-200',
        }
      case 'Rejected':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          badge: 'bg-red-100',
          border: 'border border-red-200',
        }
      case 'Locked':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100',
          border: 'border border-emerald-200',
        }
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          badge: 'bg-gray-100',
          border: 'border border-gray-200',
        }
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'Draft':
        return 'Draft'
      case 'Submitted':
        return 'Pending Review'
      case 'Approved':
        return 'Approved'
      case 'Rejected':
        return 'Rejected'
      case 'Locked':
        return 'Locked'
      default:
        return 'Unknown'
    }
  }

  const styles = getStatusStyles()

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${styles.badge} ${styles.border} ${className}`}>
      <div className={`w-2 h-2 rounded-full ${styles.text.replace('text-', 'bg-')}`} />
      {showLabel && <span className={`text-sm font-medium ${styles.text}`}>{getStatusLabel()}</span>}
    </div>
  )
}
