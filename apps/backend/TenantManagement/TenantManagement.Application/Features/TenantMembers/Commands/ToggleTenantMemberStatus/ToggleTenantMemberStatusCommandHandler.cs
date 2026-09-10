using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ToggleTenantMemberStatus;

public class ToggleTenantMemberStatusCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    ITenantAuditService auditService)
    : IRequestHandler<ToggleTenantMemberStatusCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(ToggleTenantMemberStatusCommand command, CancellationToken cancellationToken)
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

        return await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // 1. Row lock parent Tenant
            await unitOfWork.LockTenantRowAsync(tenantId, cancellationToken);

            // 2. Load member
            var member = await unitOfWork.TenantMemberRepository.Query()
                .Include(m => m.RoleAssignments).ThenInclude(ra => ra.Role)
                .FirstOrDefaultAsync(m => m.Id == command.Id && m.TenantId == tenantId && !m.IsDeleted, cancellationToken)
                ?? throw new NotFoundException("Tenant member not found.");

            // 3. Optimistic concurrency check
            if (member.ConcurrencyStamp != command.ConcurrencyStamp)
            {
                throw new ConflictException("The member record was modified concurrently. Please refresh and retry.");
            }

            // 4. Self-lockout check
            if (!string.IsNullOrWhiteSpace(member.ExternalIdentityId) &&
                string.Equals(member.ExternalIdentityId, actorExternalId, StringComparison.OrdinalIgnoreCase) &&
                command.Status != Status.Active)
            {
                throw new ForbiddenException("You cannot deactivate or disable your own tenant membership.");
            }

            // 5. Last Tenant Administrator invariant check
            var isTenantAdmin = member.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR");
            if (isTenantAdmin && member.Status == Status.Active && command.Status != Status.Active)
            {
                var otherActiveAdminCount = await unitOfWork.TenantMemberRepository.Query()
                    .CountAsync(m => m.TenantId == tenantId &&
                                     m.Id != member.Id &&
                                     m.Status == Status.Active &&
                                     !m.IsDeleted &&
                                     m.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR"),
                                cancellationToken);

                if (otherActiveAdminCount == 0)
                {
                    throw new ValidationException("Cannot deactivate the last active Tenant Administrator.");
                }
            }

            var previousStatus = member.Status;
            member.Status = command.Status;
            member.ConcurrencyStamp = Guid.NewGuid();

            await unitOfWork.SaveChangesAsync(cancellationToken);

            // 6. Audit log
            await auditService.LogMemberEventAsync(
                tenantId,
                actorExternalId,
                actorEmail,
                member.Id,
                member.Email,
                "MEMBER_STATUS_CHANGED",
                new { Status = previousStatus.ToString() },
                new { Status = member.Status.ToString() },
                cancellationToken);

            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(member.Id, $"Tenant member status changed to {member.Status}.");
        }, cancellationToken: cancellationToken);
    }
}
