using ERPEZ.Application.Features.Planning.ProcurementCategory.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Queries.GetProcurementCategoryById;

public class GetProcurementCategoryByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementCategoryByIdQuery, ApiResponse<ProcurementCategoryResponse>>
{
    public async Task<ApiResponse<ProcurementCategoryResponse>> Handle(
        GetProcurementCategoryByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement category not found.");

        var response = new ProcurementCategoryResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<ProcurementCategoryResponse>.Success(response);
    }
}
