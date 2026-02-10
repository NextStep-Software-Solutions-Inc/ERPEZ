namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record UpdateFiscalYearRequest
{
    public int? Year { get; init; }
    public string? Description { get; init; }
}
