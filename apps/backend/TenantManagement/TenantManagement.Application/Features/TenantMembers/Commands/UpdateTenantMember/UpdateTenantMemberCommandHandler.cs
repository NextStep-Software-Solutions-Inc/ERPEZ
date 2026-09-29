using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;

public class UpdateTenantMemberCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    IRoleAssignmentValidator roleAssignmentValidator,
    ITenantAuditService auditService)
    : IRequestHandler<UpdateTenantMemberCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateTenantMemberCommand command, CancellationToken cancellationToken)
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

        if (command.UpdateTenantMember == null)
        {
            throw new ValidationException("Update payload cannot be null.");
        }

        return await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // 1. Pessimistic row lock on the parent Tenant record to serialize concurrent admin demotions
            await unitOfWork.LockTenantRowAsync(tenantId, cancellationToken);

            // 2. Load current member state
            var member = await unitOfWork.TenantMemberRepository.Query()
                .Include(m => m.RoleAssignments).ThenInclude(ra => ra.Role)
                .FirstOrDefaultAsync(m => m.Id == command.Id && m.TenantId == tenantId && !m.IsDeleted, cancellationToken)
                ?? throw new NotFoundException("Tenant member not found.");

            // 3. Optimistic concurrency check
            if (member.ConcurrencyStamp != command.UpdateTenantMember.ConcurrencyStamp)
            {
                throw new ConflictException("The member record was modified concurrently. Please refresh and retry.");
            }

            var holdsTenantAdmin = member.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR");

            var candidateRoleIds = command.UpdateTenantMember.RoleIds.Distinct().ToList();
            var candidateRoles = await unitOfWork.RoleRepository.Query()
                .Where(r => candidateRoleIds.Contains(r.Id))
                .ToListAsync(cancellationToken);

            var willHoldTenantAdmin = candidateRoles.Any(r => r.NormalizedName == "TENANT ADMINISTRATOR");

            // 4. Last Tenant Administrator invariant check
            if (holdsTenantAdmin && !willHoldTenantAdmin && member.Status == Status.Active)
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
                    throw new ValidationException("Cannot remove the last active Tenant Administrator from this tenant.");
                }
            }

            // 5. Role delegation and self-lockout validation
            await roleAssignmentValidator.ValidateRoleAssignmentsAsync(
                tenantId,
                actorExternalId,
                targetMemberId: member.Id,
                candidateRoleIds,
                expectedScope: RoleScope.Tenant,
                cancellationToken: cancellationToken);

            // 6. Mutate member details & roles and rotate concurrency stamp
            var beforeState = new
            {
                member.FirstName,
                member.LastName,
                member.Email,
                Roles = member.RoleAssignments.Select(ra => ra.Role.Name).ToList(),
                Status = member.Status.ToString()
            };

            if (command.UpdateTenantMember.FirstName != null)
            {
                member.FirstName = command.UpdateTenantMember.FirstName.Trim();
            }

            if (command.UpdateTenantMember.LastName != null)
            {
                member.LastName = command.UpdateTenantMember.LastName.Trim();
            }

            // Preserve role assignments from other scopes (e.g. Platform)
            var preservedNonGovernanceAssignments = member.RoleAssignments
                .Where(ra => ra.Role.Scope != RoleScope.Tenant)
                .Select(ra => ra.RoleId)
                .ToList();

            member.RoleAssignments.Clear();
            foreach (var preservedRoleId in preservedNonGovernanceAssignments)
            {
                member.RoleAssignments.Add(new TenantMemberRoleAssignment
                {
                    TenantMemberId = member.Id,
                    RoleId = preservedRoleId
                });
            }
            foreach (var roleId in candidateRoleIds)
            {
                member.RoleAssignments.Add(new TenantMemberRoleAssignment
                {
                    TenantMemberId = member.Id,
                    RoleId = roleId
                });
            }

            member.ConcurrencyStamp = Guid.NewGuid();
            member.UpdatedAt = DateTime.UtcNow;
            await unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. Append audit log
            var afterRoleNames = candidateRoles.Select(r => r.Name).ToList();

            await auditService.LogMemberEventAsync(
                tenantId,
                actorExternalId,
                actorEmail,
                member.Id,
                member.Email,
                "MEMBER_UPDATED",
                beforeState,
                new
                {
                    member.FirstName,
                    member.LastName,
                    member.Email,
                    Roles = afterRoleNames,
                    Status = member.Status.ToString()
                },
                cancellationToken);

            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(member.Id, "Tenant member updated successfully.");
        }, cancellationToken: cancellationToken);
    }
}
