namespace ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;

public record FiscalMonthResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public string Name { get; init; } = string.Empty;
    public int MonthIndex { get; init; }
    public bool IsLocked { get; init; }
    public Guid? ModifiedByUserId { get; init; }
    public DateTime CreatedAt { get; init; }
}
