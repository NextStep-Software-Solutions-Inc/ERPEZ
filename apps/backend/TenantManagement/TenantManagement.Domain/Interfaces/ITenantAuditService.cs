namespace ERPEZ.TenantManagement.Domain.Interfaces;

/// <summary>
/// Service interface for recording sanitized, security-critical audit events in a tenant.
/// </summary>
public interface ITenantAuditService
{
    Task LogMemberEventAsync(
        Guid tenantId,
        string actorExternalIdentityId,
        string actorEmail,
        Guid? targetMemberId,
        string targetEmail,
        string action,
        object? beforeState,
        object? afterState,
        CancellationToken cancellationToken = default);

    Task LogRoleEventAsync(
        Guid tenantId,
        string actorExternalIdentityId,
        string actorEmail,
        Guid roleId,
        string roleName,
        string action,
        object? beforeState,
        object? afterState,
        CancellationToken cancellationToken = default);
}
