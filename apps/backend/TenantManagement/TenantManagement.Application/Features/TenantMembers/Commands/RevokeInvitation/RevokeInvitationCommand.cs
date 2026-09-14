using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.RevokeInvitation;

public record RevokeInvitationCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
