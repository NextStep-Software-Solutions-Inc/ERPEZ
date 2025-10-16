namespace ERPEZ.Application.Features.Planning.KPITarget.Dtos;

public class UpdateKPITargetDto
{
    public Guid? KPIId { get; set; }
    public decimal? TargetValue { get; set; }
    public string? Period { get; set; }
    public string? QuarterName { get; set; }
}
