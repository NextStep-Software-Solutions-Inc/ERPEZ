namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;

public record KPIModeOfVerificationResponse
{
    public Guid Id { get; init; }
    public Guid KPIId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Url { get; init; }
}
