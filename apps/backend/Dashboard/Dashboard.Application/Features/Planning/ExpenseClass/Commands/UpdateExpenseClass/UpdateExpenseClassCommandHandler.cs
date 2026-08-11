using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.UpdateExpenseClass;

/// <summary>
/// Handler for UpdateExpenseClassCommand that updates an existing Expense Class in the database.
/// </summary>
public class UpdateExpenseClassCommandHandler : IRequestHandler<UpdateExpenseClassCommand, ApiResponse<Unit>>
{
    private readonly IUnitOfWork unitOfWork;

    public UpdateExpenseClassCommandHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Unit>> Handle(UpdateExpenseClassCommand request, CancellationToken cancellationToken)
    {
        var expenseClass = await unitOfWork.ExpenseClassRepository.GetByIdAsync(request.Id, cancellationToken);

        if (expenseClass == null)
        {
            return ApiResponse<Unit>.Fail("Expense class not found.");
        }

        expenseClass.Name = request.Name;
        expenseClass.Code = request.Code;
        expenseClass.Description = request.Description;
        expenseClass.Type = request.Type;
        expenseClass.IsActive = request.IsActive;

        unitOfWork.ExpenseClassRepository.Update(expenseClass);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Expense class updated successfully.");
    }
}
