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
            .Where(p => p.Id == request.Id)
            .Select(c => new ProcurementProjectResponse
            {
                Id = c.Id,
                Title = c.Title,
                ConsolidatedPR = c.ConsolidatedPR != null ? new ConsolidatedPRSummaryResponse
                {
                    Id = c.ConsolidatedPR.Id,
                    CPRNumber = c.ConsolidatedPR.CPRNumber,
                    Description = c.ConsolidatedPR.Description ?? string.Empty,
                    ModeOfProcurementId = c.ConsolidatedPR.ConsolidatedPRItems
                        .Where(ci => ci.ProcurementModeId != null)
                        .Select(ci => ci.ProcurementModeId)
                        .FirstOrDefault(),
                    ModeOfProcurementName = c.ConsolidatedPR.ConsolidatedPRItems
                        .Where(ci => ci.ProcurementMode != null)
                        .Select(ci => ci.ProcurementMode.Name)
                        .FirstOrDefault() ?? string.Empty
                } : null,
                ABC = c.ABC,
                Status = c.Status,
                BACResolutions = c.BACResolutions.Select(r => new BACResolutionResponse
                {
                    Id = r.Id,
                    ProcurementProjectId = r.ProcurementProjectId,
                    ResolutionType = r.ResolutionType,
                    ResolutionNumber = r.ResolutionNumber,
                    DateResolved = r.DateResolved,
                    Status = r.Status,
                    WhereasClause = r.WhereasClause
                }).ToList(),
                BiddingActivitySchedules = c.BiddingActivitySchedules.Select(s => new BiddingActivityScheduleResponse
                {
                    Id = s.Id,
                    ProcurementProjectId = s.ProcurementProjectId,
                    ProcurementActivityTypeId = s.ProcurementActivityTypeId,
                    ProcurementActivityTypeName = s.ProcurementActivityType != null ? s.ProcurementActivityType.Name : string.Empty,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    Venue = s.Venue,
                    Status = s.Status,
                    Remarks = s.Remarks
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (projectDto == null)
        {
            return ApiResponse<ProcurementProjectResponse>.Fail("Procurement project not found.");
        }

        return ApiResponse<ProcurementProjectResponse>.Success(projectDto);
    }
}
