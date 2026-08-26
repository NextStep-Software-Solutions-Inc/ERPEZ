using System.Linq.Expressions;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBs;

public class GetAOBsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetAOBsQuery, PaginatedApiResponse<AOBResponse>>
{
    public async Task<PaginatedApiResponse<AOBResponse>> Handle(GetAOBsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.AOBRepository.Query()
            .Where(a => !a.IsDeleted)
            .AsQueryable();

        var page = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var sieveModel = new SieveModel
        {
            PageSize = pageSize,
            Page = page,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<AOB, AOBResponse>> projection = a => new AOBResponse
        {
            Id = a.Id,
            AOBNumber = a.AOBNumber,
            Description = a.Description,
            AwardCriterion = a.AwardCriterion,
            AOBDate = a.AOBDate,
            OpeningDate = a.OpeningDate,
            Status = a.Status,
            SubmittedBy = a.SubmittedBy,
            SubmittedAt = a.SubmittedAt,
            ApprovedBy = a.ApprovedBy,
            ApprovedAt = a.ApprovedAt,
            SignedDocumentUrl = a.SignedDocumentUrl,
            Remarks = a.Remarks,
            RFQIds = a.AOBRFQMappings.Select(m => m.RFQId).ToList(),
            AwardedItems = a.AOBAwardedItems.Select(ai => new AOBAwardedItemResponse
            {
                Id = ai.Id,
                RFQItemId = ai.RFQItemId,
                ItemName = ai.RFQItem != null ? ai.RFQItem.ItemNameSnapshot : string.Empty,
                WinningSupplierId = ai.WinningSupplierId,
                WinningSupplierName = ai.WinningSupplier != null ? ai.WinningSupplier.Name : string.Empty,
                AwardedUnitPrice = ai.AwardedUnitPrice,
                AwardedQuantity = ai.AwardedQuantity,
                TotalAwardedAmount = ai.TotalAwardedAmount,
                Score = ai.Score,
                AwardReason = ai.AwardReason,
                PurchaseOrderId = ai.PurchaseOrderId
            }).ToList()
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await paginatedQuery.Select(projection).ToListAsync(cancellationToken);

        return new PaginatedApiResponse<AOBResponse>(
            [.. entities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
