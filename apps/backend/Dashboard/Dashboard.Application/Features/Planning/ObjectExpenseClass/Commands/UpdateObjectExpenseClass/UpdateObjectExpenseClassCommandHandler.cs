using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.UpdateObjectExpenseClass;

/// <summary>
/// Handler for UpdateObjectExpenseClassCommand that updates an existing Object Expense Class mapping in the database.
/// </summary>
public class UpdateObjectExpenseClassCommandHandler : IRequestHandler<UpdateObjectExpenseClassCommand, ApiResponse<Unit>>
{
    private readonly IUnitOfWork unitOfWork;

    public UpdateObjectExpenseClassCommandHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Unit>> Handle(UpdateObjectExpenseClassCommand request, CancellationToken cancellationToken)
    {
        var objectExpenseClass = await unitOfWork.ObjectExpenseClassRepository.GetByIdAsync(request.Id, cancellationToken);

        if (objectExpenseClass == null)
        {
            return ApiResponse<Unit>.Fail("Object expense class mapping not found.");
        }

        objectExpenseClass.ObjectId = request.ObjectId;
        objectExpenseClass.ExpenseClassId = request.ExpenseClassId;
        objectExpenseClass.Name = request.Name;
        objectExpenseClass.Description = request.Description;
        objectExpenseClass.IsActive = request.IsActive;

        unitOfWork.ObjectExpenseClassRepository.Update(objectExpenseClass);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Object expense class mapping updated successfully.");
    }
}
