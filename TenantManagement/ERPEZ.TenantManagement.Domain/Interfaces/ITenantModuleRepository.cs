using ERPEZ.TenantManagement.Domain.Entities;

namespace ERPEZ.TenantManagement.Domain.Interfaces;

public interface ITenantModuleRepository : IRepository<TenantModule>
{
    // You can add product-specific methods here in the future
    // For example: Task<Product?> GetBySkuAsync(string sku);
}