using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Idempotent seeder that populates default Platform and Tenant system roles.
/// Role permissions are governed by the in-code PermissionsRegistry.
/// </summary>
public static class RoleSeeder
{
    private record RoleDefinition(string Name, string Description, RoleScope Scope, bool IsAssignableToTenant);

    private static readonly RoleDefinition[] systemRoles =
    [
        // Platform Scope Roles (Managing the platform and its tenant fleet)
        new(
            "Platform Administrator",
            "Full administrative authority over platform tenants, subscriptions, silos, and global settings.",
            RoleScope.Platform,
            false
        ),
        new(
            "Platform Auditor",
            "Read-only auditor for cross-tenant fleet health, compliance metrics, and platform audit logs.",
            RoleScope.Platform,
            false
        ),
        new(
            "Platform Support",
            "Platform technical support personnel managing tenant licenses and health diagnostics.",
            RoleScope.Platform,
            false
        ),

        // Tenant Scope Roles (In-tenant workspace governance, billing, and member administration)
        new(
            "Tenant Administrator",
            "Tenant-level administrator managing workspace settings, member invitations, billing, and licenses.",
            RoleScope.Tenant,
            true
        ),
        new(
            "Billing Administrator",
            "Manages organization subscription tier, invoices, receipts, and payment methods.",
            RoleScope.Tenant,
            true
        ),
        new(
            "Tenant Auditor",
            "Read-only auditor for tenant workspace configuration, audit logs, and compliance records.",
            RoleScope.Tenant,
            true
        ),
        new(
            "Tenant Member",
            "Base account membership within the tenant workspace.",
            RoleScope.Tenant,
            true
        )
    ];

    public static async Task SeedAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (dbContext.Database.IsRelational())
        {
            await dbContext.Database.ExecuteSqlRawAsync(
                "UPDATE \"Roles\" SET \"Scope\" = 'Tenant' WHERE \"Scope\" IN ('TenantManagement', 'Operational');",
                cancellationToken);
            await dbContext.Database.ExecuteSqlRawAsync(
                "UPDATE \"Roles\" SET \"Scope\" = 'Unknown' WHERE \"Scope\" = 'ExternalPortal';",
                cancellationToken);
        }

        var existingRoles = await dbContext.Roles!
            .Where(r => r.IsSystemRole && r.TenantId == null)
            .ToListAsync(cancellationToken);

        foreach (var def in systemRoles)
        {
            var normalizedName = def.Name.Trim().ToUpperInvariant();
            var role = existingRoles.FirstOrDefault(r => r.NormalizedName == normalizedName);

            if (role == null)
            {
                role = new Role
                {
                    Name = def.Name,
                    NormalizedName = normalizedName,
                    Description = def.Description,
                    IsSystemRole = true,
                    TenantId = null,
                    IsAssignableToTenant = def.IsAssignableToTenant,
                    Scope = def.Scope
                };

                await dbContext.Roles!.AddAsync(role, cancellationToken);
            }
            else
            {
                var needsUpdate = false;
                if (role.IsAssignableToTenant != def.IsAssignableToTenant)
                {
                    role.IsAssignableToTenant = def.IsAssignableToTenant;
                    needsUpdate = true;
                }
                if (role.Scope != def.Scope)
                {
                    role.Scope = def.Scope;
                    needsUpdate = true;
                }
                if (needsUpdate)
                {
                    dbContext.Roles!.Update(role);
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
