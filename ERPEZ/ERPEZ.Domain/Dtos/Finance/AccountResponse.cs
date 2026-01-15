namespace ERPEZ.Domain.Dtos.Finance;

public record AccountResponse
{
    public Guid Id { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public Guid? FundSourceId { get; init; }
    public string? FundSourceName { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYear { get; init; }
    public string? Name { get; init; }
    public decimal Balance { get; init; }
    public decimal RunningBalance { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
