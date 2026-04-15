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

        var entity = await unitOfWork.LIBAmendmentRequestRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Amendment Request with ID {command.Id} not found.");

        _ = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        entity.LineItemBudgetId = request.LineItemBudgetId;
        entity.Reason = request.Reason;
        entity.Justification = request.Justification;

        unitOfWork.LIBAmendmentRequestRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Amendment Request updated successfully.");
    }
}

