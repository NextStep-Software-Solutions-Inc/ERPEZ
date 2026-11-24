# ERPEZ Roles & Permissions (RBAC) Documentation

This document provides a comprehensive guide to the **Role-Based Access Control (RBAC)** architecture, permission definitions, system roles, controller authorization guards, frontend route guards, and development test personas across the **ERPEZ** platform.

---

## 1. Architecture Overview

ERPEZ employs a granular, claims-based RBAC model designed for multi-tenant enterprise environments:

```
┌────────────────────────────────────────────────────────┐
│                   JWT Bearer Token                     │
│  - sub (User External ID)                              │
│  - tenant_id (Active Tenant Guid)                      │
│  - roles: ["End User", "Planning Officer", ...]        │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│   Backend .NET API    │       │  Frontend Dashboard   │
│  [Authorize]          │       │  RoutePermissionGuard │
│  [HasPermission(...)] │       │  usePermissions()     │
└───────────────────────┘       └───────────────────────┘
```

### Backend Enforcement
* **`[Authorize]` (Class Level)**: All domain controllers enforce authentication by default.
* **`[HasPermission(Permissions.Domain.Key)]` (Action Level)**: Custom authorization attribute (`HasPermissionAttribute`) that verifies the user possesses the required functional permission within the active tenant context.
* **Dynamic Permission Resolution**: Permissions are evaluated at request time by querying the role-permission associations in the tenant's database context.

### Frontend Enforcement
* **`<RoutePermissionGuard>`**: Wraps TanStack Router route definitions and parent layout outlets to prevent unauthorized navigation and display an unauthorized fallback card.
* **`usePermissions()`**: React hook providing reactive helper flags (e.g. `hasPermission('planning.lib.create')`) to conditionally render buttons, actions, and tabs in the UI.

---

## 2. Canonical Atomic Permissions Reference

All atomic permissions are defined in `ERPEZ.Shared.Constants.Permissions` (Backend) and `src/constants/permissions.ts` (Frontend).

### 2.1 Planning Domain (`planning.*`)

