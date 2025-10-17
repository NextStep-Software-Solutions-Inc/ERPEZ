using ERPEZ.TenantManagement.Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;
public sealed class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly ApplicationDbContext _context;

    public ITenantRepository TenantRepository { get; }
    public ITenantSettingRepository TenantSettingRepository { get; }
    public ITenantMemberRepository TenantMemberRepository { get; }
    public ITenantSubscriptionRepository TenantSubscriptionRepository { get; }
    public IModuleRepository ModuleRepository { get; }

    public IHttpContextAccessor HttpContextAccessor { get; }

    public UnitOfWork(
        ApplicationDbContext context,
        ISieveProcessor sieveProcessor,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        ITenantSubscriptionRepository tenantSubscriptionRepository,
        ITenantSettingRepository tenantSettingRepository,
        IHttpContextAccessor httpContextAccessor,
        IModuleRepository moduleRepository)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        HttpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        TenantMemberRepository = tenantMemberRepository ?? throw new ArgumentNullException(nameof(tenantMemberRepository));
        TenantRepository = tenantRepository ?? throw new ArgumentNullException(nameof(tenantRepository));
        TenantSettingRepository = tenantSettingRepository ?? throw new ArgumentNullException(nameof(tenantSettingRepository));
        ModuleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        TenantSubscriptionRepository = tenantSubscriptionRepository ?? throw new ArgumentNullException(nameof(tenantSubscriptionRepository));
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }



    public void Dispose() => _context.Dispose();
}
