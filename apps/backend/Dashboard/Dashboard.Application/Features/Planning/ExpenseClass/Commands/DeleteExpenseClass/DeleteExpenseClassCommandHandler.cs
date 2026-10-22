using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.DeleteExpenseClass;

/// <summary>
/// Handler for DeleteExpenseClassCommand that removes an Expense Class from the database.
/// </summary>
public class DeleteExpenseClassCommandHandler : IRequestHandler<DeleteExpenseClassCommand, ApiResponse<Unit>>
{
    private readonly IUnitOfWork unitOfWork;

    public DeleteExpenseClassCommandHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Unit>> Handle(DeleteExpenseClassCommand request, CancellationToken cancellationToken)
    {
        var expenseClass = await unitOfWork.ExpenseClassRepository.GetByIdAsync(request.Id, cancellationToken);

        if (expenseClass == null)
        {
            return ApiResponse<Unit>.Fail("Expense class not found.");
        }

        unitOfWork.ExpenseClassRepository.Remove(expenseClass);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Expense class deleted successfully.");
    }
}
