using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.SubmitPPMPForApproval;

public record SubmitPPMPForApprovalCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string SubmittedBy { get; init; } = string.Empty;
}
