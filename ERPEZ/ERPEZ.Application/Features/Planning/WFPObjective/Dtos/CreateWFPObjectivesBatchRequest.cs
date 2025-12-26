namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

/// <summary>
/// Request DTO for batch creation of WFP Objectives.
/// </summary>
public class CreateWFPObjectivesBatchRequest
{
    public Guid WFPId { get; set; }
    public List<CreateWFPObjectiveItemRequest> WFPObjectives { get; set; } = [];
}
