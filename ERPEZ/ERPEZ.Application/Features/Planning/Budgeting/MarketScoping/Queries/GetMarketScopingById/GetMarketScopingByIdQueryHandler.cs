using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingById;

public class GetMarketScopingByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingByIdQuery, ApiResponse<MarketScopingResponse>>
{
    public async Task<ApiResponse<MarketScopingResponse>> Handle(GetMarketScopingByIdQuery query, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"Market scoping with ID {query.Id} not found.");

        var response = new MarketScopingResponse
        {
            Id = marketScoping.Id,
            UserId = marketScoping.UserId,
            ProjectName = marketScoping.ProjectName,
            EstimatedBudget = marketScoping.EstimatedBudget,
            PeriodFrom = marketScoping.PeriodFrom,
            PeriodTo = marketScoping.PeriodTo,
            DeliveryDate = marketScoping.DeliveryDate,
            TargetLineItemBudgetActivityId = marketScoping.TargetLineItemBudgetActivityId,
            Status = marketScoping.Status.ToString(),
            CreatedAt = marketScoping.CreatedAt,
            CreatedBy = marketScoping.CreatedBy,
            UpdatedAt = marketScoping.UpdatedAt,
            UpdatedBy = marketScoping.UpdatedBy,
            ActivitiesConducted = marketScoping.ActivitiesConducted.Select(a => new MarketScopingActivityResponse
            {
                Id = a.Id,
                ActivityId = a.ActivityId,
                Attachments = a.Attachments.Select(att => new MarketScopingActivityAttachmentResponse
                {
                    Id = att.Id,
                    FileUrl = att.FileUrl,
                    FileName = att.FileName,
                }).ToList(),
            }).ToList(),
            ParameterEvaluations = marketScoping.ParameterEvaluations.Select(p => new MarketScopingParameterResponse
            {
                Id = p.Id,
                ParameterId = p.ParameterId,
                IsConsidered = p.IsConsidered,
                Remarks = p.Remarks,
                Attachments = p.Attachments.Select(att => new MarketScopingParameterAttachmentResponse
                {
                    Id = att.Id,
                    FileUrl = att.FileUrl,
                    FileName = att.FileName,
                }).ToList(),
            }).ToList(),
            StatusHistory = marketScoping.StatusHistory.OrderByDescending(h => h.ChangedAt).Select(h => new MarketScopingHistoryResponse
            {
                Id = h.Id,
                MarketScopingId = h.MarketScopingId,
                PreviousStatus = h.PreviousStatus.ToString(),
                NewStatus = h.NewStatus.ToString(),
                ChangeReason = h.ChangeReason,
                ChangedAt = h.ChangedAt,
                ChangedBy = h.ChangedBy,
            }).ToList(),
        };

        return new ApiResponse<MarketScopingResponse>
        {
            Succeeded = true,
            Data = response,
            Message = "Market scoping retrieved successfully."
        };
    }
}
