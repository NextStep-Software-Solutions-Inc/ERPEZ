using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record SelectPPMPsRequest : IRequest<ApiResponse<Unit>>
{
    public Guid APPId { get; init; }
    public List<Guid> PPMPIds { get; init; } = [];
}