| Permission Key | Constant | Description |
| :--- | :--- | :--- |
| `planning.dashboard.view_global` | `Permissions.Planning.viewGlobalDashboard` | View institutional global planning dashboard & executive KPIs |
| `planning.dashboard.view_office` | `Permissions.Planning.viewOfficeDashboard` | View office/department-specific planning dashboard |
| `planning.lib.create` | `Permissions.Planning.libCreate` | Draft and initialize new Line Item Budget (LIB) |
| `planning.lib.view` | `Permissions.Planning.libView` | View Line Item Budgets, activities, and allocations |
| `planning.lib.update` | `Permissions.Planning.libUpdate` | Edit Line Item Budget items, amounts, and activity links |
| `planning.lib.delete` | `Permissions.Planning.libDelete` | Delete draft Line Item Budget |
| `planning.lib.submit` | `Permissions.Planning.libSubmit` | Submit Line Item Budget for review/approval |
| `planning.lib.approve` | `Permissions.Planning.libApprove` | Approve or return Line Item Budget |
| `planning.lib.amend` | `Permissions.Planning.libAmend` | Request and submit Line Item Budget amendments |
| `planning.wfp.create` | `Permissions.Planning.wfpCreate` | Draft and create Work & Financial Plan (WFP) |
| `planning.wfp.view` | `Permissions.Planning.wfpView` | View Work & Financial Plans and objective breakdowns |
| `planning.wfp.update` | `Permissions.Planning.wfpUpdate` | Edit WFP objectives, activities, and quarterly targets |
| `planning.wfp.delete` | `Permissions.Planning.wfpDelete` | Delete draft Work & Financial Plan |
| `planning.wfp.submit` | `Permissions.Planning.wfpSubmit` | Submit Work & Financial Plan for review |
| `planning.wfp.approve` | `Permissions.Planning.wfpApprove` | Approve or return Work & Financial Plan |
| `planning.opcr.create` | `Permissions.Planning.opcrCreate` | Create Office Performance Commitment & Review (OPCR) |
| `planning.opcr.view` | `Permissions.Planning.opcrView` | View OPCR documents and target commitments |
| `planning.opcr.update` | `Permissions.Planning.opcrUpdate` | Edit OPCR commitments, indicators, and success measures |
| `planning.opcr.delete` | `Permissions.Planning.opcrDelete` | Delete draft OPCR |
| `planning.opcr.submit` | `Permissions.Planning.opcrSubmit` | Submit OPCR commitment/rating for review |
| `planning.opcr.approve` | `Permissions.Planning.opcrApprove` | Final approval of OPCR commitments |
| `planning.opcr.evaluate` | `Permissions.Planning.opcrEvaluate` | PMT rating calibration and accomplishment scoring |
| `planning.kpi.create` | `Permissions.Planning.kpiCreate` | Define master KPIs in the KPI Library |
| `planning.kpi.view` | `Permissions.Planning.kpiView` | View KPI Library and active annual KPIs |
| `planning.kpi.update` | `Permissions.Planning.kpiUpdate` | Edit KPI measurement formulas, variables, and definitions |
| `planning.kpi.delete` | `Permissions.Planning.kpiDelete` | Delete master KPI definitions |
| `planning.kpi.assign` | `Permissions.Planning.kpiAssign` | Assign KPIs and targets to Delivery Units / Offices |
| `planning.target.manage` | `Permissions.Planning.targetManage` | Configure performance targets and benchmark thresholds |
| `planning.rating_scale.manage` | `Permissions.Planning.ratingScaleManage` | Configure SPMS rating scales and templates |
| `planning.fiscal_year.view` | `Permissions.Planning.fiscalYearView` | View fiscal years, calendar periods, and active years |
| `planning.fiscal_year.manage` | `Permissions.Planning.fiscalYearManage` | Create, activate, lock, unlock, and rollover fiscal years |
| `planning.budget_call.view` | `Permissions.Planning.budgetCallView` | View budget call milestones and schedules |
| `planning.budget_call.manage` | `Permissions.Planning.budgetCallManage` | Create and configure budget call guidelines & deadlines |
| `planning.workflow_matrix.manage`| `Permissions.Planning.workflowMatrixManage` | Configure step-by-step approval routing matrices |
| `planning.economic_indicators.manage` | `Permissions.Planning.economicIndicatorsManage` | Configure inflation rates, currency, and economic indices |
| `planning.data_migrations.manage` | `Permissions.Planning.dataMigrationsManage` | Perform historical data imports and schema migrations |
| `planning.spms_function_weights.manage` | `Permissions.Planning.spmsFunctionWeightsManage` | Configure SPMS functional weights (Strategic, Core, Support) |
| `planning.market_scoping.view` | `Permissions.Planning.marketScopingView` | View Market Scoping studies and price surveys |
| `planning.market_scoping.manage` | `Permissions.Planning.marketScopingManage` | Create and edit Market Scoping studies |
| `planning.market_scoping.submit` | `Permissions.Planning.marketScopingSubmit` | Submit Market Scoping studies for review |
| `planning.market_scoping.approve`| `Permissions.Planning.marketScopingApprove` | Approve Market Scoping studies |

---

### 2.2 Finance Domain (`finance.*`)

