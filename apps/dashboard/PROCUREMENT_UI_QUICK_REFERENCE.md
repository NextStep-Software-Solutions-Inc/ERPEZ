# Procurement Category-First UI - Quick Reference Guide

## Navigation Map

```
HOME: Categories View
├─ Goods and Services Card
│  └─ Click → Goods and Services Modes List
│     ├─ Search & Filter
│     └─ Mode Card
│        └─ View Details → Mode Details View
│           ├─ View Audit Log
│           └─ Edit (via dropdown)
├─ Infrastructure Card
│  └─ Click → Infrastructure Modes List
│     └─ (Same as above)
└─ Consulting Services Card
   └─ Click → Consulting Services Modes List
      └─ (Same as above)
```

## Component Hierarchy

### View States
```
viewMode: 'categories' | 'modes' | 'details' | 'audit-log'

categories → User clicks "View Modes" 
  ↓
modes → (selectedCategory is set) → User clicks "View Details"
  ↓
details → (selectedMode is set) → User clicks "View Audit Log"
  ↓
audit-log → (selectedMode stays) → User clicks back button
  ↓
details → User clicks back button
  ↓
modes → User clicks "Back to Categories"
  ↓
categories
```

## Visual Grid Reference

### Category Cards Grid (Landing Page)
```
Desktop (lg):       Tablet (md):        Mobile:
┌──┬──┬──┐         ┌──┬──┐             ┌──┐
│1 │2 │3 │         │1 │2 │             │1 │
├──┼──┼──┤         ├──┼──┤             ├──┤
                   │3 │                │2 │
                   └──┴──┘             ├──┤
└──┴──┴──┘                             │3 │
                                       └──┘

grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### Responsive Behavior
- **Mobile**: Full-width cards, single column
- **Tablet**: 2-column layout, 6px gap between cards
- **Desktop**: 3-column layout, 6px gap between cards

## CSS Classes Reference

### Card Styling
```typescript
// Category Card
className="bg-{color}-50 border-2 border-{color}-200 rounded-lg p-6 hover:shadow-md transition-all"

// Mode Card
className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md"

// Detail Section
className="bg-gray-50 rounded-lg border border-gray-200"
```

### Icon Containers
```typescript
// Category Icon Box
className="bg-{color}-50 border border-{color}-200 rounded-lg p-3 flex items-center justify-center"
className="{iconColor} w-6 h-6"

// Mode Icon Box
className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center"
className="text-blue-600 w-5 h-5"
```

### Badge Classes
```typescript
// Status Badge
color={mode.status === 'active' ? 'default' : 'destructive'}

// Category Badge
variant="outline" className="text-xs"

// Count Badge
variant="secondary" className="text-xs"
```

### Button Classes
```typescript
// Primary Action Button (Full Width)
className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"

// View Details Button
className="bg-default hover:bg-blue-700"

// Back Button
variant="ghost"
className="gap-2 -ml-4"

// Menu Button
variant="ghost" size="sm"
className="h-8 w-8 p-0"
className="opacity-0 group-hover:opacity-100" // Category cards only
```

### Text Classes
```typescript
// Page Title
className="text-2xl font-bold"

// Card Title
className="text-lg font-bold text-gray-900 mb-2"

// Subtitle
className="text-base font-semibold"

// Body Text
className="text-sm text-gray-600"

// Meta Text
className="text-xs font-medium text-muted-foreground"
```

### Layout Classes
```typescript
// Main Container
className="space-y-6"

// Category Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Modes List
className="space-y-3"

// Card Section
className="flex items-start justify-between gap-4"

