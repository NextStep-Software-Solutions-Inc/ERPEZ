using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItemById;

public class GetPPMPItemByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPPMPItemByIdQuery, ApiResponse<PPMPItemResponse>>
{
    public async Task<ApiResponse<PPMPItemResponse>> Handle(
        GetPPMPItemByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var ppmpItem = await unitOfWork.PPMPItemRepository.GetSingleAsync(
            unitOfWork.PPMPItemRepository.Query(x => x.Id == query.Id)
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
                    .ThenInclude(n => n!.UOM),
            cancellationToken);
        if (ppmpItem == null)
            throw new NotFoundException("PPMP Item not found.");

        return ApiResponse<PPMPItemResponse>.Success(PPMPResponseMapper.MapItem(ppmpItem));
    }
}
