namespace ERPEZ.Application.Features.Planning.WFPOutcome.Dtos;

public class WFPOutcomeResponse
{
    public Guid Id { get; set; }
    public Guid WFPObjectiveId { get; set; }
    public string Description { get; set; } = string.Empty;
}
