# UI Mockup - Procurement Category-First Management System

## Screen 1: Category List View (Landing Page)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Procurement Categories                                          │
│  Select a category to view and manage procurement modes          │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐│
│  │                  │  │                  │  │                  ││
│  │ [Icon Box]   ⋮   │  │ [Icon Box]   ⋮   │  │ [Icon Box]   ⋮   ││
│  │   (Blue)         │  │  (Green)         │  │ (Purple)         ││
│  │                  │  │                  │  │                  ││
│  │ Goods and        │  │ Infrastructure   │  │ Consulting       ││
│  │ Services         │  │                  │  │ Services         ││
│  │                  │  │                  │  │                  ││
│  │ [Goods and...]   │  │ [Infrastructure] │  │ [Consulting...]  ││
│  │                  │  │                  │  │                  ││
│  │ Contains 3       │  │ Contains 2       │  │ Contains 4       ││
│  │ procurement      │  │ procurement      │  │ procurement      ││
│  │ modes            │  │ modes            │  │ modes            ││
│  │                  │  │                  │  │                  ││
│  │ [View Modes]     │  │ [View Modes]     │  │ [View Modes]     ││
│  │                  │  │                  │  │                  ││
│  └──────────────────┘  └──────────────────┘  └──────────────────┘│
│                                                                   │
│  Mobile View (Single Column):              Tablet View (2 Col):  │
│  ┌────────────────┐                        ┌────────────┐        │
│  │ Card 1         │                        │  Card 1    │        │
│  └────────────────┘                        ├────────────┤        │
│  ┌────────────────┐                        │  Card 2    │        │
│  │ Card 2         │                        ├────────────┤        │
│  └────────────────┘                        │  Card 3    │        │
│  ┌────────────────┐                        └────────────┘        │
│  │ Card 3         │                                               │
│  └────────────────┘                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Category Card Detail (Hover State)

```
┌──────────────────────────────────────────┐
│                                            │
│  [Icon Box] with                ⋮⋮⋮ [Menu Visible on Hover]
│  Category Name (Bold, Large)    │ View Modes
│  [Category Badge - Pill]        └────────
│  
│  Helper Text:
│  Contains 3 procurement modes
│
│  [View Modes] Button (Full Width, Blue)
│
└──────────────────────────────────────────┘
```

---

## Screen 2: Procurement Modes List View

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│ ← Back to Categories                                             │
│                                                                   │
│ Goods and Services - Procurement Modes                           │
│ Manage procurement modes for Goods and Services                  │
│                                              [+ Create Mode]      │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ [Search Box] ▼                           [Show Archived] ⚙       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌───────────────────────────────────────────────────────────────┐│
│ │ [Icon Box]  Competitive Bidding        [View Details] [⋮]    ││
│ │   (Blue)                                                       ││
│ │                                                                ││
│ │ [Goods and Services] [Active] [2 thresholds]                 ││
│ │                                                                ││
│ │ Description: Method for purchasing goods through open bidding ││
│ │                                                                ││
│ │ Amount Range: ₱0 – ₱999,999,999                              ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌───────────────────────────────────────────────────────────────┐│
│ │ [Icon Box]  Limited Bidding             [View Details] [⋮]    ││
│ │   (Blue)                                                       ││
│ │                                                                ││
│ │ [Goods and Services] [Active] [1 threshold]                  ││
│ │                                                                ││
│ │ Description: Limited bidding method for specific goods       ││
│ │                                                                ││
│ │ Amount Range: ₱100,000 – ₱500,000                            ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌───────────────────────────────────────────────────────────────┐│
│ │ [Icon Box]  Negotiated Procurement     [View Details] [⋮]    ││
│ │   (Blue)                                                       ││
│ │                                                                ││
│ │ [Goods and Services] [Inactive] [No thresholds]              ││
│ │                                                                ││
│ │ Description: Direct negotiation with suppliers              ││
│ │                                                                ││
│ │ Amount Range: ₱50,000 – ₱250,000                             ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Mode Card Detail

