namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

public class WFPObjectiveDto
{
    public Guid Id { get; set; }
    public Guid WFPId { get; set; }
    public string Description { get; set; } = string.Empty;
}
