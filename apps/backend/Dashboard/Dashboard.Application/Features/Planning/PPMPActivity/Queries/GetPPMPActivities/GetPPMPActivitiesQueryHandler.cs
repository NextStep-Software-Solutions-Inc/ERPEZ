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
            PAPCode = activity.LIBActivity.PAPCode,
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

        // ── Batch-load linked MSFs for all returned activities ─────────────────
        // One DB round-trip regardless of how many activities are returned.
        var libActivityIds = items.Select(a => a.LIBActivityId).Distinct().ToList();
        Dictionary<Guid, PPMPActivityMSFSummary> msfMap = [];
        if (libActivityIds.Count > 0)
        {
            var msfByActivity = await unitOfWork.MarketScopingRepository
                .GetByTargetLineItemBudgetActivityIdsAsync(libActivityIds, cancellationToken);

            msfMap = msfByActivity.ToDictionary(
                kvp => kvp.Key,
                kvp => new PPMPActivityMSFSummary
                {
                    Id = kvp.Value.Id,
                    ProjectName = kvp.Value.ProjectName,
                    EstimatedBudget = kvp.Value.EstimatedBudget,
                    Status = kvp.Value.Status.ToString(),
                });
        }

        // Merge LinkedMarketScoping into each activity response
        var enriched = items
            .Select(a => a with
            {
                LinkedMarketScoping = msfMap.TryGetValue(a.LIBActivityId, out var msf) ? msf : null
            })
            .ToList();

        return new PaginatedApiResponse<PPMPActivityResponse>(enriched, totalCount, query.PageNumber, query.PageSize);
    }
}
