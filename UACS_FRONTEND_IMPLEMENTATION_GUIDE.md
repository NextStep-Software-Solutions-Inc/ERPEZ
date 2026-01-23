# UACS Library Sub-Module - Frontend Implementation Guide

## Overview

This guide provides complete specifications for implementing the UACS Library Sub-Module frontend. All backend endpoints are production-ready and documented in the API.

## API Base Information

- **Base URL:** `https://api.yourdomain.com` (or dev equivalent)
- **Authentication:** Bearer token in `Authorization` header
- **Response Format:** `ApiResponse<T>` with `succeeded`, `message`, `data`, and `errors` fields
- **Content-Type:** `multipart/form-data` for file uploads; `application/json` for others

## API Response Format

```typescript
interface ApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T | null;
  errors: Record<string, string[]> | null;
}
```

---

## Phase 1: Core CRUD

### 1.1 UACS Code Segments (`GET|POST|PUT|DELETE /uacs-code-segments`)

**Models:**

```typescript
interface UACSCodeSegment {
  id: string;
  segmentType: "FundSource" | "Organization" | "Location" | "MFOPAP" | "Object";
  name: string;
  description: string;
  displayOrder: number;
  isRequired: boolean;
  maxLength: number;
  pattern: string; // regex
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface CreateUACSCodeSegmentRequest {
  segmentType: string;
  name: string;
  description: string;
  displayOrder: number;
  isRequired: boolean;
  maxLength: number;
  pattern: string;
}
```

**Pages:**

- `pages/UACSCodeSegments/UACSCodeSegmentsList.tsx`
  - Table with columns: Name, Type, Display Order, Pattern, IsActive
  - Filters: SegmentType, IsActive
  - Sort: Display Order, Name
  - Actions: Create, Edit, Delete

- `pages/UACSCodeSegments/UACSCodeSegmentForm.tsx`
  - Form fields: SegmentType (dropdown), Name, Description, DisplayOrder, IsRequired, MaxLength, Pattern
  - Pattern regex tester (real-time validation preview)

**Components:**

- `components/UACSCodeSegments/UACSCodeSegmentTable.tsx`
- `components/UACSCodeSegments/UACSSegmentTypeSelect.tsx`
- `components/common/RegexPatternTester.tsx`

**API Hook:**

```typescript
// hooks/useUACSCodeSegments.ts
export function useUACSCodeSegments() {
  const queryClient = useQueryClient();
  
  const list = useQuery(['uacs-code-segments'], () => 
    fetch('/uacs-code-segments').then(r => r.json())
  );
  
  const create = useMutation((data: CreateUACSCodeSegmentRequest) =>
    fetch('/uacs-code-segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    { onSuccess: () => queryClient.invalidateQueries(['uacs-code-segments']) }
  );
  
  // ...update, delete mutations
  
  return { list, create };
}
```

---

### 1.2 Expense Classes (`GET|POST|PUT|DELETE /expense-classes`)

**Models:**

```typescript
interface ExpenseClass {
  id: string;
  name: string;
  code: string;
  description: string;
  type: "PS" | "MOOE" | "CO" | "Financial";
  isActive: boolean;
}

interface CreateExpenseClassRequest {
  name: string;
  code: string;
  description: string;
  type: string;
}
```

**Pages:**

- `pages/ExpenseClasses/ExpenseClassList.tsx`
  - Color-coded by type (PS=blue, MOOE=green, CO=orange, Financial=red)
  - Filter by type

- `pages/ExpenseClasses/ExpenseClassForm.tsx`

**Components:**

- `components/ExpenseClasses/ExpenseClassTable.tsx`
- `components/ExpenseClasses/ExpenseTypeSelect.tsx`
- `components/ExpenseClasses/ExpenseTypeIcon.tsx` (colored badges)

---

## Phase 2: Complex CRUD

### 2.1 UACS Code Combinations (`GET|POST|PUT|DELETE /uacs-code-combinations`)

**Models:**