| Permission Key | Constant | Description |
| :--- | :--- | :--- |
| `finance.agency_master_budget.manage` | `Permissions.Finance.agencyMasterBudgetManage` | Configure and manage top-level Agency Master Budgets (AMB) |
| `finance.budget_ceiling.assign` | `Permissions.Finance.budgetCeilingAssign` | Assign budget ceilings to offices / delivery units |
| `finance.sub_office_ceiling.assign` | `Permissions.Finance.subOfficeCeilingAssign` | Assign sub-office / department budget ceilings |
| `finance.fiscal_month.lock_unlock` | `Permissions.Finance.fiscalMonthLockUnlock` | Lock and unlock accounting/fiscal months |
| `finance.uacs.view` | `Permissions.Finance.uacsView` | View UACS chart of accounts, fund sources, and ceilings |
| `finance.uacs.manage` | `Permissions.Finance.uacsManage` | Manage UACS code segments and object combinations |
| `finance.fund_source.manage` | `Permissions.Finance.fundSourceManage` | Create, update, and manage agency fund sources |

---

### 2.3 Procurement Domain (`procurement.*`)

| Permission Key | Constant | Description |
| :--- | :--- | :--- |
| `procurement.ppmp.create` | `Permissions.Procurement.ppmpCreate` | Create department Project Procurement Management Plan (PPMP) |
| `procurement.ppmp.view` | `Permissions.Procurement.ppmpView` | View PPMP documents, activities, and allocations |
| `procurement.ppmp.update` | `Permissions.Procurement.ppmpUpdate` | Edit PPMP items, estimated prices, schedule, or delete draft |
| `procurement.ppmp.submit` | `Permissions.Procurement.ppmpSubmit` | Submit PPMP for department approval |
| `procurement.ppmp.approve` | `Permissions.Procurement.ppmpApprove` | Approve or return department PPMPs |
| `procurement.ppmp.consolidate` | `Permissions.Procurement.ppmpConsolidate` | Consolidate approved department PPMPs into the APP |
| `procurement.ppmp.review` | `Permissions.Procurement.ppmpReview` | Review PPMP compliance and review audit trails |
| `procurement.app.manage` | `Permissions.Procurement.appManage` | Manage Annual Procurement Plan (APP) and line items |
| `procurement.pr.create` | `Permissions.Procurement.prCreate` | Create Purchase Request (PR) and Agency Procurement Request (APR) |
| `procurement.pr.manage` | `Permissions.Procurement.prManage` | Approve, update status, and consolidate PRs/APRs |
| `procurement.rfq.manage` | `Permissions.Procurement.rfqManage` | Manage Request for Quotation (RFQ), supplier invites & canvass |
| `procurement.bac.manage` | `Permissions.Procurement.bacManage` | Manage Bids & Awards Committee (BAC) projects and calendar |
| `procurement.aob.manage` | `Permissions.Procurement.aobManage` | Abstract of Bids (AOB), bid matrix evaluation, and awards |
| `procurement.po.manage` | `Permissions.Procurement.poManage` | Generate and manage Purchase Orders and Notice to Proceed (NTP) |
| `procurement.procurement_library.view` | `Permissions.Procurement.procurementLibraryView` | View Procurement Item Catalog, categories, and price standards |
| `procurement.procurement_library.manage` | `Permissions.Procurement.procurementLibraryManage` | Add, update, and manage catalog items and price indices |
| `procurement.procurement_thresholds.manage` | `Permissions.Procurement.procurementThresholdsManage` | Configure procurement mode thresholds (SVP, Bidding, Direct) |
| `procurement.bidding_documents.view` | `Permissions.Procurement.biddingDocumentsView` | View standard Bidding Document Templates |
| `procurement.bidding_documents.manage` | `Permissions.Procurement.biddingDocumentsManage` | Create and customize Bidding Document templates & clauses |
| `procurement.supplier.view` | `Permissions.Procurement.supplierView` | View registered supplier directory and quotations |
| `procurement.supplier.manage` | `Permissions.Procurement.supplierManage` | Accredit, blacklist, rate, and manage supplier profiles |

---

### 2.4 Administration Domain (`admin.*`)

