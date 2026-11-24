namespace ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;

public record FiscalMonthDetailedResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public required string Name { get; init; }
    public int MonthIndex { get; init; }
    public bool IsLocked { get; init; }
    public Guid? ModifiedByUserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
