using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.UpdatePPMPActivity;

public record UpdatePPMPActivityCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public Guid? LIBActivityId { get; init; }
}
