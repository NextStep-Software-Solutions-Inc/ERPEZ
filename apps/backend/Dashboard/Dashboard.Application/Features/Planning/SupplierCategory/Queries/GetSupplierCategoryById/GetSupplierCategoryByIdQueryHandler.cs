using ERPEZ.Application.Features.Planning.SupplierCategory.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Queries.GetSupplierCategoryById;

public class GetSupplierCategoryByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierCategoryByIdQuery, ApiResponse<SupplierCategoryResponse>>
{
    public async Task<ApiResponse<SupplierCategoryResponse>> Handle(GetSupplierCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        var response = new SupplierCategoryResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<SupplierCategoryResponse>.Success(response, "Supplier category retrieved successfully.");
    }
}
