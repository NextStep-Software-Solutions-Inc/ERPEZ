using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Rules;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.DeleteLineItemBudgetDetail;

public class DeleteLineItemBudgetDetailCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteLineItemBudgetDetailCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteLineItemBudgetDetailCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetDetailRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Detail with ID {command.Id} not found.");

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(entity.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {entity.LineItemBudgetId} not found.");

        if (!LIBRules.IsEditable(lib.Status))
            throw new ValidationException("Line item details can only be deleted from a Draft, Proposed, or Returned LIB.");

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            unitOfWork.LineItemBudgetDetailRepository.Remove(entity);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Line Item Budget Detail deleted successfully.");
    }
}

