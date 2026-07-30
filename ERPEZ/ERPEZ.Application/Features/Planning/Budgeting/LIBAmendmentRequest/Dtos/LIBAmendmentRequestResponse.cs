using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;

public record LIBAmendmentRequestResponse
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid ProposedLineItemBudgetId { get; init; }
    public LIBAmendmentReasonEnum Reason { get; init; }
    public string Justification { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public LIBAmendmentStatusEnum Status { get; init; }
    public LIBAmendmentRequestLIBResponse? LineItemBudget { get; init; }
    public LIBAmendmentRequestLIBResponse? ProposedLineItemBudget { get; init; }
}

public record LIBAmendmentRequestLIBResponse
{
    public Guid Id { get; init; }
    public string LIBNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Version { get; init; }
    public List<LIBNestedActivityResponse> Activities { get; init; } = [];
    public List<LIBNestedDetailResponse> OrphanDetails { get; init; } = [];
}

public record CreateLIBAmendmentRequestRequest
{
    public Guid LineItemBudgetId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string Justification { get; init; } = string.Empty;
}

public record UpdateLIBAmendmentRequestRequest
{
    public Guid LineItemBudgetId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string Justification { get; init; } = string.Empty;
}

public record ReturnLIBAmendmentRequestRequest
{
    public string Remarks { get; init; } = string.Empty;
}