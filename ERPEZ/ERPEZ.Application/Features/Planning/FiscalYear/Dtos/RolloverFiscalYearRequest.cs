namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record RolloverFiscalYearRequest
{
    public Guid SourceFiscalYearId { get; init; }
    public bool IncludeOrgStructure { get; init; }
    public bool IncludeUACSLibrary { get; init; }
    public bool IncludeRecurringExpenses { get; init; }
}
