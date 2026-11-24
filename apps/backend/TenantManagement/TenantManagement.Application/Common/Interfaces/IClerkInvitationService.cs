namespace ERPEZ.TenantManagement.Application.Common.Interfaces;

public record ClerkInvitationResult(
    string Id,
    string EmailAddress,
    string Status,
    string? Url = null,
    DateTime? CreatedAt = null);

public interface IClerkInvitationService
{
    /// <summary>
    /// Creates a user invitation in Clerk (POST /v1/invitations) without using Clerk organization features.
    /// Stores tenantId and role metadata in public_metadata so it is automatically transferred to the user upon signup.
    /// </summary>
    Task<ClerkInvitationResult?> CreateInvitationAsync(
        string emailAddress,
        Dictionary<string, object> publicMetadata,
        string? redirectUrl = null,
        bool notify = true,
        bool ignoreExisting = true,
        CancellationToken ct = default);

    /// <summary>
    /// Revokes an existing invitation in Clerk (POST /v1/invitations/{id}/revoke).
    /// </summary>
    Task<bool> RevokeInvitationAsync(string invitationId, CancellationToken ct = default);
}
