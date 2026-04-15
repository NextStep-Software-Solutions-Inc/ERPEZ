using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;

public record LIBResponse
{
    public Guid Id { get; init; }
    public Guid? FiscalYearId { get; init; }
    public Guid? FundClusterId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string LIBNumber { get; init; } = string.Empty;
    public string SourceType { get; init; } = string.Empty;
    public Guid? SourceId { get; init; }
    public LIBStatusEnum Status { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
    public int Version { get; init; }
    public Guid? PreviousVersionId { get; init; }
    public LIBFiscalYearResponse? FiscalYear { get; init; }
    public LIBFundClusterResponse? FundCluster { get; init; }
    public LIBOfficeResponse? Office { get; init; }
    public LIBSummaryResponse? ParentLIB { get; init; }
    public LIBSummaryResponse? ConsolidatedIntoLIB { get; init; }
    public LIBSummaryResponse? PreviousVersion { get; init; }
    public int ActivityCount { get; init; }
    public int DetailCount { get; init; }
}

public record LIBFiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string? Description { get; init; }
}

public record LIBFundClusterResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
}

public record LIBOfficeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

public record LIBSummaryResponse
{
    public Guid Id { get; init; }
    public string LIBNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Version { get; init; }
}

public record CreateLIBRequest
{
    public Guid? FiscalYearId { get; init; }
    public Guid? FundSourceId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public string Scope { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string LIBNumber { get; init; } = string.Empty;
    public string SourceType { get; init; } = string.Empty;
    public Guid? SourceId { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
}

public record UpdateLIBRequest
{
    public Guid? FiscalYearId { get; init; }
    public Guid? FundSourceId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public string Scope { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string LIBNumber { get; init; } = string.Empty;
    public string SourceType { get; init; } = string.Empty;
    public Guid? SourceId { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
}

public record UpdateLIBStatusRequest
{
    public string Status { get; init; } = string.Empty;
}