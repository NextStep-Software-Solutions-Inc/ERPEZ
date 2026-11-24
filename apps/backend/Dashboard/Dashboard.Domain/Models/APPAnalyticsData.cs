namespace ERPEZ.Domain.Models;

public class APPAnalyticsData
{
    public Guid AppId { get; set; }
    public string APPNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FiscalYear { get; set; } = string.Empty;
    public string APPType { get; set; } = string.Empty;
    public decimal TotalEstimatedBudget { get; set; }
    public int TotalItemsCount { get; set; }
    public int TotalPpmpsCount { get; set; }
    public int TotalOfficesCount { get; set; }

    public List<OfficeBreakdownData> BreakdownByOffice { get; set; } = [];
    public List<CategoryBreakdownData> BreakdownByCategory { get; set; } = [];
    public List<ProcurementTypeBreakdownData> BreakdownByProcurementType { get; set; } = [];
    public List<FundSourceBreakdownData> BreakdownByFundSource { get; set; } = [];

    public FinancialBreakdownData FinancialBreakdown { get; set; } = new();
}

public record OfficeBreakdownData(Guid OfficeId, string OfficeName, int ItemsCount, decimal TotalAmount);
public record CategoryBreakdownData(string CategoryName, int ItemsCount, decimal TotalAmount);
public record ProcurementTypeBreakdownData(string ProcurementModeName, int ItemsCount, decimal TotalAmount);
public record FundSourceBreakdownData(string FundSourceName, int ItemsCount, decimal TotalAmount);
public record FinancialBreakdownData(decimal PS = 0, decimal MOOE = 0, decimal CO = 0);
