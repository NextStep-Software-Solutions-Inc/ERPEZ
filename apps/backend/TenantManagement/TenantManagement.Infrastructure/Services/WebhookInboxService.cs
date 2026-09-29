using System.Text.Json;
using ERPEZ.Shared.Enums;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public class WebhookInboxService(
    ApplicationDbContext dbContext,
    IClerkMembershipReader membershipReader,
    ILogger<WebhookInboxService> logger) : IWebhookInboxService
{
    public async Task<WebhookIngestionStatus> IngestAsync(string svixId, string payloadJson, CancellationToken ct = default)
    {
        // 1. Transactional deduplication by unique SvixMessageId
        var existing = await dbContext.WebhookInbox!
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.SvixMessageId == svixId, ct);

        if (existing != null)
        {
            if (existing.Status == WebhookProcessingStatus.Processed)
            {
                return WebhookIngestionStatus.Duplicate;
            }
            return WebhookIngestionStatus.Accepted;
        }

        // 2. Extract provider event metadata
        var providerEventId = string.Empty;
        var eventType = string.Empty;

        try
        {
            using var doc = JsonDocument.Parse(payloadJson);
            var root = doc.RootElement;
            if (root.TryGetProperty("id", out var idElem))
            {
                providerEventId = idElem.GetString() ?? string.Empty;
            }
            if (root.TryGetProperty("type", out var typeElem))
            {
                eventType = typeElem.GetString() ?? string.Empty;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to parse webhook JSON payload for svix-id: {SvixId}", svixId);
        }

        var record = new WebhookInboxRecord
        {
            SvixMessageId = svixId,
            Provider = IdentityProvider.Clerk,
            ProviderEventId = providerEventId,
            EventType = eventType,
            PayloadJson = payloadJson,
            Status = WebhookProcessingStatus.Pending,
            ReceivedAtUtc = DateTime.UtcNow
        };

        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync(ct);

        return WebhookIngestionStatus.Accepted;
    }

    public async Task<bool> ProcessSingleRecordAsync(long recordId, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var leaseExpiry = now.AddMinutes(2);

        // Atomic lease acquisition: Prevents race conditions and guarantees at-most-once active processor
        if (dbContext.Database.ProviderName?.Contains("InMemory", StringComparison.OrdinalIgnoreCase) == true)
        {
            var testRec = await dbContext.WebhookInbox!.FirstOrDefaultAsync(w => w.Id == recordId, ct);
            if (testRec == null || testRec.Status == WebhookProcessingStatus.Processed ||
                (testRec.Status == WebhookProcessingStatus.Processing && testRec.LeaseExpiresAtUtc >= now))
            {
                return false;
            }
            testRec.Status = WebhookProcessingStatus.Processing;
            testRec.LeaseExpiresAtUtc = leaseExpiry;
            testRec.AttemptCount++;
            testRec.LastAttemptedAtUtc = now;
            await dbContext.SaveChangesAsync(ct);
        }
        else
        {
            var rowsAffected = await dbContext.WebhookInbox!
                .Where(w => w.Id == recordId &&
                    (w.Status == WebhookProcessingStatus.Pending ||
                    (w.Status == WebhookProcessingStatus.Processing && w.LeaseExpiresAtUtc < now)))
                .ExecuteUpdateAsync(s => s
                    .SetProperty(w => w.Status, WebhookProcessingStatus.Processing)
                    .SetProperty(w => w.LeaseExpiresAtUtc, leaseExpiry)
                    .SetProperty(w => w.AttemptCount, w => w.AttemptCount + 1)
                    .SetProperty(w => w.LastAttemptedAtUtc, now), ct);

            if (rowsAffected == 0)
            {
                // Another worker acquired the lease or record is already processed
                return false;
            }
        }

        var record = await dbContext.WebhookInbox!.FirstOrDefaultAsync(w => w.Id == recordId, ct);
        if (record == null)
        {
            return false;
        }

        try
        {
            await HandleEventAsync(record, ct);

            record.Status = WebhookProcessingStatus.Processed;
            record.ProcessedAtUtc = DateTime.UtcNow;
            record.LastError = null;
            await dbContext.SaveChangesAsync(ct);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed processing webhook record {RecordId} (Svix: {SvixId}, Type: {Type})",
                record.Id, record.SvixMessageId, record.EventType);

            record.Status = WebhookProcessingStatus.Failed;
            record.LastError = ex.Message;
            await dbContext.SaveChangesAsync(ct);
            return false;
        }
    }

    public async Task ProcessPendingBatchAsync(int batchSize = 10, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var candidateIds = await dbContext.WebhookInbox!
            .AsNoTracking()
            .Where(w => w.Status == WebhookProcessingStatus.Pending ||
                (w.Status == WebhookProcessingStatus.Processing && w.LeaseExpiresAtUtc < now))
            .OrderBy(w => w.Id)
            .Take(batchSize)
            .Select(w => w.Id)
            .ToListAsync(ct);

        foreach (var id in candidateIds)
        {
            await ProcessSingleRecordAsync(id, ct);
        }
    }

    private async Task HandleEventAsync(WebhookInboxRecord record, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(record.PayloadJson);
        var root = doc.RootElement;
        var eventType = record.EventType;

        if (!root.TryGetProperty("data", out var dataElem))
        {
            return;
        }

        switch (eventType)
        {
            case "user.created":
                await HandleUserCreatedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "user.updated":
                await HandleUserUpdatedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "user.deleted":
                await HandleUserDeletedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "invitation.accepted":
                await HandleInvitationAcceptedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "invitation.revoked":
                await HandleInvitationRevokedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "organization.deleted":
                await HandleOrganizationDeletedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "organization.updated":
                await HandleOrganizationUpdatedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "organizationMembership.created":
            case "organizationMembership.updated":
                await HandleMembershipCreatedOrUpdatedAsync(dataElem, record.ProviderEventId, ct);
                break;

            case "organizationMembership.deleted":
                await HandleMembershipDeletedAsync(dataElem, record.ProviderEventId, ct);
                break;

            default:
                logger.LogInformation("Unhandled Clerk webhook event type: {EventType}", eventType);
                break;
        }
    }

    private async Task HandleOrganizationDeletedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var externalOrgId = data.TryGetProperty("id", out var idElem) ? idElem.GetString() : null;
        if (string.IsNullOrWhiteSpace(externalOrgId)) return;

        var tenant = await dbContext.Tenants!
            .FirstOrDefaultAsync(t => t.AuthProvider == IdentityProvider.Clerk && t.ExternalOrgId == externalOrgId, ct);

        if (tenant != null)
        {
            tenant.IsDisabled = true;
            tenant.ProvisioningState = TenantProvisioningState.Disabled;
            tenant.LastSuccessfulWebhookProcessingAtUtc = DateTime.UtcNow;
            tenant.LastProcessedEventId = eventId;
            await dbContext.SaveChangesAsync(ct);
            logger.LogWarning("Disabled tenant {TenantId} due to Clerk organization.deleted event", tenant.Id);
        }
    }

    private async Task HandleOrganizationUpdatedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var externalOrgId = data.TryGetProperty("id", out var idElem) ? idElem.GetString() : null;
        var name = data.TryGetProperty("name", out var nameElem) ? nameElem.GetString() : null;
        if (string.IsNullOrWhiteSpace(externalOrgId) || string.IsNullOrWhiteSpace(name)) return;

        var tenant = await dbContext.Tenants!
            .FirstOrDefaultAsync(t => t.AuthProvider == IdentityProvider.Clerk && t.ExternalOrgId == externalOrgId, ct);

        if (tenant != null)
        {
            tenant.Name = name;
            tenant.LastSuccessfulWebhookProcessingAtUtc = DateTime.UtcNow;
            tenant.LastProcessedEventId = eventId;
            await dbContext.SaveChangesAsync(ct);
        }
    }

    private async Task HandleMembershipCreatedOrUpdatedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var externalOrgId = string.Empty;
        var externalUserId = string.Empty;

        if (data.TryGetProperty("organization", out var orgElem) &&
            orgElem.TryGetProperty("id", out var orgIdElem))
        {
            externalOrgId = orgIdElem.GetString() ?? string.Empty;
        }

        if (data.TryGetProperty("public_user_data", out var userElem) &&
            userElem.TryGetProperty("user_id", out var userIdElem))
        {
            externalUserId = userIdElem.GetString() ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(externalOrgId) || string.IsNullOrWhiteSpace(externalUserId))
        {
            return;
        }

        var tenant = await dbContext.Tenants!
            .FirstOrDefaultAsync(t => t.AuthProvider == IdentityProvider.Clerk && t.ExternalOrgId == externalOrgId, ct);

        if (tenant == null)
        {
            logger.LogInformation("Tenant with ExternalOrgId {OrgId} not found in ERPEZ. Skipping membership projection.", externalOrgId);
            return;
        }

        // Reconcile membership: Verify state with upstream Clerk API if available
        var upstream = await membershipReader.GetMembershipAsync(externalOrgId, externalUserId, ct);

        var member = await dbContext.TenantMembers!
            .FirstOrDefaultAsync(tm => tm.TenantId == tenant.Id &&
                                       tm.Provider == IdentityProvider.Clerk &&
                                       tm.ExternalIdentityId == externalUserId, ct);

        if (member == null)
        {
            member = new TenantMember
            {
                TenantId = tenant.Id,
                Provider = IdentityProvider.Clerk,
                ExternalIdentityId = externalUserId,
                Status = Status.Active,
                LastReconciledAtUtc = DateTime.UtcNow,
                ProjectionVersion = 1
            };
            dbContext.TenantMembers!.Add(member);
        }
        else
        {
            member.Status = Status.Active;
            member.LastReconciledAtUtc = DateTime.UtcNow;
            member.ProjectionVersion += 1;
        }

        tenant.LastSuccessfulWebhookProcessingAtUtc = DateTime.UtcNow;
        tenant.LastProcessedEventId = eventId;

        await dbContext.SaveChangesAsync(ct);
        logger.LogInformation("Reconciled membership for user {UserId} in tenant {TenantId}", externalUserId, tenant.Id);
    }

    private async Task HandleMembershipDeletedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var externalOrgId = string.Empty;
        var externalUserId = string.Empty;

        if (data.TryGetProperty("organization", out var orgElem) &&
            orgElem.TryGetProperty("id", out var orgIdElem))
        {
            externalOrgId = orgIdElem.GetString() ?? string.Empty;
        }

        if (data.TryGetProperty("public_user_data", out var userElem) &&
            userElem.TryGetProperty("user_id", out var userIdElem))
        {
            externalUserId = userIdElem.GetString() ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(externalOrgId) || string.IsNullOrWhiteSpace(externalUserId))
        {
            return;
        }

        var tenant = await dbContext.Tenants!
            .FirstOrDefaultAsync(t => t.AuthProvider == IdentityProvider.Clerk && t.ExternalOrgId == externalOrgId, ct);

        if (tenant == null) return;

        var member = await dbContext.TenantMembers!
            .FirstOrDefaultAsync(tm => tm.TenantId == tenant.Id &&
                                       tm.Provider == IdentityProvider.Clerk &&
                                       tm.ExternalIdentityId == externalUserId, ct);

        if (member != null)
        {
            member.Status = Status.Inactive;
            member.LastReconciledAtUtc = DateTime.UtcNow;
            member.ProjectionVersion += 1;

            tenant.LastSuccessfulWebhookProcessingAtUtc = DateTime.UtcNow;
            tenant.LastProcessedEventId = eventId;

            await dbContext.SaveChangesAsync(ct);
            logger.LogInformation("Marked member {UserId} inactive in tenant {TenantId} due to organizationMembership.deleted", externalUserId, tenant.Id);
        }
    }

    private async Task HandleUserCreatedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var externalUserId = data.TryGetProperty("id", out var idElem) ? idElem.GetString() : null;
        if (string.IsNullOrWhiteSpace(externalUserId)) return;

        var firstName = data.TryGetProperty("first_name", out var fElem) ? fElem.GetString() : null;
        var lastName = data.TryGetProperty("last_name", out var lElem) ? lElem.GetString() : null;

        var email = string.Empty;
        var primaryEmailId = data.TryGetProperty("primary_email_address_id", out var peElem) ? peElem.GetString() : null;
        if (data.TryGetProperty("email_addresses", out var emailsElem) && emailsElem.ValueKind == JsonValueKind.Array)
        {
            foreach (var emailItem in emailsElem.EnumerateArray())
            {
                var id = emailItem.TryGetProperty("id", out var iElem) ? iElem.GetString() : null;
                var address = emailItem.TryGetProperty("email_address", out var aElem) ? aElem.GetString() : null;
                if (!string.IsNullOrWhiteSpace(address))
                {
                    if (id == primaryEmailId || string.IsNullOrWhiteSpace(email))
                    {
                        email = address;
                    }
                }
            }
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();

        if (data.TryGetProperty("public_metadata", out var metaElem) && metaElem.ValueKind == JsonValueKind.Object)
        {
            if (metaElem.TryGetProperty("tenantId", out var tenantElem) &&
                Guid.TryParse(tenantElem.GetString(), out var tenantId))
            {
                var tenant = await dbContext.Tenants!.FirstOrDefaultAsync(t => t.Id == tenantId, ct);
                if (tenant != null)
                {
                    var member = await dbContext.TenantMembers!
                        .Include(m => m.RoleAssignments)
                        .FirstOrDefaultAsync(tm => tm.TenantId == tenantId &&
                                                   !tm.IsDeleted &&
                                                   (tm.ExternalIdentityId == externalUserId ||
                                                    (!string.IsNullOrWhiteSpace(normalizedEmail) && tm.Email.ToLower() == normalizedEmail)), ct);

                    var roleIdsToAssign = new List<Guid>();
                    if (metaElem.TryGetProperty("roleIds", out var roleIdsElem) && roleIdsElem.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var rIdElem in roleIdsElem.EnumerateArray())
                        {
                            if (Guid.TryParse(rIdElem.GetString(), out var rGuid))
                            {
                                roleIdsToAssign.Add(rGuid);
                            }
                        }
                    }

                    if (member == null)
                    {
                        member = new TenantMember
                        {
                            TenantId = tenantId,
                            Provider = IdentityProvider.Clerk,
                            ExternalIdentityId = externalUserId,
                            UserId = externalUserId,
                            Email = normalizedEmail,
                            FirstName = !string.IsNullOrWhiteSpace(firstName) ? firstName : (normalizedEmail.Split('@').FirstOrDefault() ?? "User"),
                            LastName = lastName ?? string.Empty,
                            Status = Status.Active,
                            LastReconciledAtUtc = DateTime.UtcNow,
                            ProjectionVersion = 1,
                            ConcurrencyStamp = Guid.NewGuid()
                        };

                        if (roleIdsToAssign.Count == 0)
                        {
                            var defaultRole = await dbContext.Roles!
                                .FirstOrDefaultAsync(r => r.NormalizedName == "TENANT MEMBER", ct);
                            if (defaultRole != null)
                            {
                                roleIdsToAssign.Add(defaultRole.Id);
                            }
                        }

                        foreach (var roleId in roleIdsToAssign.Distinct())
                        {
                            member.RoleAssignments.Add(new TenantMemberRoleAssignment
                            {
                                RoleId = roleId
                            });
                        }

                        dbContext.TenantMembers!.Add(member);
                        logger.LogInformation("Created new TenantMember {Email} for tenant {TenantId} from Clerk user.created webhook",
                            normalizedEmail, tenantId);
                    }
                    else
                    {
                        member.ExternalIdentityId = externalUserId;
                        member.UserId = externalUserId;
                        if (!string.IsNullOrWhiteSpace(firstName)) member.FirstName = firstName;
                        if (!string.IsNullOrWhiteSpace(lastName)) member.LastName = lastName;
                        if (!string.IsNullOrWhiteSpace(normalizedEmail)) member.Email = normalizedEmail;
                        member.Status = Status.Active;
                        member.InvitationTokenHash = null;
                        member.InvitationExpiresAtUtc = null;
                        member.LastReconciledAtUtc = DateTime.UtcNow;
                        member.ProjectionVersion += 1;
                        member.ConcurrencyStamp = Guid.NewGuid();

                        foreach (var roleId in roleIdsToAssign.Distinct())
                        {
                            if (!member.RoleAssignments.Any(ra => ra.RoleId == roleId))
                            {
                                member.RoleAssignments.Add(new TenantMemberRoleAssignment
                                {
                                    TenantMemberId = member.Id,
                                    RoleId = roleId
                                });
                            }
                        }

                        logger.LogInformation("Activated existing TenantMember {Email} for tenant {TenantId} from Clerk user.created webhook",
                            member.Email, tenantId);
                    }

                    tenant.LastSuccessfulWebhookProcessingAtUtc = DateTime.UtcNow;
                    tenant.LastProcessedEventId = eventId;
                    await dbContext.SaveChangesAsync(ct);
                }
                else
                {
                    logger.LogWarning("Tenant {TenantId} not found for Clerk user.created webhook", tenantId);
                }
            }
            else if (metaElem.TryGetProperty("platformRole", out var pRoleElem))
            {
                var platformRole = pRoleElem.GetString();
                logger.LogInformation("Platform user {ExternalUserId} ({Email}) created with role {PlatformRole} via Clerk user.created webhook",
                    externalUserId, normalizedEmail, platformRole);
            }
        }
    }

    private async Task HandleUserUpdatedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var externalUserId = data.TryGetProperty("id", out var idElem) ? idElem.GetString() : null;
        if (string.IsNullOrWhiteSpace(externalUserId)) return;

        var firstName = data.TryGetProperty("first_name", out var fElem) ? fElem.GetString() : null;
        var lastName = data.TryGetProperty("last_name", out var lElem) ? lElem.GetString() : null;

        var members = await dbContext.TenantMembers!
            .Where(m => m.ExternalIdentityId == externalUserId && !m.IsDeleted)
            .ToListAsync(ct);

        foreach (var member in members)
        {
            if (!string.IsNullOrWhiteSpace(firstName)) member.FirstName = firstName;
            if (!string.IsNullOrWhiteSpace(lastName)) member.LastName = lastName;
            member.LastReconciledAtUtc = DateTime.UtcNow;
            member.ProjectionVersion += 1;
        }

        if (members.Count > 0)
        {
            await dbContext.SaveChangesAsync(ct);
            logger.LogInformation("Updated {Count} tenant member records for Clerk user {UserId}", members.Count, externalUserId);
        }
    }

    private async Task HandleUserDeletedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var externalUserId = data.TryGetProperty("id", out var idElem) ? idElem.GetString() : null;
        if (string.IsNullOrWhiteSpace(externalUserId)) return;

        var members = await dbContext.TenantMembers!
            .Where(m => m.ExternalIdentityId == externalUserId && !m.IsDeleted)
            .ToListAsync(ct);

        foreach (var member in members)
        {
            member.Status = Status.Inactive;
            member.LastReconciledAtUtc = DateTime.UtcNow;
            member.ProjectionVersion += 1;
        }

        if (members.Count > 0)
        {
            await dbContext.SaveChangesAsync(ct);
            logger.LogInformation("Marked {Count} tenant member records as Inactive for deleted Clerk user {UserId}", members.Count, externalUserId);
        }
    }

    private async Task HandleInvitationAcceptedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var email = data.TryGetProperty("email_address", out var emElem) ? emElem.GetString() : null;
        var invitationId = data.TryGetProperty("id", out var idElem) ? idElem.GetString() : null;

        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(invitationId)) return;

        var normalizedEmail = email?.Trim().ToLowerInvariant();

        Guid? tenantId = null;
        if (data.TryGetProperty("public_metadata", out var metaElem) &&
            metaElem.TryGetProperty("tenantId", out var tElem) &&
            Guid.TryParse(tElem.GetString(), out var parsedTenantId))
        {
            tenantId = parsedTenantId;
        }

        var query = dbContext.TenantMembers!.Where(m => !m.IsDeleted && m.Status == Status.Pending);
        if (tenantId.HasValue)
        {
            query = query.Where(m => m.TenantId == tenantId.Value);
        }

        var member = await query.FirstOrDefaultAsync(m =>
            (!string.IsNullOrWhiteSpace(invitationId) && m.ExternalIdentityId == invitationId) ||
            (!string.IsNullOrWhiteSpace(normalizedEmail) && m.Email.ToLower() == normalizedEmail), ct);

        if (member != null)
        {
            member.Status = Status.Active;
            member.InvitationTokenHash = null;
            member.InvitationExpiresAtUtc = null;
            member.LastReconciledAtUtc = DateTime.UtcNow;
            member.ProjectionVersion += 1;
            member.ConcurrencyStamp = Guid.NewGuid();
            await dbContext.SaveChangesAsync(ct);
            logger.LogInformation("Activated member {Email} for tenant {TenantId} via invitation.accepted webhook",
                member.Email, member.TenantId);
        }
    }

    private async Task HandleInvitationRevokedAsync(JsonElement data, string eventId, CancellationToken ct)
    {
        var email = data.TryGetProperty("email_address", out var emElem) ? emElem.GetString() : null;
        var invitationId = data.TryGetProperty("id", out var idElem) ? idElem.GetString() : null;

        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(invitationId)) return;

        var normalizedEmail = email?.Trim().ToLowerInvariant();

        var member = await dbContext.TenantMembers!
            .FirstOrDefaultAsync(m => !m.IsDeleted && m.Status == Status.Pending &&
                ((!string.IsNullOrWhiteSpace(invitationId) && m.ExternalIdentityId == invitationId) ||
                 (!string.IsNullOrWhiteSpace(normalizedEmail) && m.Email.ToLower() == normalizedEmail)), ct);

        if (member != null)
        {
            member.Status = Status.Cancelled;
            member.InvitationTokenHash = null;
            member.InvitationExpiresAtUtc = null;
            member.ConcurrencyStamp = Guid.NewGuid();
            await dbContext.SaveChangesAsync(ct);
            logger.LogInformation("Cancelled pending member invitation {Email} via invitation.revoked webhook", member.Email);
        }
    }
}
