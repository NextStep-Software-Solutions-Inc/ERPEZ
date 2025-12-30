using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

public record WFPObjectiveTargetResponse
{
    public Guid Id { get; init; }
    public Guid WFPObjectiveId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string Indicator { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;

    public List<WFPObjectiveTimelineResponse> WFPObjectiveTimelines { get; init; } = [];
    public List<WFPObjectiveTargetExpenditureResponse> WFPObjectiveTargetExpenditures { get; init; } = [];
}
