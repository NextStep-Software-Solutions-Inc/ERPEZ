namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

public class WFPObjectiveTargetResponse
{
    public Guid Id { get; set; }
    public Guid WFPObjectiveId { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public string Indicator { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
