using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.DeleteObjectExpenseClass;

/// <summary>
/// Handler for DeleteObjectExpenseClassCommand that removes an Object Expense Class mapping from the database.
/// </summary>
public class DeleteObjectExpenseClassCommandHandler : IRequestHandler<DeleteObjectExpenseClassCommand, ApiResponse<Unit>>
{
    private readonly IUnitOfWork unitOfWork;

    public DeleteObjectExpenseClassCommandHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Unit>> Handle(DeleteObjectExpenseClassCommand request, CancellationToken cancellationToken)
    {
        var objectExpenseClass = await unitOfWork.ObjectExpenseClassRepository.GetByIdAsync(request.Id, cancellationToken);

        if (objectExpenseClass == null)
        {
            return ApiResponse<Unit>.Fail("Object expense class mapping not found.");
        }

        unitOfWork.ObjectExpenseClassRepository.Remove(objectExpenseClass);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Object expense class mapping deleted successfully.");
    }
}
