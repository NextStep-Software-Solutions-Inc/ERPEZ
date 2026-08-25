using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.UpdateAOB;

public record UpdateAOBCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required string AOBNumber { get; init; }
    public string? Description { get; init; }
    public BidEvaluationCriteria AwardCriterion { get; init; } = BidEvaluationCriteria.LCRB;
    public DateOnly AOBDate { get; init; }
    public DateTime OpeningDate { get; init; }
    public StatusEnum Status { get; init; } = StatusEnum.Draft;
    public string? Remarks { get; init; }
    public List<Guid> RFQIds { get; init; } = [];
}
