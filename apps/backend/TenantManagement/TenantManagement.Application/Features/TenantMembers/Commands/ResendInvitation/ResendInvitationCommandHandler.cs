using System.Security.Cryptography;
using System.Text;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ResendInvitation;

public class ResendInvitationCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    ITenantAuditService auditService,
    IClerkInvitationService clerkInvitationService)
    : IRequestHandler<ResendInvitationCommand, ApiResponse<ResendInvitationResponse>>
{
    public async Task<ApiResponse<ResendInvitationResponse>> Handle(ResendInvitationCommand command, CancellationToken cancellationToken)
    {
        if (!tenantContext.TenantId.HasValue)
        {
            throw new UnauthorizedException("Tenant context is missing or unauthenticated.");
        }

        var tenantId = tenantContext.TenantId.Value;
        var actorExternalId = currentUser.ExternalIdentityId ?? currentUser.UserId;
        var actorEmail = currentUser.Email ?? string.Empty;

        if (string.IsNullOrWhiteSpace(actorExternalId))
        {
            throw new UnauthorizedException("Current user identity is unauthenticated.");
        }

        var member = await unitOfWork.TenantMemberRepository.Query()
            .Include(m => m.RoleAssignments).ThenInclude(ra => ra.Role)
            .FirstOrDefaultAsync(m => m.Id == command.Id && m.TenantId == tenantId && !m.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Tenant member not found.");

        if (member.Status != Status.Pending && member.Status != Status.Cancelled)
        {
            throw new ValidationException($"Cannot resend invitation to a member with status '{member.Status}'.");
        }

        // 1. Revoke existing Clerk invitation if present
        if (!string.IsNullOrWhiteSpace(member.ExternalIdentityId) && member.ExternalIdentityId.StartsWith("inv_"))
        {
            await clerkInvitationService.RevokeInvitationAsync(member.ExternalIdentityId, cancellationToken);
        }

        // 2. Prepare metadata and roles
        var roleIds = member.RoleAssignments.Select(ra => ra.RoleId.ToString()).ToArray();
        var roleNames = member.RoleAssignments.Select(ra => ra.Role.Name).ToArray();

        var metadata = new Dictionary<string, object>
        {
            ["tenantId"] = tenantId.ToString(),
            ["roleIds"] = roleIds,
            ["roles"] = roleNames,
            ["invitationType"] = "tenant_member"
        };

        // 3. Create fresh User Invitation in Clerk
        var clerkInvitation = await clerkInvitationService.CreateInvitationAsync(
            member.Email,
            metadata,
            notify: true,
            ignoreExisting: true,
            ct: cancellationToken);

        // 4. Generate fresh cryptographic token & 48-hour expiration
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var rawInvitationToken = clerkInvitation?.Id ?? Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
        var tokenHashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawInvitationToken));
        var invitationTokenHash = Convert.ToHexString(tokenHashBytes).ToLowerInvariant();
        var expiresAt = DateTime.UtcNow.AddHours(48);

        // 5. Update member state
        member.ExternalIdentityId = clerkInvitation?.Id ?? string.Empty;
        member.Status = Status.Pending;
        member.InvitationTokenHash = invitationTokenHash;
        member.InvitationExpiresAtUtc = expiresAt;
        member.ConcurrencyStamp = Guid.NewGuid();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 6. Audit logging
        await auditService.LogMemberEventAsync(
            tenantId,
            actorExternalId,
            actorEmail,
            member.Id,
            member.Email,
            "INVITATION_RESENT",
            null,
            new
            {
                member.Email,
                Roles = roleNames,
                Status = member.Status.ToString(),
                ExpiresAtUtc = expiresAt
            },
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new ResendInvitationResponse
        {
            Id = member.Id,
            Email = member.Email,
            InvitationToken = rawInvitationToken,
            InvitationExpiresAtUtc = expiresAt
        };

        return ApiResponse<ResendInvitationResponse>.Success(response, "Invitation resent successfully.");
    }
}
