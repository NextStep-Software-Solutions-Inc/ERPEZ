namespace ERPEZ.Application.Features.Planning.WFPActivity.Dtos;

public class WFPActivityDto
{
    public Guid Id { get; set; }
    public Guid WFPId { get; set; }
    public Guid WFPOutcomeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OutputIndicator { get; set; } = string.Empty;
    public string Deliverable { get; set; } = string.Empty;
    public string Timeframe { get; set; } = string.Empty;
    public List<string>? PersonsInvolved { get; set; }
}
