using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;

public record LIBResponse
{
    public Guid Id { get; init; }
    public Guid? FiscalYearId { get; init; }
    public Guid? FundSourceId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string LIBNumber { get; init; } = string.Empty;
    public string SourceType { get; init; } = string.Empty;
    public Guid? SourceId { get; init; }
    public string Scope { get; init; } = string.Empty;   // ← add
    public string Level { get; init; } = string.Empty;   // ← add
    public LIBStatusEnum Status { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
    public int Version { get; init; }
    public Guid? PreviousVersionId { get; init; }
    public LIBFiscalYearResponse? FiscalYear { get; init; }
    public LIBFundSourceResponse? FundSource { get; init; }
    public LIBOfficeResponse? Office { get; init; }
    public LIBSummaryResponse? ParentLIB { get; init; }
    public LIBSummaryResponse? ConsolidatedIntoLIB { get; init; }
    public LIBSummaryResponse? PreviousVersion { get; init; }
    public List<LIBNestedActivityResponse> Activities { get; init; } = [];
    public List<LIBNestedDetailResponse> OrphanDetails { get; init; } = [];
}

public record LIBFiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string? Description { get; init; }
}

public record LIBFundSourceResponse
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

public record LIBNestedActivityResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid? WFPObjectiveActivityId { get; init; }
    public Guid? OPCRActivityId { get; init; }
    public LIBNestedWFPActivityResponse? WFPObjectiveActivity { get; init; }
    public LIBNestedOPCRActivityResponse? OPCRActivity { get; init; }
    public List<LIBNestedDetailResponse> Details { get; init; } = [];
}

public record LIBNestedDetailResponse
{
    public Guid Id { get; init; }
    public Guid ObjectId { get; init; }
    public LIBNestedObjectResponse? Object { get; init; }
    public LIBNestedExpenseClassResponse? ExpenseClass { get; init; }
    public Guid? WFPObjectiveActivityExpenditureId { get; init; }
    public LIBNestedWFPExpenditureResponse? WFPObjectiveActivityExpenditure { get; init; }
    public string? Description { get; init; }
    public decimal? UnitQuantity { get; init; }
    public decimal? UnitCost { get; init; }
    public string? TimelineType { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public decimal Budget { get; init; }
}

public record LIBNestedObjectResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

public record LIBNestedExpenseClassResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
}

public record LIBNestedWFPActivityResponse
{
    public Guid Id { get; init; }
    public string ActivityName { get; init; } = string.Empty;
}

public record LIBNestedOPCRActivityResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}

public record LIBNestedWFPExpenditureResponse
{
    public Guid Id { get; init; }
    public string? ItemDescription { get; init; }
    public int? Quantity { get; init; }
    public decimal? UnitCost { get; init; }
}

public record CreateLIBRequest
{
    public Guid? FiscalYearId { get; init; }
    public Guid? FundSourceId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public string Scope { get; init; } = string.Empty;
    public string Level { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string SourceType { get; init; } = string.Empty;
    public Guid? SourceId { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
}

public record UpdateLIBRequest
{
    public Guid? FiscalYearId { get; init; }
    public Guid? FundSourceId { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ParentLIBId { get; init; }
    public string? Scope { get; init; }
    public string? Level { get; init; }
    public string? Name { get; init; }
    public string? LIBNumber { get; init; }
    public string? SourceType { get; init; }
    public Guid? SourceId { get; init; }
    public Guid? ConsolidatedIntoLIBId { get; init; }
    public decimal? TotalAmount { get; init; }
}

public record UpdateLIBStatusRequest
{
    public string Status { get; init; } = string.Empty;
}