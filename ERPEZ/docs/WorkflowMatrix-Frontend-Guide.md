# WorkflowMatrix API - Frontend Integration Guide

## Quick Overview

**WorkflowMatrix** defines approval workflows using **Position IDs** (not User IDs). The system automatically shows you which user currently holds each position.

---

## Creating a Workflow Matrix

### Step 1: Choose Approvers in UI

You can use either:

- **Position picker UI** (send position IDs directly), or
- **User picker UI** (recommended for FE) then resolve to position IDs via API.

### Option A: Position Picker (Direct)

**Endpoint**: `GET /api/positions`

Fetch available positions to populate your dropdowns:

```typescript
const response = await fetch('/api/positions');
const positions = await response.json();

// Use for recommending approver dropdown
<select name="recommendingApproverPositionId">
  {positions.data.map(p => (
    <option value={p.id}>{p.title} ({p.code})</option>
  ))}
</select>

// Use for final approver dropdown
<select name="finalApproverPositionId">
  {positions.data.map(p => (
    <option value={p.id}>{p.title} ({p.code})</option>
  ))}
</select>
```

### Option B: User Picker (Hybrid UX)

If your UI only selects users, call resolver first:

**Endpoint**: `POST /api/workflow-matrices/resolve-approvers`

```typescript
const resolveApprovers = async () => {
  const response = await fetch('/api/workflow-matrices/resolve-approvers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      officeId: form.officeId,
      recommendingApproverUserId: form.recommendingApproverUserId,
      finalApproverUserId: form.finalApproverUserId
    })
  });

  const result = await response.json();

  // Use these in create payload
  return {
    recommendingApproverPositionId: result.data.recommendingApprover.positionId,
    finalApproverPositionId: result.data.finalApprover.positionId
  };
};
```

Resolver returns validation errors when:

- user has no active assignment in selected office, or
- user has multiple active assignments in selected office (ambiguous).

### Step 2: Create Workflow Matrix

**Endpoint**: `POST /api/workflow-matrices`

**Important**: New workflows are created with status `"Inactive"` by default. You must explicitly activate them using the Update Status endpoint.

```typescript
const createWorkflow = async () => {
  const resolved = await resolveApprovers(); // only for User Picker flow

  const body = {
    fiscalYearId: "your-fiscal-year-id",
    officeId: "your-office-id",
    documentType: "WFP",  // or null for all document types
    
    // Use Position IDs (NOT User IDs)
    recommendingApproverPositionId: resolved.recommendingApproverPositionId,
    finalApproverPositionId: resolved.finalApproverPositionId
  };

  const response = await fetch('/api/workflow-matrices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const result = await response.json();
  // result.data = new workflow matrix ID
  // workflow.status = "Inactive" (default)
};
```

### Step 3: Activate Workflow (Update Status)

**Endpoint**: `PATCH /api/workflow-matrices/{id}/status`

```typescript
const updateWorkflowStatus = async (workflowId, newStatus) => {
  const response = await fetch(`/api/workflow-matrices/${workflowId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }) // "Active" or "Inactive"
  });

  const result = await response.json();
  // result.message = "Workflow Matrix status updated to Active successfully."
};

// Example: Activate workflow
await updateWorkflowStatus(workflowId, "Active");

// Example: Deactivate workflow
await updateWorkflowStatus(workflowId, "Inactive");
```

---

## Viewing Workflow Matrix (Shows Position & User Info)

### Get Single Workflow

**Endpoint**: `GET /api/workflow-matrices/{id}`

```typescript
const workflow = await fetch('/api/workflow-matrices/{id}')
  .then(res => res.json());

console.log(workflow.data);
```

### Response Structure (Nested Objects)

```json
{
  "succeeded": true,
  "data": {
    "id": "workflow-id",
    "fiscalYear": 2025,
    "officeName": "Human Resource Office",
    "documentType": "WFP",
    "status": "Active",
    
    "recommendingApprover": {
      "position": {
        "id": "position-id-1",
        "title": "Budget Officer",
        "code": "BUDG-OFF"
      },
      "currentUser": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    },
    
    "finalApprover": {
      "position": {
        "id": "position-id-2",
        "title": "Finance Director",
        "code": "FIN-DIR"
      },
      "currentUser": null  // ← VACANT POSITION
    }
  }
}
```

---

## Displaying Position Status (Filled vs Vacant)

### React/Vue Example

```tsx
// Display Recommending Approver
<div>
  <h4>Recommending Approver</h4>
  <p><strong>Position:</strong> {workflow.recommendingApprover.position.title}</p>
  
  {workflow.recommendingApprover.currentUser ? (
    // Position is FILLED
    <div className="badge-success">
      <p>✅ Assigned to: {workflow.recommendingApprover.currentUser.name}</p>
      <p>📧 {workflow.recommendingApprover.currentUser.email}</p>
    </div>
  ) : (
    // Position is VACANT
    <div className="badge-warning">
      <p>⚠️ Position Vacant - No user assigned</p>
    </div>
  )}
</div>

// Display Final Approver
<div>
  <h4>Final Approver</h4>
  <p><strong>Position:</strong> {workflow.finalApprover.position.title}</p>
  
  {workflow.finalApprover.currentUser ? (
    <div className="badge-success">
      <p>✅ Assigned to: {workflow.finalApprover.currentUser.name}</p>
      <p>📧 {workflow.finalApprover.currentUser.email}</p>
    </div>
  ) : (
    <div className="badge-warning">
      <p>⚠️ Position Vacant - No user assigned</p>
    </div>
  )}
