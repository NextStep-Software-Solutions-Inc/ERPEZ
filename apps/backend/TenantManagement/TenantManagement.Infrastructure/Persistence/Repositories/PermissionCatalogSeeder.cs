using ERPEZ.Shared.Constants;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Idempotent seeder that populates the atomic permissions catalog into the database.
/// </summary>
public static class PermissionCatalogSeeder
{
    public static async Task SeedAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var allPermissionKeys = Permissions.GetAllPermissions();

        var existingKeys = await dbContext.Permissions!
            .Select(p => p.Key)
            .ToListAsync(cancellationToken);

        var existingSet = new HashSet<string>(existingKeys, StringComparer.OrdinalIgnoreCase);

        var permissionsToInsert = new List<Permission>();

        foreach (var key in allPermissionKeys)
        {
            if (!existingSet.Contains(key))
            {
                var module = key.Split('.')[0];
                var capitalizedModule = char.ToUpperInvariant(module[0]) + module[1..];

                permissionsToInsert.Add(new Permission
                {
                    Key = key,
                    Module = capitalizedModule,
                    DisplayName = key.Replace('.', ' ').Replace('_', ' '),
                    Description = $"Permission capability for {key}"
                });
            }
        }

        if (permissionsToInsert.Count != 0)
        {
            await dbContext.Permissions!.AddRangeAsync(permissionsToInsert, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
