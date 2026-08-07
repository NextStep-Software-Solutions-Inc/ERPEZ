# OPCR API Integration - Structure Diagram

## Directory Structure

```
lib/opcr/
│
├── index.ts                          # 📦 Main exports barrel
│   ├── Export all types
│   ├── Export all requests
│   └── Export all hooks
│
├── types.ts                          # 📋 Type definitions
│   ├── OPCRListItem                  # List view type
│   ├── OPCRDetails                   # Detail view type
│   ├── CreateOPCRPayload             # Create payload
│   ├── UpdateOPCRPayload             # Update payload
│   ├── UpdateOPCRStatusPayload       # Status payload
│   └── Supporting types (MFOPAP, Attribute, SDG, etc.)
│
├── requests/                         # 📂 Request handlers directory
│   │
│   ├── index.ts                      # Export all request handlers
│   │
│   ├── hooks.ts                      # 🪝 Custom React hooks
│   │   ├── useOPCRs()               # Query hook for list
│   │   ├── useOPCR()                # Query hook for single item
│   │   ├── useCreateOPCR()          # Mutation hook for create
│   │   ├── useUpdateOPCR()          # Mutation hook for update
│   │   ├── useDeleteOPCR()          # Mutation hook for delete
│   │   ├── useUpdateOPCRStatus()    # Mutation hook for status
│   │   ├── useSubmitOPCRRating()    # Mutation hook for submit
│   │   └── useReturnOPCRRating()    # Mutation hook for return
│   │
│   ├── getOPCRsRequest.ts           # 📄 GET /opcrs
│   │   └── QueryBlueprintFromTemplate
│   │
│   ├── getOPCRRequest.ts            # 📄 GET /opcrs/:id
│   │   └── QueryBlueprintFromTemplate
│   │
│   ├── createOPCRRequest.ts         # 📄 POST /opcrs
│   │   └── MutationBlueprintFromTemplate
│   │
│   ├── updateOPCRRequest.ts         # 📄 PUT /opcrs/:id
│   │   └── MutationBlueprintFromTemplate
│   │
│   ├── deleteOPCRRequest.ts         # 📄 DELETE /opcrs/:id
│   │   └── MutationBlueprintFromTemplate
│   │
│   ├── updateOPCRStatusRequest.ts   # 📄 PUT /opcrs/:id/status
│   │   └── MutationBlueprintFromTemplate
│   │
│   ├── submitOPCRRatingRequest.ts   # 📄 POST /opcrs/:id/rating/submit
│   │   └── MutationBlueprintFromTemplate
│   │
│   └── returnOPCRRatingRequest.ts   # 📄 POST /opcrs/:id/rating/return
│       └── MutationBlueprintFromTemplate
│
├── README.md                         # 📖 Full documentation
├── MIGRATION_GUIDE.md                # 🔄 Migration from old handlers
└── IMPLEMENTATION_SUMMARY.md         # 📝 Implementation overview
```

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         OPCR Feature                             │
│                     (React Components)                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ import { useOPCRs, useCreateOPCR }
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      lib/opcr/index.ts                           │
│                   (Central Export Point)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
        ┌─────────────────────┐  ┌─────────────────────┐
        │   requests/hooks.ts  │  │     types.ts        │
        │   (React Hooks)      │  │   (TypeScript)      │
        └─────────────────────┘  └─────────────────────┘
                    │
                    │ uses
                    ▼
        ┌─────────────────────┐
        │  Request Handlers    │
        │  (getOPCRsRequest,   │
        │   createOPCRRequest, │
        │   etc.)              │
        └─────────────────────┘
                    │
                    │ uses
                    ▼
        ┌─────────────────────┐
        │  erpez-shared-lib    │
        │  Blueprint System    │
        │  (Query/Mutation     │
        │   Templates)         │
        └─────────────────────┘
                    │
                    │ HTTP calls
                    ▼
        ┌─────────────────────┐
        │   services/api.ts    │
        │   (Axios Instance)   │
        └─────────────────────┘
                    │
                    │ HTTP request
                    ▼
        ┌─────────────────────┐
        │   Backend API        │
        │   /opcrs endpoints   │
        └─────────────────────┘
```

## API Endpoint Mapping

```
┌──────────────────────────────────────────────────────────────────┐
│                     API Endpoints                                 │
└──────────────────────────────────────────────────────────────────┘

GET    /opcrs                  ──────►  getOPCRsRequest.ts
                                       └─► useOPCRs()

GET    /opcrs/:id              ──────►  getOPCRRequest.ts
                                       └─► useOPCR()

POST   /opcrs                  ──────►  createOPCRRequest.ts
                                       └─► useCreateOPCR()

PUT    /opcrs/:id              ──────►  updateOPCRRequest.ts
                                       └─► useUpdateOPCR()

