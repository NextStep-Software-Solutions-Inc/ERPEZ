# ERPEZ Production Release Notes - v1.0.0

**Release Tag:** `v1.0.0`  
**Release Date:** September 9, 2026  
**Build Target:** .NET 10 (Backend) / React Router + Vite (Frontend) / PostgreSQL / Docker  

---

## 1. Executive Summary

**ERPEZ v1.0.0** represents the initial production release of the **ERPEZ Multi-Tenant Enterprise Resource Planning (ERP)** platform for public sector governance, corporate planning, financial management, and public procurement.

This release consolidates 570+ commits incorporating complete planning cycles, public procurement compliance (RA 9184), national budget allocation structures (UACS), sovereign air-gapped cryptographic license enforcement, and granular role-based access control (RBAC).

---

## 2. Core Functional Domains & Highlights

### 2.1 Tenant Management & Sovereign Licensing
* **Sovereign Offline License Key Engine**:
  * Air-gapped cryptographic license key generation using HMAC-SHA256 signature verification (`EPZ-{PLAN}-{EXPDATE}-{BLOCK1}-{BLOCK2}`).
  * Cryptographic validation verifying bound email, allowed domain, expiration date, max tenant count, and integrity hash.
  * Real-time activation and revocation lifecycle with automated synchronization into `TenantSubscriptions`.
* **Subscription Plan Standardization**:
  * Unified subscription tier definitions: `Starter` (1), `Professional` (2), `Enterprise` (3), and `OnPremise` (4).
  * Dynamic license key generation synchronized with tenant billing profiles.
* **Tenant Lifecycle Administration**:
  * Multi-tenant data isolation, settings management, and active status toggling.
  * Tenant-level module activation and switchboard controls.

### 2.2 Granular RBAC & Security Infrastructure
* **Claims-Based Dynamic Permission Evaluation**:
  * Zero-trust, fail-closed security model via `PermissionAuthorizationHandler`.
  * Request-level active tenant context resolution via `TenantContextMiddleware` reading JWT `tenant_id` claims and `X-Tenant-Id` fallback headers.
  * In-memory caching with sliding (5 min) and absolute (15 min) expiration and event-driven cache invalidation.
* **10 Canonical Pre-Seeded System Roles**:
  * `Tenant Administrator`, `Planning Officer`, `Finance Officer`, `Procurement Officer`, `LIB Approver`, `WFP Approver`, `OPCR Approver`, `PPMP Approver`, `End User`, and `Supplier`.
  * 40+ atomic functional permissions across `planning.*`, `finance.*`, `procurement.*`, and `admin.*`.

### 2.3 Planning & Performance Management
* **Line Item Budget (LIB)**:
  * Complete lifecycle: Draft $\rightarrow$ Submitted $\rightarrow$ Approved $\rightarrow$ Amended.
  * Financial plan alignment, object code classification, and automated budget summary calculations.
* **Work & Financial Plan (WFP)**:
  * Multi-level hierarchy: Goals $\rightarrow$ Objectives $\rightarrow$ Targets $\rightarrow$ Activities $\rightarrow$ Timelines.
  * Quarterly accomplishment tracking and fund source allocation.
* **Office Performance Commitment and Review (OPCR)**:
  * Performance Management Team (PMT) evaluation and rating calibration.
  * Strategic, Core, and Support function percentage weighting.
* **Executive KPI Library & Benchmarking**:
  * Annual KPI target setting, office assignment, and measurement formulas.

### 2.4 Finance & Budget Execution
* **Unified Accounts Code Structure (UACS)**:
  * Full 54-digit government accounting code structure validation.
  * Fund clusters, authorization codes, financing sources, department/agency codes, and object classifications.
* **Agency Master Budget & Ceilings**:
  * Top-level agency budget allocation with cascaded delivery unit and sub-office ceiling locks.
  * Accounting period locking and unlocking (`fiscalMonthLockUnlock`).

### 2.5 Procurement Operations (RA 9184 Compliant)
* **Project Procurement Management Plan (PPMP)**:
  * Office-level procurement drafting and consolidation into the master Annual Procurement Plan (APP).
* **Purchase Requests (PR) & Canvassing**:
  * PR creation, validation against approved APP entries, and consolidated PR tracking.
  * Request for Quotation (RFQ) generation and supplier price survey comparisons.
* **Bids and Awards Committee (BAC) Lifecycle**:
  * Bidding document configuration, Abstract of Bids (AOB), BAC resolution drafting, and Notice of Award (NOA).
  * Purchase Order (PO) issuance and supplier tracking.

---

## 3. Database Schema & Migrations

### Applied EF Core Migrations
* `20260909041128_AddLicenseKeysAndOnPremiseControls`:
  * Creates `LicenseKeys` table with air-gapped cryptographic signatures, bound domain, and status constraints.
  * Adds `OnPremise`, `AllowedDomain`, and `MaxAllowedTenants` controls to `TenantSettings`.
* `AddUserProfileFieldsToTenantMembers`:
  * Adds `Email`, `FirstName`, `LastName`, and `FullName` to `TenantMembers`.
* `RbacInitialSeed`:
  * Creates `Permissions`, `Roles`, `RolePermissions`, and `TenantMemberRoleAssignments`.

### Migration Execution
```bash
# Apply migrations to Tenant Management database
dotnet ef database update --project apps/backend/TenantManagement/TenantManagement.Infrastructure --startup-project apps/backend/TenantManagement/TenantManagement.Api

# Apply migrations to Dashboard / Planning database
dotnet ef database update --project apps/backend/Dashboard/Dashboard.Infrastructure --startup-project apps/backend/Dashboard/Dashboard.Api
```

---

## 4. Production CI/CD Pipelines

Production workflows have been configured to run on pushes to `master` and version tags (`v*`):

1. **`.github/workflows/deploy-tenant-management-api-prod.yml`**:
   * Solution restore and release compilation with `/p:TreatWarningsAsErrors=true`.
   * Pre-deployment FluentValidation coverage validation (`check-validators.sh`).
   * DTO contract compliance audit (`check-dto-contracts.sh`).
   * Production Docker image build (`:prod` and `:${{ github.ref_name }}`).
   * Automated SCP & SSH deployment to production stack `/opt/docker-stack/tenant-management-api-prod`.
2. **`.github/workflows/deploy-dashboard-api-prod.yml`**:
   * Automated verification, test execution, and deployment to `/opt/docker-stack/dashboard-api-prod`.

---

## 5. Environment Configuration Checklist

Ensure the following secrets are configured in GitHub Actions / Production VPS:

| Environment Variable | Required Service | Description |
| :--- | :--- | :--- |
| `ERPEZ_MANAGEMENT_DB_CONNECTION_STRING_PROD` | Tenant Management API | PostgreSQL connection string for Tenant Management database |
| `ERPEZ_DB_CONNECTION_STRING_PROD` | Dashboard API | PostgreSQL connection string for Planning/Finance database |
| `AZURE_BLOB_STORAGE_CONNECTION_STRING_PROD` | Dashboard API | Blob storage connection string for document archives |
| `PROD_SSH_HOST` | GitHub Actions | Production server IP / Hostname |
| `PROD_SSH_USERNAME` | GitHub Actions | Deployment SSH username |
| `PROD_SSH_KEY` | GitHub Actions | Deployment private SSH key |
