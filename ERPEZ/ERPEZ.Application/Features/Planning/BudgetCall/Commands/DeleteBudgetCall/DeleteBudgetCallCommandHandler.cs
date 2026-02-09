using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.DeleteBudgetCall;

public class DeleteBudgetCallCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteBudgetCallCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteBudgetCallCommand request, CancellationToken cancellationToken)
    {
        var budgetCall = await unitOfWork.BudgetCallRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Budget call not found.");

        unitOfWork.BudgetCallRepository.Remove(budgetCall);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Budget call with ID {request.Id} deleted successfully.");
    }
}
