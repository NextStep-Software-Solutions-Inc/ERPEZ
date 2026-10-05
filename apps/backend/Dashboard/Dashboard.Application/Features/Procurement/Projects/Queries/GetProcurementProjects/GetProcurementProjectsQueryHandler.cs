using System.Linq.Expressions;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Services;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjects;

public class GetProcurementProjectsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetProcurementProjectsQuery, PaginatedApiResponse<ProcurementProjectResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementProjectResponse>> Handle(GetProcurementProjectsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.EndUserRepresentative)
            .Include(p => p.TechRepresentative)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.APP)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.ProcurementMode)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.FundSource)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.Office)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.PPMPItem)
                    .ThenInclude(pi => pi!.PPMPItemAllocations)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.PPMPItem)
                    .ThenInclude(pi => pi!.ProcurementMode)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.PPMPItem)
                    .ThenInclude(pi => pi!.APPProcurementSchedules)
                        .ThenInclude(s => s.ProcurementActivityType)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(c => c!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.ProcurementMode)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(c => c!.RFQs)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.WhereasClauseItems)
                    .ThenInclude(item => item.BACResolutionWhereasClause)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (query.HasRFQ == true)
        {
            dbQuery = dbQuery.Where(p => p.ConsolidatedPR != null && p.ConsolidatedPR.RFQs.Any(r => !r.IsDeleted));
        }

        if (query.HasApprovedRFQ == true)
        {
            dbQuery = dbQuery.Where(p => p.ConsolidatedPR != null && p.ConsolidatedPR.RFQs.Any(r => !r.IsDeleted && r.Status == ERPEZ.Domain.Enums.StatusEnum.Approved));
        }

        if (query.ForSupplierPortal == true)
        {
            var allowedPortalStatuses = new[] { "Posted", "ROUTED_TO_PORTAL", "Active", "Published", "Open", "ClosingSoon", "Closed" };
            dbQuery = dbQuery.Where(p => allowedPortalStatuses.Contains(p.Status));
        }

        if (query.UnlinkedDirectContracting == true)
        {
            dbQuery = dbQuery.Where(p => !p.DirectContractings.Any(dc => !dc.IsDeleted) && p.ABC > 0);
        }

        if (string.IsNullOrWhiteSpace(query.Sorts))
        {
            dbQuery = dbQuery.OrderByDescending(p => p.CreatedAt);
        }

        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var rawEntities = await paginatedQuery.ToListAsync(cancellationToken);
        var projectionFunc = ProcurementProjectResponse.Projection.Compile();
        var entities = rawEntities.Select(projectionFunc).ToList();

        var projectIds = entities.Select(p => p.Id).ToList();
        var applicationCounts = await unitOfWork.PublicSupplierApplicationRepository.Query()
            .Where(a => projectIds.Contains(a.ProcurementProjectId) && !a.IsDeleted)
            .GroupBy(a => a.ProcurementProjectId)
            .Select(g => new { ProjectId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.ProjectId, g => g.Count, cancellationToken);

        var cprIds = entities.Where(e => e.ConsolidatedPRId.HasValue).Select(e => e.ConsolidatedPRId!.Value).ToList();
        var rfqBidCounts = await unitOfWork.SupplierBidRepository.Query()
            .Where(b => b.RFQ != null && b.RFQ.ConsolidatedPRId.HasValue && cprIds.Contains(b.RFQ.ConsolidatedPRId.Value) && !b.IsDeleted)
            .GroupBy(b => b.RFQ.ConsolidatedPRId!.Value)
            .Select(g => new { ConsolidatedPRId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.ConsolidatedPRId, g => g.Count, cancellationToken);

        entities = entities.Select(e => e with
        {
            ApplicantCount = applicationCounts.GetValueOrDefault(e.Id, 0) +
                (e.ConsolidatedPRId.HasValue ? rfqBidCounts.GetValueOrDefault(e.ConsolidatedPRId.Value, 0) : 0)
        }).ToList();

        return new PaginatedApiResponse<ProcurementProjectResponse>(
            entities,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
