namespace ERPEZ.Application.Features.Planning.Object.Dtos;

public record UpdateObjectRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public bool? IsActive { get; init; }
    public Guid? FiscalYearId { get; init; }
}
