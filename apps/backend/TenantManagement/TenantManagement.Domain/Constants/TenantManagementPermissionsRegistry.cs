namespace ERPEZ.TenantManagement.Domain.Constants;

public static class PlatformPermissions
{
    public const string tenantsView = "platform.tenants.view";
    public const string tenantsManage = "platform.tenants.manage";
    public const string usersView = "platform.users.view";
    public const string usersManage = "platform.users.manage";
    public const string settingsView = "platform.settings.view";
    public const string settingsManage = "platform.settings.manage";
    public const string subscriptionsManage = "platform.subscriptions.manage";
    public const string licensesManage = "platform.licenses.manage";
    public const string auditLogsView = "platform.audit_logs.view";
    public const string inquiriesView = "platform.inquiries.view";
    public const string inquiriesManage = "platform.inquiries.manage";

    public static readonly IReadOnlySet<string> all = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        tenantsView,
        tenantsManage,
        usersView,
        usersManage,
        settingsView,
        settingsManage,
        subscriptionsManage,
        licensesManage,
        auditLogsView,
        inquiriesView,
        inquiriesManage,
        "admin.tenants.manage",
        "admin.system.admin.manage",
        "admin.system.admin.view"
    };

    public static readonly IReadOnlySet<string> auditor = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        tenantsView,
        usersView,
        settingsView,
        auditLogsView
    };

    public static readonly IReadOnlySet<string> support = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        tenantsView,
        usersView,
        settingsView,
        licensesManage
    };
}

public static class TenantPermissions
{
    public const string workspaceView = "tenant.workspace.view";
    public const string workspaceManage = "tenant.workspace.manage";
    public const string membersView = "tenant.members.view";
    public const string membersManage = "tenant.members.manage";
    public const string rolesView = "tenant.roles.view";
    public const string rolesManage = "tenant.roles.manage";
    public const string billingView = "tenant.billing.view";
    public const string billingManage = "tenant.billing.manage";
    public const string invoicesView = "tenant.invoices.view";
    public const string subscriptionsView = "tenant.subscriptions.view";
    public const string subscriptionsManage = "tenant.subscriptions.manage";
    public const string licensesView = "tenant.licenses.view";
    public const string licensesManage = "tenant.licenses.manage";
    public const string modulesView = "tenant.modules.view";
    public const string modulesManage = "tenant.modules.manage";

    public static readonly IReadOnlySet<string> all = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        workspaceView,
        workspaceManage,
        membersView,
        membersManage,
        rolesView,
        rolesManage,
        billingView,
        billingManage,
        invoicesView,
        subscriptionsView,
        subscriptionsManage,
        licensesView,
        licensesManage,
        modulesView,
        modulesManage,
        // Cross-domain aliases for backward compatibility with shared Admin permissions
        ERPEZ.Shared.Constants.Permissions.Admin.rolesManage,
        ERPEZ.Shared.Constants.Permissions.Admin.membersManage,
        ERPEZ.Shared.Constants.Permissions.Admin.tenantsManage,
        ERPEZ.Shared.Constants.Permissions.Admin.usersManage,
        ERPEZ.Shared.Constants.Permissions.Admin.orgStructureView,
        ERPEZ.Shared.Constants.Permissions.Admin.orgStructureManage,
        ERPEZ.Shared.Constants.Permissions.Admin.systemAdminView,
        ERPEZ.Shared.Constants.Permissions.Admin.systemAdminManage,
        ERPEZ.Shared.Constants.Permissions.Admin.operationalRolesView,
        ERPEZ.Shared.Constants.Permissions.Admin.operationalRolesManage
    };

    public static readonly IReadOnlySet<string> billingAdmin = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        workspaceView,
        billingView,
        billingManage,
        invoicesView,
        subscriptionsView,
        subscriptionsManage
    };

    public static readonly IReadOnlySet<string> auditor = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        workspaceView,
        membersView,
        billingView,
        invoicesView,
        licensesView,
        modulesView
    };

    public static readonly IReadOnlySet<string> member = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        workspaceView
    };
}

public static class TenantManagementPermissionsRegistry
{
    private static readonly Dictionary<string, IReadOnlySet<string>> systemRoleMap =
        new(StringComparer.OrdinalIgnoreCase)
        {
            // Platform Scope Roles
            ["Platform Administrator"] = PlatformPermissions.all,
            ["Platform Auditor"] = PlatformPermissions.auditor,
            ["Platform Support"] = PlatformPermissions.support,
            ["SuperAdmin"] = PlatformPermissions.all,

            // Tenant Scope Roles
            ["Tenant Administrator"] = TenantPermissions.all,
            ["TenantAdmin"] = TenantPermissions.all,
            ["System Administrator"] = TenantPermissions.all,
            ["Workspace Admin"] = TenantPermissions.all,
            ["Org Admin"] = TenantPermissions.all,
            ["admin"] = TenantPermissions.all,
            ["Owner"] = TenantPermissions.all,
            ["Billing Administrator"] = TenantPermissions.billingAdmin,
            ["Tenant Auditor"] = TenantPermissions.auditor,
            ["Tenant Member"] = TenantPermissions.member,
        };

    public static IReadOnlySet<string> GetPermissionsForRole(string roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName))
        {
            return new HashSet<string>();
        }

        if (systemRoleMap.TryGetValue(roleName, out var permissions))
        {
            return permissions;
        }

        return new HashSet<string>();
    }

    public static IReadOnlySet<string> GetPermissionsForRoles(IEnumerable<string> roleNames)
    {
        var result = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var role in roleNames)
        {
            if (string.IsNullOrWhiteSpace(role)) continue;

            if (systemRoleMap.TryGetValue(role, out var perms))
            {
                foreach (var p in perms)
                {
                    result.Add(p);
                }
            }
        }
        return result;
    }
}
