namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Request DTO for batch creation of WFP Objectives.
/// </summary>
public record CreateWFPObjectivesBatchRequest
{
    public Guid WFPId { get; init; }
    public List<CreateWFPObjectiveItemRequest> WFPObjectives { get; init; } = [];
}
