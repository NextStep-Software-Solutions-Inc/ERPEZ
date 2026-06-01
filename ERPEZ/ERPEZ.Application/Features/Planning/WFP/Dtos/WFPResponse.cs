
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;

namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public record WFPResponse
{
    public Guid Id { get; init; }
    public required OfficeResponse Office { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public Guid? OPCRId { get; init; }
    public OPCRDetailedResponse? OPCR { get; init; }
    public Guid? FundSourceId { get; init; }
    public FundSourceResponse? FundSource { get; init; }
    public DateOnly ProjectStartDate { get; init; }
    public DateOnly ProjectEndDate { get; init; }
    public decimal? ProposedBudget { get; init; }
    public string? GeneralObjective { get; init; }
    public string Mode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public int ObjectiveCount { get; init; } = 0;
    public int ActivityCount { get; init; } = 0;

    public List<WFPObjectiveResponse> WFPObjectives { get; init; } = [];
}
