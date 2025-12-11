namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

public class WFPObjectiveResponse
{
    public Guid Id { get; set; }
    public Guid WFPId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public decimal? Outcome { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
