using ERPEZ.Application.Features.Planning.ProcurementCategory.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Queries.GetProcurementCategories;

public class GetProcurementCategoriesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementCategoriesQuery, PaginatedApiResponse<ProcurementCategoryResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementCategoryResponse>> Handle(
        GetProcurementCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.ProcurementCategory, ProcurementCategoryResponse>> projection = x => new ProcurementCategoryResponse
        {
            Id = x.Id,
            Name = x.Name,
            Description = x.Description,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        var (categories, totalCount) = await unitOfWork.ProcurementCategoryRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ProcurementCategoryResponse>(
            [.. categories],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount);
    }
}
