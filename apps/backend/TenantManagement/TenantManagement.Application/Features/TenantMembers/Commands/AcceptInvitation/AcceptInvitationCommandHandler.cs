using System.Security.Cryptography;
using System.Text;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.AcceptInvitation;

public class AcceptInvitationCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser,
    ITenantAuditService auditService)
    : IRequestHandler<AcceptInvitationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(AcceptInvitationCommand command, CancellationToken cancellationToken)
    {
        var authenticatedExternalId = currentUser.ExternalIdentityId ?? currentUser.UserId;
        var authenticatedEmail = currentUser.Email ?? string.Empty;

        if (string.IsNullOrWhiteSpace(authenticatedExternalId))
        {
            throw new UnauthorizedException("You must be authenticated with Clerk to accept an invitation.");
        }

        // 1. Compute SHA-256 hash of incoming raw invitation token
        var tokenHashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(command.InvitationToken.Trim()));
        var tokenHash = Convert.ToHexString(tokenHashBytes).ToLowerInvariant();

        // 2. Find member by invitation token hash
        var member = await unitOfWork.TenantMemberRepository.Query()
            .Include(m => m.RoleAssignments).ThenInclude(ra => ra.Role)
            .FirstOrDefaultAsync(m => m.InvitationTokenHash == tokenHash && !m.IsDeleted, cancellationToken);

        // 2b. Fallback: If not found by token hash (e.g. stale or missing token in browser session),
        // look up any active pending invitation matching the caller's authenticated email.
        if (member == null && !string.IsNullOrWhiteSpace(authenticatedEmail))
        {
            var normalizedCallerEmail = authenticatedEmail.Trim().ToLowerInvariant();
            member = await unitOfWork.TenantMemberRepository.Query()
                .Include(m => m.RoleAssignments).ThenInclude(ra => ra.Role)
                .FirstOrDefaultAsync(m => m.Email.ToLower() == normalizedCallerEmail &&
                                          m.Status == Status.Pending &&
                                          !m.IsDeleted, cancellationToken);
        }

        if (member == null)
        {
            throw new NotFoundException("Invitation token is invalid or has already been used.");
        }

        // 3. Expiry check
        if (member.InvitationExpiresAtUtc.HasValue && member.InvitationExpiresAtUtc.Value < DateTime.UtcNow)
        {
            throw new ValidationException("This invitation token has expired.");
        }

        // 4. Status check
        if (member.Status != Status.Pending)
        {
            throw new ValidationException($"Invitation cannot be accepted because member is in status '{member.Status}'.");
        }

        // 5. Authenticated email consistency verification (when email claim is present in token)
        if (!string.IsNullOrWhiteSpace(authenticatedEmail) &&
            !string.Equals(member.Email.Trim(), authenticatedEmail.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            throw new ForbiddenException($"The authenticated account email '{authenticatedEmail}' does not match the invitation email address.");
        }

        // 5b. Verify that this external identity is not already bound to another member in this workspace
        var existingWithSameIdentity = await unitOfWork.TenantMemberRepository.Query()
            .FirstOrDefaultAsync(m => m.TenantId == member.TenantId &&
                                      m.Provider == member.Provider &&
                                      m.ExternalIdentityId == authenticatedExternalId &&
                                      m.Id != member.Id &&
                                      !m.IsDeleted, cancellationToken);

        if (existingWithSameIdentity != null)
        {
            throw new ConflictException(
                $"The authenticated account is already a member of this workspace ({existingWithSameIdentity.Email}). Please sign out and sign in with the invited email address.");
        }

        // 6. Bind external identity, activate, invalidate token
        member.ExternalIdentityId = authenticatedExternalId;
        member.UserId = authenticatedExternalId;
        member.Status = Status.Active;
        member.InvitationTokenHash = null;
        member.InvitationExpiresAtUtc = null;
        member.ConcurrencyStamp = Guid.NewGuid();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 7. Audit log
        await auditService.LogMemberEventAsync(
            member.TenantId,
            authenticatedExternalId,
            authenticatedEmail,
            member.Id,
            member.Email,
            "INVITATION_ACCEPTED",
            new { Status = Status.Pending.ToString() },
            new { Status = Status.Active.ToString(), ExternalIdentityId = authenticatedExternalId },
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(member.Id, "Invitation accepted successfully. Membership is now active.");
    }
}
