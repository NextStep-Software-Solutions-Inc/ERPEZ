using ERPEZ.TenantManagement.Application.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.DeleteTenantSubscription;

public record class DeleteTenantSubscriptionCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