```
┌────────────────────────────────────────────┐
│                                             │
│ [Icon] Competitive Bidding    [View] [⋮]   │
│   ↓                                         │
│ [Goods & Services] [Active] [2 thresholds] │
│   ↓                                         │
│ Short description text...                   │
│   ↓                                         │
│ Amount Range: ₱50,000 – ₱250,000           │
│                                             │
└────────────────────────────────────────────┘

Dropdown Menu (Click ⋮):
├─ View Details
├─ Edit
├─ Create Threshold
└─ Archive
```

---

## Screen 3: Mode Details View

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│ ← Back to Modes List                                             │
│                                                                   │
│ Competitive Bidding                                              │
│ [Goods and Services] • [Active] [View Audit Log] [Edit] [⋮]    │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Description                                                       │
│ ─────────────────────────────────────────────────────────────    │
│ Method for purchasing goods and services through open bidding    │
│ process                                                           │
│                                                                   │
│ Amount Range                                                     │
│ ─────────────────────────────────────────────────────────────    │
│ Minimum: ₱0                                                      │
│ Maximum: ₱999,999,999                                           │
│                                                                   │
│ Thresholds (2)                                                   │
│ ─────────────────────────────────────────────────────────────    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TH-1: ₱50,000 – ₱100,000       Status: Active              │ │
│ │ Effective: 2024-01-01 to 2024-12-31                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TH-2: ₱100,000 – ₱500,000      Status: Active              │ │
│ │ Effective: 2024-01-01 to 2024-12-31                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Metadata                                                         │
│ ─────────────────────────────────────────────────────────────    │
│ Created: 2026-01-01 by Admin                                    │
│ Updated: 2026-02-04 by Planning Officer                        │
│ Status: Active                                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 4: Audit Log View

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│ ← Back to Competitive Bidding                                    │
│                                                                   │
│ Audit Log                                                         │
│ Activity history for Competitive Bidding                         │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Mode Created ──────────────────────────────────────────────┐ │
│ │ [✓ Green Icon]  Created by: Admin                           │ │
│ │                 2026-02-04 14:30:22                         │ │
│ │                                                              │ │
│ │                 No changes (initial creation)               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─ Mode Updated ──────────────────────────────────────────────┐ │
│ │ [✎ Blue Icon]   Updated by: Planning Officer               │ │
│ │                 2026-02-04 16:45:10                         │ │
│ │                                                              │ │
│ │                 Changes:                                     │ │
│ │                 • Description: "..." → "Method for..."      │ │
│ │                 • Status: inactive → active                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─ Mode Updated ──────────────────────────────────────────────┐ │
│ │ [✎ Blue Icon]   Updated by: Admin                           │ │
│ │                 2026-02-04 09:15:30                         │ │
│ │                                                              │ │
│ │                 Changes:                                     │ │
│ │                 • Min Amount: ₱0 → ₱50,000                 │ │
│ │                 • Max Amount: ₱500,000 → ₱999,999,999      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Legend

### Category Colors
```
Goods and Services:     █ Light Blue (#EFF6FF / bg-blue-50)
                        ░ Blue (#2563EB / text-blue-600)

Infrastructure:         █ Light Green (#ECFDF5 / bg-green-50)
                        ░ Green (#16A34A / text-green-600)

Consulting Services:    █ Light Purple (#F3E8FF / bg-purple-50)
                        ░ Purple (#9333EA / text-purple-600)
```

### Status Colors
```
Active:     █ Light Green (#DCFCE7 / bg-green-100)
            ░ Green (#16A34A / text-green-600)

Inactive:   █ Light Red (#FEE2E2 / bg-red-100)
            ░ Red (#DC2626 / text-red-600)

Archive:    █ Light Orange (#FEF3C7 / bg-orange-100)
            ░ Orange (#D97706 / text-orange-600)
```

