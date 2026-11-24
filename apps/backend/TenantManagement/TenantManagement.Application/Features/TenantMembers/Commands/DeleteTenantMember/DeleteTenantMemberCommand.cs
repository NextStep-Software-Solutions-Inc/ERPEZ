using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.DeleteTenantMember;

public record DeleteTenantMemberCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
