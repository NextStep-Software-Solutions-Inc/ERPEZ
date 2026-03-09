using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public record UpdateWFPRequest
{
    public Guid? OfficeId { get; init; }
    public string? ProjectTitle { get; init; }
    public string? Description { get; init; }
    public Guid? FiscalYearId { get; init; }
    public DateOnly? ProjectStartDate { get; init; }
    public DateOnly? ProjectEndDate { get; init; }
    public decimal? ProposedBudget { get; init; }
    public string? GeneralObjective { get; init; }
    public string? Mode { get; init; }
}