</div>
```

---

## Key Points for Frontend

| Concept | Explanation |
|---------|-------------|
| **Position ID** | Organizational structure (e.g., "Budget Officer") - **Use this in form** |
| **User ID** | Actual person assigned to position - **Read-only, shown in response** |
| **`currentUser`** | If `null` → Position is **vacant** |
| **`currentUser` exists** | Position is **filled** with that user |

---

## Form Validation

```typescript
const validateForm = (formData) => {
  const errors = [];
  
  if (!formData.fiscalYearId) {
    errors.push("Fiscal Year is required");
  }
  
  if (!formData.officeId) {
    errors.push("Office is required");
  }
  
  if (!formData.recommendingApproverPositionId) {
    errors.push("Recommending Approver Position is required");
  }
  
  if (!formData.finalApproverPositionId) {
    errors.push("Final Approver Position is required");
  }
  
  if (!formData.status) {
    errors.push("Status is required");
  }
  
  return errors;
};
```

---

## Visual Status Indicators

### Recommended UI Elements

```html
<!-- Filled Position -->
<div class="approver-card filled">
  <span class="badge badge-success">Filled</span>
  <h5>Budget Officer</h5>
  <p class="user-info">
    <img src="avatar.jpg" />
    John Doe
    <span class="email">john.doe@example.com</span>
  </p>
</div>

<!-- Vacant Position -->
<div class="approver-card vacant">
  <span class="badge badge-warning">Vacant</span>
  <h5>Finance Director</h5>
  <p class="vacant-message">
    <i class="icon-warning"></i>
    No user currently assigned to this position
  </p>
</div>
```

---

## Complete Form Example

```tsx
import { useState, useEffect } from 'react';

const WorkflowMatrixForm = () => {
  const [positions, setPositions] = useState([]);
  const [formData, setFormData] = useState({
    fiscalYearId: '',
    officeId: '',
    recommendingApproverPositionId: '',
    finalApproverPositionId: '',
    documentType: 'WFP',
    status: 'Active'
  });

  useEffect(() => {
    // Load positions for dropdowns
    fetch('/api/positions')
      .then(res => res.json())
      .then(data => setPositions(data.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/workflow-matrices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Workflow created successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Fiscal Year</label>
      <select 
        value={formData.fiscalYearId}
        onChange={(e) => setFormData({...formData, fiscalYearId: e.target.value})}
      >
        {/* Fiscal year options */}
      </select>

      <label>Office</label>
      <select 
        value={formData.officeId}
        onChange={(e) => setFormData({...formData, officeId: e.target.value})}
      >
        {/* Office options */}
      </select>

      <label>Recommending Approver Position</label>
      <select 
        value={formData.recommendingApproverPositionId}
        onChange={(e) => setFormData({...formData, recommendingApproverPositionId: e.target.value})}
        required
      >
        <option value="">Select Position...</option>
        {positions.map(p => (
          <option key={p.id} value={p.id}>
            {p.title} ({p.code})
          </option>
        ))}
      </select>

      <label>Final Approver Position</label>
      <select 
        value={formData.finalApproverPositionId}
        onChange={(e) => setFormData({...formData, finalApproverPositionId: e.target.value})}
        required
      >
        <option value="">Select Position...</option>
        {positions.map(p => (
          <option key={p.id} value={p.id}>
            {p.title} ({p.code})
          </option>
        ))}
      </select>

      <label>Document Type</label>
      <input 
        type="text"
        value={formData.documentType}
        onChange={(e) => setFormData({...formData, documentType: e.target.value})}
        placeholder="WFP, Budget, etc. (optional)"
      />

      <button type="submit">Create Workflow Matrix</button>
    </form>
  );
};
```

---

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/positions` | Get all positions for dropdowns |
| POST | `/api/workflow-matrices/resolve-approvers` | Resolve selected users to position IDs for create/update |
| POST | `/api/workflow-matrices` | Create new workflow (status defaults to "Inactive") |
| GET | `/api/workflow-matrices` | List all workflows (paginated) |
| GET | `/api/workflow-matrices/{id}` | Get single workflow with user details |
| PUT | `/api/workflow-matrices/{id}` | Update workflow positions/document type |
| PATCH | `/api/workflow-matrices/{id}/status` | Activate or deactivate workflow |
| DELETE | `/api/workflow-matrices/{id}` | Delete workflow (soft delete) |

---

## Status Management

### Toggle Active/Inactive

```tsx
const WorkflowStatusToggle = ({ workflowId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = status === "Active" ? "Inactive" : "Active";
    
    const response = await fetch(`/api/workflow-matrices/${workflowId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      setStatus(newStatus);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={toggleStatus} 
      disabled={loading}
      className={status === "Active" ? "btn-success" : "btn-secondary"}
    >
      {loading ? "Updating..." : status}
    </button>
  );
};
```

### Status Dropdown

```tsx
const WorkflowStatusDropdown = ({ workflowId, currentStatus }) => {
  const updateStatus = async (newStatus) => {
    const response = await fetch(`/api/workflow-matrices/${workflowId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      alert(`Workflow ${newStatus === "Active" ? "activated" : "deactivated"} successfully!`);
    }
  };

  return (
    <select 
      value={currentStatus} 
      onChange={(e) => updateStatus(e.target.value)}
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  );
};
```

---

## Summary

✅ **Use Position IDs** in your form (from `/api/positions`)  
✅ **If UI uses user picker**, call `/api/workflow-matrices/resolve-approvers` first  
✅ **Response shows Position + User** in nested structure  
✅ **Check `currentUser === null`** to detect vacant positions  
✅ **Position details always present**, user details may be null  
✅ **System auto-resolves** current user at runtime (no manual lookups needed)
