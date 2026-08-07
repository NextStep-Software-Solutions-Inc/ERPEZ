# KPI Detail Page - Animation Documentation

This document describes the Framer Motion animation implementation for the KPI Detail Page.

## Animation Variants

### Page Container

- **Effect**: Fade + slide-up entrance
- **Duration**: 400ms
- **Stagger**: Children elements animate with 80ms delay between each

### Card Components

- **Effect**: Scale from 0.98 → 1 with fade
- **Transition**: Spring animation (stiffness: 300, damping: 24)
- **Left Accent Bar**: Reveals via scaleY animation from 0 → 1

### Content Rows

- **Effect**: Fade + slight upward motion (8px)
- **Duration**: 300ms
- **Stagger**: 40ms between rows

### SDG Pills

- **Entrance**: Staggered fade + slide up (60ms delay between each)
- **Hover**: Scale to 1.03 with subtle box-shadow
- **Duration**: 280ms

### Tab Switching

- **Enter/Exit**: Slide left/right (20px) with fade
- **Direction-aware**: Slides in direction of tab navigation
- **Mode**: Uses AnimatePresence with "wait" mode for smooth transitions

## Accessibility

### Reduced Motion Support

All animations respect the `prefers-reduced-motion` media query:

- Animations are disabled when user has this preference set
- Page remains fully functional without animations
- Implemented via `useEffect` hook listening to MediaQueryList changes

### Keyboard Navigation

- All tabs are keyboard-focusable
- Tab triggers use Radix UI primitives for proper ARIA attributes
- Focus states maintained throughout navigation

## Files Structure

```
components/features/planning/kpi/
├── components/
│   ├── index.ts                    # Barrel exports
│   ├── SdgPill.tsx                 # Atomic SDG badge component
│   ├── KpiBasicInfoCard.tsx        # Basic Information tab content
│   ├── PerformanceMeasureCard.tsx  # Performance Measure tab content
│   ├── TargetCard.tsx              # Target tab content
│   └── ModeOfVerificationCard.tsx  # Mode of Verification tab content
└── handlers/
    └── getKpiDetailsRequest.ts     # API request handler
```

## Usage

```tsx
import { KpiBasicInfoCard } from '@/components/features/planning/kpi/components'

// The component auto-animates on mount
;<KpiBasicInfoCard kpi={kpiData} />
```

## Variant Constants

```typescript
// Card entrance
const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

// Left accent bar reveal
const accentVariants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

// SDG pill with hover
const pillVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28 } },
  hover: { scale: 1.03, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' },
}
```
