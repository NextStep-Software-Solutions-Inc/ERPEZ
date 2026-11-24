# Supplier & Supplier Requirements API Guide

This guide provides a comprehensive overview of the Supplier and Supplier Requirements endpoints in the ERPEZ Dashboard backend and how they are consumed by the Frontend UI.

---

## 1. High-Level Architecture & Approval Business Rules

### Supplier Lifecycle
```
[Create Supplier with Requirements] (Status: Pending)
             │
             ▼
[Reviewer Inspects & Verifies Documents] (isVerified: true for all requirements)
             │
             ▼
[Status Updated to Approved]
```

### Critical Approval Constraint
When approving a supplier (`PATCH /suppliers/{id}/status` or `PUT /suppliers/{id}` with `status: "Approved"`):
- The backend executes `AllMandatoryRequirementsVerifiedAsync(supplierId)`.
- **Validation Rule 1:** The supplier **must have at least one requirement registered** (`requirements.Any()`). A supplier with 0 requirements cannot be approved.
- **Validation Rule 2:** **All** registered requirements must be verified (`requirements.All(r => r.IsVerified == true)`).
- **Failure Consequence:** Throws `ConflictException: "Cannot approve supplier. All mandatory requirements must be verified."` (HTTP 409).

---

## 2. API Endpoints Reference

### A. Supplier Management (`SupplierController.cs` - Route: `/suppliers`)

| Method | Endpoint | Primary Use Case | Consumed by Frontend? |
|---|---|---|---|
| `POST` | `/suppliers/with-requirements` | **Create Supplier + Compliance Documents in 1 atomic request** | **YES** (Used by `SupplierRegistryForm.tsx`) |
| `POST` | `/suppliers` | Create basic supplier without requirements | Optional / Legacy |
| `GET` | `/suppliers` | List suppliers with filtering, sorting, pagination (Sieve) & embedded requirements | **YES** (Used by supplier table / list) |
| `GET` | `/suppliers/{id}` | Get complete supplier profile with embedded requirements | **YES** (Used by `SupplierDetailPage.tsx` and Edit dialog) |
| `PUT` | `/suppliers/{id}` | Full update of supplier details (checks requirement verification if setting status to Approved) | **YES** (Used by `SupplierRegistryForm.tsx` in edit mode) |
| `PATCH` | `/suppliers/{id}/status` | Update status (`Approved`, `Declined`, `Pending`), status notes, or blocking (`isBlocked`) | **YES** (Used by `SupplierDetailPage.tsx` action buttons) |
| `PATCH` | `/suppliers/{id}/requirements` | **Batch verify or update verification status of requirements** for a supplier | **YES** (Used by `SupplierDetailPage.tsx` requirement verification) |
| `DELETE` | `/suppliers/{id}` | Soft delete supplier | **YES** (Used by SupplierActions delete) |

---

### B. Individual Supplier Requirements (`SupplierRequirementController.cs` - Route: `/supplier-requirements`)

| Method | Endpoint | Primary Use Case | Consumed by Frontend? |
|---|---|---|---|
| `POST` | `/supplier-requirements` | Add an individual requirement document to an existing supplier | Standalone / Post-creation requirement addition |
| `GET` | `/supplier-requirements` | List supplier requirements with Sieve filtering | Admin / Auditing |
| `GET` | `/supplier-requirements/{id}` | Get single requirement details | Granular lookup |
| `PUT` | `/supplier-requirements/{id}` | Update single requirement (name, verification status `isVerified`, or file) | Granular editing |
| `DELETE` | `/supplier-requirements/{id}` | Soft delete a requirement document | Standalone removal |

---

## 3. Payload Contracts & Common Pitfalls

### 1. Creating a Supplier with Requirements
**Endpoint:** `POST /suppliers/with-requirements`

**Request Payload:**
```json
{
  "name": "ACME Supplies Corp.",
  "businessPermitNo": "BP-2026-00123",
  "contactPerson": "John Doe",
  "contactNumber": "09171234567",
  "address": "123 Business Park, Metro Manila",
  "email": "contact@acme.com",
  "tinNumber": "123-456-789-000",
  "philGEPSNumber": "PG-987654",
  "supplierCategoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requirements": [
    {
      "requirementName": "Mayor's Business Permit",
      "fileId": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d"
    },
    {
      "requirementName": "Tax Clearance Certificate",
      "fileId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
    }
  ]
}
```

> [!NOTE]
> **Payload Property Casing & Aliases:**
> The backend accepts both `requirements` and `supplierRequirements` in `CreateSupplierWithRequirementsRequest` to prevent deserialization issues. However, the standard canonical property name is **`requirements`**.

---

### 2. File Upload Flow
1. The frontend uploads the requirement document using the generic file upload endpoint (`POST /files` or `useUploadFile`).
2. The file service saves the temporary upload and returns a `fileId` (GUID).
3. The frontend passes `fileId` inside each item of the `requirements` array to `POST /suppliers/with-requirements`.
4. The backend calls `IFileStorageService.PromoteFileAsync(fileId)` to move the file to permanent storage and persists the URL in `SupplierRequirement.Url`.

---

### 3. Verifying Requirements Before Approval
**Endpoint:** `PATCH /suppliers/{supplierId}/requirements`

**Request Payload:**
```json
{
  "requirements": [
    {
      "supplierRequirementId": "6fa85f64-5717-4562-b3fc-2c963f66afa6",
      "isVerified": true
    },
    {
      "supplierRequirementId": "7fa85f64-5717-4562-b3fc-2c963f66afa7",
      "isVerified": true
    }
  ]
}
```

---

### 4. Updating Supplier Status
**Endpoint:** `PATCH /suppliers/{supplierId}/status`

**Approve Supplier:**
```json
{
  "status": "Approved"
}
```
*(Requires all requirements to have `isVerified: true` beforehand)*

**Decline Supplier:**
```json
{
  "status": "Declined",
  "statusNote": "Business permit has expired. Please re-upload updated permit."
}
```

**Block / Unblock Supplier:**
```json
{
  "isBlocked": true
}
```

---

## 4. Frontend Hook Mapping (`useSuppliers.ts`)

| React Query Hook | Request Handler | Target Endpoint | Description |
|---|---|---|---|
| `useSuppliers(...)` | `getSuppliersRequest` | `GET /suppliers` | Fetch paginated list of suppliers |
| `useSupplierById(...)` | `getSupplierRequest` | `GET /suppliers/:id` | Fetch supplier detail by ID |
| `useSupplierCategories(...)` | `getSupplierCategoriesRequest` | `GET /supplier-categories` | Fetch category options |
| `useCreateSupplier()` | `createSupplierRequest` | `POST /suppliers/with-requirements` | Create supplier with requirements |
| `useUpdateSupplier()` | `updateSupplierRequest` | `PUT /suppliers/:id` | Update supplier profile |
| `useUpdateSupplierStatus()` | `updateSupplierStatusRequest` | `PATCH /suppliers/:id/status` | Approve, Decline, or Block |
| `useVerifySupplierRequirements()` | `verifySupplierRequirementsRequest` | `PATCH /suppliers/:id/requirements` | Verify / unverify compliance documents |
| `useDeleteSupplier()` | `deleteSupplierRequest` | `DELETE /suppliers/:id` | Delete supplier |
