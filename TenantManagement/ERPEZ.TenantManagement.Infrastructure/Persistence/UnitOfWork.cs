using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Sieve.Services;

public sealed class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly ApplicationDbContext _context;

    public IProductRepository ProductRepository { get; }
    public ITenantRepository TenantRepository { get; }
    public ITenantSettingRepository TenantSettingRepository { get; }
    public IModuleRepository ModuleRepository { get; }

    public UnitOfWork(
        ApplicationDbContext context,
        ISieveProcessor sieveProcessor,
        ITenantRepository tenantRepository,
        ITenantSettingRepository tenantSettingRepository,
        IModuleRepository moduleRepository)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));

        TenantRepository = tenantRepository ?? throw new ArgumentNullException(nameof(tenantRepository));
        TenantSettingRepository = tenantSettingRepository ?? throw new ArgumentNullException(nameof(tenantSettingRepository));
        ModuleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose() => _context.Dispose();
}
