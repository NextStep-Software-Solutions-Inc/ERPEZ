namespace ERPEZ.Application.Features.Planning.OfficeType.Dtos;

public record OfficeTypeResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required bool CanHaveChildren { get; init; }
    public required bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
