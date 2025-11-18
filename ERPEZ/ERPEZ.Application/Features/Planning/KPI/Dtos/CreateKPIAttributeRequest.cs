namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateKPIAttributeRequest
{
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
