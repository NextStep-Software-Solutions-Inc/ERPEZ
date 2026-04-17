using ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivities;

public class GetPPMPActivitiesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPPMPActivitiesQuery, PaginatedApiResponse<PPMPActivityResponse>>
{
    public async Task<PaginatedApiResponse<PPMPActivityResponse>> Handle(GetPPMPActivitiesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.PPMPActivity, PPMPActivityResponse>> projection = activity => new PPMPActivityResponse
        {
            Id = activity.Id,
            PPMPId = activity.PPMPId,
            LIBActivityId = activity.LIBActivityId,
            ActivityName = activity.LIBActivity.Name,
            TotalItems = activity.PPMPExpenditureItems
                .Where(expenditure => !expenditure.IsDeleted)
                .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                .Count(),
            TotalItemAllocations = activity.PPMPExpenditureItems
                .Where(expenditure => !expenditure.IsDeleted)
                .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                .SelectMany(item => item.PPMPItemAllocations.Where(allocation => !allocation.IsDeleted))
                .Count(),
            TotalAllocationQuantity = activity.PPMPExpenditureItems
                .Where(expenditure => !expenditure.IsDeleted)
                .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                .SelectMany(item => item.PPMPItemAllocations.Where(allocation => !allocation.IsDeleted))
                .Sum(allocation => (int?)allocation.Quantity) ?? 0,
            TotalAllocationAmount = activity.PPMPExpenditureItems
                .Where(expenditure => !expenditure.IsDeleted)
                .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                .SelectMany(item => item.PPMPItemAllocations.Where(allocation => !allocation.IsDeleted))
                .Sum(allocation => (decimal?)allocation.Amount) ?? 0m,
            CreatedAt = activity.CreatedAt,
            CreatedBy = activity.CreatedBy
        };

        var (items, totalCount) = await unitOfWork.PPMPActivityRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken);

        return new PaginatedApiResponse<PPMPActivityResponse>(items.ToList(), totalCount, query.PageNumber, query.PageSize);
    }
}