```typescript
interface UACSCodeCombination {
  id: string;
  fundSourceId?: string;
  organizationId?: string;
  locationId?: string;
  mfopapId?: string;
  objectId?: string;
  combinationCode: string; // auto-generated: "01-101-001-P001-5021401000"
  description: string;
  isValid: boolean;
  fiscalYearId?: string;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
}

interface CreateUACSCodeCombinationRequest {
  fundSourceId?: string;
  organizationId?: string;
  locationId?: string;
  mfopapId?: string;
  objectId?: string;
  description: string;
  effectiveDate: string;
  expiryDate?: string;
}
```

**Pages:**

- `pages/UACSCodeCombinations/UACSCodeCombinationsList.tsx`
  - Table: CombinationCode, FundSource Name, Organization Name, Location Name, MFOPAP Name, Object Name, IsValid
  - Multi-filter by each segment, IsValid status, FiscalYear
  - Search by combination code

- `pages/UACSCodeCombinations/UACSCodeCombinationForm.tsx`
  - 5 dropdowns: FundSource, Organization, Location, MFOPAP, Object
  - Auto-generate CombinationCode from selections
  - Show validation rules that apply (call `POST /uacs/validate-combination`)
  - Bulk upload modal (upload CSV/Excel with combination codes)

**Components:**

- `components/UACSCodeCombinations/UACSCodeCombinationsTable.tsx`
- `components/UACSCodeCombinations/FiveSegmentSelector.tsx` (5 dropdowns + auto-code generation)
- `components/UACSCodeCombinations/CombinationCodeDisplay.tsx`
- `components/UACSCodeCombinations/CombinationValidationPreview.tsx`
- `components/UACSCodeCombinations/BulkUploadModal.tsx`

**Smart Features:**

- Auto-generate code format: `XX-XXX-XXX-PXXX-XXXXXXXXXX`
- Real-time validation preview
- Conflict detection (warn if duplicate)

---

### 2.2 Object-Expense Class Mapping (`GET|POST|PUT|DELETE /object-expense-classes`)

**Models:**

```typescript
interface ObjectExpenseClass {
  id: string;
  objectId: string;
  expenseClassId: string;
  name: string;
  description: string;
  isActive: boolean;
  object?: { id: string; name: string; code: string; };
  expenseClass?: { id: string; name: string; code: string; type: string; };
}
```

**Pages:**

- `pages/ObjectExpenseClasses/ObjectExpenseClassesList.tsx`
- `pages/ObjectExpenseClasses/ObjectExpenseClassForm.tsx`

---

### 2.3 Validation Rules (`GET|POST|PUT|DELETE /uacs-validation-rules`)

**Models:**

```typescript
interface UACSValidationRule {
  id: string;
  ruleName: string;
  description: string;
  ruleType: "AllowedCombination" | "ForbiddenCombination" | "ConditionalValidation";
  codeSegmentId?: string;
  segmentType?: number;
  validationExpression: string;
  errorMessage: string;
  condition?: string; // JSON for conditional logic
  priority: number; // lower = executes first
  fundSourceId?: string;
  locationId?: string;
  objectId?: string;
  isActive: boolean;
}
```

**Pages:**

- `pages/ValidationRules/UACSValidationRulesList.tsx`
  - Table: RuleName, RuleType, Priority, Status
  - Sort by Priority (execution order)
  - Filter by RuleType

- `pages/ValidationRules/UACSValidationRuleForm.tsx`
  - RuleName, Description, RuleType (enum select)
  - Priority (number)
  - ValidationExpression (code editor for regex)
  - Condition (JSON editor for complex rules)
  - Optional scoped fields: FundSourceId, LocationId, ObjectId

**Components:**

- `components/ValidationRules/ValidationRuleTable.tsx`
- `components/ValidationRules/RuleTypeSelect.tsx`
- `components/common/CodeEditor.tsx` (for regex/JSON)

---

## Phase 3: Fiscal Year Management

### 3.1 Code Segment Fiscal Years (`GET|POST|PUT|DELETE /uacs-code-segment-fiscal-years`)

```typescript
interface UACSCodeSegmentFiscalYear {
  id: string;
  uacsCodeSegmentId: string;
  fiscalYearId: string;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  isActive: boolean;
}
```

**Pages:**

- `pages/FiscalYearValidity/CodeSegmentFiscalYearList.tsx`
- `pages/FiscalYearValidity/FiscalYearValidityForm.tsx`

