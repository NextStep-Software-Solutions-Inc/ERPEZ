using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocations;

public class GetPPMPItemAllocationsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor) 
    : IRequestHandler<GetPPMPItemAllocationsQuery, PaginatedApiResponse<PPMPItemAllocationResponse>>
{
    public async Task<PaginatedApiResponse<PPMPItemAllocationResponse>> Handle(
        GetPPMPItemAllocationsQuery query, 
        CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.PPMPItemAllocationRepository.Query()
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity.PPMP)
                            .ThenInclude(ppmp => ppmp.Office)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity.PPMP)
                            .ThenInclude(ppmp => ppmp.FiscalYear)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity.PPMP)
                            .ThenInclude(ppmp => ppmp.FundSource)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.PPMPExpenditureItem)
                    .ThenInclude(expenditure => expenditure.PPMPActivity)
                        .ThenInclude(activity => activity.PPMP)
                            .ThenInclude(ppmp => ppmp.LineItemBudget)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.ProcurementMode)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.CSEItem)
            .Include(allocation => allocation.PPMPItem)
                .ThenInclude(item => item.NonCSEItem)
                    .ThenInclude(n => n!.UOM)
            .AsSplitQuery();

        var filteredQuery = sieveProcessor.Apply(query.SieveModel, baseQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery = sieveProcessor.Apply(query.SieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var allocations = await unitOfWork.PPMPItemAllocationRepository.ToListAsync(pagedQuery, cancellationToken);

        var pageNumber = query.SieveModel.Page ?? 1;
        var pageSize = query.SieveModel.PageSize ?? 10;

        return new PaginatedApiResponse<PPMPItemAllocationResponse>(allocations.Select(allocation => PPMPResponseMapper.MapAllocation(allocation)).ToList(), totalCount, pageNumber, pageSize);
    }
}
