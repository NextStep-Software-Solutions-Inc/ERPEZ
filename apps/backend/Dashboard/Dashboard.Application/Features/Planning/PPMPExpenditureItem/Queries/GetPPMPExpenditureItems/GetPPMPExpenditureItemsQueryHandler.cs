using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItems;

public class GetPPMPExpenditureItemsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPPMPExpenditureItemsQuery, PaginatedApiResponse<PPMPExpenditureItemResponse>>
{
    public async Task<PaginatedApiResponse<PPMPExpenditureItemResponse>> Handle(GetPPMPExpenditureItemsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.PPMPExpenditureItem, PPMPExpenditureItemResponse>> projection = item => new PPMPExpenditureItemResponse
        {
            Id = item.Id,
            PPMPId = item.PPMPId,
            PPMPActivityId = item.PPMPActivityId,
            LineItemBudgetDetailId = item.LineItemBudgetDetailId,
            IsProcurable = item.IsProcurable,
            TotalCost = item.TotalCost,
            CreatedAt = item.CreatedAt,
            CreatedBy = item.CreatedBy,
            PPMPActivityName = item.PPMPActivity != null ? item.PPMPActivity.LIBActivity.Name : null
        };
        var (items, totalCount) = await unitOfWork.PPMPExpenditureItemRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken);

        return new PaginatedApiResponse<PPMPExpenditureItemResponse>(items.ToList(), totalCount, query.PageNumber, query.PageSize);
    }
}
