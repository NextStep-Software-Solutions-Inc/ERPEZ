# Procurement Category-First Management UI Design

## Overview
A modern, card-based ERP UI designed with a category-first approach to procurement mode management. The interface emphasizes clean hierarchy, readability, and intuitive navigation.

## Visual Design System

### Design Principles
- **Card-based Layout**: All content displayed in clean, spacious cards
- **White Background**: Professional, clean appearance
- **Subtle Shadows**: `shadow-sm`, `hover:shadow-md` for depth without heaviness
- **Rounded Corners**: `rounded-lg` for modern feel
- **Clear Hierarchy**: Bold fonts for titles, smaller fonts for metadata
- **Generous Spacing**: `gap-6`, `p-6`, `p-5` for breathing room
- **Color Coding**: Each category has a unique soft background color

## UI Views

### 1. Category List View (Landing Page)
**Purpose**: Display all procurement categories at the top level

#### Structure
```
┌─ HEADER ─────────────────────────────────────────┐
│ Procurement Categories                           │
│ Select a category to view and manage procurement modes │
└──────────────────────────────────────────────────┘

┌─ CATEGORY CARDS (3-column grid, responsive) ────┐
│                                                   │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ │ [Icon Box]  │  │ [Icon Box]  │  │ [Icon Box]  │
│ │ ⋮⋮⋮ (Menu)  │  │ ⋮⋮⋮ (Menu)  │  │ ⋮⋮⋮ (Menu)  │
│ │             │  │             │  │             │
│ │ Category    │  │ Category    │  │ Category    │
│ │ Name        │  │ Name        │  │ Name        │
│ │             │  │             │  │             │
│ │ [Badge]     │  │ [Badge]     │  │ [Badge]     │
│ │ "Contains 3 │  │ "Contains 2 │  │ "Contains 4 │
│ │ modes"      │  │ modes"      │  │ modes"      │
│ │             │  │             │  │             │
│ │ [View Modes]│  │ [View Modes]│  │ [View Modes]│
│ └─────────────┘  └─────────────┘  └─────────────┘
│                                                   │
└──────────────────────────────────────────────────┘
```

#### Category Card Layout

**Left Section** (Icon Container)
```
┌─────────────────┐
│ [Soft bg]       │
│   [Icon]        │
└─────────────────┘
- Rounded square
- Unique background color per category
- Simple line icon
- Soft color scheme
```

**Middle Section** (Content)
```
Category Name (Bold, lg font)

[Category Badge] (Pill-shaped)

Helper Text: "Contains X modes"
```

**Right Section** (Actions)
```
Three-dot menu (visible on hover)
- View Modes
```

**Bottom Section** (Primary Action)
```
[View Modes] Button
- Primary blue button
- Full width
- Bold text
```

#### Category Configuration
```typescript
{
  'Goods and Services': {
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  'Infrastructure': {
    color: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  'Consulting Services': {
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
}
```

### 2. Procurement Modes List View
**Purpose**: Show all modes for selected category, with filtering and search

#### Structure
```
┌─ HEADER ─────────────────────────────────────────┐
│ [← Back to Categories]                           │
│                                                   │
│ Category Name - Procurement Modes                │
│ Manage procurement modes for [Category]          │
│                          [+ Create Mode] Button  │
└──────────────────────────────────────────────────┘

┌─ TOOLBAR ────────────────────────────────────────┐
│ [Search Box] [Show Archived] Toggle              │
└──────────────────────────────────────────────────┘

┌─ MODES LIST ─────────────────────────────────────┐
│                                                   │
│ ┌─ MODE CARD ───────────────────────────────────┐
│ │ [Icon] Mode Name                [View] [⋮]    │
│ │                                                │
│ │ [Category] [Active] [2 thresholds]             │
│ │                                                │
│ │ Short description text...                      │
│ │                                                │
│ │ Amount Range: ₱50,000 – ₱250,000               │
│ └────────────────────────────────────────────────┘
│                                                   │
│ ┌─ MODE CARD ───────────────────────────────────┐
│ │ [Icon] Mode Name                [View] [⋮]    │
│ │        (similar structure)                     │
│ └────────────────────────────────────────────────┘
│                                                   │
└──────────────────────────────────────────────────┘
```

#### Procurement Mode Card Layout

**Left Section** (Icon)
```
┌─────────────────┐
│ [Soft bg]       │
│   [Icon]        │
└─────────────────┘
- Rounded square
- Blue background (consistent)
```

**Middle Section** (Content)
```
Mode Name (Bold, base font)

[Category Badge] [Active Status] [Threshold Count]

Optional: Short description text

Metadata Row:
Amount Range: ₱X,XXX – ₱X,XXX
```

**Right Section** (Actions)
```
[View Details] Button + Three-dot menu
- View Details
- Edit
- Create Threshold (if none exist)
- Archive/Restore
```

### 3. Procurement Mode Details View
**Purpose**: Show full details for a procurement mode

