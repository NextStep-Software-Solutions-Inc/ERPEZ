namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateKPIModeOfVerificationRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Url { get; set; }
}
