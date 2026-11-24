using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEventById;

public class GetCalendarEventByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetCalendarEventByIdQuery, ApiResponse<CalendarEventResponse>>
{
    public async Task<ApiResponse<CalendarEventResponse>> Handle(GetCalendarEventByIdQuery request, CancellationToken cancellationToken)
    {
        var schedule = await unitOfWork.BiddingActivityScheduleRepository.Query()
            .Include(s => s.ProcurementProject)
                .ThenInclude(p => p.EndUserRepresentative)
                    .ThenInclude(u => u!.Office)
            .Include(s => s.ProcurementProject)
                .ThenInclude(p => p.ConsolidatedPR)
                    .ThenInclude(c => c!.ConsolidatedPRItems)
                        .ThenInclude(i => i.PurchaseRequest)
                            .ThenInclude(pr => pr.Office)
            .Include(s => s.ProcurementProject)
                .ThenInclude(p => p.BACResolutions)
            .Include(s => s.ProcurementActivityType)
            .Include(s => s.BACResolution)
            .FirstOrDefaultAsync(s => s.Id == request.Id && !s.IsDeleted, cancellationToken);

        if (schedule == null)
        {
            return ApiResponse<CalendarEventResponse>.Fail("Calendar event (bidding activity schedule) not found.");
        }

        string officeLabel = string.Empty;
        if (schedule.ProcurementProject?.EndUserRepresentative?.Office != null)
        {
            officeLabel = schedule.ProcurementProject.EndUserRepresentative.Office.Name;
        }
        else if (schedule.ProcurementProject?.ConsolidatedPR?.ConsolidatedPRItems != null)
        {
            officeLabel = schedule.ProcurementProject.ConsolidatedPR.ConsolidatedPRItems
                .Where(i => i.PurchaseRequest?.Office != null)
                .Select(i => i.PurchaseRequest!.Office.Name)
                .FirstOrDefault() ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(officeLabel))
        {
            officeLabel = schedule.Venue;
        }

        var response = new CalendarEventResponse
        {
            Id = schedule.Id,
            ProjectId = schedule.ProcurementProjectId,
            ProjectTitle = schedule.ProcurementProject != null ? schedule.ProcurementProject.Title : string.Empty,
            ProcurementActivityTypeId = schedule.ProcurementActivityTypeId,
            ProcurementActivityTypeName = schedule.ProcurementActivityType != null ? schedule.ProcurementActivityType.Name : string.Empty,
            StartDate = schedule.StartDate,
            EndDate = schedule.EndDate,
            Venue = schedule.Venue,
            Status = schedule.Status,
            Remarks = schedule.Remarks,
            BacResolutionId = schedule.BACResolutionId,
            BacResolutionNumber = schedule.BACResolution != null ? schedule.BACResolution.ResolutionNumber : (schedule.ProcurementProject != null && schedule.ProcurementProject.BACResolutions.Count > 0 ? schedule.ProcurementProject.BACResolutions[0].ResolutionNumber : null),
            ScheduleStatus = schedule.ScheduleStatus ?? "draft",
            ProcurementCategory = schedule.ProcurementCategory ?? string.Empty,
            MilestoneKey = schedule.MilestoneKey,
            FiscalYear = schedule.IbPostingDate.HasValue ? schedule.IbPostingDate.Value.Year : schedule.StartDate.Year,
            OfficeLabel = officeLabel
        };

        return ApiResponse<CalendarEventResponse>.Success(response);
    }
}
