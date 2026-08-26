using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Migration seeder that safely converts legacy TenantMember.Role enum values to TenantMemberRoleAssignments.
/// Ensures zero downtime and eliminates split-brain authorization.
/// </summary>
public static class TenantMemberMigrationSeeder
{
    public static async Task MigrateLegacyRolesAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var adminRole = await dbContext.Roles!
            .FirstOrDefaultAsync(r => r.NormalizedName == "TENANT ADMINISTRATOR", cancellationToken);

        var endUserRole = await dbContext.Roles!
            .FirstOrDefaultAsync(r => r.NormalizedName == "END USER", cancellationToken);

        if (adminRole == null || endUserRole == null)
        {
            return;
        }

        var unassignedMembers = await dbContext.TenantMembers!
            .Include(tm => tm.RoleAssignments)
            .Where(tm => !tm.RoleAssignments.Any())
            .ToListAsync(cancellationToken);

        foreach (var member in unassignedMembers)
        {
            var targetRoleId = member.Role == TenantMemberRole.Admin
                ? adminRole.Id
                : endUserRole.Id;

            member.RoleAssignments.Add(new TenantMemberRoleAssignment
            {
                TenantMemberId = member.Id,
                RoleId = targetRoleId
            });
        }

        if (unassignedMembers.Count != 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
