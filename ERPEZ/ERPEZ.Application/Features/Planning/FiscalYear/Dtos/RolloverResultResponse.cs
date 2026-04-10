namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record RolloverResultResponse
{
    public int FundSourcesCopied { get; init; }
    public int MFOPAPsCopied { get; init; }
    public int UACSCombinationsCopied { get; init; }
    public int UACSSegmentYearsCopied { get; init; }
    public int TotalRecordsCopied { get; init; }
}
