using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.DeleteTenantRole;

public record DeleteTenantRoleCommand(Guid Id) : IRequest<ApiResponse<bool>>;
