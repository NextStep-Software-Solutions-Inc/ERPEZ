using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.Shared.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;
public sealed class UnitOfWork : IUnitOfWork, IDisposable
{
    private readonly ApplicationDbContext context;

    public ITenantRepository TenantRepository { get; }
    public ITenantSettingRepository TenantSettingRepository { get; }
    public ITenantMemberRepository TenantMemberRepository { get; }
    public ITenantSubscriptionRepository TenantSubscriptionRepository { get; }
    public IModuleRepository ModuleRepository { get; }
    public IRoleRepository RoleRepository { get; }
    public ILicenseKeyRepository LicenseKeyRepository { get; }

    private ICurrentUserService CurrentUser { get; }

    public UnitOfWork(
        ApplicationDbContext context,
        ISieveProcessor sieveProcessor,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        ITenantSubscriptionRepository tenantSubscriptionRepository,
        ITenantSettingRepository tenantSettingRepository,
        ICurrentUserService currentUser,
        IModuleRepository moduleRepository,
        IRoleRepository roleRepository,
        ILicenseKeyRepository licenseKeyRepository)
    {
        this.context = context ?? throw new ArgumentNullException(nameof(context));
        CurrentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
        TenantMemberRepository = tenantMemberRepository ?? throw new ArgumentNullException(nameof(tenantMemberRepository));
        TenantRepository = tenantRepository ?? throw new ArgumentNullException(nameof(tenantRepository));
        TenantSettingRepository = tenantSettingRepository ?? throw new ArgumentNullException(nameof(tenantSettingRepository));
        ModuleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        TenantSubscriptionRepository = tenantSubscriptionRepository ?? throw new ArgumentNullException(nameof(tenantSubscriptionRepository));
        RoleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
        LicenseKeyRepository = licenseKeyRepository ?? throw new ArgumentNullException(nameof(licenseKeyRepository));
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return context.SaveChangesAsync(cancellationToken);
    }



    public void Dispose() => context.Dispose();
}
