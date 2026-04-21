using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.SelectPPMPs;

public record SelectPPMPsCommand : IRequest<ApiResponse<Unit>>
{
    public Guid APPId { get; init; }
    public List<Guid> PPMPIds { get; init; } = [];
}
