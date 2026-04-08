namespace ERPEZ.Application.Features.Planning.Object.Dtos;

public record ObjectDetailedResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Code { get; init; }
    public Guid? FiscalYearId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
