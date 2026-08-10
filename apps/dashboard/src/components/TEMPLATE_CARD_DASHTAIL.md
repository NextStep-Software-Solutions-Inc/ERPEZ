# TemplateCardDashtail Component

A reusable, type-safe card template component with support for color-coding, actions, animations, and flexible content layouts.

## Features

- **Color Schemes**: Support for multiple predefined color schemes (primary, blue, orange, purple, emerald, red)
- **Flexible Layout**: Header with icon/title and content area with flexible children
- **Actions**: Permission-aware action buttons with hover animations
- **Animations**: Framer Motion animations for entry and hover states
- **Type-Safe**: Full TypeScript support without `any` types
- **Accessibility**: ARIA labels and semantic HTML

## Props

```typescript
interface TemplateCardDashtailProps {
  title: string                           // Card title (required)
  subtitle?: string                       // Optional subtitle below title
  icon?: ReactNode                        // Optional icon in header
  colorScheme?: CardColorScheme            // Color theme: 'primary' | 'blue' | 'orange' | 'purple' | 'emerald' | 'red'
  actions?: CardAction[]                  // Array of action buttons
  index?: number                          // Animation delay index (default: 0)
  children: ReactNode                     // Main content
  className?: string                      // Additional CSS classes
  onHover?: boolean                       // Enable hover shadow effect (default: true)
}

interface CardAction {
  label: string                           // Action button label/tooltip
  icon: ReactNode                         // Icon to display
  onClick: () => void                     // Click handler
  variant?: 'default' | 'outline' | 'destructive'  // Button style
  size?: 'sm' | 'icon'                    // Button size
  className?: string                      // Additional styling
  disabled?: boolean                      // Disable button
  hasPermission?: boolean                 // Hide button if false (permission check)
}

type CardColorScheme = 'primary' | 'blue' | 'orange' | 'purple' | 'emerald' | 'red'
```

## Usage Examples

### Basic Card with Title and Content

```tsx
import { TemplateCardDashtail } from '@/components/TemplateCardDashtail'
import { TrendingUp } from 'lucide-react'

export function MyCard() {
  return (
    <TemplateCardDashtail
      title="Economic Indicator"
      subtitle="FY 2024"
      icon={<TrendingUp className="h-5 w-5" />}
      colorScheme="emerald"
    >
      <div>
        <p className="text-sm">VAT Rate: 12%</p>
        <p className="text-sm">Status: Active</p>
      </div>
    </TemplateCardDashtail>
  )
}
```

### Card with Actions

```tsx
import { TemplateCardDashtail } from '@/components/TemplateCardDashtail'
import { Edit, Trash2, TrendingUp } from 'lucide-react'

export function EditableCard({ item }) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <TemplateCardDashtail
      title={item.name}
      icon={<TrendingUp className="h-5 w-5" />}
      colorScheme="blue"
      actions={[
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          onClick: () => handleEdit(item),
          hasPermission: userCan('write'),
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDelete(item),
          variant: 'destructive',
          disabled: isLoading,
          hasPermission: userCan('delete'),
        },
      ]}
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <p className="text-xs font-semibold">{item.value}</p>
      </div>
    </TemplateCardDashtail>
  )
}
```

### Card Grid with Animations

```tsx
import { TemplateCardDashtail } from '@/components/TemplateCardDashtail'
import { AnimatePresence } from 'framer-motion'

export function CardGrid({ items }) {
  return (
    <AnimatePresence mode="popLayout">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <TemplateCardDashtail
            key={item.id}
            title={item.title}
            colorScheme={item.colorScheme}
            index={idx}
            actions={[/* ... */]}
          >
            {/* Content */}
          </TemplateCardDashtail>
        ))}
      </div>
    </AnimatePresence>
  )
}
```

## Color Scheme Reference

| Scheme   | Use Case                    | Border Class           | Background Class      | Icon Color      |
|----------|---------------------------|----------------------|----------------------|-----------------|
| primary  | Default, general items    | border-primary/20    | bg-primary/5         | text-primary    |
| blue     | Information, core data    | border-blue-200      | bg-blue-50/50        | text-blue-600   |
| orange   | Warnings, inflation data  | border-orange-200    | bg-orange-50/50      | text-orange-600 |
| purple   | Premium, tax data         | border-purple-200    | bg-purple-50/50      | text-purple-600 |
| emerald  | Success, VAT rates        | border-emerald-200   | bg-emerald-50/50     | text-emerald-600|
| red      | Critical, errors          | border-red-200       | bg-red-50/50         | text-red-600    |

## Type Safety

The component uses full TypeScript typing with discriminated unions for actions and strict typing of all props. No `any` types are used.

## Animation Behavior

- **Entry**: Cards animate in with fade and slide-up, with staggered delays based on index
- **Exit**: Cards fade and scale out on removal
- **Hover**: Actions appear on hover with opacity transition
- **Hover Effect**: Card shadow elevates on hover (when `onHover={true}`)

