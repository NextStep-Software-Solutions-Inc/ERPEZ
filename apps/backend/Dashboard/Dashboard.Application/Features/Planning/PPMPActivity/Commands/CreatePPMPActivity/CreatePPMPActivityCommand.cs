using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.CreatePPMPActivity;

public record CreatePPMPActivityCommand : IRequest<ApiResponse<Guid>>
{
    public Guid PPMPId { get; init; }
    public Guid LIBActivityId { get; init; }
}
