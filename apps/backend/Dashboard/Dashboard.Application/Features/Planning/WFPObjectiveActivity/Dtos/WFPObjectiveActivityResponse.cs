using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;

public record WFPObjectiveActivityResponse
{
    public Guid Id { get; init; }
    public Guid WFPObjectiveId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string Indicator { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }

    public List<WFPObjectiveTimelineResponse> WFPObjectiveTimelines { get; init; } = [];
    public List<WFPObjectiveActivityExpenditureResponse> WFPObjectiveActivityExpenditures { get; init; } = [];
}