// Content Group
className="space-y-4"
```

## Color Palette

### Background Colors
| Use Case | Color | Class |
|----------|-------|-------|
| White Cards | White | `bg-white` |
| Goods & Services | Light Blue | `bg-blue-50` |
| Infrastructure | Light Green | `bg-green-50` |
| Consulting Services | Light Purple | `bg-purple-50` |
| Page Background | Light Gray | `bg-gray-50` |

### Border Colors
| Use Case | Color | Class |
|----------|-------|-------|
| Card Borders | Gray-200 | `border-gray-200` |
| Goods & Services | Blue-200 | `border-blue-200` |
| Infrastructure | Green-200 | `border-green-200` |
| Consulting Services | Purple-200 | `border-purple-200` |

### Text Colors
| Use Case | Color | Class |
|----------|-------|-------|
| Headings | Gray-900 | `text-gray-900` |
| Body Text | Gray-600 | `text-gray-600` |
| Muted Text | Gray-500 | `text-gray-500` |
| Goods & Services | Blue-600 | `text-blue-600` |
| Infrastructure | Green-600 | `text-green-600` |
| Consulting Services | Purple-600 | `text-purple-600` |

### Status Colors
| Status | Colors | Usage |
|--------|--------|-------|
| Active | Green (100/600) | Status badge, checkmarks |
| Inactive | Red (100/600) | Status badge, disabled states |
| Archive | Orange (100/600) | Archive actions |
| Updated | Blue (100/600) | Update actions |
| Created | Green (100/600) | Create actions |

## Interactive States

### Hover Effects
```typescript
// Category Cards
className="hover:shadow-md cursor-pointer group"
// Makes menu visible on hover
className="opacity-0 group-hover:opacity-100"

// Mode Cards
className="hover:shadow-md transition-all"

// Buttons
className="hover:bg-{color}-700"
```

### Focus States
- All buttons support keyboard focus
- Tab navigation works across all interactive elements
- Dropdown menus fully keyboard accessible

### Active States
- Selected category doesn't have special indicator (state in viewMode)
- Active status badge shows green color
- Archive toggle shows blue when enabled

## Data Flow

### Category View Data
```typescript
categories: string[] // ['Goods and Services', 'Infrastructure', 'Consulting Services']
getModeCountForCategory(category) → number // Count of active modes
```

### Modes View Data
```typescript
selectedCategory: string
searchTerm: string
showArchived: boolean
getModesForCategory(category) → ModeOfProcurement[] // Filtered modes
```

### Mode Card Data
```typescript
mode: ModeOfProcurement {
  id: string
  modeName: string
  category: string
  status: 'active' | 'inactive'
  description?: string
  minAmount: number
  maxAmount: number
  isArchived?: boolean
}
thresholds: ProcurementThreshold[] // Associated thresholds
```

### Details View Data
```typescript
selectedMode: ModeOfProcurement
thresholds: ProcurementThreshold[] // Filtered by modeId
auditLogs: ModeAuditLog[]
```

## Action Handlers

### Navigation Actions
```typescript
// Go to modes view
setSelectedCategory(category)
setViewMode('modes')

// Go to details view
setSelectedMode(mode)
setViewMode('details')

// Go back to previous view
setViewMode('modes') // or 'categories'
setSelectedMode(null) // if going back from details

// Go to audit log
setViewMode('audit-log')
```

### CRUD Actions
```typescript
handleCreateSuccess() // Create new mode
handleEditMode(mode) // Opens edit dialog
handleUpdateMode(data, modeId) // Update existing mode
handleDeleteMode(modeId) // Delete mode
handleArchiveMode(modeId) // Archive/restore mode
```

### Filter Actions
```typescript
setSearchTerm(value) // Search modes
setShowArchived(boolean) // Toggle archived modes
```

## Troubleshooting

### Issue: Mode count shows 0
**Solution**: Check that mode has `isArchived: false` and `category` matches

### Issue: Category menu not visible
**Solution**: Menu is hidden until hover on category cards - this is intentional

### Issue: Back button not working
**Solution**: Ensure `setViewMode()` is called with correct state

### Issue: Filters not updating modes list
**Solution**: Verify `getModesForCategory()` is being called in render

### Issue: Mode details show wrong data
**Solution**: Check that `selectedMode` state is set before navigating to details view

## Performance Notes

- Category configuration is memoizable if needed
- Mode filtering happens in render (consider useMemo for large datasets)
- State updates trigger re-renders for affected views only
- No unnecessary API calls in current mock implementation

## Accessibility Features

✓ Semantic HTML structure
✓ Proper button labels for screen readers
✓ Color not the only indicator (badges have text)
✓ Keyboard navigation support via existing UI components
✓ WCAG AA compliant color contrasts
✓ Descriptive link/button text

## Browser Support

- Modern browsers with CSS Grid support
- Tailwind CSS (all versions 3+)
- React 18+
- TypeScript 4.5+
