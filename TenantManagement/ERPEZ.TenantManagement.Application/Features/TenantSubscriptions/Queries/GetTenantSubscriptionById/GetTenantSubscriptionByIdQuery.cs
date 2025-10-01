using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptionById;

public record GetTenantSubscriptionByIdQuery(Guid Id) : IRequest<TenantSubscription?>;
