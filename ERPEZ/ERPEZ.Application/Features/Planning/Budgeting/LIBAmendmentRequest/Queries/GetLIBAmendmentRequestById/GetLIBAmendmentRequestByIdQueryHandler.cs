using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequestById;

public class GetLIBAmendmentRequestByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBAmendmentRequestByIdQuery, ApiResponse<LIBAmendmentRequestResponse>>
{
    public async Task<ApiResponse<LIBAmendmentRequestResponse>> Handle(GetLIBAmendmentRequestByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {query.Id} not found.");

        var item = new LIBAmendmentRequestResponse
        {
            Id = entity.Id,
            LineItemBudgetId = entity.LineItemBudgetId,
            ProposedLineItemBudgetId = entity.ProposedLineItemBudgetId,
            Reason = Enum.Parse<LIBAmendmentReasonEnum>(entity.Reason, true),
            Justification = entity.Justification,
            Status = Enum.Parse<LIBAmendmentStatusEnum>(entity.Status, true),
            LineItemBudget = entity.LineItemBudget == null ? null : new LIBAmendmentRequestLIBResponse
            {
                Id = entity.LineItemBudget.Id,
                LIBNumber = entity.LineItemBudget.LIBNumber,
                Name = entity.LineItemBudget.Name ?? string.Empty,
                Version = entity.LineItemBudget.Version
            },
            ProposedLineItemBudget = entity.ProposedLineItemBudget == null ? null : new LIBAmendmentRequestLIBResponse
            {
                Id = entity.ProposedLineItemBudget.Id,
                LIBNumber = entity.ProposedLineItemBudget.LIBNumber,
                Name = entity.ProposedLineItemBudget.Name ?? string.Empty,
                Version = entity.ProposedLineItemBudget.Version
            }
        };

        return ApiResponse<LIBAmendmentRequestResponse>.Success(item);
    }
}

