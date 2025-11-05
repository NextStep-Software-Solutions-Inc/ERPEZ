namespace ERPEZ.Application.Features.Planning.WFPActivity.Dtos;

public class UpdateWFPActivityDto
{
    public Guid? WFPId { get; set; }
    public Guid? WFPOutcomeId { get; set; }
    public string? Name { get; set; }
    public string? OutputIndicator { get; set; }
    public string? Deliverable { get; set; }
    public string? Timeframe { get; set; }
    public List<string>? PersonsInvolved { get; set; }
}
