namespace ERPEZ.Application.Features.Planning.Location.Dtos;

public record LocationResponse
{
    public Guid Id { get; init; }
    public Guid? ParentId { get; init; }
    public string? Name { get; init; }
    public string? Code { get; init; }
    public string? Type { get; init; }
    public bool? IsActive { get; init; }
    public Guid? FiscalYearId { get; init; }
}
