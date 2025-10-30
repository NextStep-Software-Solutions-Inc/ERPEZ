using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.DeleteTenantMember;

public record class DeleteTenantMemberCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
