using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.UpdateTenantSubscription;

public sealed class UpdateTenantSubscriptionCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; set; }
    public required UpdateTenantSubscriptionDto UpdateTenantSubscription {  get; set; }
}
