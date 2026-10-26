using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Queries.GetNonCSEItems;

public class GetNonCSEItemsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetNonCSEItemsQuery, PaginatedApiResponse<NonCSEItemResponse>>
{
    public async Task<PaginatedApiResponse<NonCSEItemResponse>> Handle(
        GetNonCSEItemsQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.NonCSEItem, NonCSEItemResponse>> projection = 
            item => new NonCSEItemResponse
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                UOMId = item.UOMId,
                UOMName = item.UOM != null ? item.UOM.Name : null,
                ProcurementCategoryId = item.ItemRequest != null ? item.ItemRequest.ProcurementCategoryId : null,
                ProcurementCategoryName = item.ItemRequest != null && item.ItemRequest.ProcurementCategory != null ? item.ItemRequest.ProcurementCategory.Name : (!string.IsNullOrEmpty(item.Type) ? item.Type : null),
                ItemRequestId = item.ItemRequestId,
                ProductCode = item.ProductCode,
                CurrentPrice = item.CurrentPrice,
                Remarks = item.Remarks,
                CreatedAt = item.CreatedAt,
                CreatedBy = item.CreatedBy
            };

        var (items, totalCount) = await unitOfWork.NonCSEItemRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken);

        return new PaginatedApiResponse<NonCSEItemResponse>(items.ToList(), totalCount, query.PageNumber, query.PageSize);
    }
}
