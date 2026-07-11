using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Rules;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.DeleteLIBActivity;

public class DeleteLIBActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteLIBActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteLIBActivityCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Activity with ID {command.Id} not found.");

        // Add these lines:
        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(entity.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {entity.LineItemBudgetId} not found.");

        if (!LIBRules.IsEditable(lib.Status))
            throw new ValidationException("Activities can only be deleted from a Draft, Proposed, or Returned LIB.");

        // Existing delete logic continues:
        unitOfWork.LineItemBudgetActivityRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Activity deleted successfully.");
    }
}

