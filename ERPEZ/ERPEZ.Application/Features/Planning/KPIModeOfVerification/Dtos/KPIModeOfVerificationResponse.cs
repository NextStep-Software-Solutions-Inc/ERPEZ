namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;

public class KPIModeOfVerificationResponse
{
    public Guid Id { get; set; }
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Url { get; set; }
}
