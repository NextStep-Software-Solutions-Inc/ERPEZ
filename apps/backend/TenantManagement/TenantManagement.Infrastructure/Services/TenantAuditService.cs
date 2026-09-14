using System.Text.Json;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Service implementation for recording sanitized, append-only tenant audit events.
/// </summary>
public class TenantAuditService(ApplicationDbContext context) : ITenantAuditService
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        WriteIndented = false,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public async Task LogMemberEventAsync(
        Guid tenantId,
        string actorExternalIdentityId,
        string actorEmail,
        Guid? targetMemberId,
        string targetEmail,
        string action,
        object? beforeState,
        object? afterState,
        CancellationToken cancellationToken = default)
    {
        var log = new TenantAuditLog
        {
            TenantId = tenantId,
            ActorExternalIdentityId = actorExternalIdentityId,
            ActorEmail = actorEmail,
            TargetMemberId = targetMemberId,
            TargetEmail = targetEmail,
            Action = action,
            BeforeStateJson = SerializeSanitized(beforeState),
            AfterStateJson = SerializeSanitized(afterState),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = actorExternalIdentityId
        };

        await context.TenantAuditLogs!.AddAsync(log, cancellationToken);
    }

    public async Task LogRoleEventAsync(
        Guid tenantId,
        string actorExternalIdentityId,
        string actorEmail,
        Guid roleId,
        string roleName,
        string action,
        object? beforeState,
        object? afterState,
        CancellationToken cancellationToken = default)
    {
        var log = new TenantAuditLog
        {
            TenantId = tenantId,
            ActorExternalIdentityId = actorExternalIdentityId,
            ActorEmail = actorEmail,
            TargetMemberId = roleId,
            TargetEmail = roleName,
            Action = action,
            BeforeStateJson = SerializeSanitized(beforeState),
            AfterStateJson = SerializeSanitized(afterState),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = actorExternalIdentityId
        };

        await context.TenantAuditLogs!.AddAsync(log, cancellationToken);
    }

    private static string? SerializeSanitized(object? state)
    {
        if (state == null) return null;

        try
        {
            return JsonSerializer.Serialize(state, jsonOptions);
        }
        catch
        {
            return null;
        }
    }
}
