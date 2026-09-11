using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.RevokeInvitation;

public class RevokeInvitationCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    ITenantAuditService auditService)
    : IRequestHandler<RevokeInvitationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(RevokeInvitationCommand command, CancellationToken cancellationToken)
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
            .FirstOrDefaultAsync(m => m.Id == command.Id && m.TenantId == tenantId && !m.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Tenant member not found.");

        if (member.Status != Status.Pending)
        {
            throw new ValidationException($"Only pending invitations can be revoked. Current status is '{member.Status}'.");
        }

        var previousStatus = member.Status;
        member.Status = Status.Cancelled;
        member.InvitationTokenHash = null;
        member.InvitationExpiresAtUtc = null;
        member.ConcurrencyStamp = Guid.NewGuid();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditService.LogMemberEventAsync(
            tenantId,
            actorExternalId,
            actorEmail,
            member.Id,
            member.Email,
            "INVITATION_REVOKED",
            new { Status = previousStatus.ToString() },
            new { Status = Status.Cancelled.ToString() },
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(member.Id, "Invitation revoked successfully.");
    }
}
