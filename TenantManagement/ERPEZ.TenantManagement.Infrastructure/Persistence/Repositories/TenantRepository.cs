using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class TenantRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Tenant>(context, sieveProcessor), ITenantRepository
{
    // You can add tenant-specific methods here in the future
    // For example: Task<Tenant?> GetByDomainAsync(string domain);
}