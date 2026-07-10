using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjectById;

public class GetProcurementProjectByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementProjectByIdQuery, ApiResponse<ProcurementProjectResponse>>
{
    public async Task<ApiResponse<ProcurementProjectResponse>> Handle(GetProcurementProjectByIdQuery request, CancellationToken cancellationToken)
    {
        var projectDto = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.EndUserRepresentative)
            .Include(p => p.TechRepresentative)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(c => c!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.ProcurementMode)
            .Include(p => p.BACResolutions)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .Where(p => p.Id == request.Id)
            .Select(ProcurementProjectResponse.Projection)
            .FirstOrDefaultAsync(cancellationToken);

        if (projectDto == null)
        {
            return ApiResponse<ProcurementProjectResponse>.Fail("Procurement project not found.");
        }

        return ApiResponse<ProcurementProjectResponse>.Success(projectDto);
    }
}
