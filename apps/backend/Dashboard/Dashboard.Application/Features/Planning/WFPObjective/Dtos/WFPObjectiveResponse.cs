using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

public record WFPObjectiveResponse
{
    public Guid Id { get; init; }
    public Guid WFPId { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal Weight { get; init; }
    public string? Outcome { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
    public string? WFPStatus { get; init; }
    public WFPResponse? WFP { get; init; }
    public int WFPObjectiveActivitiesCount { get; init; } = 0;
    public List<WFPObjectiveActivityResponse> WFPObjectiveActivities { get; init; } = [];
}
