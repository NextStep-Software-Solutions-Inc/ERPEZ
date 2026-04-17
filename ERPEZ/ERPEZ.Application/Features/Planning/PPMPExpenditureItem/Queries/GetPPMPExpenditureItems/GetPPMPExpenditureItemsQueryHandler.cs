using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItems;

public class GetPPMPExpenditureItemsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPPMPExpenditureItemsQuery, PaginatedApiResponse<PPMPExpenditureItemResponse>>
{
    public async Task<PaginatedApiResponse<PPMPExpenditureItemResponse>> Handle(GetPPMPExpenditureItemsQuery query, CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.PPMPExpenditureItem, PPMPExpenditureItemResponse>> projection = item => new PPMPExpenditureItemResponse
        {
            Id = item.Id,
            PPMPActivityId = item.PPMPActivityId,
            IsProcurable = item.IsProcurable,
            TotalCost = item.TotalCost,
            CreatedAt = item.CreatedAt,
            CreatedBy = item.CreatedBy,
            PPMPActivityName = item.PPMPActivity.LIBActivity.Name
        };

        var (items, totalCount) = await unitOfWork.PPMPExpenditureItemRepository.GetAllAsync(
            query.SieveModel,
            projection,
            cancellationToken);

        var pageNumber = query.SieveModel.Page ?? 1;
        var pageSize = query.SieveModel.PageSize ?? 10;

        return new PaginatedApiResponse<PPMPExpenditureItemResponse>(items.ToList(), totalCount, pageNumber, pageSize);
    }
}
