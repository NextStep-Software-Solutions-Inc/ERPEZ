using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;

public record CreateLIBAmendmentRequestResponse(Guid AmendmentRequestId, Guid ProposedLineItemBudgetId);