using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.DeleteTenantMember;

public class DeleteTenantMemberCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    ITenantAuditService auditService)
    : IRequestHandler<DeleteTenantMemberCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteTenantMemberCommand request, CancellationToken cancellationToken)
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
            // 1. Pessimistic row lock on parent Tenant
            await unitOfWork.LockTenantRowAsync(tenantId, cancellationToken);

            // 2. Load member
            var member = await unitOfWork.TenantMemberRepository.Query()
                .Include(m => m.RoleAssignments).ThenInclude(ra => ra.Role)
                .FirstOrDefaultAsync(m => m.Id == request.Id && m.TenantId == tenantId && !m.IsDeleted, cancellationToken)
                ?? throw new NotFoundException("Tenant member not found.");

            // 3. Self-deletion prevention
            if (!string.IsNullOrWhiteSpace(member.ExternalIdentityId) &&
                string.Equals(member.ExternalIdentityId, actorExternalId, StringComparison.OrdinalIgnoreCase))
            {
                throw new ForbiddenException("You cannot delete your own tenant membership.");
            }

            // 4. Last Tenant Administrator invariant check
            var isTenantAdmin = member.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR");
            if (isTenantAdmin && member.Status == Status.Active)
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
                    throw new ValidationException("Cannot delete the last active Tenant Administrator.");
                }
            }

            var beforeState = new
            {
                member.Email,
                Roles = member.RoleAssignments.Select(ra => ra.Role.Name).ToList(),
                Status = member.Status.ToString()
            };

            // 5. Soft-delete
            member.IsDeleted = true;
            member.DeletedAt = DateTime.UtcNow;
            member.DeletedBy = actorExternalId;
            member.ConcurrencyStamp = Guid.NewGuid();

            await unitOfWork.SaveChangesAsync(cancellationToken);

            // 6. Audit log
            await auditService.LogMemberEventAsync(
                tenantId,
                actorExternalId,
                actorEmail,
                member.Id,
                member.Email,
                "MEMBER_DELETED",
                beforeState,
                null,
                cancellationToken);

            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Unit>.Success(Unit.Value, "Tenant member deleted successfully.");
        }, cancellationToken: cancellationToken);
    }
}
