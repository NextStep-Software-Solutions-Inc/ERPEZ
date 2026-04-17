using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPsByOffice;

public class GetPPMPsByOfficeQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPPMPsByOfficeQuery, ApiResponse<List<PPMPDetailedResponse>>>
{
    public async Task<ApiResponse<List<PPMPDetailedResponse>>> Handle(GetPPMPsByOfficeQuery query, CancellationToken cancellationToken)
    {
        var ppmpsQuery = unitOfWork.PPMPRepository
            .Query(p => p.OfficeId == query.OfficeId)
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
        
        var ppmps = await unitOfWork.PPMPRepository.ToListAsync(ppmpsQuery, cancellationToken);

        return ApiResponse<List<PPMPDetailedResponse>>.Success(ppmps.Select(ppmp => PPMPResponseMapper.MapDetailed(ppmp)).ToList());
    }
}
