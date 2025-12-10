namespace ERPEZ.Application.Features.Planning.WFPObjective.Dtos;

public class UpdateWFPObjectiveRequest
{
    public string? Description { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Outcome { get; set; }
}
