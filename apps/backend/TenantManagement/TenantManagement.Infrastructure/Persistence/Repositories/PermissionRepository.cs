using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class PermissionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Permission>(context, sieveProcessor), IPermissionRepository
{
}
