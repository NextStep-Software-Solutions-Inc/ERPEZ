import { Button } from '@/components/ui/button'
import { CreateLineItemBudgetDialog } from '@/pages/planning/line-item-budgeting/tabs/dialogs/CreateLineItemBudgetDialog'
import { useNavigate, useSearch } from '@tanstack/react-router'

interface HeroSectionProps {
  title?: string
  scope?: 'office' | 'sub-office'
  isSubOfficeToggleEnabled?: boolean
}

interface SearchParams {
  officeId?: string
  [key: string]: unknown
}

const TEMP_SUB_OFFICE_ID = import.meta.env.VITE_TEMP_SUB_OFFICE_ID

export const HeroSection = ({
  title,
  scope,
  isSubOfficeToggleEnabled,
}: HeroSectionProps) => {
  const navigation = useNavigate({ from: '/v2/line-item-budgeting' })
  const search = useSearch({
    from: '/v2/line-item-budgeting',
  }) as SearchParams

  const hasOfficeId = !!search.officeId

  const handleToggleOffice = () => {
    navigation({
      from: '/v2/line-item-budgeting',
      search: (prev: SearchParams) => {
        if (hasOfficeId) {
          // Remove officeId if it exists
          const { officeId, ...rest } = prev
          return rest
        }
        // Add officeId if it doesn't exist
        return { ...prev, officeId: TEMP_SUB_OFFICE_ID }
      },
    })
  }

  return (
    <div
      className="rounded-xl border p-8 transition-colors"
      style={{
        background: `hsl(var(--primary) / 0.05)`,
        borderColor: `hsl(var(--primary) / 0.2)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            {title ?? 'Office Line-Item Budget'}{' '}
            {isSubOfficeToggleEnabled && (
              <Button
                onClick={handleToggleOffice}
                variant={hasOfficeId ? 'default' : 'outline'}
              >
                {hasOfficeId ? 'Remove Office Filter' : 'Toggle Office'}
              </Button>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            {scope === 'sub-office'
              ? 'Create and manage Line-Item Budget documents for your sub-office'
              : 'Create and manage Line-Item Budget documents for your organization'}
          </p>
        </div>
        <CreateLineItemBudgetDialog />
      </div>
    </div>
  )
}
