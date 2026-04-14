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