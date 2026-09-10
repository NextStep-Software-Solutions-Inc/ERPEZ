using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

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
