using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptionById;

public record GetTenantSubscriptionByIdQuery(Guid Id) : IRequest<ApiResponse<TenantSubscriptionDto>>;
