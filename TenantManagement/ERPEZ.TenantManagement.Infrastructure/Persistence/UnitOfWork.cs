using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly ApplicationDbContext _context;
    public IProductRepository ProductRepository { get; }
    public ITenantRepository TenantRepository { get; }
    public ITenantSettingRepository TenantSettingRepository { get; }
    public IModuleRepository ModuleRepository { get; }

    public UnitOfWork(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    {
        _context = context;
        ProductRepository = new ProductRepository(_context, sieveProcessor);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}