| Permission Key | Constant | Description |
| :--- | :--- | :--- |
| `admin.tenants.manage` | `Permissions.Admin.tenantsManage` | Provision, configure, and manage tenant organizations |
| `admin.members.manage` | `Permissions.Admin.membersManage` | Manage tenant user memberships and invitations |
| `admin.roles.manage` | `Permissions.Admin.rolesManage` | Create, customize, and assign functional roles |
| `admin.users.manage` | `Permissions.Admin.usersManage` | Manage user profiles, contact information, and statuses |
| `admin.org_structure.view` | `Permissions.Admin.orgStructureView` | View organizational hierarchy, offices, and delivery units |
| `admin.org_structure.manage` | `Permissions.Admin.orgStructureManage` | Configure offices, divisions, sections, and positions |
| `admin.system_admin.view` | `Permissions.Admin.systemAdminView` | View system health, runtime parameters, and audit logs |
| `admin.system_admin.manage` | `Permissions.Admin.systemAdminManage` | Configure global system parameters and subscriptions |

---

## 3. Pre-Seeded System Roles Reference

Configured in `RoleSeeder.cs`.

### 3.1 End User / Preparer
* **Role Name**: `End User`
* **Target Users**: Department heads, division chiefs, delivery unit focal persons.
* **Core Responsibilities**: Drafts, amends, and submits operational planning documents (**LIB**, **WFP**, **OPCR**) and procurement plans (**PPMP**).
* **Assigned Permissions**:
  * Planning: `lib.create`, `lib.update`, `lib.view`, `lib.submit`, `lib.amend`, `wfp.create`, `wfp.update`, `wfp.view`, `wfp.submit`, `opcr.create`, `opcr.update`, `opcr.view`, `opcr.submit`, `dashboard.view_office`, `fiscal_year.view`
  * Procurement: `ppmp.create`, `ppmp.update`, `ppmp.view`, `ppmp.submit`, `procurement_library.view`
  * Finance: `uacs.view`
  * Admin: `org_structure.view`

### 3.2 Planning Officer
* **Role Name**: `Planning Officer`
* **Target Users**: Corporate Planning Division, Institutional Quality Assurance.
* **Core Responsibilities**: Manages institutional KPI library, target assignments, PMT evaluations, SPMS weighting, fiscal year lifecycle, and global dashboards.
* **Assigned Permissions**:
  * Planning: `kpi.create`, `kpi.view`, `kpi.update`, `kpi.delete`, `kpi.assign`, `target.manage`, `rating_scale.manage`, `fiscal_year.view`, `fiscal_year.manage`, `budget_call.view`, `budget_call.manage`, `workflow_matrix.manage`, `economic_indicators.manage`, `data_migrations.manage`, `spms_function_weights.manage`, `market_scoping.view`, `market_scoping.manage`, `market_scoping.submit`, `market_scoping.approve`, `opcr.evaluate`, `dashboard.view_global`, `lib.view`, `wfp.view`
  * Admin: `org_structure.view`
  * Finance: `uacs.view`
  * Procurement: `procurement_library.view`, `bidding_documents.view`

### 3.3 Finance Officer
* **Role Name**: `Finance Officer`
* **Target Users**: Budget Office, Accounting Division, Cashier/Treasurer.
* **Core Responsibilities**: Manages agency budget allocations, office ceilings, fund sources, UACS account codes, and fiscal month locks.
* **Assigned Permissions**:
  * Finance: `agency_master_budget.manage`, `budget_ceiling.assign`, `sub_office_ceiling.assign`, `fiscal_month.lock_unlock`, `uacs.view`, `uacs.manage`, `fund_source.manage`
  * Planning: `fiscal_year.view`, `fiscal_year.manage`, `economic_indicators.manage`, `dashboard.view_global`
  * Admin: `org_structure.view`
  * Procurement: `procurement_library.view`

