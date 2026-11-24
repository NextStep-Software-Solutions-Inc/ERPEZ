using ERPEZ.Application.Features.Planning.PMT.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.UpdatePMT;

public record UpdatePMTCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdatePMTRequest UpdatePMT { get; init; }
}
