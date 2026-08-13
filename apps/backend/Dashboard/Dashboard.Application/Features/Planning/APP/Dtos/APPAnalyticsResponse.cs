namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record APPAnalyticsResponse
{
    public Guid AppId { get; init; }
    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string FiscalYear { get; init; } = string.Empty;
    public string APPType { get; init; } = string.Empty;
    public decimal TotalEstimatedBudget { get; init; }
    public int TotalItemsCount { get; init; }
    public int TotalPpmpsCount { get; init; }
    public int TotalOfficesCount { get; init; }

    public List<OfficeBreakdownDto> BreakdownByOffice { get; init; } = [];
    public List<CategoryBreakdownDto> BreakdownByCategory { get; init; } = [];
    public List<ProcurementTypeBreakdownDto> BreakdownByProcurementType { get; init; } = [];
    public List<FundSourceBreakdownDto> BreakdownByFundSource { get; init; } = [];
    
    public FinancialBreakdownDto FinancialBreakdown { get; init; } = new();
}

public record OfficeBreakdownDto(Guid OfficeId, string OfficeName, int ItemsCount, decimal TotalAmount);
public record CategoryBreakdownDto(string CategoryName, int ItemsCount, decimal TotalAmount);
public record ProcurementTypeBreakdownDto(string ProcurementModeName, int ItemsCount, decimal TotalAmount);
public record FundSourceBreakdownDto(string FundSourceName, int ItemsCount, decimal TotalAmount);
public record FinancialBreakdownDto(decimal PS = 0, decimal MOOE = 0, decimal CO = 0);