### 3.4 Procurement Officer
* **Role Name**: `Procurement Officer`
* **Target Users**: Bids and Awards Committee (BAC) Secretariat, Procurement Management Unit.
* **Core Responsibilities**: Consolidates PPMPs into the APP, manages Purchase Requests (PR), APRs, RFQ canvassing, BAC bidding projects, Abstract of Bids (AOB), Purchase Orders (PO), and Supplier directory.
* **Assigned Permissions**:
  * Procurement: `ppmp.view`, `ppmp.review`, `ppmp.consolidate`, `app.manage`, `pr.create`, `pr.manage`, `rfq.manage`, `bac.manage`, `aob.manage`, `po.manage`, `procurement_library.view`, `procurement_library.manage`, `procurement_thresholds.manage`, `bidding_documents.view`, `bidding_documents.manage`, `supplier.view`, `supplier.manage`
  * Planning: `market_scoping.view`
  * Finance: `uacs.view`
  * Admin: `org_structure.view`

### 3.5 Approvers
* **LIB Approver**: `planning.lib.approve`, `planning.lib.view`
* **WFP Approver**: `planning.wfp.approve`, `planning.wfp.view`
* **OPCR Approver**: `planning.opcr.approve`, `planning.opcr.view`
* **PPMP Approver**: `procurement.ppmp.approve`, `procurement.ppmp.view`

### 3.6 Tenant Administrator
* **Role Name**: `Tenant Administrator`
* **Target Users**: System Administrators, IT Governance.
* **Core Responsibilities**: Manages tenant users, roles, organizational units, and all institutional configuration matrices.
* **Assigned Permissions**: Full administrative control across `admin.*`, `planning.fiscal_year.manage`, `finance.agency_master_budget.manage`, `finance.uacs.manage`, `procurement.procurement_library.manage`, and all system configurations.

### 3.7 Supplier
* **Role Name**: `Supplier`
* **Target Users**: External vendors and contractors.
* **Assigned Permissions**: `procurement.supplier.view` (access to Supplier Portal for bidding and submitting quotations).

---

## 4. Development Test Personas

Pre-configured in `DevTenantAndMemberSeeder.cs` for local testing.

| Persona User ID | Display Name | Email | Roles Assigned |
| :--- | :--- | :--- | :--- |
| `dev_superadmin` | Super Administrator | `superadmin@erpez.dev` | Tenant Administrator *(SuperAdmin)* |
| `dev_planner` | Planning Officer | `planner@erpez.dev` | Planning Officer |
| `dev_preparer` | End User / Preparer | `preparer@erpez.dev` | End User |
| `dev_approver` | Approver | `approver@erpez.dev` | LIB Approver, PPMP Approver, WFP Approver, OPCR Approver |
| `dev_finance` | Finance Officer | `finance@erpez.dev` | Finance Officer |
| `dev_procurement` | Procurement Officer | `procurement@erpez.dev` | Procurement Officer |
| `dev_admin` | Tenant Admin | `admin@erpez.dev` | Tenant Administrator |
| `dev_supplier` | Supplier / Vendor | `supplier@erpez.dev` | Supplier |

---

## 5. Developer Guide: Applying RBAC to New Features

### 5.1 Protecting a Backend Controller
1. Add `[Authorize]` at the class level.
2. Add `[HasPermission(Permissions.<Domain>.<Action>)]` to every action method:

```csharp
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[ApiController]
[Route("api/feature")]
[Authorize]
public class MyFeatureController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Planning.libView)]
    public async Task<IActionResult> GetItems() => Ok();

    [HttpPost]
    [HasPermission(Permissions.Planning.libCreate)]
    public async Task<IActionResult> CreateItem([FromBody] CreateItemDto dto) => Ok();
}
```

### 5.2 Protecting a Frontend Route
Wrap the route component in `<RoutePermissionGuard>`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'
import { MyFeaturePage } from '@/features/my-feature/pages/MyFeaturePage'

export const Route = createFileRoute('/v2/my-feature')({
  component: () => (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Lib.View}
      message="You do not have permission to access this module."
    >
      <MyFeaturePage />
    </RoutePermissionGuard>
  ),
})
```
