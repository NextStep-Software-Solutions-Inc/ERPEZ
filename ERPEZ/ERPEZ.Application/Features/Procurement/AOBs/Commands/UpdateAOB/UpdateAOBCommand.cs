using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.UpdateAOB;

public record UpdateAOBCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required string AOBNumber { get; init; }
    public string? Description { get; init; }
    public string AwardCriterion { get; init; } = "LCRB"; // LCRB, MEARB, MARB
    public DateOnly AOBDate { get; init; }
    public DateTime OpeningDate { get; init; }
    public string Status { get; init; } = "DRAFT"; // DRAFT, FOR_APPROVAL, APPROVED
    public List<Guid> ProcurementProjectIds { get; init; } = [];
}
