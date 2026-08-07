# OPCR API Integration - Quick Migration Guide

## Overview

This guide helps you migrate from the old OPCR handlers to the new unified API integration in `/lib/opcr/`.

## File Structure Comparison

### Old Location (Legacy)
```
/components/features/planning/opcr/handlers/
├── getOPCRsRequest.ts
├── getOPCRRequest.ts
├── createOPCRRequest.ts
├── updateOPCRRequest.ts
├── deleteOpcrRequest.ts
├── submitOPCRRequest.ts
└── consolidateOPCRRequest.ts
```

### New Location (Current)
```
/lib/opcr/
├── types.ts
├── index.ts
└── requests/
    ├── getOPCRsRequest.ts
    ├── getOPCRRequest.ts
    ├── createOPCRRequest.ts
    ├── updateOPCRRequest.ts
    ├── deleteOPCRRequest.ts
    ├── updateOPCRStatusRequest.ts
    ├── submitOPCRRatingRequest.ts
    ├── returnOPCRRatingRequest.ts
    └── hooks.ts
```

## Import Changes

### Getting List of OPCRs

**Before:**
```typescript
import { getOPCRsRequest } from '@/components/features/planning/opcr/handlers/getOPCRsRequest';
import type { OPCR } from '@/components/features/planning/opcr/types/opcr';
```

**After:**
```typescript
import { useOPCRs } from '@/lib/opcr';
// or direct request
import { getOPCRsRequest } from '@/lib/opcr';
import type { OPCRListItem } from '@/lib/opcr';
```

### Getting Single OPCR

**Before:**
```typescript
import { getOPCRRequest } from '@/components/features/planning/opcr/handlers/getOPCRRequest';
import type { OPCRDetails } from '@/components/features/planning/opcr/types/opcr';
```

**After:**
```typescript
import { useOPCR } from '@/lib/opcr';
// or direct request
import { getOPCRRequest } from '@/lib/opcr';
import type { OPCRDetails } from '@/lib/opcr';
```

### Creating OPCR

**Before:**
```typescript
import { createOPCRRequest } from '@/components/features/planning/opcr/handlers/createOPCRRequest';
import type { CreateOPCRPayload } from '@/components/features/planning/opcr/handlers/createOPCRRequest';
```

**After:**
```typescript
import { useCreateOPCR } from '@/lib/opcr';
// or direct request
import { createOPCRRequest } from '@/lib/opcr';
import type { CreateOPCRPayload } from '@/lib/opcr';
```

### Updating OPCR

**Before:**
```typescript
import { updateOPCRRequest } from '@/components/features/planning/opcr/handlers/updateOPCRRequest';
```

**After:**
```typescript
import { useUpdateOPCR } from '@/lib/opcr';
// or direct request
import { updateOPCRRequest } from '@/lib/opcr';
```

### Deleting OPCR

**Before:**
```typescript
import { deleteOPCRRequest } from '@/components/features/planning/opcr/handlers/deleteOpcrRequest';
```

**After:**
```typescript
import { useDeleteOPCR } from '@/lib/opcr';
// or direct request
import { deleteOPCRRequest } from '@/lib/opcr';
```

## API Endpoint Differences

### Old Implementation

The old handlers had these endpoints:
- `POST /opcrs` - Create OPCR (payload: `deliveryUnitId`, `fiscalYearId`)
- `PUT /opcrs/:id/status` - Update status

### New Implementation (API Updated)

The new handlers match the updated API:
- `POST /opcrs` - Create OPCR (payload: `officeId`, `fiscalYearId`, `name`, `code`)
- `PUT /opcrs/:id` - Update OPCR (payload: `name`, `code`)
- `PUT /opcrs/:id/status` - Update status (payload: `status`)
- `POST /opcrs/:id/rating/submit` - Submit rating
- `POST /opcrs/:id/rating/return` - Return rating

## Key Changes

### 1. Payload Structure

**Old Create Payload:**
```typescript
{
  deliveryUnitId: string;
  fiscalYearId: string;
}
```

**New Create Payload:**
```typescript
{
  officeId: string;          // Changed from deliveryUnitId
  fiscalYearId: string;
  name?: string | null;      // New field
  code?: string | null;      // New field
}
```

### 2. Update Payload

**Old Update Payload:**
```typescript
{
  deliveryUnitId: string;
  fiscalYearId: string;
}
```

**New Update Payload:**
```typescript
{
  name?: string | null;
  code?: string | null;
}
```

