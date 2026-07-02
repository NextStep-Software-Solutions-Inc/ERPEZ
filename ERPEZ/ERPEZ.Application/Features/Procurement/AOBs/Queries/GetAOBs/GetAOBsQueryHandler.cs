using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
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

        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
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
            ProcurementProjectIds = a.AOBProcurementProjectMappings.Select(m => m.ProcurementProjectId).ToList(),
            AwardedItems = a.AOBAwardedItems.Select(ai => new AOBAwardedItemResponse
            {
                Id = ai.Id,
                APPItemId = ai.APPItemId,
                APPItemName = ai.APPItem != null && ai.APPItem.PPMPItem != null ? ai.APPItem.PPMPItem.Name : string.Empty,
                WinningSupplierId = ai.WinningSupplierId,
                WinningSupplierName = ai.WinningSupplier != null ? ai.WinningSupplier.Name : string.Empty,
                AwardedUnitPrice = ai.AwardedUnitPrice,
                Score = ai.Score
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
