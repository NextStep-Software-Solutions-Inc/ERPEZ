using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPs;

public class GetPPMPsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor) : IRequestHandler<GetPPMPsQuery, PaginatedApiResponse<PPMPDetailedResponse>>
{
    public async Task<PaginatedApiResponse<PPMPDetailedResponse>> Handle(GetPPMPsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var baseQuery = unitOfWork.PPMPRepository.Query()
            .Include(p => p.Office)
            .Include(p => p.FiscalYear)
            .Include(p => p.FundSource)
            .Include(p => p.LineItemBudget)
            .Include(p => p.ParentPPMP).ThenInclude(parent => parent!.Office)
            .Include(p => p.ParentPPMP).ThenInclude(parent => parent!.FiscalYear)
            .Include(p => p.ParentPPMP).ThenInclude(parent => parent!.FundSource)
            .Include(p => p.ParentPPMP).ThenInclude(parent => parent!.LineItemBudget)
            .Include(p => p.PPMPActivities).ThenInclude(pa => pa.LIBActivity)
            .Include(p => p.PPMPActivities).ThenInclude(pa => pa.PPMPExpenditureItems).ThenInclude(pei => pei.PPMPItems).ThenInclude(pi => pi.PPMPItemAllocations)
            .Include(p => p.PPMPActivities).ThenInclude(pa => pa.PPMPExpenditureItems).ThenInclude(pei => pei.PPMPItems).ThenInclude(pi => pi.ProcurementMode)
            .Include(p => p.PPMPActivities).ThenInclude(pa => pa.PPMPExpenditureItems).ThenInclude(pei => pei.PPMPItems).ThenInclude(pi => pi.CSEItem)
            .Include(p => p.PPMPActivities).ThenInclude(pa => pa.PPMPExpenditureItems).ThenInclude(pei => pei.PPMPItems).ThenInclude(pi => pi.NonCSEItem).ThenInclude(n => n!.UOM)
            .Include(p => p.ApprovalEvents)
            .Include(p => p.ChildPPMPs).ThenInclude(child => child.Office)
            .Include(p => p.ChildPPMPs).ThenInclude(child => child.FiscalYear)
            .Include(p => p.ChildPPMPs).ThenInclude(child => child.FundSource)
            .Include(p => p.ChildPPMPs).ThenInclude(child => child.LineItemBudget)
            .AsSplitQuery();

        var filteredQuery = sieveProcessor.Apply(sieveModel, baseQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await unitOfWork.PPMPRepository.ToListAsync(pagedQuery, cancellationToken);

        return new PaginatedApiResponse<PPMPDetailedResponse>(
            entities.Select(entity => PPMPResponseMapper.MapDetailed(entity)).ToList(),
            totalCount,
            query.PageNumber,
            query.PageSize);
    }
}
