using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBSummary;

public record GetLIBSummaryQuery(Guid Id) : IRequest<ApiResponse<LIBDashboardSummaryResponse>>;

public record LIBDashboardSummaryResponse
{
    public Guid LibId { get; init; }
    public string LIBNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int Version { get; init; }
    public List<LIBSummaryActivityRow> Activities { get; init; } = [];
    public LIBSummaryTotals GrandTotals { get; init; } = new();
    public List<LIBSummaryUACSRow> UACSBreakdown { get; init; } = [];
    public LIBSummaryCeilingInfo? CeilingInfo { get; init; }
}

public record LIBSummaryActivityRow
{
    public Guid ActivityId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public decimal PersonnelServices { get; init; }
    public decimal MOOE { get; init; }
    public decimal CapitalOutlay { get; init; }
    public decimal Financial { get; init; }
    public decimal Total { get; init; }
}

public record LIBSummaryTotals
{
    public decimal PersonnelServices { get; init; }
    public decimal MOOE { get; init; }
    public decimal CapitalOutlay { get; init; }
    public decimal Financial { get; init; }
    public decimal Grand { get; init; }
}

public record LIBSummaryUACSRow
{
    public Guid ObjectId { get; init; }
    public string ObjectCode { get; init; } = string.Empty;
    public string ObjectName { get; init; } = string.Empty;
    public decimal Total { get; init; }
}

public record LIBSummaryCeilingInfo
{
    public decimal PSCeiling { get; init; }
    public decimal MOOECeiling { get; init; }
    public decimal COCeiling { get; init; }
    public decimal PSConsumed { get; init; }
    public decimal MOOEConsumed { get; init; }
    public decimal COConsumed { get; init; }
    public string CeilingStatus { get; init; } = string.Empty;
}
