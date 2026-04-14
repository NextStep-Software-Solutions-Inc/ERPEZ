using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.CreateLIBAmendmentRequest;

public class CreateLIBAmendmentRequestCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateLIBAmendmentRequestCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateLIBAmendmentRequestCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ProposedLineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Proposed LIB with ID {request.ProposedLineItemBudgetId} not found.");

        if (request.LineItemBudgetId == request.ProposedLineItemBudgetId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Proposed LIB cannot be the same as the original LIB.");
        }

        var entity = new Domain.Entities.Planning.LIBAmendmentRequest
        {
            LineItemBudgetId = request.LineItemBudgetId,
            ProposedLineItemBudgetId = request.ProposedLineItemBudgetId,
            Reason = request.Reason.ToString(),
            Justification = request.Justification,
            Status = request.Status.ToString()
        };

        await unitOfWork.LIBAmendmentRequestRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "LIB Amendment Request created successfully.");
    }
}

