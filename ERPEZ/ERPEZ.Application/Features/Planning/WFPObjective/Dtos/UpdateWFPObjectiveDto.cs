namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

public class UpdateWFPObjectiveDto
{
    public Guid? WFPId { get; set; }
    public string? Description { get; set; } = string.Empty;
}
