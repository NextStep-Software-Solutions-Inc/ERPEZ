using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjectById;

public class GetProcurementProjectByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementProjectByIdQuery, ApiResponse<ProcurementProjectDetailResponse>>
{
    public async Task<ApiResponse<ProcurementProjectDetailResponse>> Handle(GetProcurementProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementProjectRepository.Query()
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
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.APP)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.Office)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.PPMPItem)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(c => c!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.ProcurementMode)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.WhereasClauseItems)
                    .ThenInclude(item => item.BACResolutionWhereasClause)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.ClauseLinks)
                    .ThenInclude(cl => cl.ResolutionClause)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .Include(p => p.ApprovalEvents)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return ApiResponse<ProcurementProjectDetailResponse>.Fail("Procurement project not found.");
        }

        if (entity.ConsolidatedPRId.HasValue && (entity.ConsolidatedPR == null || entity.ConsolidatedPR.ConsolidatedPRItems == null || entity.ConsolidatedPR.ConsolidatedPRItems.Count == 0 || entity.ConsolidatedPR.ConsolidatedPRItems.Any(ci => ci.PRItem == null)))
        {
            var cprWithDetails = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(entity.ConsolidatedPRId.Value, cancellationToken);
            if (cprWithDetails != null)
            {
                entity.ConsolidatedPR = cprWithDetails;
            }
        }

        var projectDto = ProcurementProjectDetailResponse.DetailProjection.Compile()(entity);
        return ApiResponse<ProcurementProjectDetailResponse>.Success(projectDto);
    }
}
