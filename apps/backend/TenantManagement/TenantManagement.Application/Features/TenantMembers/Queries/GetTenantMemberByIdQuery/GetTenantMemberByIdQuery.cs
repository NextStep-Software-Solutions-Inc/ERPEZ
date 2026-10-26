using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMemberByIdQuery;

public record GetTenantMemberByIdQuery(Guid Id) : IRequest<ApiResponse<TenantMemberDto>>;