## Accessibility

- ARIA labels on all action buttons
- Title tooltips on action buttons
- Semantic HTML structure
- Keyboard navigation support through shadcn Button component

## Best Practices

1. **Always provide a title** - Required for card identification
2. **Use meaningful icons** - Helps users quickly identify card type
3. **Choose color schemes thoughtfully** - Match domain semantics (e.g., emerald for VAT/success)
4. **Implement permission checks** - Use `hasPermission` prop to hide actions user can't perform
5. **Keep content concise** - Cards should display summary information
6. **Use with CardGrid** - Combine with framer-motion's AnimatePresence for smooth layouts

## Integration with Economic Indicators

For the Economic Indicators feature, use color schemes mapped by indicator type:

```tsx
const colorByIndicatorType: Record<string, CardColorScheme> = {
  'vat-rate': 'emerald',
  'inflation-rate': 'orange',
  'income-tax-rate': 'purple',
}

const iconByIndicatorType: Record<string, ReactNode> = {
  'vat-rate': <Receipt className="h-5 w-5" />,
  'inflation-rate': <TrendingUp className="h-5 w-5" />,
  'income-tax-rate': <DollarSign className="h-5 w-5" />,
}

<TemplateCardDashtail
  title={`${indicatorLabel[indicator.type]}`}
  subtitle={`FY ${indicator.fiscalYear}`}
  icon={iconByIndicatorType[indicator.type]}
  colorScheme={colorByIndicatorType[indicator.type]}
  actions={[...]}
>
  {/* Content */}
</TemplateCardDashtail>
```

## Real-World Example: Economic Indicator Card

```tsx
import { TemplateCardDashtail } from '@/components/TemplateCardDashtail'
import { Edit, Trash2, TrendingUp, Receipt, DollarSign } from 'lucide-react'
import { useState } from 'react'

interface EconomicIndicator {
  id: string
  type: 'vat-rate' | 'inflation-rate' | 'income-tax-rate'
  fiscalYear: string
  value: number
  effectiveDate: string
  isActive: boolean
}

const colorByType: Record<string, 'emerald' | 'orange' | 'purple'> = {
  'vat-rate': 'emerald',
  'inflation-rate': 'orange',
  'income-tax-rate': 'purple',
}

const iconByType: Record<string, React.ReactNode> = {
  'vat-rate': <Receipt className="h-5 w-5" />,
  'inflation-rate': <TrendingUp className="h-5 w-5" />,
  'income-tax-rate': <DollarSign className="h-5 w-5" />,
}

const labelByType: Record<string, string> = {
  'vat-rate': 'VAT Rate',
  'inflation-rate': 'Inflation Rate',
  'income-tax-rate': 'Income Tax Rate',
}

export function EconomicIndicatorCard({
  indicator,
  index,
  onEdit,
  onDelete,
  userPermissions,
}: {
  indicator: EconomicIndicator
  index: number
  onEdit: (indicator: EconomicIndicator) => void
  onDelete: (indicator: EconomicIndicator) => void
  userPermissions: string[]
}) {
  return (
    <TemplateCardDashtail
      title={labelByType[indicator.type]}
      subtitle={`FY ${indicator.fiscalYear}`}
      icon={iconByType[indicator.type]}
      colorScheme={colorByType[indicator.type]}
      index={index}
      actions={[
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          onClick: () => onEdit(indicator),
          hasPermission: userPermissions.includes('write'),
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => onDelete(indicator),
          variant: 'destructive',
          hasPermission: userPermissions.includes('delete'),
          disabled: !indicator.isActive, // Can't delete inactive
        },
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Value</p>
            <p className="text-2xl font-bold text-default-900">{indicator.value}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Status</p>
            <p className={`text-sm font-semibold ${indicator.isActive ? 'text-emerald-600' : 'text-slate-600'}`}>
              {indicator.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] font-medium text-muted-foreground uppercase">Effective</p>
          <p className="text-sm text-default-900">{new Date(indicator.effectiveDate).toLocaleDateString()}</p>
        </div>
      </div>
    </TemplateCardDashtail>
  )
}
```

## Integration with Grid Layout

```tsx
import { AnimatePresence } from 'framer-motion'

export function IndicatorCardGrid({
  indicators,
  onEdit,
  onDelete,
  isLoading,
}: {
  indicators: EconomicIndicator[]
  onEdit: (indicator: EconomicIndicator) => void
  onDelete: (indicator: EconomicIndicator) => void
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (indicators.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No indicators found</p>
      </div>
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((indicator, idx) => (
          <EconomicIndicatorCard
            key={indicator.id}
            indicator={indicator}
            index={idx}
            onEdit={onEdit}
            onDelete={onDelete}
            userPermissions={['read', 'write', 'delete']}
          />
        ))}
      </div>
    </AnimatePresence>
  )
}
```
