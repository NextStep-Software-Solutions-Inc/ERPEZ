using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.CreateAOB;

public record CreateAOBCommand : IRequest<ApiResponse<Guid>>
{
    public required string AOBNumber { get; init; }
    public string? Description { get; init; }
    public string AwardCriterion { get; init; } = "LCRB"; // LCRB, MEARB, MARB
    public DateOnly AOBDate { get; init; }
    public DateTime OpeningDate { get; init; }
    public List<Guid> ProcurementProjectIds { get; init; } = [];
}
