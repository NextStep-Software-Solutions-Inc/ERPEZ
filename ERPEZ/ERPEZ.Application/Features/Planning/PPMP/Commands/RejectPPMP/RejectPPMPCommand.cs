using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.RejectPPMP;

public record RejectPPMPCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string RejectedBy { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
}
