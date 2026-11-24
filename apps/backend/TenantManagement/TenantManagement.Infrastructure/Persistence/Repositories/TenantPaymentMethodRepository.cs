using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class TenantPaymentMethodRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<TenantPaymentMethod>(context, sieveProcessor), ITenantPaymentMethodRepository
{
}
