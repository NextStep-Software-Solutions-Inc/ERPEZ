namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;

public record UpdateKPIModeOfVerificationRequest
{
    public Guid? KPIId { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public Guid? FileId { get; init; }
}
