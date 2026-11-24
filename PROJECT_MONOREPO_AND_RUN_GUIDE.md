# ERPEZ Unified Monorepo Development & Execution Guide

This document is the official development guide for the **ERPEZ Full-Stack Monorepo**. The workspace houses all backend .NET microservices, frontend applications, and shared libraries in a single repository.

---

## 1. Monorepo Architecture & Directory Layout

The workspace is managed using **`pnpm` Workspaces**, **Turborepo** (`turbo.json`), and **.NET Solution** tools.

```text
ERPEZ-backend/
├── apps/
│   ├── backend/                 # Primary .NET 8/9 Backend Microservices & Solution
│   │   ├── ERPEZ.sln            # Main C# Visual Studio Solution
│   │   ├── ERPEZ/               # Main ERP Web API (ERPEZ.Api, Application, Domain, Infrastructure)
│   │   ├── TenantManagement/    # Tenant Onboarding API (ERPEZ.TenantManagement.Api, Application, etc.)
│   │   └── ERPEZ.Shared/        # Shared C# Domain Primitives & DTOs
│   │
│   ├── dashboard/               # Main ERP Web Dashboard (Vite + React 19 + TanStack Router/Query)
│   ├── tenant-management/       # Admin & Tenant Configuration Web App (Vite + React 19)
│   └── dashtail/                # Dashtail v1.3.0 Next.js Design System & Component Library
│
├── packages/
│   ├── erpez-shared-lib/        # Shared TypeScript Data Layer (API Clients, TanStack Query Factories)
│   ├── types/                   # Cross-app TypeScript Type Definitions
│   └── ui/                      # Shared React UI Component Library
│
├── .vscode/                     # VS Code Pre-configured Debugger & Task Configurations
├── pnpm-workspace.yaml          # Monorepo Workspace Configuration
├── turbo.json                   # Turborepo Build & Dev Task Orchestration
└── package.json                 # Monorepo Root Script Definitions
```

---

## 2. VS Code "Run & Debug" (Zero Terminal Commands Required)

The workspace is pre-configured with VS Code `.vscode/launch.json` and `.vscode/tasks.json` profiles for one-click debugging:

### A. Running the Backend API Server:
1. Open the repository root folder in VS Code.
2. Press **`F5`** (or open the **Run & Debug** panel `Ctrl+Shift+D`).
3. Select **`.NET Core Launch (ERPEZ.Api)`** from the dropdown and click **Play**.
4. VS Code will build the project and start the server on **`http://localhost:5245/swagger`**.

> *To run the Tenant Management API instead, select **`.NET Core Launch (TenantManagement.Api)`**.*

### B. Running Frontend Applications:
1. Open the **Run & Debug** panel (`Ctrl+Shift+D`) or Task Runner (`Ctrl+Shift+P` -> `Tasks: Run Task`).
2. Run task **`pnpm: dev (dashboard)`** or execute `pnpm --filter dashboard dev` in terminal.
3. The dashboard app will start on **`http://localhost:3000`**.

---

## 3. Running via Terminal / CLI

If you prefer using the terminal directly from the monorepo root:

### Start All Applications (Backend & Frontend):
```powershell
pnpm dev
```
*(Uses Turborepo to run `dev` scripts across all apps concurrently)*

### Run Backend Only (.NET CLI):
```powershell
dotnet run --project apps/backend/ERPEZ/ERPEZ.Api/ERPEZ.Api.csproj --launch-profile http
```

### Run Frontend Dashboard Only:
```powershell
pnpm --filter dashboard dev
```

---

## 4. Local Database Setup & Configuration

The backend `ERPEZ.Api` requires a PostgreSQL database connection.

### Setting Up Local Connection:
If you are developing locally with a local PostgreSQL server (port `5432`):

1. Set the User Secret for `ERPEZ.Api`:
   ```powershell
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=ERPEZ_DB;Username=postgres;Password=your_password" --project apps/backend/ERPEZ/ERPEZ.Api/ERPEZ.Api.csproj
   ```
2. Run EF Core migrations (if needed):
   ```powershell
   dotnet ef database update --project apps/backend/ERPEZ/ERPEZ.Infrastructure --startup-project apps/backend/ERPEZ/ERPEZ.Api
   ```
3. Press **`F5`** in VS Code to launch.

---

## 5. Key File References

- **Root Package Config**: [`package.json`](./package.json)
- **Monorepo Workspaces**: [`pnpm-workspace.yaml`](./pnpm-workspace.yaml)
- **Turborepo Config**: [`turbo.json`](./turbo.json)
- **Backend .NET Solution**: [`apps/backend/ERPEZ.sln`](./apps/backend/ERPEZ.sln)
- **Main Backend API**: [`apps/backend/Dashboard/Dashboard.Api`](./apps/backend/Dashboard/Dashboard.Api)
- **Main Frontend App**: [`apps/dashboard`](./apps/dashboard)
- **VS Code Debugger**: [`.vscode/launch.json`](./.vscode/launch.json)
