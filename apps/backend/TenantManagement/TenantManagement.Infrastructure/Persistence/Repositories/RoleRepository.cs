using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class RoleRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Role>(context, sieveProcessor), IRoleRepository
{
}