---

### 3.2 Code Combination Fiscal Years (`GET|POST|PUT|DELETE /uacs-code-combination-fiscal-years`)

```typescript
interface UACSCodeCombinationFiscalYear {
  id: string;
  uacsCodeCombinationId: string;
  fiscalYearId: string;
  isValidFrom: string;
  isValidTo?: string;
  isActive: boolean;
}
```

---

## Phase 4: Advanced Features

### 4.1 CSV/Excel Import (`POST /uacs/import-csv`)

**Request:**

```typescript
interface UACSImportRequest {
  file: File; // CSV or Excel (.xlsx/.xls)
  segmentType: string; // "FundSource", "Organization", "Location", "MFOPAP", "Object"
  isDryRun: boolean;
  importedBy: string;
}
```

**Response:**

```typescript
interface UACSImportResultResponse {
  importId: string;
  fileName: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    lineNumber: number;
    message: string;
    rawData?: string;
  }>;
  isDryRun: boolean;
  importedAt: string;
}
```

**Pages:**

- `pages/UACSImport/UACSImportPage.tsx`
  - Drag-drop CSV/Excel uploader
  - Preview first N rows
  - Real-time progress bar (Total/Success/Failed rows)
  - Error log viewer (expandable errors by row)
  - Download failed rows as CSV
  - Import summary report

- `pages/UACSImport/ImportLogsHistory.tsx`
  - Table: Filename, Date, User, Success Rate
  - Expandable error details
  - Re-import option

**Components:**

- `components/Import/CSVUploader.tsx` (drag-drop)
- `components/Import/ImportPreview.tsx`
- `components/Import/ImportProgressBar.tsx`
- `components/Import/ErrorLogViewer.tsx`
- `components/Import/TemplateDownloader.tsx` (download sample CSV)

**Sample CSV Files (in repo `/samples/uacs-import`):**

- `FundSourceSample.csv` → Headers: Code, Name, Type, IsActive
- `OrganizationSample.csv` → Headers: Code, Name, IsActive
- `LocationSample.csv` → Headers: Code, Name, IsActive
- `MFOPAPSample.csv` → Headers: Code, Name, IsActive
- `ObjectSample.csv` → Headers: Code, Name, IsActive

---

### 4.2 Validation Tester (`POST /uacs/validate-combination`)

**Request:**

```typescript
interface ValidateCombinationRequest {
  fundSourceId?: string;
  organizationId?: string;
  locationId?: string;
  mfopapId?: string;
  objectId?: string;
}
```

**Response:**

```typescript
interface ValidationResult {
  isValid: boolean;
  applicableRules: UACSValidationRule[];
  violations?: string[];
}
```

**Pages:**

- `pages/ValidationTester/ValidationTesterPage.tsx`

**Components:**

- `components/ValidationTester/CombinationTester.tsx`
- `components/ValidationTester/ValidationResultCard.tsx`

---

### 4.3 Object Hierarchy (`GET|POST|PUT|DELETE /objects/{id}/child-codes`)

**Models:**

```typescript
interface ObjectChildCode {
  id: string;
  parentObjectId: string;
  childObjectId: string;
  name: string;
  code: string;
  description?: string;
  agencyId?: string;
  isActive: boolean;
}
```

**Pages:**

- `pages/ObjectHierarchy/ObjectChildCodesTree.tsx`
  - Tree view: Parent Object → Child Objects
  - Drag-drop reordering (optional)
  - Highlight agency-specific children

- `pages/ObjectHierarchy/ObjectHierarchyForm.tsx`
  - Parent Object selector
  - Child Object selector
  - Circular reference prevention (warn user)

**Components:**

- `components/Hierarchy/ObjectHierarchyTree.tsx`
- `components/Hierarchy/ParentChildSelector.tsx`
- `components/Hierarchy/CircularReferenceWarning.tsx`

---

## Folder Structure (Recommended)

