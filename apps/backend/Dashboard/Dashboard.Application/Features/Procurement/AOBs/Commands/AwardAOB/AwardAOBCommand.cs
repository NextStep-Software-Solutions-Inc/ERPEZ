using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.AwardAOB;

public record AwardAOBCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid AOBId { get; init; }
    public required List<AwardItemInputDto> AwardedItems { get; init; } = [];
}
