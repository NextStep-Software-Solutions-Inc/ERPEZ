using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class ModuleRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Module>(context, sieveProcessor), IModuleRepository
{
    // You can add module-specific methods here in the future
    // For example: Task<Module?> GetByCodeAsync(string code);
}