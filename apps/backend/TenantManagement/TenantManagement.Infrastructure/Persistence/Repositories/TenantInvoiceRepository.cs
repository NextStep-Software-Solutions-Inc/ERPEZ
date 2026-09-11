using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class TenantInvoiceRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<TenantInvoice>(context, sieveProcessor), ITenantInvoiceRepository
{
}
