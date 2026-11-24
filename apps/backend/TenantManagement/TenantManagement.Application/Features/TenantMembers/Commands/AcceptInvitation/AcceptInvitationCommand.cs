using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.AcceptInvitation;

public record AcceptInvitationCommand(string InvitationToken) : IRequest<ApiResponse<Guid>>;
