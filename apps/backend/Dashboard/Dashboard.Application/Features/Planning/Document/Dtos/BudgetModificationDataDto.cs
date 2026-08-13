using ERPEZ.Application.Common.Dtos;

namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public record BudgetModificationDataDto
{
    public required string AgencyDetails { get; init; }
    public required string DeliveryUnit { get; init; }
    public required string FiscalYear { get; init; }
    public required string DocumentCodeNo { get; init; } = "FM-USTP-FDP-002";
    public required string RevisionNo { get; init; } = "00";
    public required DateTime EffectiveDate { get; init; }
    public required string Reason { get; init; }
    public required string Justification { get; init; }
    public required LibDataDto OriginalBudget { get; init; }
    public required LibDataDto ProposedBudget { get; init; }
    public required List<SignatoryDto> Signatories { get; init; }
}
