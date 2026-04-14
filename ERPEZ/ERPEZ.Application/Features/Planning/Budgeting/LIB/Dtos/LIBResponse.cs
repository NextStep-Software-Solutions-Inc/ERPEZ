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
    public LIBLevelEnum Level { get; init; }
    public LIBSourceTypeEnum SourceType { get; init; }
    public Guid? SourceId { get; init; }
    public LIBStatusEnum Status { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
    public int Version { get; init; }
    public Guid? PreviousVersionId { get; init; }
    public LIBFiscalYearResponse? FiscalYear { get; init; }
    public LIBFundClusterResponse? FundCluster { get; init; }
    public LIBOfficeResponse? Office { get; init; }
    public LIBDeliveryUnitResponse? DeliveryUnit { get; init; }
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

public record LIBDeliveryUnitResponse
{
    public Guid Id { get; init; }
    public Guid OfficeId { get; init; }
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
    public Guid? FundClusterId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public Guid DeliveryUnitId { get; init; }
    public string Scope { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string LIBNumber { get; init; } = string.Empty;
    public LIBLevelEnum Level { get; init; }
    public LIBSourceTypeEnum SourceType { get; init; }
    public Guid? SourceId { get; init; }
    public LIBStatusEnum Status { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
    public int Version { get; init; } = 1;
    public Guid? PreviousVersionId { get; init; }
}

public record UpdateLIBRequest
{
    public Guid Id { get; init; }
    public Guid? FiscalYearId { get; init; }
    public Guid? FundClusterId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public Guid DeliveryUnitId { get; init; }
    public string Scope { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string LIBNumber { get; init; } = string.Empty;
    public LIBLevelEnum Level { get; init; }
    public LIBSourceTypeEnum SourceType { get; init; }
    public Guid? SourceId { get; init; }
    public LIBStatusEnum Status { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
    public int Version { get; init; }
    public Guid? PreviousVersionId { get; init; }
}