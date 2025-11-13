namespace ERPEZ.Application.Features.Planning.KPITarget.Dtos;

public class UpdateKPITargetRequest
{
    public decimal? TargetValue { get; set; }
    public string? Period { get; set; }
    public string? QuarterName { get; set; }
}
