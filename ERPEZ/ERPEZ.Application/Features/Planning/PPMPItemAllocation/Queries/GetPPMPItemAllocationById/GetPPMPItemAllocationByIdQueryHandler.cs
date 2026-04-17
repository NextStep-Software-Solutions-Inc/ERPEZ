using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocationById;

public class GetPPMPItemAllocationByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPPMPItemAllocationByIdQuery, ApiResponse<PPMPItemAllocationResponse>>
{
    public async Task<ApiResponse<PPMPItemAllocationResponse>> Handle(
        GetPPMPItemAllocationByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var allocation = await unitOfWork.PPMPItemAllocationRepository.GetSingleAsync(
            unitOfWork.PPMPItemAllocationRepository.Query(x => x.Id == query.Id)
                .Include(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.PPMPExpenditureItem)
                        .ThenInclude(expenditure => expenditure.PPMPActivity)
                            .ThenInclude(activity => activity.PPMP)
                                .ThenInclude(ppmp => ppmp.Office)
                .Include(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.PPMPExpenditureItem)
                        .ThenInclude(expenditure => expenditure.PPMPActivity)
                            .ThenInclude(activity => activity.PPMP)
                                .ThenInclude(ppmp => ppmp.FiscalYear)
                .Include(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.PPMPExpenditureItem)
                        .ThenInclude(expenditure => expenditure.PPMPActivity)
                            .ThenInclude(activity => activity.PPMP)
                                .ThenInclude(ppmp => ppmp.FundSource)
                .Include(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.PPMPExpenditureItem)
                        .ThenInclude(expenditure => expenditure.PPMPActivity)
                            .ThenInclude(activity => activity.PPMP)
                                .ThenInclude(ppmp => ppmp.LineItemBudget)
                .Include(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.ProcurementMode)
                .Include(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.CSEItem)
                .Include(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.NonCSEItem)
                        .ThenInclude(n => n!.UOM),
            cancellationToken);
        if (allocation == null)
            throw new NotFoundException("PPMP Item Allocation not found.");

        return ApiResponse<PPMPItemAllocationResponse>.Success(PPMPResponseMapper.MapAllocation(allocation));
    }
}
