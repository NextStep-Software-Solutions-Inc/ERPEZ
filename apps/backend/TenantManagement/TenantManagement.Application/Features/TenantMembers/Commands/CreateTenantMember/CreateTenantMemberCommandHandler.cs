using System.Security.Cryptography;
using System.Text;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

public class CreateTenantMemberCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    IRoleAssignmentValidator roleAssignmentValidator,
    ITenantAuditService auditService)
    : IRequestHandler<CreateTenantMemberCommand, ApiResponse<CreateTenantMemberResponse>>
{
    public async Task<ApiResponse<CreateTenantMemberResponse>> Handle(CreateTenantMemberCommand command, CancellationToken cancellationToken)
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

        var normalizedEmail = command.Email.Trim().ToLowerInvariant();

        // 1. Check for duplicate active or pending member in this tenant
        var existing = await unitOfWork.TenantMemberRepository.Query()
            .FirstOrDefaultAsync(tm => tm.TenantId == tenantId &&
                                       tm.Email.ToLower() == normalizedEmail &&
                                       !tm.IsDeleted &&
                                       (tm.Status == Status.Active || tm.Status == Status.Pending),
                                 cancellationToken);

        if (existing != null)
        {
            throw new ConflictException($"A member with email '{command.Email}' already exists in this tenant with status '{existing.Status}'.");
        }

        // 2. Resolve roles to assign
        List<Guid> rolesToAssign;
        if (command.RoleIds != null && command.RoleIds.Count > 0)
        {
            rolesToAssign = command.RoleIds.Distinct().ToList();
        }
        else
        {
            var tenantMemberRole = await unitOfWork.RoleRepository.Query()
                .FirstOrDefaultAsync(r => r.NormalizedName == "TENANT MEMBER", cancellationToken)
                ?? throw new ValidationException("Default Tenant Member role was not found.");
            rolesToAssign = [tenantMemberRole.Id];
        }

        // 3. Role assignment and delegation validation
        await roleAssignmentValidator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorExternalId,
            targetMemberId: null,
            rolesToAssign,
            expectedScope: RoleScope.TenantManagement,
            cancellationToken: cancellationToken);

        // 4. Generate cryptographically secure invitation token (32 bytes Base64Url)
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var rawInvitationToken = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
        var tokenHashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawInvitationToken));
        var invitationTokenHash = Convert.ToHexString(tokenHashBytes).ToLowerInvariant();
        var expiresAt = DateTime.UtcNow.AddHours(48);

        var tenantMember = new TenantMember
        {
            TenantId = tenantId,
            UserId = normalizedEmail,
            ExternalIdentityId = string.Empty,
            Email = normalizedEmail,
            FirstName = command.FirstName.Trim(),
            LastName = command.LastName.Trim(),
            Status = Status.Pending,
            ConcurrencyStamp = Guid.NewGuid(),
            InvitationTokenHash = invitationTokenHash,
            InvitationExpiresAtUtc = expiresAt
        };

        foreach (var roleId in rolesToAssign)
        {
            tenantMember.RoleAssignments.Add(new TenantMemberRoleAssignment
            {
                RoleId = roleId
            });
        }

        await unitOfWork.TenantMemberRepository.AddAsync(tenantMember, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Append audit log
        var assignedRoleNames = await unitOfWork.RoleRepository.Query()
            .Where(r => rolesToAssign.Contains(r.Id))
            .Select(r => r.Name)
            .ToListAsync(cancellationToken);

        await auditService.LogMemberEventAsync(
            tenantId,
            actorExternalId,
            actorEmail,
            tenantMember.Id,
            tenantMember.Email,
            "MEMBER_INVITED",
            null,
            new
            {
                tenantMember.Email,
                tenantMember.FirstName,
                tenantMember.LastName,
                Roles = assignedRoleNames,
                Status = tenantMember.Status.ToString(),
                ExpiresAtUtc = expiresAt
            },
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new CreateTenantMemberResponse
        {
            Id = tenantMember.Id,
            Email = tenantMember.Email,
            InvitationToken = rawInvitationToken,
            InvitationExpiresAtUtc = expiresAt
        };

        return ApiResponse<CreateTenantMemberResponse>.Success(response, "Member invited successfully.");
    }
}