```
src/
├── features/
│   └── planning/
│       └── uacs-library/
│           ├── pages/
│           │   ├── UACSCodeSegments/
│           │   │   ├── UACSCodeSegmentsList.tsx
│           │   │   └── UACSCodeSegmentForm.tsx
│           │   ├── ExpenseClasses/
│           │   ├── UACSCodeCombinations/
│           │   ├── ObjectExpenseClasses/
│           │   ├── ValidationRules/
│           │   ├── FiscalYearValidity/
│           │   ├── UACSImport/
│           │   ├── ValidationTester/
│           │   └── ObjectHierarchy/
│           ├── components/
│           │   ├── common/
│           │   │   ├── RegexPatternTester.tsx
│           │   │   ├── CodeEditor.tsx
│           │   │   └── FileUploader.tsx
│           │   ├── UACSCodeSegments/
│           │   ├── ExpenseClasses/
│           │   ├── UACSCodeCombinations/
│           │   ├── ObjectExpenseClasses/
│           │   ├── ValidationRules/
│           │   ├── Import/
│           │   ├── ValidationTester/
│           │   └── Hierarchy/
│           ├── hooks/
│           │   ├── useUACSCodeSegments.ts
│           │   ├── useExpenseClasses.ts
│           │   ├── useUACSCodeCombinations.ts
│           │   ├── useObjectExpenseClasses.ts
│           │   ├── useValidationRules.ts
│           │   ├── useUACSImport.ts
│           │   ├── useValidationTester.ts
│           │   └── useObjectChildCodes.ts
│           ├── services/
│           │   └── uacsApi.ts
│           ├── types/
│           │   ├── uacs.types.ts
│           │   └── api.types.ts
│           └── utils/
│               ├── codeFormatter.ts
│               ├── validationHelpers.ts
│               └── csvParser.ts
```

---

## Tech Stack Recommendations

- **UI Framework:** React 18+ with TypeScript
- **Form Management:** React Hook Form + Zod validation
- **Tables:** TanStack Table (React Table) with sorting/filtering
- **CSV:** papaparse for client-side parsing
- **Excel:** xlsx library for preview/inspection
- **File Upload:** react-dropzone for drag-drop
- **Code Editor:** monaco-editor or ace-editor
- **State Management:** TanStack Query (React Query) for server state
- **HTTP Client:** Axios with interceptors
- **Modals/Dialogs:** Radix UI Dialog or shadcn/ui
- **Icons:** Lucide React or Feather Icons
- **Validation:** Zod for form validation

---

## Priority Implementation Order

**MVP (Phase 1-2):**

1. ✅ Code Segments CRUD
2. ✅ Expense Classes CRUD
3. ✅ Code Combinations CRUD + validation preview
4. ✅ Object-Expense mapping
5. ✅ Validation Rules CRUD

**Phase 2 (Phase 3-4):**
6. Fiscal year validity management
7. CSV/Excel import with progress tracking
8. Validation tester tool
9. Object hierarchy (child codes)
10. Import history & analytics

---

## API Integration Quick Start

```typescript
// services/uacsApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uacsApi = {
  // Code Segments
  getCodeSegments: () => client.get('/uacs-code-segments'),
  createCodeSegment: (data) => client.post('/uacs-code-segments', data),
  updateCodeSegment: (id, data) => client.put(`/uacs-code-segments/${id}`, data),
  deleteCodeSegment: (id) => client.delete(`/uacs-code-segments/${id}`),
  
  // Code Combinations
  getCodeCombinations: () => client.get('/uacs-code-combinations'),
  validateCombination: (data) => client.post('/uacs/validate-combination', data),
  
  // Import
  importFile: (file, segmentType, isDryRun, importedBy) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('segmentType', segmentType);
    formData.append('isDryRun', isDryRun);
    formData.append('importedBy', importedBy);
    
    return client.post('/uacs/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // ...other endpoints
};
```

---

## Testing Endpoints

Use the included sample CSV files in `/samples/uacs-import/`:

- Place a file in Swagger (dev environment)
- Set `isDryRun=true` for validation-only
- Set `isDryRun=false` to actually insert data
- Check responses in `importedAt` and error logs

---

## Next Steps

1. Set up React project with recommended tech stack
2. Create API service layer and types
3. Implement Phase 1 (Segments + Expenses) first
4. Test against live API endpoints
5. Build out remaining phases incrementally
