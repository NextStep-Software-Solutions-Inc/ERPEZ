using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.UpdateLIBAmendmentRequest;

public class UpdateLIBAmendmentRequestCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateLIBAmendmentRequestCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateLIBAmendmentRequestCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {request.Id} not found.");

        _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.ProposedLineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Proposed LIB with ID {request.ProposedLineItemBudgetId} not found.");

        if (request.LineItemBudgetId == request.ProposedLineItemBudgetId)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Proposed LIB cannot be the same as the original LIB.");
        }

        entity.LineItemBudgetId = request.LineItemBudgetId;
        entity.ProposedLineItemBudgetId = request.ProposedLineItemBudgetId;
        entity.Reason = BudgetingEnumMapper.ToEntityValue(request.Reason);
        entity.Justification = request.Justification;
        entity.Status = BudgetingEnumMapper.ToEntityValue(request.Status);

        unitOfWork.LIBAmendmentRequestRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Amendment Request updated successfully.");
    }
}

