using ERPEZ.Application.Features.Planning.ExpenseClass.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Queries.GetExpenseClassById;

/// <summary>
/// Handler for GetExpenseClassByIdQuery that retrieves a single Expense Class from the database.
/// </summary>
public class GetExpenseClassByIdQueryHandler : IRequestHandler<GetExpenseClassByIdQuery, ApiResponse<ExpenseClassResponse>>
{
    private readonly IUnitOfWork unitOfWork;

    public GetExpenseClassByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ExpenseClassResponse>> Handle(GetExpenseClassByIdQuery request, CancellationToken cancellationToken)
    {
        var expenseClass = await unitOfWork.ExpenseClassRepository.GetByIdAsync(request.Id, cancellationToken);

        if (expenseClass == null)
        {
            return ApiResponse<ExpenseClassResponse>.Fail("Expense class not found.");
        }

        var response = new ExpenseClassResponse
        {
            Id = expenseClass.Id,
            Name = expenseClass.Name,
            Code = expenseClass.Code,
            Description = expenseClass.Description,
            Type = expenseClass.Type,
            IsActive = expenseClass.IsActive,
            CreatedAt = expenseClass.CreatedAt,
            CreatedBy = expenseClass.CreatedBy,
            UpdatedAt = expenseClass.UpdatedAt,
            UpdatedBy = expenseClass.UpdatedBy
        };

        return ApiResponse<ExpenseClassResponse>.Success(response);
    }
}
