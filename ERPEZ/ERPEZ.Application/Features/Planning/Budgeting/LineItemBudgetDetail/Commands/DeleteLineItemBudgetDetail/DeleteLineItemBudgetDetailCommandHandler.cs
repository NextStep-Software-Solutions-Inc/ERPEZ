using ERPEZ.Domain.Interfaces;
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

        unitOfWork.LineItemBudgetDetailRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Line Item Budget Detail deleted successfully.");
    }
}

