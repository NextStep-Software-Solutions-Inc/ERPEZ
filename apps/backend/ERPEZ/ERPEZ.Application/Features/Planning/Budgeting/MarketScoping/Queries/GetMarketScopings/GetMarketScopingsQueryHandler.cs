using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopings;

public class GetMarketScopingsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingsQuery, PaginatedApiResponse<MarketScopingResponse>>
{
    public async Task<PaginatedApiResponse<MarketScopingResponse>> Handle(GetMarketScopingsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts,
        };

        var (marketScopings, totalCount) = await unitOfWork.MarketScopingRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var responses = marketScopings.Select(ms => new MarketScopingResponse
        {
            Id = ms.Id,
            UserId = ms.UserId,
            ProjectName = ms.ProjectName,
            EstimatedBudget = ms.EstimatedBudget,
            PeriodFrom = ms.PeriodFrom,
            PeriodTo = ms.PeriodTo,
            DeliveryDate = ms.DeliveryDate,
            TargetLineItemBudgetActivityId = ms.TargetLineItemBudgetActivityId,
            Status = ms.Status.ToString(),
            SignedDocumentFileId = ms.SignedDocumentFileId,
            AgencyName = ms.User?.Office?.Organization?.Name ?? string.Empty,
            DepartmentUnit = ms.User?.Office?.Name ?? string.Empty,
            RepresentativeName = ms.User != null ? $"{ms.User.FirstName} {ms.User.LastName}" : string.Empty,
            RepresentativeDesignation = ms.User?.PersonnelPositions?.FirstOrDefault(pp => pp.IsActive)?.Position?.Title ?? string.Empty,
            CreatedAt = ms.CreatedAt,
            CreatedBy = ms.CreatedBy,
            UpdatedAt = ms.UpdatedAt,
            UpdatedBy = ms.UpdatedBy,
            ActivitiesConducted = ms.ActivitiesConducted.Select(a => new MarketScopingActivityResponse
            {
                Id = a.Id,
                ActivityId = a.ActivityId,
                ActivityType = a.ActivitySettings?.ActivityType ?? string.Empty,
                Label = a.ActivitySettings?.Label ?? string.Empty,
                Description = a.ActivitySettings?.Description ?? string.Empty,
                Attachments = a.Attachments.Select(att => new MarketScopingActivityAttachmentResponse
                {
                    Id = att.Id,
                    FileUrl = att.FileUrl,
                    FileName = att.FileName,
                }).ToList(),
            }).ToList(),
            ParameterEvaluations = ms.ParameterEvaluations.Select(p => new MarketScopingParameterResponse
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
                    FileUrl = att.FileUrl,
                    FileName = att.FileName,
                }).ToList(),
            }).ToList(),
        }).ToList();

        return new PaginatedApiResponse<MarketScopingResponse>(responses, query.PageNumber, query.PageSize, totalCount);
    }
}
