using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjectById;

public class GetObjectByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetObjectByIdQuery, ApiResponse<ObjectDetailedResponse>>
{
    public async Task<ApiResponse<ObjectDetailedResponse>> Handle(GetObjectByIdQuery request, CancellationToken cancellationToken)
    {
        var objectEntity = await unitOfWork.ObjectRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        // Get the first active ObjectExpenseClass if exists
        var objectExpenseClass = await unitOfWork.ObjectExpenseClassRepository.FindAsync(
            oec => oec.ObjectId == request.Id && oec.IsActive,
            cancellationToken);

        var response = new ObjectDetailedResponse
        {
            Id = objectEntity.Id,
            Name = objectEntity.Name,
            Description = null,
            Code = objectEntity.Code,
            FiscalYearId = objectEntity.FiscalYearId,
            ExpenseClassId = objectExpenseClass?.ExpenseClassId,
            CreatedAt = objectEntity.CreatedAt,
            CreatedBy = objectEntity.CreatedBy,
            UpdatedAt = objectEntity.UpdatedAt,
            UpdatedBy = objectEntity.UpdatedBy
        };

        return ApiResponse<ObjectDetailedResponse>.Success(response, "Retrieved successfully");
    }
}
