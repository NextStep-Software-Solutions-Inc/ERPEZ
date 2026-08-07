# UACS Library Feature Module

## Overview

This directory contains the complete implementation structure for the UACS (Unified Accounts Code Structure) Library feature in the ERPEZ Planning Module.

## 📁 Directory Structure

```
features/uacs/
├── code-segments/          # Manage 5 core UACS elements
│   ├── atoms/             # ✓ State management (Jotai)
│   ├── components/        # TODO: Feature-specific components
│   ├── dialogs/           # TODO: CRUD dialogs
│   ├── forms/             # TODO: TanStack Forms + Zod
│   ├── handlers/          # ✓ API request blueprints
│   ├── tables/            # TODO: TanStack Tables
│   └── types/             # ✓ TypeScript definitions
│
├── rules/                  # Validation rules management
│   ├── atoms/             # ✓ State management
│   ├── components/        # TODO: Rule builder components
│   ├── dialogs/           # TODO: Rule dialogs
│   ├── forms/             # TODO: Rule configuration forms
│   ├── handlers/          # TODO: Rule API handlers
│   ├── tables/            # TODO: Rules tables
│   └── types/             # ✓ TypeScript definitions
│
└── data-management/        # Import/Export/Sync operations
    ├── atoms/             # ✓ State management
    ├── components/        # TODO: Upload, progress components
    ├── dialogs/           # TODO: Import/export dialogs
    ├── forms/             # TODO: Import config forms
    ├── handlers/          # TODO: Import/export handlers
    ├── tables/            # TODO: Import history tables
    └── types/             # ✓ TypeScript definitions
```

## 🎯 What's Implemented

### ✅ Completed
- **TypeScript Types**: Complete type definitions for all entities
- **State Management**: Jotai atoms for all dialogs and global state
- **API Handlers**: Request blueprint patterns for all CRUD operations
- **Feature Structure**: Complete directory organization following ERPEZ standards

### 🚧 To Be Implemented
- **Forms**: TanStack Form components with Zod validation
- **Dialogs**: OrdinaryDialog/AlertDialog wrappers for CRUD operations
- **Tables**: TanStack Table components for data display
- **Components**: Feature-specific UI components
- **API Integration**: Connect handlers to actual backend endpoints
- **Business Logic**: Validation rules, import processing, sync operations

## 📚 Key Files

### Code Segments
- **Types**: `code-segments/types/index.ts`
  - `FundingSource`, `OrganizationCode`, `LocationCode`, `MfoPap`, `ObjectCode`
  - `ExpenseClass` enum, `CodeSegmentType` enum
- **Atoms**: `code-segments/atoms/index.ts`
  - Dialog states, fiscal year context, selected items
- **Handlers**: `code-segments/handlers/index.ts`
  - Query/mutation request blueprints for all 5 segments

### Rules
- **Types**: `rules/types/index.ts`
  - `ExpenseMappingRule`, `FiscalValidityRule`, `CombinationValidationRule`
  - `RuleType` enum, `RuleStatus` enum
- **Atoms**: `rules/atoms/index.ts`
  - Rule dialog states, test dialog state

### Data Management
- **Types**: `data-management/types/index.ts`
  - `ImportJob`, `ExportJob`, `SyncConfiguration`
  - `ImportStatus` enum, `DuplicateHandling` enum
- **Atoms**: `data-management/atoms/index.ts`
  - Import/export dialog states, upload progress

## 🚀 Getting Started

### For Developers Implementing Features

1. **Read Documentation** (in `/documentations/`):
   - `uacs-library-design.md` - Complete design specification
   - `uacs-implementation-summary.md` - What's done, what's next
   - `uacs-quick-start-guide.md` - Developer quick reference

2. **Follow the Pattern**:
   ```tsx
   // Example: Implementing Funding Source CRUD
   
   // 1. Form (forms/FundingSourceForm.tsx)
   import { useForm } from '@tanstack/react-form'
   
   // 2. Dialog (dialogs/CreateFundingSourceDialog.tsx)
   import { OrdinaryDialog } from '@/components/dialogs/OrdinaryDialog'
   
   // 3. Table (tables/FundingSourceTable.tsx)
   import { useReactTable } from '@tanstack/react-table'
   
   // 4. Connect API (use existing handlers)
   import { createQueryHookFromTemplate } from 'erpez-shared-lib'
   import { getFundingSourcesRequest } from './handlers'
   ```

