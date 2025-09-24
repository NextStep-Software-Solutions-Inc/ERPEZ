using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class TenantSubscriptionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<TenantSubscription>(context, sieveProcessor), ITenantSubscriptionRepository
{

    // You can add product-specific methods here in the future.
    // For example:
    // public async Task<Product?> GetBySkuAsync(string sku)
    // {
    //     return await _context.Products.FirstOrDefaultAsync(p => p.Sku == sku);
    // }
}