using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItems;

public class GetPPMPItemsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor) 
    : IRequestHandler<GetPPMPItemsQuery, PaginatedApiResponse<PPMPItemResponse>>
{
    public async Task<PaginatedApiResponse<PPMPItemResponse>> Handle(
        GetPPMPItemsQuery query, 
        CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.PPMPItemRepository.Query()
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.Office)
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.FiscalYear)
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.FundSource)
            .Include(item => item.PPMPExpenditureItem)
                .ThenInclude(expenditure => expenditure.PPMPActivity)
                    .ThenInclude(activity => activity.PPMP)
                        .ThenInclude(ppmp => ppmp.LineItemBudget)
            .Include(item => item.PPMPItemAllocations)
            .Include(item => item.ProcurementMode)
            .Include(item => item.CSEItem)
            .Include(item => item.NonCSEItem)
                .ThenInclude(n => n!.UOM)
            .AsSplitQuery();

        var filteredQuery = sieveProcessor.Apply(query.SieveModel, baseQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery = sieveProcessor.Apply(query.SieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var items = await unitOfWork.PPMPItemRepository.ToListAsync(pagedQuery, cancellationToken);

        var pageNumber = query.SieveModel.Page ?? 1;
        var pageSize = query.SieveModel.PageSize ?? 10;

        return new PaginatedApiResponse<PPMPItemResponse>(items.Select(item => PPMPResponseMapper.MapItem(item)).ToList(), totalCount, pageNumber, pageSize);
    }
}
