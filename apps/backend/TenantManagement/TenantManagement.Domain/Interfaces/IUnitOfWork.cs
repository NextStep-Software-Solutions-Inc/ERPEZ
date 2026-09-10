using System.Data;

namespace ERPEZ.TenantManagement.Domain.Interfaces;

public interface IUnitOfWork
{
    ITenantRepository TenantRepository { get; }
    ITenantSettingRepository TenantSettingRepository { get; }
    IModuleRepository ModuleRepository { get; }
    ITenantMemberRepository TenantMemberRepository { get; }
    ITenantSubscriptionRepository TenantSubscriptionRepository { get; }
    IRoleRepository RoleRepository { get; }
    IPermissionRepository PermissionRepository { get; }
    ILicenseKeyRepository LicenseKeyRepository { get; }
    ITenantAuditRepository TenantAuditRepository { get; }
    ITenantInvoiceRepository TenantInvoiceRepository { get; }
    ITenantPaymentMethodRepository TenantPaymentMethodRepository { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default);
    Task ExecuteInTransactionAsync(Func<Task> operation, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default);
    Task LockTenantRowAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
