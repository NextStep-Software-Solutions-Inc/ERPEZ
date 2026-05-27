using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingActivities;

public class GetMarketScopingActivitiesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingActivitiesQuery, PaginatedApiResponse<MarketScopingActivityResponse>>
{
    public async Task<PaginatedApiResponse<MarketScopingActivityResponse>> Handle(
        GetMarketScopingActivitiesQuery request,
        CancellationToken cancellationToken)
    {
        _ = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {request.MarketScopingId} not found.");

        var query = unitOfWork.MarketScopingRepository.Query()
            .Where(ms => ms.Id == request.MarketScopingId)
            .SelectMany(ms => ms.ActivitiesConducted);

        var totalCount = query.Count();
        var activities = query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var response = activities.Select(a => new MarketScopingActivityResponse
        {
            Id = a.Id,
            ActivityId = a.ActivityId,
            Attachments = a.Attachments.Select(att => new MarketScopingActivityAttachmentResponse
            {
                Id = att.Id,
                FileUrl = att.FileUrl,
                FileName = att.FileName,
            }).ToList(),
        }).ToList();

        return new PaginatedApiResponse<MarketScopingActivityResponse>(
            response,
            request.PageNumber,
            request.PageSize,
            totalCount
        );
    }
}
