# OPCR API Integration

This directory contains the API integration for the OPCR (Office Performance Commitment and Review) feature, following the same pattern as the Budget Call implementation.

## Directory Structure

```
lib/opcr/
├── index.ts                     # Main exports
├── types.ts                     # TypeScript type definitions
└── requests/
    ├── index.ts                 # Request handlers exports
    ├── hooks.ts                 # Custom React hooks
    ├── getOPCRsRequest.ts       # GET /opcrs - List OPCRs
    ├── getOPCRRequest.ts        # GET /opcrs/:id - Get single OPCR
    ├── createOPCRRequest.ts     # POST /opcrs - Create OPCR
    ├── updateOPCRRequest.ts     # PUT /opcrs/:id - Update OPCR
    ├── deleteOPCRRequest.ts     # DELETE /opcrs/:id - Delete OPCR
    ├── updateOPCRStatusRequest.ts     # PUT /opcrs/:id/status - Update status
    ├── submitOPCRRatingRequest.ts     # POST /opcrs/:id/rating/submit
    └── returnOPCRRatingRequest.ts     # POST /opcrs/:id/rating/return
```

## API Endpoints

### 1. List OPCRs
**GET** `/opcrs`

Returns a paginated list of OPCRs with summary information.

### 2. Get Single OPCR
**GET** `/opcrs/:id`

Returns detailed information for a specific OPCR including KPIs, activities, and related data.

### 3. Create OPCR
**POST** `/opcrs`

Creates a new OPCR.

**Payload:**
```typescript
{
  officeId: string;
  fiscalYearId: string;
  name?: string | null;
  code?: string | null;
}
```

### 4. Update OPCR
**PUT** `/opcrs/:id`

Updates an existing OPCR.

**Payload:**
```typescript
{
  name?: string | null;
  code?: string | null;
}
```

### 5. Delete OPCR
**DELETE** `/opcrs/:id`

Deletes an OPCR.

### 6. Update OPCR Status
**PUT** `/opcrs/:id/status`

Updates the status of an OPCR.

**Payload:**
```typescript
{
  status: string | null;
}
```

### 7. Submit OPCR Rating
**POST** `/opcrs/:id/rating/submit`

Submits the OPCR for rating.

### 8. Return OPCR Rating
**POST** `/opcrs/:id/rating/return`

Returns the OPCR rating for revision.

## Usage Examples

### Fetching OPCRs List

```typescript
import { useOPCRs } from '@/lib/opcr';

function OPCRList() {
  const { data, isLoading, error } = useOPCRs({
    queryParams: { 
      pageNumber: 1, 
      pageSize: 10 
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((opcr) => (
        <div key={opcr.id}>
          <h3>{opcr.name}</h3>
          <p>Status: {opcr.status}</p>
          <p>Budget: {opcr.totalBudget}</p>
        </div>
      ))}
    </div>
  );
}
```

### Fetching Single OPCR

```typescript
import { useOPCR } from '@/lib/opcr';

function OPCRDetails({ opcrId }: { opcrId: string }) {
  const { data, isLoading } = useOPCR({
    pathParams: { id: opcrId }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{data?.data.name}</h2>
      <p>Code: {data?.data.code}</p>
      <p>Status: {data?.data.status}</p>
      <h3>Activities ({data?.data.opcrActivities.length})</h3>
      {/* Render activities */}
    </div>
  );
}
```

### Creating an OPCR

```typescript
import { useCreateOPCR } from '@/lib/opcr';
import { useQueryClient } from '@tanstack/react-query';

function CreateOPCRForm() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateOPCR();

  const handleSubmit = (formData: CreateOPCRPayload) => {
    mutate(formData, {
      onSuccess: () => {
        // Invalidate and refetch OPCR list
        queryClient.invalidateQueries({ queryKey: ['/opcrs'] });
        // Show success message
        toast.success('OPCR created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create OPCR');
      }
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({
        officeId: 'office-123',
        fiscalYearId: 'fy-2024',
        name: 'Q1 OPCR 2024',
        code: 'OPCR-2024-Q1'
      });
    }}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create OPCR'}
      </button>
    </form>
  );
}
```

### Updating an OPCR

```typescript
import { useUpdateOPCR } from '@/lib/opcr';
import { useQueryClient } from '@tanstack/react-query';

function EditOPCRForm({ opcrId }: { opcrId: string }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateOPCR();

  const handleUpdate = (updates: UpdateOPCRPayload) => {
    mutate({
      pathParams: { id: opcrId },
      payload: updates
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/opcrs'] });
        queryClient.invalidateQueries({ queryKey: [`/opcrs/${opcrId}`] });
        toast.success('OPCR updated successfully');
      }
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleUpdate({
        name: 'Updated OPCR Name',
        code: 'OPCR-2024-Q1-V2'
      });
    }}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        Update
      </button>
    </form>
  );
}
```