### 3. New Endpoints

The new implementation adds:
- `PUT /opcrs/:id` - For updating name/code
- `POST /opcrs/:id/rating/submit` - For submitting ratings
- `POST /opcrs/:id/rating/return` - For returning ratings

### 4. Response Types

**Old Response:**
```typescript
type OPCR = {
  id: string;
  name: string;
  deliveryUnitId: string;
  deliveryUnit?: DeliveryUnit;
  fiscalYear: FiscalYear;
  status: 'Draft' | 'Pending' | 'Approved' | 'Returned' | 'Submitted';
  // ... other fields
}
```

**New Response (List Item):**
```typescript
type OPCRListItem = {
  id: string;
  name: string | null;
  officeId: string;           // Changed from deliveryUnitId
  officeName: string | null;
  fiscalYear: number;         // Changed from FiscalYear object
  status: string | null;      // More flexible status
  ratingStatus: string | null;
  submittedDate: string | null;
  returnedDate: string | null;
  // ... other fields
}
```

## Migration Examples

### Example 1: Fetching OPCRs in a Component

**Before:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getOPCRsRequest } from '@/components/features/planning/opcr/handlers/getOPCRsRequest';

function OPCRList() {
  const { data, isLoading } = useQuery({
    queryKey: getOPCRsRequest.key({ url: '/opcrs' }),
    queryFn: () => getOPCRsRequest.fetcher({ 
      finalUrl: '/opcrs',
      signal: new AbortController().signal 
    })
  });
}
```

**After:**
```typescript
import { useOPCRs } from '@/lib/opcr';

function OPCRList() {
  const { data, isLoading } = useOPCRs({
    queryParams: { pageNumber: 1, pageSize: 10 }
  });
}
```

### Example 2: Creating an OPCR

**Before:**
```typescript
import { useMutation } from '@tanstack/react-query';
import { createOPCRRequest } from '@/components/features/planning/opcr/handlers/createOPCRRequest';

function CreateOPCRForm() {
  const { mutate } = useMutation({
    mutationFn: (payload) => createOPCRRequest.fetcher({ 
      finalUrl: '/opcrs',
      payload 
    })
  });

  const handleSubmit = () => {
    mutate({
      deliveryUnitId: 'du-123',
      fiscalYearId: 'fy-2024'
    });
  };
}
```

**After:**
```typescript
import { useCreateOPCR } from '@/lib/opcr';

function CreateOPCRForm() {
  const { mutate } = useCreateOPCR();

  const handleSubmit = () => {
    mutate({
      officeId: 'office-123',      // Changed field name
      fiscalYearId: 'fy-2024',
      name: 'Q1 OPCR 2024',        // New field
      code: 'OPCR-2024-Q1'         // New field
    });
  };
}
```

### Example 3: Updating OPCR Status

**Before:**
```typescript
import { submitOPCRRequest } from '@/components/features/planning/opcr/handlers/submitOPCRRequest';

const { mutate } = useMutation({
  mutationFn: (data) => submitOPCRRequest.fetcher({ 
    finalUrl: `/opcrs/${opcrId}/status`,
    payload: data 
  })
});

mutate({ status: 'Submitted' });
```

**After:**
```typescript
import { useUpdateOPCRStatus } from '@/lib/opcr';

const { mutate } = useUpdateOPCRStatus();

mutate({
  pathParams: { id: opcrId },
  payload: { status: 'Submitted' }
});
```

## Benefits of New Implementation

1. **Consistency**: Follows the same pattern as Budget Call and other lib features
2. **Type Safety**: Better TypeScript support with updated types matching API
3. **Hooks**: Pre-built hooks for common operations
4. **Documentation**: Comprehensive inline documentation
5. **Maintainability**: Single source of truth in `/lib/opcr/`
6. **API Alignment**: Matches the latest API specification

## Migration Checklist

- [ ] Update imports to use `/lib/opcr`
- [ ] Replace `deliveryUnitId` with `officeId` in create operations
- [ ] Add `name` and `code` fields to create/update forms
- [ ] Update type imports to use new types
- [ ] Replace manual query/mutation setup with hooks
- [ ] Update status handling to use new endpoints
- [ ] Test all CRUD operations
- [ ] Update cache invalidation keys

## Need Help?

Refer to:
- `/lib/opcr/README.md` - Full documentation
- `/lib/fiscal-year-and-policies/requests/` - Similar pattern examples
- API documentation for endpoint details
