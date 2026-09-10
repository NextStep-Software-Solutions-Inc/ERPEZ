using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
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
    public IPermissionRepository PermissionRepository { get; }
    public ILicenseKeyRepository LicenseKeyRepository { get; }
    public ITenantAuditRepository TenantAuditRepository { get; }

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
        IPermissionRepository permissionRepository,
        ILicenseKeyRepository licenseKeyRepository,
        ITenantAuditRepository tenantAuditRepository)
    {
        this.context = context ?? throw new ArgumentNullException(nameof(context));
        CurrentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
        TenantMemberRepository = tenantMemberRepository ?? throw new ArgumentNullException(nameof(tenantMemberRepository));
        TenantRepository = tenantRepository ?? throw new ArgumentNullException(nameof(tenantRepository));
        TenantSettingRepository = tenantSettingRepository ?? throw new ArgumentNullException(nameof(tenantSettingRepository));
        ModuleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        TenantSubscriptionRepository = tenantSubscriptionRepository ?? throw new ArgumentNullException(nameof(tenantSubscriptionRepository));
        RoleRepository = roleRepository ?? throw new ArgumentNullException(nameof(roleRepository));
        PermissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
        LicenseKeyRepository = licenseKeyRepository ?? throw new ArgumentNullException(nameof(licenseKeyRepository));
        TenantAuditRepository = tenantAuditRepository ?? throw new ArgumentNullException(nameof(tenantAuditRepository));
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return context.SaveChangesAsync(cancellationToken);
    }

    public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, System.Data.IsolationLevel isolationLevel = System.Data.IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(isolationLevel, cancellationToken);
        try
        {
            var result = await operation();
            await transaction.CommitAsync(cancellationToken);
            return result;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task ExecuteInTransactionAsync(Func<Task> operation, System.Data.IsolationLevel isolationLevel = System.Data.IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(isolationLevel, cancellationToken);
        try
        {
            await operation();
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task LockTenantRowAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        await context.Database.ExecuteSqlRawAsync(@"SELECT id FROM ""Tenants"" WHERE id = {0} FOR UPDATE", [tenantId], cancellationToken);
    }

    public void Dispose() => context.Dispose();
}
