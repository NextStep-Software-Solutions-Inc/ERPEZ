namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateKPITargetRequest
{
    public List<TargetValueDto> TargetValues { get; set; } = [];
    public string Period { get; set; } = string.Empty;
}
public class TargetValueDto
{
    public decimal TargetValue { get; set; }
    public string? QuarterName { get; set; }

} 
