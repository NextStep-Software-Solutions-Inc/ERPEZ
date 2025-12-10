namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;

public class UpdateKPIModeOfVerificationRequest
{
    public Guid? KPIId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
}
