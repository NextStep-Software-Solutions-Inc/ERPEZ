namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateMFOKPIRequest
{
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
}
