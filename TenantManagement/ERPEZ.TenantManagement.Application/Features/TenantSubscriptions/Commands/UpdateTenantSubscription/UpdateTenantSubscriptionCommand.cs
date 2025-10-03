using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.UpdateTenantSubscription;

public sealed class UpdateTenantSubscriptionCommand : IRequest<ApiResponse<TenantSubscription>>
{
    public Guid Id { get; set; }
    public UpdateTenantSubscriptionDto? UpdateTenantSubscription {  get; set; }
}
