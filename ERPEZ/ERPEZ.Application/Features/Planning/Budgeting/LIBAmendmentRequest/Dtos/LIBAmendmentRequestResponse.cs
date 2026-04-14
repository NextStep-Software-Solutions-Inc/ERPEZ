using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;

public record LIBAmendmentRequestResponse
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid ProposedLineItemBudgetId { get; init; }
    public LIBAmendmentReasonEnum Reason { get; init; }
    public string Justification { get; init; } = string.Empty;
    public LIBAmendmentStatusEnum Status { get; init; }
}

public record CreateLIBAmendmentRequestRequest
{
    public Guid LineItemBudgetId { get; init; }
    public Guid ProposedLineItemBudgetId { get; init; }
    public LIBAmendmentReasonEnum Reason { get; init; }
    public string Justification { get; init; } = string.Empty;
    public LIBAmendmentStatusEnum Status { get; init; }
}

public record UpdateLIBAmendmentRequestRequest
{
    public Guid Id { get; init; }
    public Guid LineItemBudgetId { get; init; }
    public Guid ProposedLineItemBudgetId { get; init; }
    public LIBAmendmentReasonEnum Reason { get; init; }
    public string Justification { get; init; } = string.Empty;
    public LIBAmendmentStatusEnum Status { get; init; }
}