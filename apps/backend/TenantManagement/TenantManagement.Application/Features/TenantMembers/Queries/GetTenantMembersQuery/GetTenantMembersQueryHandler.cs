using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMembersQuery;

public class GetTenantMembersQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantMembersQuery, PaginatedApiResponse<TenantMemberDto>>
{
    public async Task<PaginatedApiResponse<TenantMemberDto>> Handle(GetTenantMembersQuery query, CancellationToken cancellationToken)
    {
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
            Status = tm.Status.ToString()
        };

        (IReadOnlyList<TenantMemberDto> tenantMembers, int totalCount) result;
        if (query.TenantId.HasValue)
        {
            result = await unitOfWork.TenantMemberRepository.GetAllAsync(
                sieveModel,
                projection,
                tm => tm.TenantId == query.TenantId.Value,
                cancellationToken);
        }
        else
        {
            result = await unitOfWork.TenantMemberRepository.GetAllAsync(
                sieveModel,
                projection,
                cancellationToken);
        }

        return new PaginatedApiResponse<TenantMemberDto>(
            [.. result.tenantMembers],
            query.PageNumber,
            query.PageSize,
            result.totalCount);
    }
}
