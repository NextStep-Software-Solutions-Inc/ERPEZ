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
            .Include(s => s.ProcurementActivityType)
            .FirstOrDefaultAsync(s => s.Id == request.Id && !s.IsDeleted, cancellationToken);

        if (schedule == null)
        {
            return ApiResponse<CalendarEventResponse>.Fail("Calendar event (bidding activity schedule) not found.");
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
            Remarks = schedule.Remarks
        };

        return ApiResponse<CalendarEventResponse>.Success(response);
    }
}
