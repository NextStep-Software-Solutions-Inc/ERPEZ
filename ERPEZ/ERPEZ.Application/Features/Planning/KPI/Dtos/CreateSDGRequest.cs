namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateSDGRequest
{
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
}
