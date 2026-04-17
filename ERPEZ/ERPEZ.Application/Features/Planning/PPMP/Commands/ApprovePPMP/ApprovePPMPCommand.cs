using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;

public record ApprovePPMPCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string ApprovedBy { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string? Notes { get; init; }
}
