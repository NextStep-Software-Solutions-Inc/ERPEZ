import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  /** If true, renders a divider below the section */
  withDivider?: boolean
}

/**
 * Reusable wrapper for a named section within a form.
 * Provides a title, optional description, consistent spacing, and an optional divider.
 */
export function FormSection({
  title,
  description,
  children,
  className,
  withDivider = false,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Section heading */}
      <div className="space-y-0.5">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-3">{children}</div>

      {withDivider && <div className="border-b border-border" />}
    </div>
  )
}
