using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById;

public record GetTenantByIdQuery(Guid Id) : IRequest<ApiResponse<TenantDto>>;