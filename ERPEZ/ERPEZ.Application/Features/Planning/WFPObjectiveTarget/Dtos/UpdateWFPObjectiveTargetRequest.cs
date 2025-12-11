namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;

public class UpdateWFPObjectiveTargetRequest
{
    public string? ActivityName { get; set; }
    public string? Indicator { get; set; }
    public decimal? Weight { get; set; }
}
