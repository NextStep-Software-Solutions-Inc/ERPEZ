using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEvents;

public class GetCalendarEventsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetCalendarEventsQuery, ApiResponse<List<CalendarEventResponse>>>
{
    public async Task<ApiResponse<List<CalendarEventResponse>>> Handle(GetCalendarEventsQuery request, CancellationToken cancellationToken)
    {
        var events = await unitOfWork.BiddingActivityScheduleRepository.Query()
            .Select(s => new CalendarEventResponse
            {
                Id = s.Id,
                ProjectId = s.ProcurementProjectId,
                ProjectTitle = s.ProcurementProject != null ? s.ProcurementProject.Title : string.Empty,
                ProcurementActivityTypeId = s.ProcurementActivityTypeId,
                ProcurementActivityTypeName = s.ProcurementActivityType != null ? s.ProcurementActivityType.Name : string.Empty,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Venue = s.Venue
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<List<CalendarEventResponse>>.Success(events);
    }
}
