# Environment Variables & Secret Management Guide

This document outlines all required and optional environment variables and secrets across the ERPEZ microservices and client applications.

---

## 1. Secret & Key Management (Required for Staging & Production)

### `ENCRYPTION_MASTER_KEY_V1` (or `ENCRYPTION_MASTER_KEY`)

- **Required:** **YES in Staging & Production** (Application will fail-fast at startup if missing). In `Development`, a fallback key is allowed with a logged security warning.
- **Used by:** `ERPEZ.Shared.Configuration.EncryptionConfigurationValidator`, `AesGcmSecretEncryptionService` (Dashboard & TenantManagement microservices).
- **Purpose:** 256-bit (32-byte) AES master key used for cryptographically securing tenant operational database credentials, connection strings, and sensitive secrets at rest.
- **Format:** 32-byte raw UTF-8 string or 64-character hexadecimal representation.
- **Version Precedence & Key Rotation:**
  1. `ENCRYPTION_MASTER_KEY_V{n}` (Environment variable)
  2. `Encryption:Keys:V{n}` (Structured JSON configuration)
  3. `Encryption:MasterKey` (Legacy configuration fallback for V1)
  4. `ENCRYPTION_MASTER_KEY` (Legacy environment fallback for V1)

> [!CAUTION]
> Non-development environments strictly enforce fail-closed security. If `ENCRYPTION_MASTER_KEY_V1` (or `ENCRYPTION_MASTER_KEY`) is null or empty, startup throws `InvalidOperationException` and aborts host initialization.

---

## 2. Authentication & Identity Provider Configurations

### A. Keycloak (Dashboard Application & Operational APIs)

Keycloak provides OpenID Connect (OIDC) identity federation for operational tenants and the Dashboard app.

#### Backend APIs (`Dashboard.Api` & `TenantManagement.Api`):

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `JwtSettings__Authority` | Staging/Prod | Keycloak Realm Issuer URL | `https://keycloak.dev.nextstep-software.com/realms/erpez` |
| `JwtSettings__Audience` | Staging/Prod | Client Audience in JWT | `web-client` or `erpez-api` |
| `Keycloak__BaseUrl` | Optional | Keycloak instance base URL | `https://keycloak.dev.nextstep-software.com` |
| `Keycloak__Authority` | Optional | Keycloak realm endpoint | `https://keycloak.dev.nextstep-software.com/realms/erpez` |
| `Keycloak__Audience` | Optional | Target client audience | `web-client` |
| `Keycloak__AdminUsername` | Optional | Admin account for automation | `admin` |
| `Keycloak__AdminPassword` | Optional | Admin password for automation | *(secret)* |

#### Frontend (`apps/dashboard`):

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `VITE_KEYCLOAK_URL` | Yes | Keycloak base URL | `https://keycloak.dev.nextstep-software.com` |
| `VITE_KEYCLOAK_REALM` | Yes | Target Realm name | `erpez` |
| `VITE_KEYCLOAK_CLIENT_ID` | Yes | OIDC Public Client ID | `web-client` |
| `VITE_BACKEND_URL` | Yes | Dashboard backend API endpoint | `http://localhost:5245` |

---

### B. Clerk (Tenant Management Control Plane)

Clerk manages customer registration, multi-tenant workspace onboarding, and organization licensing in the Tenant Management portal.

#### Backend APIs (`TenantManagement.Api`):

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `ClerkSettings__Authority` | Staging/Prod | Clerk JWT Issuer Authority | `https://clerk.yourdomain.com` |
| `ClerkSettings__SecretKey` | Staging/Prod | Clerk Backend Secret API Key | `sk_live_...` |
| `ClerkSettings__WebhookSecret` | Staging/Prod | Clerk Webhook signature validation secret | `whsec_...` |

#### Frontend (`apps/tenant-management`):

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable public key | `pk_test_...` or `pk_live_...` |
| `VITE_ERPEZ_BACKEND_URL` | Yes | Tenant Management API endpoint | `http://localhost:5246` |