### Neutral Colors
```
White:      #FFFFFF / bg-white
Border:     #E5E7EB / border-gray-200
Text Dark:  #111827 / text-gray-900
Text Light: #4B5563 / text-gray-600
Muted:      #6B7280 / text-gray-500
```

---

## Typography Scale

```
Page Title:     24px / 1.5rem  (text-2xl)  | Bold
Card Title:     18px / 1.125rem (text-lg)  | Bold
Subtitle:       16px / 1rem     (text-base) | Semibold
Body Text:      16px / 1rem     (text-base) | Regular
Small Text:     14px / 0.875rem (text-sm)   | Regular
Meta Text:      12px / 0.75rem  (text-xs)   | Medium
```

---

## Interactive States

### Button States
```
Default:    bg-blue-600, text-white
Hover:      bg-blue-700 (darker)
Active:     border-2, slightly elevated
Disabled:   opacity-50, cursor-not-allowed

Ghost:      transparent, text color only
Ghost Hover: light background
```

### Card States
```
Default:    shadow-sm, border-gray-200
Hover:      shadow-md (elevated)
Active:     border color changes (if applicable)
```

### Badge States
```
Active:     green background, green text
Inactive:   red background, red text
Category:   outlined style, gray text
Count:      secondary style (muted background)
```

---

## Spacing Measurements

```
Outer Padding:      24px (p-6)
Card Padding:       20px (p-5)
Icon Container:     12px (p-3)
Large Gap:          24px (gap-6)
Medium Gap:         16px (gap-4)
Small Gap:          8px (gap-2)
Line Height:        Comfortable (1.5-1.75)
```

---

## Responsive Breakpoints

```
Mobile:     < 768px  | 1 column
Tablet:     768px+   | 2 columns (md)
Desktop:    1024px+  | 3 columns (lg)

Container Width:
Mobile:     Full width - 2px padding
Tablet:     90% or max 768px
Desktop:    90% or max 1280px
```

---

## Edge Cases & Empty States

### No Modes in Category
```
┌─────────────────────────────────────────┐
│                                          │
│ [📦 Icon - Large]                       │
│                                          │
│ No modes found                           │
│ No procurement modes for [Category]     │
│                                          │
│ [+ Create Mode] Button                  │
│                                          │
└─────────────────────────────────────────┘
```

### No Audit Log History
```
┌─────────────────────────────────────────┐
│                                          │
│ [📄 Icon - Large]                       │
│                                          │
│ No activity yet                          │
│ This mode hasn't been modified yet.     │
│                                          │
└─────────────────────────────────────────┘
```

### Loading State (Optional)
```
[Skeleton loaders matching card shapes]
- Replace actual content with gray placeholder
- Maintain layout to prevent jumping
- Show 3 skeleton cards in modes list
```

---

## Accessibility Features

✓ **Color Not Only Indicator**
  - Status shown as text in badge
  - Actions labeled in buttons
  - No information conveyed by color alone

✓ **Keyboard Navigation**
  - Tab through all buttons and links
  - Enter to activate buttons
  - Escape to close dropdowns
  - Arrow keys in dropdowns

✓ **Screen Reader Support**
  - Semantic HTML elements
  - Descriptive button labels
  - ARIA labels where needed

✓ **Focus Indicators**
  - Visible focus state on all interactive elements
  - High contrast focus rings

✓ **Text Size**
  - Minimum 14px for body text
  - 1.5x line height for readability
  - Scalable font sizes (rem/em units)

---

## Implementation Checklist

- [x] Category list view with 3 categories
- [x] Responsive grid layout (1/2/3 columns)
- [x] Category-specific colors and styling
- [x] Mode count display
- [x] Navigation between views
- [x] Search and filter functionality
- [x] Mode details display
- [x] Audit log timeline
- [x] Action buttons and dropdowns
- [x] Empty states
- [x] Hover effects
- [x] Mobile responsiveness
- [x] Accessibility features
- [x] Professional ERP aesthetic

