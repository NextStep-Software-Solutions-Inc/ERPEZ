using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Idempotent seeder that provisions the ERPEZ Dev Sandbox tenant and test members for local development.
/// </summary>
public static class DevTenantAndMemberSeeder
{
    public static Guid DevTenantId { get; } = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static Guid DevTenantSettingId { get; } = Guid.Parse("00000000-0000-0000-0000-000000000002");

    public record DevPersonaDefinition(
        Guid MemberId,
        string UserId,
        string ExternalIdentityId,
        string DisplayName,
        string Email,
        TenantMemberRole LegacyRole,
        string[] RoleNames
    );

    public static IReadOnlyList<DevPersonaDefinition> DevPersonas { get; } =
    [
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000001"),
            "dev_superadmin",
            "dev_superadmin",
            "Super Administrator (Dev)",
            "superadmin@erpez.dev",
            TenantMemberRole.Admin,
            ["Tenant Administrator"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000002"),
            "dev_planner",
            "dev_planner",
            "Planning Officer (Dev)",
            "planner@erpez.dev",
            TenantMemberRole.Member,
            ["Planning Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000003"),
            "dev_preparer",
            "dev_preparer",
            "End User / Preparer (Dev)",
            "preparer@erpez.dev",
            TenantMemberRole.Member,
            ["End User"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000004"),
            "dev_approver",
            "dev_approver",
            "Approver (Dev)",
            "approver@erpez.dev",
            TenantMemberRole.Member,
            ["LIB Approver", "PPMP Approver", "WFP Approver", "OPCR Approver"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000005"),
            "dev_finance",
            "dev_finance",
            "Finance Officer (Dev)",
            "finance@erpez.dev",
            TenantMemberRole.Member,
            ["Finance Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000006"),
            "dev_procurement",
            "dev_procurement",
            "Procurement Officer (Dev)",
            "procurement@erpez.dev",
            TenantMemberRole.Member,
            ["Procurement Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000007"),
            "dev_admin",
            "dev_admin",
            "Tenant Admin (Dev)",
            "admin@erpez.dev",
            TenantMemberRole.Admin,
            ["Tenant Administrator"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000008"),
            "dev_supplier",
            "dev_supplier",
            "Supplier / Vendor (Dev)",
            "supplier@erpez.dev",
            TenantMemberRole.Member,
            ["Supplier"]
        )
    ];

    public static async Task SeedAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        // 1. Ensure Dev Tenant exists
        var existingTenant = await dbContext.Tenants!
            .Include(t => t.Modules)
            .FirstOrDefaultAsync(t => t.Id == DevTenantId, cancellationToken);

        if (existingTenant == null)
        {
            existingTenant = new Tenant
            {
                Id = DevTenantId,
                Name = "ERPEZ Dev Sandbox",
                Description = "Dedicated Development & Testing Environment",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await dbContext.Tenants!.AddAsync(existingTenant, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 2. Ensure Tenant Setting exists
        var existingSetting = await dbContext.TenantSettings!
            .FirstOrDefaultAsync(ts => ts.TenantId == DevTenantId, cancellationToken);

        if (existingSetting == null)
        {
            var setting = new TenantSetting
            {
                Id = DevTenantSettingId,
                TenantId = DevTenantId,
                OnPremise = false,
                BaseURL = "http://localhost:5245",
                DbConnectionString = string.Empty,
                BillingContactEmail = "dev@erpez.local",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await dbContext.TenantSettings!.AddAsync(setting, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 3. Link Available Modules
        if (dbContext.Modules != null && existingTenant.Modules.Count == 0)
        {
            var modules = await dbContext.Modules.ToListAsync(cancellationToken);
            if (modules.Count != 0)
            {
                foreach (var module in modules)
                {
                    existingTenant.Modules.Add(module);
                }
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        // 4. Fetch System Roles for mapping
        var roles = await dbContext.Roles!
            .ToListAsync(cancellationToken);

        var rolesByName = roles.ToDictionary(r => r.NormalizedName, r => r, StringComparer.OrdinalIgnoreCase);

        // 5. Seed Dev Personas / Members
        foreach (var persona in DevPersonas)
        {
            var member = await dbContext.TenantMembers!
                .Include(tm => tm.RoleAssignments)
                .FirstOrDefaultAsync(tm => tm.TenantId == DevTenantId &&
                                          (tm.Id == persona.MemberId || tm.UserId == persona.UserId || tm.ExternalIdentityId == persona.ExternalIdentityId),
                                     cancellationToken);

            var nameParts = persona.DisplayName.Split(' ', 2);
            var firstName = nameParts[0];
            var lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

            if (member == null)
            {
                member = new TenantMember
                {
                    Id = persona.MemberId,
                    TenantId = DevTenantId,
                    UserId = persona.UserId,
                    ExternalIdentityId = persona.ExternalIdentityId,
                    Email = persona.Email,
                    FirstName = firstName,
                    LastName = lastName,
                    Status = Status.Active,
#pragma warning disable CS0618
                    Role = persona.LegacyRole,
#pragma warning restore CS0618
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };

                await dbContext.TenantMembers!.AddAsync(member, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            else
            {
                member.ExternalIdentityId = persona.ExternalIdentityId;
                member.Email = persona.Email;
                member.FirstName = firstName;
                member.LastName = lastName;
                member.Status = Status.Active;
            }

            // Assign roles
            var assignedRoleIds = member.RoleAssignments.Select(ra => ra.RoleId).ToHashSet();

            foreach (var roleName in persona.RoleNames)
            {
                var normalized = roleName.Trim().ToUpperInvariant();
                if (rolesByName.TryGetValue(normalized, out var roleEntity))
                {
                    if (!assignedRoleIds.Contains(roleEntity.Id))
                    {
                        member.RoleAssignments.Add(new TenantMemberRoleAssignment
                        {
                            TenantMemberId = member.Id,
                            RoleId = roleEntity.Id
                        });
                    }
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
