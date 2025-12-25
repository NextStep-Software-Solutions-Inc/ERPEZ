
using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public record WFPResponse
{
    public Guid Id { get; init; }
    public required DeliveryUnitResponse DeliveryUnit { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public string? Description { get; init; }
    public FiscalYearResponse? FiscalYear { get; init; }
    public DateOnly ProjectStartDate { get; init; }
    public DateOnly ProjectEndDate { get; init; }
    public decimal? ProposedBudget { get; init; }
    public string? GeneralObjective { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public int ObjectiveCount { get; init; } = 0;
    public int ActivityCount { get; init; } = 0;

    public List<WFPObjectiveResponse> WFPObjectives { get; init; } = [];
}