#### Structure
```
┌─ HEADER ─────────────────────────────────────────┐
│ [← Back to Modes]                                │
│                                                   │
│ Mode Name                                        │
│ Category • Status • [View Audit Log] [Edit] [⋮] │
└──────────────────────────────────────────────────┘

┌─ DETAILS CARD ────────────────────────────────────┐
│                                                    │
│ Description                                       │
│ ──────────────────────────────────────────────    │
│ Full description text...                         │
│                                                    │
│ Amount Range                                     │
│ ──────────────────────────────────────────────    │
│ Minimum: ₱X,XXX                                   │
│ Maximum: ₱X,XXX                                   │
│                                                    │
│ Thresholds                                       │
│ ──────────────────────────────────────────────    │
│ [Threshold List/Table]                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 4. Audit Log View
**Purpose**: Show activity history for a mode

#### Structure
```
┌─ HEADER ─────────────────────────────────────────┐
│ [← Back to Mode Name]                            │
│                                                   │
│ Audit Log                                        │
│ Activity history for Mode Name                  │
└──────────────────────────────────────────────────┘

┌─ AUDIT ENTRIES ───────────────────────────────────┐
│                                                    │
│ ┌─ ACTION ICON ─┐                                │
│ │ [Create ✓]    │ Mode Created                   │
│ │ (green bg)    │ Admin User  2026-02-04        │
│ └────────────────┘                                │
│                  Changes:                         │
│                  • Mode Name: ... → ...           │
│                  • Category: ... → ...            │
│                                                    │
│ ┌─ ACTION ICON ─┐                                │
│ │ [Update ✎]    │ Mode Updated                   │
│ │ (blue bg)     │ Planning Officer  2026-02-04  │
│ └────────────────┘                                │
│                  Changes: (list of changes)      │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Color Scheme

### Backgrounds
- **Cards**: White (`bg-white`)
- **Category Goods**: Blue 50 (`bg-blue-50`)
- **Category Infrastructure**: Green 50 (`bg-green-50`)
- **Category Consulting**: Purple 50 (`bg-purple-50`)
- **Hover States**: Subtle shadows (`hover:shadow-md`)

### Borders
- **Card Borders**: Gray 200 (`border-gray-200`)
- **Category Specific**: Colored borders (`border-blue-200`, etc.)

### Text
- **Headers**: Gray 900 (`text-gray-900`)
- **Body Text**: Gray 600 (`text-gray-600`)
- **Muted**: Gray 500 (`text-gray-500`)

### Status Badges
- **Active**: Green (`bg-green-100`, `text-green-600`)
- **Inactive**: Red (`bg-red-100`, `text-red-600`)
- **Archive**: Orange (`bg-orange-100`, `text-orange-600`)

### Icons
- **Action Icons**: Color-coded (`text-blue-600`, `text-green-600`, etc.)
- **Muted Icons**: Gray 400 (`text-muted-foreground`)

## Spacing

### Padding
- **Large Containers**: `p-6`
- **Cards**: `p-5`
- **Small Elements**: `p-3`

### Gaps
- **Page Layout**: `gap-6` (vertical spacing)
- **Within Cards**: `gap-4` (horizontal/vertical)
- **Inline Elements**: `gap-2`, `gap-3`

### Margins
- **Section Headers**: `mb-4` or `mb-2` for tight spacing

## Responsive Design

### Breakpoints
- **Mobile**: Single column layout
- **Tablet (md)**: 2-column grid
- **Desktop (lg)**: 3-column grid

### Grid Configuration
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

## Typography

### Headers
- **Page Titles**: `text-2xl font-bold` (24px, bold)
- **Card Titles**: `text-lg font-bold` (18px, bold)
- **Subtitles**: `text-base font-semibold` (16px, semibold)

### Body Text
- **Primary**: `text-base` (16px)
- **Secondary**: `text-sm` (14px)
- **Meta**: `text-xs` (12px)

## Interactive Elements

### Buttons
- **Primary**: Blue background, white text, full width on cards
- **Secondary**: Outlined style
- **Ghost**: Transparent, text-only (for back buttons)

### Badges
- **Status Badges**: Pill-shaped, color-coded
- **Category Badges**: Outlined style
- **Count Badges**: Secondary variant

### Dropdowns
- **Three-dot Menu**: Hidden until hover (on category cards), visible on mode cards
- **Actions**: View, Edit, Archive, Create Threshold, etc.

## Key Features

### Category Cards
✓ Hover effect with shadow elevation
✓ Dynamic mode count display
✓ Icon with soft background
✓ Category-specific color scheme
✓ Full-width action button
✓ Optional three-dot menu

### Mode Cards
✓ Horizontal layout for clarity
✓ Icon, content, and actions sections
✓ Multiple status badges
✓ Amount range display
✓ Optional description text
✓ Quick action buttons

### Navigation
✓ Breadcrumb-style back buttons
✓ Clear view transitions
✓ Category → Modes → Details flow
✓ Audit log accessible from details

## Implementation Notes

- Uses Tailwind CSS for styling
- Lucide icons for all visual elements
- Component-based architecture
- Type-safe with TypeScript
- Responsive mobile-first design
- Accessible color contrasts
- Clear visual hierarchy
- Professional ERP aesthetic
