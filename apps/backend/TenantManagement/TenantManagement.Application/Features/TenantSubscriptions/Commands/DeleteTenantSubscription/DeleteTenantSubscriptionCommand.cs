using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.DeleteTenantSubscription;

public record DeleteTenantSubscriptionCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
