using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.CreateObjectExpenseClass;

/// <summary>
/// Handler for CreateObjectExpenseClassCommand that creates a new Object Expense Class mapping in the database.
/// </summary>
public class CreateObjectExpenseClassCommandHandler : IRequestHandler<CreateObjectExpenseClassCommand, ApiResponse<Guid>>
{
    private readonly IUnitOfWork unitOfWork;

    public CreateObjectExpenseClassCommandHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateObjectExpenseClassCommand request, CancellationToken cancellationToken)
    {
        var objectExpenseClass = new Domain.Entities.Planning.ObjectExpenseClass
        {
            ObjectId = request.ObjectId,
            ExpenseClassId = request.ExpenseClassId,
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive
        };

        await unitOfWork.ObjectExpenseClassRepository.AddAsync(objectExpenseClass, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(objectExpenseClass.Id, "Object expense class mapping created successfully.");
    }
}
