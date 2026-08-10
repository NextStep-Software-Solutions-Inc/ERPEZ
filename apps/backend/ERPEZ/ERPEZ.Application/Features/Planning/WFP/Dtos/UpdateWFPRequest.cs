using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public record UpdateWFPRequest
{
    public Guid? OfficeId { get; init; }
    public string? ProjectTitle { get; init; }
    public Guid? OPCRId { get; init; }
    public Guid? FundSourceId { get; init; }
    public DateOnly? ProjectStartDate { get; init; }
    public DateOnly? ProjectEndDate { get; init; }
    public decimal? ProposedBudget { get; init; }
    public string? GeneralObjective { get; init; }
    public ModeEnum? Mode { get; init; }
}