3. **Test Your Implementation**:
   - Unit tests for forms and validation
   - Integration tests for CRUD operations
   - E2E tests for complete workflows

## 🎨 Design Patterns

### State Management
```tsx
// Use Jotai atoms for UI state
import { useAtom } from 'jotai'
import { createCodeSegmentDialogAtom } from './atoms'

const [dialog, setDialog] = useAtom(createCodeSegmentDialogAtom)
```

### API Integration
```tsx
// Use TanStack Query with handlers
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getFundingSourcesRequest } from './handlers'

const useFundingSources = createQueryHookFromTemplate(getFundingSourcesRequest)
```

### Form Validation
```tsx
// Use TanStack Form + Zod
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

const schema = z.object({
  code: z.string().length(6, 'Must be 6 digits'),
  name: z.string().min(1, 'Required'),
})
```

## 📊 Type Reference

### Code Segment Types
```typescript
interface FundingSource {
  id: string
  code: string        // 6 digits
  name: string
  isActive: boolean
  fiscalYear: number
}

interface ObjectCode {
  id: string
  code: string        // 10 digits
  name: string
  expenseClass: 'PS' | 'MOOE' | 'CO' | 'FE'
  isActive: boolean
  children?: ObjectCode[]  // For subsidiary ledger
}
```

### Rule Types
```typescript
interface CombinationValidationRule {
  id: string
  name: string
  conditions: Array<{
    field: string
    operator: 'EQUALS' | 'NOT_EQUALS' | 'STARTS_WITH'
    value: string
  }>
  errorMessage: string
  isAllowed: boolean
}
```

## 🔗 Related Files

- **Pages**: `src/pages/planning/uacs/`
  - Main page components with tab navigation
- **Routes**: `src/routes/v2/uacs-library/`
  - TanStack Router configuration
- **Navigation**: `src/data/navigation-group.ts`
  - Sidebar navigation integration

## 🧪 Testing

### Unit Tests
Place in `__tests__/` folder within each feature subdirectory:
- `code-segments/__tests__/`
- `rules/__tests__/`
- `data-management/__tests__/`

### Test Coverage Requirements
- Forms: Validation logic, field interactions
- Handlers: Mock API responses
- Components: Rendering, user interactions
- Business Logic: Rule evaluation, import validation

## 📝 Coding Standards

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `PascalCase.ts` or `index.ts`

### Component Size Limits
- Forms: Max 200 lines
- Dialogs: Max 100 lines
- Atomic components: Max 50 lines

### Required Patterns
- ✅ TypeScript strict mode (no `any`)
- ✅ TanStack Form for forms
- ✅ TanStack Query for API
- ✅ Jotai for client state
- ✅ Zod for validation
- ✅ Tailwind CSS for styling

## 🔐 Security Notes

### Role-Based Access
Implement RBAC checks in components:
```tsx
const canEdit = ['SUPER_ADMIN', 'BUDGET_OFFICER'].includes(user.role)
```

### Validation
- Client-side: Zod schemas (UX)
- Server-side: Backend validation (security)

## 📖 Documentation

When adding new components/features:
1. Add JSDoc comments
2. Update this README if structure changes
3. Create/update documentation in `/documentations/`
4. Add examples to quick-start guide

## 🤝 Contributing

Before implementing:
1. Read the Epic requirements (see `/documentations/uacs-library-design.md`)
2. Check existing patterns in similar features (Planning/Fund, Planning/KPI)
3. Follow the established folder structure
4. Write tests alongside implementation
5. Update documentation

## 📧 Support

For questions about this feature:
- Check `/documentations/uacs-quick-start-guide.md`
- Review existing implementations in `/features/planning/`
- Consult the team lead

---

**Status**: 🟡 Structure established, implementation in progress

**Last Updated**: 2026-01-26
