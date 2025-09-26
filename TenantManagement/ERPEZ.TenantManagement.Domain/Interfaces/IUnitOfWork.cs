namespace ERPEZ.TenantManagement.Domain.Interfaces;

public interface IUnitOfWork
{
    IProductRepository ProductRepository { get; }
    ITenantRepository TenantRepository { get; }
    ITenantSettingRepository TenantSettingRepository { get; }
    IModuleRepository ModuleRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}