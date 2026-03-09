
namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public record WFPsResponse
{
    public Guid Id { get; init; }
    public Guid OfficeId { get; init; }
    public required string OfficeName { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int? FiscalYear { get; init; }
    public DateOnly ProjectStartDate { get; init; }
    public DateOnly ProjectEndDate { get; init; }
    public decimal? ProposedBudget { get; init; }
    public string? GeneralObjective { get; init; }
    public string Mode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;

    public int ObjectiveCount { get; init; } = 0;
}
