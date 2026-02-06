using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Category.Queries.GetCategoryById;

public class GetCategoryByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetCategoryByIdQuery, ApiResponse<CategoryResponse>>
{
    public async Task<ApiResponse<CategoryResponse>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await unitOfWork.CategoryRepository.FindAsync(
            t => t.Id == request.Id, 
            cancellationToken: cancellationToken) 
            ?? throw new NotFoundException("Category not found.");

        var result = new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Code = category.Code,
            CanHaveChildren = category.CanHaveChildren,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            CreatedBy = category.CreatedBy
        };

        return ApiResponse<CategoryResponse>.Success(result, "Retrieved successfully.");
    }
}