### Deleting an OPCR

```typescript
import { useDeleteOPCR } from '@/lib/opcr';
import { useQueryClient } from '@tanstack/react-query';

function DeleteOPCRButton({ opcrId }: { opcrId: string }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useDeleteOPCR();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this OPCR?')) return;
    
    mutate({ pathParams: { id: opcrId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/opcrs'] });
        toast.success('OPCR deleted successfully');
      }
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### Updating OPCR Status

```typescript
import { useUpdateOPCRStatus } from '@/lib/opcr';

function OPCRStatusControl({ opcrId }: { opcrId: string }) {
  const { mutate, isPending } = useUpdateOPCRStatus();

  const handleStatusChange = (newStatus: string) => {
    mutate({
      pathParams: { id: opcrId },
      payload: { status: newStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/opcrs/${opcrId}`] });
      }
    });
  };

  return (
    <select onChange={(e) => handleStatusChange(e.target.value)} disabled={isPending}>
      <option value="Draft">Draft</option>
      <option value="Pending">Pending</option>
      <option value="Submitted">Submitted</option>
      <option value="Approved">Approved</option>
      <option value="Returned">Returned</option>
    </select>
  );
}
```

### Submitting OPCR Rating

```typescript
import { useSubmitOPCRRating } from '@/lib/opcr';

function SubmitRatingButton({ opcrId }: { opcrId: string }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useSubmitOPCRRating();

  const handleSubmit = () => {
    mutate({ pathParams: { id: opcrId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/opcrs/${opcrId}`] });
        toast.success('OPCR rating submitted successfully');
      }
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Submitting...' : 'Submit Rating'}
    </button>
  );
}
```

### Returning OPCR Rating

```typescript
import { useReturnOPCRRating } from '@/lib/opcr';

function ReturnRatingButton({ opcrId }: { opcrId: string }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useReturnOPCRRating();

  const handleReturn = () => {
    mutate({ pathParams: { id: opcrId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/opcrs/${opcrId}`] });
        toast.success('OPCR rating returned for revision');
      }
    });
  };

  return (
    <button onClick={handleReturn} disabled={isPending}>
      {isPending ? 'Returning...' : 'Return Rating'}
    </button>
  );
}
```

## Type Definitions

### OPCRListItem
The type returned by `GET /opcrs` for list items.

```typescript
type OPCRListItem = {
  id: string;
  name: string | null;
  officeId: string;
  officeName: string | null;
  fiscalYear: number;
  totalBudget: number;
  createdDate: string;
  status: string | null;
  ratingStatus: string | null;
  submittedDate: string | null;
  returnedDate: string | null;
  evaluationCount: number;
  kpiAssignmentCount: number;
  activityCount: number;
}
```

### OPCRDetails
The type returned by `GET /opcrs/:id` with full details.

Includes all fields from `OPCRListItem` plus:
- `fyActiveKPIMeasurements: FYActiveKPIMeasurement[]`
- `mfopap: MFOPAP`
- `attributes: Attribute[]`
- `sdgs: SDG[]`
- `office: Office`
- `opcrActivities: OPCRActivity[]`

See `types.ts` for complete type definitions.

## Cache Management

When mutating data (create, update, delete), always invalidate related queries:

```typescript
// After creating/updating/deleting
queryClient.invalidateQueries({ queryKey: ['/opcrs'] });

// After updating a specific OPCR
queryClient.invalidateQueries({ queryKey: [`/opcrs/${opcrId}`] });
```

## Migration from Old Handlers

If you have existing OPCR components using the old handler pattern from `/components/features/planning/opcr/handlers/`, you should migrate to use these new handlers:

**Old:**
```typescript
import { getOPCRsRequest } from '@/components/features/planning/opcr/handlers/getOPCRsRequest';
```

**New:**
```typescript
import { useOPCRs } from '@/lib/opcr';
```

The new implementation follows the same blueprint pattern as budget calls and provides better type safety and consistency.

## Pattern Consistency

This implementation follows the same pattern as:
- `/lib/fiscal-year-and-policies/requests/getBudgetCallRequest.ts`
- Budget Call feature structure
- Shared library blueprint patterns

All OPCR requests use the `QueryBlueprintFromTemplate` or `MutationBlueprintFromTemplate` patterns for consistency across the application.
