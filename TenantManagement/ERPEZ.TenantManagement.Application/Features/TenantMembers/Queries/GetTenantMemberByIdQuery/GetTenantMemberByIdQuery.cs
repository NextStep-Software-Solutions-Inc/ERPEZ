using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMemberByIdQuery;

public record class GetTenantMemberByIdQuery(Guid Id) : IRequest<ApiResponse<TenantMember>>;
