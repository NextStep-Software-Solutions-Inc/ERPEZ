using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;

public record DeleteTenantCommand(Guid Id) : IRequest<ApiResponse<Unit>>;