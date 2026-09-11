using ERPEZ.TenantManagement.Domain.Entities;

namespace ERPEZ.TenantManagement.Domain.Interfaces;

public interface ILicenseKeyRepository : IRepository<LicenseKey>
{
    Task<LicenseKey?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<LicenseKey?> GetActiveByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
