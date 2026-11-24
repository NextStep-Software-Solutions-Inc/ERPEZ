using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class LicenseKeyRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<LicenseKey>(context, sieveProcessor), ILicenseKeyRepository
{
    public async Task<LicenseKey?> GetByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        return await Query(lk => lk.Key == key)
            .Include(lk => lk.Tenant)
            .Include(lk => lk.TenantSubscription)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<LicenseKey?> GetActiveByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await Query(lk => lk.TenantId == tenantId && lk.Status == LicenseStatus.Active)
            .OrderByDescending(lk => lk.ExpiresAt)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
