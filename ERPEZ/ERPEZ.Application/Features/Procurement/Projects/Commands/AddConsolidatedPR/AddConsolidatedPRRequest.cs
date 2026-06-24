namespace ERPEZ.Application.Features.Procurement.Projects.Commands.AddConsolidatedPR;

public record AddConsolidatedPRRequest
{
    public required Guid ConsolidatedPRId { get; init; }
}
