using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public class ExternalTenantResolver(ApplicationDbContext dbContext) : IExternalTenantResolver
{
    public async Task<Guid?> ResolveTenantIdAsync(
        IdentityProvider provider,
        string externalOrgId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(externalOrgId))
        {
            return null;
        }

        var normalizedOrgId = externalOrgId.Trim();
        return await dbContext.Tenants!
            .AsNoTracking()
            .Where(t => t.AuthProvider == provider && t.ExternalOrgId == normalizedOrgId && !t.IsDeleted)
            .Select(t => (Guid?)t.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
