using ERPEZ.Application.Features.Planning.SupplierCategory.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Queries.GetSupplierCategories;

public class GetSupplierCategoriesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierCategoriesQuery, PaginatedApiResponse<SupplierCategoryResponse>>
{
    public async Task<PaginatedApiResponse<SupplierCategoryResponse>> Handle(GetSupplierCategoriesQuery request, CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.SupplierCategory, SupplierCategoryResponse>> projection = sc => new SupplierCategoryResponse
        {
            Id = sc.Id,
            Name = sc.Name,
            Description = sc.Description,
            CreatedAt = sc.CreatedAt,
            UpdatedAt = sc.UpdatedAt
        };

        var (items, totalCount) = await unitOfWork.SupplierCategoryRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken
        );

        return new PaginatedApiResponse<SupplierCategoryResponse>(
            [.. items],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount
        );
    }
}
