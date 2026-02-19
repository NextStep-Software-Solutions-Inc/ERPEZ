using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.CreatePMT;

public record CreatePMTCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OrganizationId { get; init; }
    public int ActiveYear { get; init; }
    public bool IsManualWorkflow { get; init; } = false;
}