---

## 3. Multi-Tenancy & Host / Origin Boundaries

| Variable | Required | Description | Default / Recommended |
|---|---|---|---|
| `TenantRouting__AllowedApiHosts` | Staging/Prod | Comma-delimited list of authorized API host headers | `api.erpez.com,dashboard.erpez.com` |
| `TenantRouting__AllowDevelopmentFallback` | Staging/Prod | Controls whether unauthorized hosts fall back to dev defaults | Set to `false` in Staging & Production |

---

## 4. Database Connection

### `ConnectionStrings__DefaultConnection`

- **Required:** Yes
- **Description:** PostgreSQL connection string for the core operational database (or single database if running combined).
- **Format:** `Host=localhost;Port=5432;Database=erpez_db;Username=your_user;Password=your_password`

### `ConnectionStrings__ControlPlaneConnection` / `ConnectionStrings__TenantManagementConnection`

- **Required:** Yes (in multi-database / microservice topologies where Tenant Management DB is separate from Dashboard DB)
- **Description:** PostgreSQL connection string for the Tenant Management / Control Plane database. Used by Dashboard middlewares (`CachedTenantAccessService`, `KeycloakUserProvisioningMiddleware`) to validate tenant workspace status and cross-plane administrative access.
- **Fallback Behavior:** If not explicitly set, falls back to `TenantManagementConnection`, then to `DefaultConnection` (with development fallback substituting `ERPEZ-DASHBOARD_DB` for `ERPEZ-TENANT_MANAGEMENT_DB`).
- **Format:** `Host=localhost;Port=5432;Database=erpez_tenant_mgmt_db;Username=your_user;Password=your_password`

---

## 5. Azure Blob Storage

### `AzureBlobStorage__ConnectionString`

- **Required:** Yes
- **Description:** Azure Blob Storage connection string for file storage and document attachments.
- **Format:** `DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net`
- **Default Container:** `files`

---

## 6. Pre-Flight Staging & Production Deployment Checklist

Prior to promoting any build from Development to Staging or Production:

- [ ] **Encryption Master Key**: Verify `ENCRYPTION_MASTER_KEY_V1` (or `ENCRYPTION_MASTER_KEY`) is stored securely in Azure Key Vault / App Configuration / Kubernetes Secrets.
- [ ] **Strict Security Mode**: Verify `TenantRouting__AllowDevelopmentFallback` is set to `false`.
- [ ] **Allowed API Hosts**: Verify `TenantRouting__AllowedApiHosts` includes all custom domains and gateway hostnames.
- [ ] **Keycloak OIDC**: Verify `JwtSettings__Authority` and `JwtSettings__Audience` match the target Keycloak realm.
- [ ] **Clerk Keys**: Verify `VITE_CLERK_PUBLISHABLE_KEY` and `ClerkSettings__SecretKey` use production (`pk_live_`, `sk_live_`) keys.
- [ ] **PostgreSQL Operational DB**: Verify `ConnectionStrings__DefaultConnection` is pointed to the managed database cluster with SSL enforced (`SSL Mode=Require`).
- [ ] **PostgreSQL Control Plane DB**: Verify `ConnectionStrings__ControlPlaneConnection` is populated in Dashboard App Service / Kubernetes secrets if running distinct database instances.
- [ ] **Blob Storage**: Verify `AzureBlobStorage__ConnectionString` points to the designated storage account.

---

## 7. Deprecation Notice & Removal Schedule

| Component / API | Deprecation Ticket | Target Removal | Migration Guidance |
|---|---|---|---|
| `ITenantAccessService.EvaluateAccessAsync(ClaimsPrincipal, Guid, string, CancellationToken)` | **`[SEC-DEP-001]`** | **v1.1.0** | Use `EvaluateAccessAsync(TenantAccessRequest, CancellationToken)`. All callers have already been migrated to use `TenantAccessRequest`. |
