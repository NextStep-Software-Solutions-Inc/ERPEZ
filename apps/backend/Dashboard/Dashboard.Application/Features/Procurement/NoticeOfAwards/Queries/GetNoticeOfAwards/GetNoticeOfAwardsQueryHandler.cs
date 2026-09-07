using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwards;

public class GetNoticeOfAwardsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetNoticeOfAwardsQuery, PaginatedApiResponse<NoticeOfAwardListDto>>
{
    public async Task<PaginatedApiResponse<NoticeOfAwardListDto>> Handle(GetNoticeOfAwardsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.NoticeOfAwardRepository.QueryWithDetails();

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<NoticeOfAwardStatus>(query.Status, true, out var parsedStatus))
        {
            dbQuery = dbQuery.Where(n => n.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            dbQuery = dbQuery.Where(n =>
                n.NOANumber.ToLower().Contains(term) ||
                n.Description.ToLower().Contains(term) ||
                (n.Supplier != null && n.Supplier.Name.ToLower().Contains(term)) ||
                (n.BACResolution != null && n.BACResolution.ResolutionNumber.ToLower().Contains(term)) ||
                (n.ProcurementProject != null && n.ProcurementProject.Title.ToLower().Contains(term))
            );
        }

        var page = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var sieveModel = new SieveModel
        {
            PageSize = pageSize,
            Page = page,
            Filters = query.Filters,
            Sorts = string.IsNullOrWhiteSpace(query.Sorts) ? "-CreatedAt" : query.Sorts
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await unitOfWork.NoticeOfAwardRepository.ToListAsync(filteredQuery, cancellationToken);
        var count = totalCount.Count;

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await unitOfWork.NoticeOfAwardRepository.ToListAsync(paginatedQuery, cancellationToken);

        var allMilestones = await unitOfWork.NoticeOfAwardMilestoneRepository.ToListAsync(
            unitOfWork.NoticeOfAwardMilestoneRepository.Query(m => entities.Select(e => e.Id).Contains(m.NoticeOfAwardId)),
            cancellationToken
        );

        var dtoList = entities.Select(noa =>
        {
            var noaMilestones = allMilestones.Where(m => m.NoticeOfAwardId == noa.Id).ToList();
            var supplierName = noa.Supplier?.Name ?? string.Empty;
            var bacResNumber = noa.BACResolution?.ResolutionNumber ?? string.Empty;
            var projectName = noa.ProcurementProject?.Title ?? string.Empty;
            var prNumber = !string.IsNullOrWhiteSpace(noa.ProcurementProject?.ConsolidatedPR?.CPRNumber)
                ? noa.ProcurementProject.ConsolidatedPR.CPRNumber
                : (noa.ProcurementProject?.APPItem?.APP?.APPNumber ?? string.Empty);

            return new NoticeOfAwardListDto
            {
                Id = noa.Id,
                NOANumber = noa.NOANumber,
                Date = noa.NOADate,
                DateBid = noa.BidDate,
                Description = noa.Description,
                Type = noa.ProcurementType,
                Status = noa.Status,
                TotalAmount = noa.AwardedAmount,
                SupplierId = noa.SupplierId,
                SupplierName = supplierName,
                BACResolutionId = noa.BACResolutionId,
                BACResolutionNumber = bacResNumber,
                PRNumber = prNumber,
                ProjectName = projectName,
                CreatedAt = noa.CreatedAt,
                UpdatedAt = noa.UpdatedAt,
                SlaState = NoticeOfAwardSlaCalculator.CalculateSla(noa, noaMilestones)
            };
        }).ToList();

        return new PaginatedApiResponse<NoticeOfAwardListDto>(
            dtoList,
            query.PageNumber,
            query.PageSize,
            count
        );
    }
}
