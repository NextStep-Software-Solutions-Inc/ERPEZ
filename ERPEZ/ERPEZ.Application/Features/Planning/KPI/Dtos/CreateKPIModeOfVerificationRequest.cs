namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateKPIModeOfVerificationRequest
{
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Url { get; set; }
}
