namespace ERPEZ.Shared.Constants;

/// <summary>
/// Authoritative centralized role constants and classification utilities for ERPEZ RBAC.
/// Eliminates magic strings across API controllers, authorization services, and middlewares.
/// Adheres strictly to repository .editorconfig naming conventions (camelCase fields, PascalCase properties).
/// </summary>
public static class RoleConstants
{
    // Primary Architectural Roles (camelCase fields per .editorconfig)
    public const string systemAdministrator = "System Administrator";
    public const string tenantAdministrator = "Tenant Administrator";
    public const string platformAdministrator = "Platform Administrator";
    public const string employeeViewer = "Employee / Viewer";

    // Legacy and Identity Provider Aliases
    public const string dashboardSystemAdmin = "Dashboard System Admin";
    public const string workspaceAdmin = "Workspace Admin";
    public const string workspaceAdministrator = "Workspace Administrator";
    public const string tenantAdmin = "TenantAdmin";
    public const string superAdmin = "SuperAdmin";
    public const string orgAdmin = "org:admin";
    public const string admin = "admin";

    // Operational Domain Roles
    public const string planningOfficer = "Planning Officer";
    public const string procurementOfficer = "Procurement Officer";
    public const string budgetOfficer = "Budget Officer";
    public const string bacMember = "BAC Member";
    public const string executiveApprover = "Executive Approver";
    public const string libApprover = "LIB Approver";
    public const string wfpApprover = "WFP Approver";
    public const string opcrApprover = "OPCR Approver";
    public const string ppmpApprover = "PPMP Approver";
    public const string supplier = "Supplier";
    public const string financeOfficer = "Finance Officer";

    // PascalCase Properties matching C# standard accessors and .editorconfig property rules
    public static string SystemAdministrator => systemAdministrator;
    public static string TenantAdministrator => tenantAdministrator;
    public static string PlatformAdministrator => platformAdministrator;
    public static string EmployeeViewer => employeeViewer;
    public static string DashboardSystemAdmin => dashboardSystemAdmin;
    public static string WorkspaceAdmin => workspaceAdmin;
    public static string WorkspaceAdministrator => workspaceAdministrator;
    public static string TenantAdmin => tenantAdmin;
    public static string SuperAdmin => superAdmin;
    public static string OrgAdmin => orgAdmin;
    public static string Admin => admin;
    public static string PlanningOfficer => planningOfficer;
    public static string ProcurementOfficer => procurementOfficer;
    public static string BudgetOfficer => budgetOfficer;
    public static string BACMember => bacMember;
    public static string ExecutiveApprover => executiveApprover;
    public static string LIBApprover => libApprover;
    public static string WFPApprover => wfpApprover;
    public static string OPCRApprover => opcrApprover;
    public static string PPMPApprover => ppmpApprover;
    public static string Supplier => supplier;
    public static string FinanceOfficer => financeOfficer;

    /// <summary>
    /// Checks if the specified role name represents an operational or workspace administrator.
    /// </summary>
    public static bool IsWorkspaceAdmin(string? roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName)) return false;
        return roleName.Equals(systemAdministrator, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals(dashboardSystemAdmin, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals(workspaceAdmin, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals(workspaceAdministrator, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Checks if the specified role name represents a tenant account governance administrator.
    /// </summary>
    public static bool IsTenantAdmin(string? roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName)) return false;
        return roleName.Equals(tenantAdministrator, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals(tenantAdmin, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals(orgAdmin, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals(admin, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Checks if the specified role name represents a platform-level administrator.
    /// </summary>
    public static bool IsPlatformAdmin(string? roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName)) return false;
        return roleName.Equals(platformAdministrator, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals(superAdmin, StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals("super-admin", StringComparison.OrdinalIgnoreCase) ||
               roleName.Equals("platform_administrator", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Checks if the specified role name represents any administrative tier (workspace, tenant, or platform).
    /// </summary>
    public static bool IsAnyAdmin(string? roleName)
    {
        return IsWorkspaceAdmin(roleName) || IsTenantAdmin(roleName) || IsPlatformAdmin(roleName);
    }
}
