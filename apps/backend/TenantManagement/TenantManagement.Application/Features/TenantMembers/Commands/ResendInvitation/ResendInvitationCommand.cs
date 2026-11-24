using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ResendInvitation;

public record ResendInvitationCommand(Guid Id) : IRequest<ApiResponse<ResendInvitationResponse>>;
