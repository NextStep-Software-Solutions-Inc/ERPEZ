using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMembersQuery;

public class GetTenantMembersQueryHandler(IUnitOfWork unitOfWork, ITenantContextService tenantContext)
    : IRequestHandler<GetTenantMembersQuery, PaginatedApiResponse<TenantMemberDto>>
{
    public async Task<PaginatedApiResponse<TenantMemberDto>> Handle(GetTenantMembersQuery query, CancellationToken cancellationToken)
    {
        if (!tenantContext.TenantId.HasValue)
        {
            throw new UnauthorizedException("Tenant context is missing or unauthenticated.");
        }

        var tenantId = tenantContext.TenantId.Value;

        // Auto-reconcile pending members who actually have a real Clerk user identity bound (e.g. user_...)
        var pendingWithIdentity = await unitOfWork.TenantMemberRepository.Query()
            .Where(tm => tm.TenantId == tenantId &&
                         tm.Status == ERPEZ.TenantManagement.Domain.Enums.Status.Pending &&
                         !string.IsNullOrEmpty(tm.ExternalIdentityId) &&
                         !tm.ExternalIdentityId.StartsWith("inv_") &&
                         !tm.IsDeleted)
            .ToListAsync(cancellationToken);

        if (pendingWithIdentity.Count > 0)
        {
            foreach (var pm in pendingWithIdentity)
            {
                pm.Status = ERPEZ.TenantManagement.Domain.Enums.Status.Active;
                pm.InvitationTokenHash = null;
                pm.InvitationExpiresAtUtc = null;
                pm.ConcurrencyStamp = Guid.NewGuid();
            }
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Self-heal any erroneously auto-reconciled invitations whose ExternalIdentityId is still a pending invitation token
        var misreconciledInvitations = await unitOfWork.TenantMemberRepository.Query()
            .Where(tm => tm.TenantId == tenantId &&
                         tm.Status == ERPEZ.TenantManagement.Domain.Enums.Status.Active &&
                         !string.IsNullOrEmpty(tm.ExternalIdentityId) &&
                         tm.ExternalIdentityId.StartsWith("inv_") &&
                         !tm.IsDeleted)
            .ToListAsync(cancellationToken);

        if (misreconciledInvitations.Count > 0)
        {
            foreach (var mi in misreconciledInvitations)
            {
                mi.Status = ERPEZ.TenantManagement.Domain.Enums.Status.Pending;
                var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(mi.ExternalIdentityId.Trim()));
                mi.InvitationTokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();
                mi.InvitationExpiresAtUtc = DateTime.UtcNow.AddHours(48);
                mi.ConcurrencyStamp = Guid.NewGuid();
            }
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<TenantMember, TenantMemberDto>> projection = tm => new TenantMemberDto
        {
            Id = tm.Id,
            TenantId = tm.TenantId,
            UserId = tm.UserId,
            ExternalIdentityId = tm.ExternalIdentityId,
            Email = tm.Email,
            FirstName = tm.FirstName,
            LastName = tm.LastName,
            Role = tm.RoleAssignments.Select(ra => ra.Role.Name).FirstOrDefault(),
            Roles = tm.RoleAssignments.Select(ra => ra.Role.Name).ToList(),
            RoleIds = tm.RoleAssignments.Select(ra => ra.RoleId).ToList(),
            Status = tm.Status.ToString(),
            ConcurrencyStamp = tm.ConcurrencyStamp,
            InvitationExpiresAtUtc = tm.InvitationExpiresAtUtc
        };

        var result = await unitOfWork.TenantMemberRepository.GetAllAsync(
            sieveModel,
            projection,
            tm => tm.TenantId == tenantId && !tm.IsDeleted,
            cancellationToken);

        return new PaginatedApiResponse<TenantMemberDto>(
            [.. result.Entities],
            query.PageNumber,
            query.PageSize,
            result.TotalCount);
    }
}
