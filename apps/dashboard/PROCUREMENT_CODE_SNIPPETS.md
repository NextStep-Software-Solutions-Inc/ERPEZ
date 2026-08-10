# Code Snippets & Examples

## Component Structure

### Main Component Wrapper
```typescript
export function ModesOfProcurementTab() {
  // State Management
  const [viewMode, setViewMode] = useState<'categories' | 'modes' | 'details' | 'audit-log'>('categories')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null)
  const [selectedMode, setSelectedMode] = useState<ModeOfProcurement | null>(null)
  
  // Render based on viewMode
  return (
    <div className="space-y-6">
      {viewMode === 'categories' && <CategoryListView />}
      {viewMode === 'modes' && <ModesListView />}
      {viewMode === 'details' && <DetailsView />}
      {viewMode === 'audit-log' && <AuditLogView />}
    </div>
  )
}
```

## Category Configuration Pattern

```typescript
const categoryConfig = {
  'Goods and Services': {
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    icon: Package,
  },
  'Infrastructure': {
    color: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
    icon: Package,
  },
  'Consulting Services': {
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    icon: Package,
  },
} as const
```

## Category Card Component

```typescript
// Rendered in category list view
{categories.map((category) => {
  const config = categoryConfig[category]
  const IconComponent = config.icon
  const modeCount = getModeCountForCategory(category)

  return (
    <div
      key={category}
      className={`${config.color} ${config.borderColor} rounded-lg border-2 p-6 transition-all hover:shadow-md cursor-pointer group`}
      onClick={() => {
        setSelectedCategory(category)
        setViewMode('modes')
      }}
    >
      {/* Icon Section */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${config.color} border ${config.borderColor} rounded-lg p-3`}>
          <IconComponent className={`${config.iconColor} w-6 h-6`} />
        </div>
      </div>

      {/* Content Section */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{category}</h3>
      <Badge variant="outline" className="mb-3">{category}</Badge>
      <p className="text-sm text-gray-600">
        Contains <span className="font-semibold">{modeCount}</span> procurement modes
      </p>

      {/* Action Section */}
      <div className="pt-4">
        <Button className="w-full">View Modes</Button>
      </div>
    </div>
  )
})}
```

## Procurement Mode Card Component

```typescript
// Rendered in modes list view
{getModesForCategory(selectedCategory).map((mode) => {
  const modeThresholds = thresholds.filter(t => t.modeId === mode.id)
  
  return (
    <div
      key={mode.id}
      className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon Container */}
        <div className="flex-shrink-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Package className="text-blue-600 w-5 h-5" />
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {mode.modeName}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {mode.category}
            </Badge>
            <Badge
              color={mode.status === 'active' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {mode.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
            {modeThresholds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {modeThresholds.length} threshold(s)
              </Badge>
            )}
          </div>

          {/* Description */}
          {mode.description && (
            <p className="text-sm text-gray-600 mb-3">{mode.description}</p>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Amount Range:</span> ₱
            {mode.minAmount.toLocaleString()} – ₱
            {mode.maxAmount === 999999999 ? 'Unlimited' : mode.maxAmount.toLocaleString()}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={() => {
              setSelectedMode(mode)
              setViewMode('details')
            }}
          >
            View Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Menu items */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
})}
```

## Navigation Functions

```typescript
// Navigate to modes list
const handleViewModes = (category: CategoryType) => {
  setSelectedCategory(category)
  setViewMode('modes')
  setSearchTerm('')
}

// Navigate to details
const handleViewDetails = (mode: ModeOfProcurement) => {
  setSelectedMode(mode)
  setViewMode('details')
}

// Navigate to audit log
const handleViewAuditLog = () => {
  setViewMode('audit-log')
}

// Go back to previous view
const handleBackToModes = () => {
  setViewMode('modes')
  setSelectedMode(null)
}

const handleBackToCategories = () => {
  setViewMode('categories')
  setSelectedCategory(null)
  setSearchTerm('')
}
```

## Data Filtering Functions

```typescript
// Get count of modes in a category
const getModeCountForCategory = (category: CategoryType) => {
  return allData.filter(
    mode => mode.category === category && !mode.isArchived
  ).length
}

// Get filtered modes for a category
const getModesForCategory = (category: CategoryType) => {
  return allData.filter(mode => {
    const matchesCategory = mode.category === category
    const matchesSearch = mode.modeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesArchive = showArchived 
      ? mode.isArchived 
      : !mode.isArchived
    return matchesCategory && matchesSearch && matchesArchive
  })
}
```

## Responsive Grid Classes

```typescript
// Category cards grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>

// Modes list (single column)
<div className="space-y-3">
  {/* Vertical spacing between cards */}
</div>
```

## Search & Filter Toolbar

```typescript
<div className="flex items-center w-full gap-4 flex-wrap">
  {/* Search Input */}
  <div className="relative w-64">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
    <DebouncedInput
      placeholder="Search procurement modes"
      value={searchTerm}
      onChange={setSearchTerm}
      className="w-full pl-10"
    />
  </div>

  {/* Archive Toggle */}
  <div className="flex gap-2 ml-auto items-center">
    <Button
      variant={showArchived ? 'default' : 'outline'}
      size="sm"
      onClick={() => setShowArchived(!showArchived)}
      className="gap-2"
    >
      <Archive className="w-4 h-4" />
      {showArchived ? 'Show Active' : 'Show Archived'}
    </Button>
  </div>
</div>
```

## Back Navigation Button

```typescript
<Button
  variant="ghost"
  onClick={() => {
    setViewMode('categories')
    setSelectedCategory(null)
    setSearchTerm('')
  }}
  className="gap-2 -ml-4 mb-4"
>
  ← Back to Categories
</Button>
```

## Empty State Component

```typescript
<div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
  <Package className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">No modes found</h3>
  <p className="text-muted-foreground">
    {searchTerm
      ? 'Try adjusting your search'
      : `No procurement modes for ${selectedCategory}`}
  </p>
</div>
```


> **Note:** `PermissionCheck` now defaults to *deny* when the `actions` array
> is empty. This prevents UI from appearing if permissions fail to load. You
> can override with the `allowWhenActionsEmpty` prop or set
> `VITE_ALLOW_EMPTY_PERMISSIONS=true` in your local env for development only.
>
## Dropdown Menu Example

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <MoreHorizontal className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <PermissionCheck action="read" actions={actions}>
      <DropdownMenuItem onClick={() => handleViewDetails(mode)}>
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </DropdownMenuItem>
    </PermissionCheck>
    <PermissionCheck action="write" actions={actions}>
      <DropdownMenuItem onClick={() => handleEditMode(mode)}>
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </DropdownMenuItem>
    </PermissionCheck>
    <PermissionCheck action="write" actions={actions}>
      <DropdownMenuItem
        onClick={() => handleArchiveMode(mode.id)}
        className="text-orange-600 focus:text-orange-600"
      >
        <Archive className="w-4 h-4 mr-2" />
        {mode.isArchived ? 'Restore' : 'Archive'}
      </DropdownMenuItem>
    </PermissionCheck>
  </DropdownMenuContent>
</DropdownMenu>
```

## Badge Variations

```typescript
// Status Badge
<Badge color={mode.status === 'active' ? 'default' : 'destructive'}>
  {mode.status === 'active' ? 'Active' : 'Inactive'}
</Badge>

// Category Badge
<Badge variant="outline" className="text-xs">
  {mode.category}
</Badge>

// Count Badge
<Badge variant="secondary" className="text-xs">
  {modeThresholds.length} threshold(s)
</Badge>

// Pill Badge (Category Cards)
<Badge variant="outline">{category}</Badge>
```

## State Types

```typescript
type ViewMode = 'categories' | 'modes' | 'details' | 'audit-log'
type Category = 'Goods and Services' | 'Infrastructure' | 'Consulting Services'

interface CategoryConfig {
  color: string
  iconColor: string
  borderColor: string
  icon: React.ComponentType
}
```

## Tailwind Class Combinations

### Card Base
```typescript
"bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all"
```

### Category Card
```typescript
"bg-{color}-50 border-2 border-{color}-200 rounded-lg p-6 transition-all hover:shadow-md cursor-pointer group"
```

### Icon Container
```typescript
"bg-{color}-50 border border-{color}-200 rounded-lg p-3 flex items-center justify-center"
```

### Flex Layout (Card)
```typescript
"flex items-start justify-between gap-4"
```

### Grid Layout (Categories)
```typescript
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### List Layout (Modes)
```typescript
"space-y-3"
```

### Hover Menu (Visible on Hover)
```typescript
"opacity-0 group-hover:opacity-100"
```

## Common Patterns

### Access Category Icon
```typescript
const config = categoryConfig[category]
const IconComponent = config.icon

<IconComponent className={`${config.iconColor} w-6 h-6`} />
```

### Get Associated Thresholds
```typescript
const modeThresholds = thresholds.filter(t => t.modeId === mode.id)
```

### Format Amount Display
```typescript
`₱${amount.toLocaleString()}`

// For unlimited
mode.maxAmount === 999999999 ? 'Unlimited' : `₱${mode.maxAmount.toLocaleString()}`
```

### Check Permissions
```typescript
<PermissionCheck action="write" actions={actions}>
  <Button onClick={handleEdit}>Edit</Button>
</PermissionCheck>
```

### Navigate with State
```typescript
setSelectedCategory(category)
setViewMode('modes')
setSearchTerm('') // Reset search
```

---

These code snippets demonstrate the key patterns used throughout the implementation. They can be used as reference or templates for similar components.