DELETE /opcrs/:id              ──────►  deleteOPCRRequest.ts
                                       └─► useDeleteOPCR()

PUT    /opcrs/:id/status       ──────►  updateOPCRStatusRequest.ts
                                       └─► useUpdateOPCRStatus()

POST   /opcrs/:id/rating/submit ─────►  submitOPCRRatingRequest.ts
                                       └─► useSubmitOPCRRating()

POST   /opcrs/:id/rating/return ─────►  returnOPCRRatingRequest.ts
                                       └─► useReturnOPCRRating()
```

## Component Usage Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPCR List Component                           │
├─────────────────────────────────────────────────────────────────┤
│  import { useOPCRs, useDeleteOPCR } from '@/lib/opcr';          │
│                                                                   │
│  const { data, isLoading } = useOPCRs({                          │
│    queryParams: { pageNumber: 1, pageSize: 10 }                 │
│  });                                                              │
│                                                                   │
│  const { mutate: deleteOPCR } = useDeleteOPCR();                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OPCR Details Component                         │
├─────────────────────────────────────────────────────────────────┤
│  import { useOPCR, useUpdateOPCRStatus } from '@/lib/opcr';     │
│                                                                   │
│  const { data } = useOPCR({                                      │
│    pathParams: { id: opcrId }                                    │
│  });                                                              │
│                                                                   │
│  const { mutate: updateStatus } = useUpdateOPCRStatus();         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OPCR Create Form                               │
├─────────────────────────────────────────────────────────────────┤
│  import { useCreateOPCR } from '@/lib/opcr';                    │
│  import type { CreateOPCRPayload } from '@/lib/opcr';           │
│                                                                   │
│  const { mutate, isPending } = useCreateOPCR();                  │
│                                                                   │
│  mutate({                                                         │
│    officeId: 'office-123',                                       │
│    fiscalYearId: 'fy-2024',                                      │
│    name: 'Q1 OPCR',                                              │
│    code: 'OPCR-2024-Q1'                                          │
│  });                                                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OPCR Rating Component                          │
├─────────────────────────────────────────────────────────────────┤
│  import {                                                        │
│    useSubmitOPCRRating,                                          │
│    useReturnOPCRRating                                           │
│  } from '@/lib/opcr';                                            │
│                                                                   │
│  const { mutate: submitRating } = useSubmitOPCRRating();         │
│  const { mutate: returnRating } = useReturnOPCRRating();         │
└─────────────────────────────────────────────────────────────────┘
```

## Type Hierarchy

```
OPCRListItem (Summary)
├── id: string
├── name: string | null
├── officeId: string
├── officeName: string | null
├── fiscalYear: number
├── totalBudget: number
├── status: string | null
├── ratingStatus: string | null
└── ... (counts and dates)

OPCRDetails (Full Details)
├── All fields from OPCRListItem
├── fyActiveKPIMeasurements: FYActiveKPIMeasurement[]
│   ├── id, dimension, moVs
│   └── rating scale info
├── mfopap: MFOPAP
│   └── id, name, code, type
├── attributes: Attribute[]
│   └── id, name, code, description
├── sdgs: SDG[]
│   └── id, name, description
├── office: Office
│   └── id, name, description
└── opcrActivities: OPCRActivity[]
    ├── id, name, description, budget
    └── papDepartments: PAPDepartment[]
```

## Pattern Consistency

```
Budget Call Pattern              OPCR Pattern
─────────────────────           ──────────────
lib/                            lib/
├── fiscal-year-and-policies/   ├── opcr/
│   └── requests/               │   └── requests/
│       ├── getBudgetCall...    │       ├── getOPCRs...
│       ├── createBudgetCall... │       ├── createOPCR...
│       ├── updateBudgetCall... │       ├── updateOPCR...
│       └── hooks/              │       └── hooks.ts
│           └── use*.ts         │
```

## Quick Import Reference

```typescript
// Single import for everything
import {
  // Types
  type OPCRListItem,
  type OPCRDetails,
  type CreateOPCRPayload,
  
  // Query Hooks (GET)
  useOPCRs,
  useOPCR,
  
  // Mutation Hooks (POST/PUT/DELETE)
  useCreateOPCR,
  useUpdateOPCR,
  useDeleteOPCR,
  useUpdateOPCRStatus,
  useSubmitOPCRRating,
  useReturnOPCRRating,
  
  // Direct Request Handlers (if needed)
  getOPCRsRequest,
  createOPCRRequest,
  // ... etc
} from '@/lib/opcr';
```

## Legend

📦 - Export/Barrel file  
📋 - Type definitions  
📂 - Directory  
📄 - Request handler file  
🪝 - React hooks  
📖 - Documentation  
🔄 - Migration guide  
📝 - Summary document  
