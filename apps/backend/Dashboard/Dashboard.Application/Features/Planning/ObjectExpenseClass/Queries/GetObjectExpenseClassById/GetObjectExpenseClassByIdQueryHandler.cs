using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Queries.GetObjectExpenseClassById;

/// <summary>
/// Handler for GetObjectExpenseClassByIdQuery that retrieves a single Object Expense Class mapping from the database.
/// </summary>
public class GetObjectExpenseClassByIdQueryHandler : IRequestHandler<GetObjectExpenseClassByIdQuery, ApiResponse<ObjectExpenseClassResponse>>
{
    private readonly IUnitOfWork unitOfWork;

    public GetObjectExpenseClassByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ObjectExpenseClassResponse>> Handle(GetObjectExpenseClassByIdQuery request, CancellationToken cancellationToken)
    {
        var objectExpenseClass = await unitOfWork.ObjectExpenseClassRepository.GetByIdAsync(request.Id, cancellationToken);

        if (objectExpenseClass == null)
        {
            return ApiResponse<ObjectExpenseClassResponse>.Fail("Object expense class mapping not found.");
        }

        var response = new ObjectExpenseClassResponse
        {
            Id = objectExpenseClass.Id,
            ObjectId = objectExpenseClass.ObjectId,
            ExpenseClassId = objectExpenseClass.ExpenseClassId,
            Name = objectExpenseClass.Name,
            Description = objectExpenseClass.Description,
            IsActive = objectExpenseClass.IsActive,
            CreatedAt = objectExpenseClass.CreatedAt,
            CreatedBy = objectExpenseClass.CreatedBy,
            UpdatedAt = objectExpenseClass.UpdatedAt,
            UpdatedBy = objectExpenseClass.UpdatedBy
        };

        return ApiResponse<ObjectExpenseClassResponse>.Success(response);
    }
}
