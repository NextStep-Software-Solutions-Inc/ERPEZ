using ERPEZ.TenantManagement.Domain.Enums;

namespace ERPEZ.TenantManagement.Domain.Interfaces;

/// <summary>
/// Pure authorization and business validator for tenant role assignments and member modifications.
/// Does NOT manage transactions or database row locking.
/// </summary>
public interface IRoleAssignmentValidator
{
    Task ValidateRoleAssignmentsAsync(
        Guid tenantId,
        string actorExternalIdentityId,
        Guid? targetMemberId,
        IEnumerable<Guid> requestedRoleIds,
        CancellationToken cancellationToken = default);

    void ValidateSelfLockout(
        string actorExternalIdentityId,
        string targetExternalIdentityId,
        Status newStatus,
        bool hadAdminRole,
        bool willRetainAdminRole);
}
