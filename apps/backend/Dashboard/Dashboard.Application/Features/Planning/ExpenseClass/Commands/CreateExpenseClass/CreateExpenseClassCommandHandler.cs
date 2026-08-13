using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.CreateExpenseClass;

/// <summary>
/// Handler for CreateExpenseClassCommand that creates a new Expense Class in the database.
/// </summary>
public class CreateExpenseClassCommandHandler : IRequestHandler<CreateExpenseClassCommand, ApiResponse<Guid>>
{
    private readonly IUnitOfWork unitOfWork;

    public CreateExpenseClassCommandHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(CreateExpenseClassCommand request, CancellationToken cancellationToken)
    {
        var expenseClass = new Domain.Entities.Planning.ExpenseClass
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            Type = request.Type,
            IsActive = request.IsActive
        };

        await unitOfWork.ExpenseClassRepository.AddAsync(expenseClass, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(expenseClass.Id, "Expense class created successfully.");
    }
}
