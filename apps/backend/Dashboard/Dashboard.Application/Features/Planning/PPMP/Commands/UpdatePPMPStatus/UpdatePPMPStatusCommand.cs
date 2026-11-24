using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMPStatus;

public record UpdatePPMPStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string Action { get; init; } = string.Empty;
    public string ActorName { get; init; } = string.Empty;
    public string? Role { get; init; }
    public string? Notes { get; init; }
}