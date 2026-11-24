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
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
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
            TargetLineItemBudgetId = marketScoping.TargetLineItemBudgetId ?? marketScoping.TargetLineItemBudgetActivity?.LineItemBudgetId,
            TargetLineItemBudgetNumber = marketScoping.TargetLineItemBudget?.LIBNumber ?? marketScoping.TargetLineItemBudgetActivity?.LineItemBudget?.LIBNumber,
            TargetLineItemBudgetActivityId = marketScoping.TargetLineItemBudgetActivityId,
            TargetLineItemBudgetActivityName = marketScoping.TargetLineItemBudgetActivity?.Name,
            Status = marketScoping.Status.ToString(),
            SignedDocumentFileId = marketScoping.SignedDocumentFileId,
            AgencyName = marketScoping.User?.Office?.Organization?.Name ?? string.Empty,
            DepartmentUnit = marketScoping.User?.Office?.Name ?? string.Empty,
            RepresentativeName = marketScoping.User != null ? $"{marketScoping.User.FirstName} {marketScoping.User.LastName}" : string.Empty,
            RepresentativeDesignation = marketScoping.User?.PersonnelPositions?.FirstOrDefault(pp => pp.IsActive)?.Position?.Title ?? string.Empty,
            CreatedAt = marketScoping.CreatedAt,
            CreatedBy = marketScoping.CreatedBy,
            UpdatedAt = marketScoping.UpdatedAt,
            UpdatedBy = marketScoping.UpdatedBy,
            ActivitiesConducted = marketScoping.ActivitiesConducted.Select(a => new MarketScopingActivityResponse
            {
                Id = a.Id,
                ActivityId = a.ActivityId,
                ActivityType = a.ActivitySettings?.ActivityType ?? string.Empty,
                Label = a.ActivitySettings?.Label ?? string.Empty,
                Description = a.ActivitySettings?.Description ?? string.Empty,
                Attachments = a.Attachments.Select(att => new MarketScopingActivityAttachmentResponse
                {
                    Id = att.Id,
                    FileUrl = FormatRoutableFileUrl(att.FileUrl),
                    FileName = att.FileName,
                }).ToList(),
            }).ToList(),
            ParameterEvaluations = marketScoping.ParameterEvaluations.Select(p => new MarketScopingParameterResponse
            {
                Id = p.Id,
                ParameterId = p.ParameterId,
                ParameterName = p.ParameterSettings?.Name ?? string.Empty,
                DisplayName = p.ParameterSettings?.Name ?? string.Empty,
                GuidedQuestion = p.ParameterSettings?.GuidedQuestion ?? string.Empty,
                IsConsidered = p.IsConsidered,
                Remarks = p.Remarks,
                Attachments = p.Attachments.Select(att => new MarketScopingParameterAttachmentResponse
                {
                    Id = att.Id,
                    FileUrl = FormatRoutableFileUrl(att.FileUrl),
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

    private static string FormatRoutableFileUrl(string rawFileUrl)
    {
        if (string.IsNullOrWhiteSpace(rawFileUrl)) return string.Empty;
        if (rawFileUrl.StartsWith("/files/download/")) return rawFileUrl;
        if (Guid.TryParse(rawFileUrl, out var fileId))
        {
            return $"/files/download/{fileId}";
        }
        return rawFileUrl;
    }
}
