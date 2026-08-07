# OPCR API Integration - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### 1. Import What You Need

```typescript
import { useOPCRs, useCreateOPCR, type OPCRListItem } from '@/lib/opcr';
```

### 2. Use in Your Component

```typescript
function OPCRPage() {
  const { data, isLoading } = useOPCRs();
  
  return (
    <div>
      {data?.data.map(opcr => (
        <div key={opcr.id}>{opcr.name}</div>
      ))}
    </div>
  );
}
```

That's it! 🎉

---

## 📚 Common Use Cases

### Fetch List of OPCRs with Pagination

```typescript
const { data, isLoading, error } = useOPCRs({
  queryParams: {
    pageNumber: 1,
    pageSize: 10
  }
});

// Access data
const opcrs = data?.data; // OPCRListItem[]
const total = data?.totalCount;
```

### Fetch Single OPCR

```typescript
const { data } = useOPCR({
  pathParams: { id: 'opcr-id-123' }
});

// Access detailed data
const opcr = data?.data; // OPCRDetails
```

### Create New OPCR

```typescript
const { mutate, isPending } = useCreateOPCR();

const handleCreate = () => {
  mutate({
    officeId: 'office-123',
    fiscalYearId: 'fy-2024',
    name: 'Q1 OPCR 2024',
    code: 'OPCR-001'
  }, {
    onSuccess: () => {
      toast.success('OPCR created!');
      queryClient.invalidateQueries({ queryKey: ['/opcrs'] });
    }
  });
};
```

### Update OPCR

```typescript
const { mutate } = useUpdateOPCR();

mutate({
  pathParams: { id: 'opcr-123' },
  payload: {
    name: 'Updated Name',
    code: 'OPCR-002'
  }
});
```

### Delete OPCR

```typescript
const { mutate } = useDeleteOPCR();

mutate({ 
  pathParams: { id: 'opcr-123' } 
}, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/opcrs'] });
  }
});
```

### Update OPCR Status

```typescript
const { mutate } = useUpdateOPCRStatus();

mutate({
  pathParams: { id: 'opcr-123' },
  payload: { status: 'Submitted' }
});
```

### Submit Rating

```typescript
const { mutate } = useSubmitOPCRRating();

mutate({ pathParams: { id: 'opcr-123' } });
```

### Return Rating

```typescript
const { mutate } = useReturnOPCRRating();

mutate({ pathParams: { id: 'opcr-123' } });
```

---

## 🎯 Complete Example Component

```typescript
import { 
  useOPCRs, 
  useCreateOPCR, 
  useDeleteOPCR,
  type CreateOPCRPayload 
} from '@/lib/opcr';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export function OPCRManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch OPCRs
  const { data, isLoading } = useOPCRs({
    queryParams: { pageNumber: page, pageSize: 10 }
  });

  // Create mutation
  const { mutate: create, isPending: isCreating } = useCreateOPCR();

  // Delete mutation
  const { mutate: deleteOPCR, isPending: isDeleting } = useDeleteOPCR();

  const handleCreate = (payload: CreateOPCRPayload) => {
    create(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/opcrs'] });
        toast.success('OPCR created successfully!');
      },
      onError: (error) => {
        toast.error(`Failed to create: ${error.message}`);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this OPCR?')) return;
    
    deleteOPCR({ pathParams: { id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/opcrs'] });
        toast.success('OPCR deleted!');
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>OPCR Management</h1>
      
      {/* Create Form */}
      <CreateForm onSubmit={handleCreate} isSubmitting={isCreating} />

      {/* List */}
      <div>
        {data?.data.map((opcr) => (
          <div key={opcr.id}>
            <h3>{opcr.name}</h3>
            <p>Status: {opcr.status}</p>
            <p>Budget: {opcr.totalBudget}</p>
            <button 
              onClick={() => handleDelete(opcr.id)}
              disabled={isDeleting}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

---

## ⚡ Hook Reference

| Hook | Type | Purpose |
|------|------|---------|
| `useOPCRs()` | Query | Fetch paginated list |
| `useOPCR()` | Query | Fetch single OPCR |
| `useCreateOPCR()` | Mutation | Create new OPCR |
| `useUpdateOPCR()` | Mutation | Update OPCR name/code |
| `useDeleteOPCR()` | Mutation | Delete OPCR |
| `useUpdateOPCRStatus()` | Mutation | Change status |
| `useSubmitOPCRRating()` | Mutation | Submit for rating |
| `useReturnOPCRRating()` | Mutation | Return rating |

---

## 🔑 Key Types

```typescript
// List item (summary)
type OPCRListItem = {
  id: string;
  name: string | null;
  officeId: string;
  officeName: string | null;
  fiscalYear: number;
  totalBudget: number;
  status: string | null;
  // ... more fields
}

// Create payload
type CreateOPCRPayload = {
  officeId: string;
  fiscalYearId: string;
  name?: string | null;
  code?: string | null;
}

// Update payload
type UpdateOPCRPayload = {
  name?: string | null;
  code?: string | null;
}
```

---

## 🔄 Cache Invalidation

Always invalidate cache after mutations:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After create/update/delete
queryClient.invalidateQueries({ queryKey: ['/opcrs'] });

// After updating specific OPCR
queryClient.invalidateQueries({ queryKey: [`/opcrs/${opcrId}`] });
```

---

## 🐛 Error Handling

```typescript
const { mutate } = useCreateOPCR();

mutate(payload, {
  onSuccess: (data) => {
    console.log('Created:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
    toast.error(error.message);
  },
  onSettled: () => {
    console.log('Request completed');
  }
});
```

---

## 📝 TypeScript Tips

```typescript
// Import types
import type { 
  OPCRListItem, 
  OPCRDetails,
  CreateOPCRPayload 
} from '@/lib/opcr';

// Use in component props
interface Props {
  opcr: OPCRListItem;
  onUpdate: (payload: UpdateOPCRPayload) => void;
}

// Use in state
const [selectedOpcr, setSelectedOpcr] = useState<OPCRListItem | null>(null);
```

---

## 🎨 Loading States

```typescript
const { data, isLoading, isFetching, error } = useOPCRs();

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
if (isFetching) return <div>Refreshing... {/* show data */}</div>;

return <OPCRList data={data} />;
```

---

## 🚨 Common Mistakes

### ❌ Don't do this:
```typescript
const { data } = useOPCRs();
// Accessing data directly without checking
const opcrs = data.data; // ❌ data might be undefined
```

### ✅ Do this:
```typescript
const { data } = useOPCRs();
const opcrs = data?.data ?? []; // ✅ Safe access
```

---

## 📖 Learn More

- Full Documentation: `/lib/opcr/README.md`
- Migration Guide: `/lib/opcr/MIGRATION_GUIDE.md`
- Structure Diagram: `/lib/opcr/STRUCTURE_DIAGRAM.md`
- Implementation Summary: `/lib/opcr/IMPLEMENTATION_SUMMARY.md`

---

## 🤝 Need Help?

Check the reference implementation:
- Budget Call: `/lib/fiscal-year-and-policies/requests/getBudgetCallRequest.ts`
- Pattern examples in fiscal-year-and-policies folder

---

**Happy coding!** 🎉
