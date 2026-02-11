using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Category.Queries.GetCategories;

public class GetCategoriesQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetCategoriesQuery, PaginatedApiResponse<CategoryResponse>>
{
    public async Task<PaginatedApiResponse<CategoryResponse>> Handle(GetCategoriesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.Category, CategoryResponse>> projection = c => new CategoryResponse
        {
            Id = c.Id,
            Name = c.Name,
            Code = c.Code,
            CanHaveChildren = c.CanHaveChildren,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt,
            CreatedBy = c.CreatedBy
        };

        var (categories, totalCount) = await unitOfWork.CategoryRepository.GetAllAsync(
            sieveModel, 
            projection, 
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<CategoryResponse>(
            [.. categories],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
