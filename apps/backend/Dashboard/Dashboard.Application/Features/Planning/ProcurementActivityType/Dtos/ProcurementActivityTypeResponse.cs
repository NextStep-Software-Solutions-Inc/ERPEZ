namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Dtos;

public record ProcurementActivityTypeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? ActivityCode { get; init; }
    public string Description { get; init; } = string.Empty;
    public int? MinDays { get; init; }
    public int? MaxDays { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
