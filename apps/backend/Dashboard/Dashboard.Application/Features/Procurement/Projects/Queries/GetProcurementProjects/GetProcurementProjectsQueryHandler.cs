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
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.WhereasClauseItems)
                    .ThenInclude(item => item.BACResolutionWhereasClause)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        // Apply custom filters for ModeOfProcurement - REMOVED

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

        return new PaginatedApiResponse<ProcurementProjectResponse>(
            entities,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
