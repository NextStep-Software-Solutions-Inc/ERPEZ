namespace ERPEZ.Application.Features.Planning.KPITarget.Dtos;

public class KPITargetDto
{
    public Guid Id { get; set; }
    public Guid KPIId { get; set; }
    public decimal TargetValue { get; set; }
    public string Period { get; set; } = string.Empty;
    public string? QuarterName { get; set; }
}
