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
        var query = unitOfWork.BiddingActivityScheduleRepository.Query();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(s =>
                (s.ProcurementProject != null && s.ProcurementProject.Title.ToLower().Contains(searchLower)) ||
                (s.ProcurementActivityType != null && s.ProcurementActivityType.Name.ToLower().Contains(searchLower)) ||
                s.Venue.ToLower().Contains(searchLower) ||
                s.Status.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(request.Filter))
        {
            var filterLower = request.Filter.ToLower();
            query = query.Where(s =>
                (s.ProcurementProject != null && s.ProcurementProject.Title.ToLower().Contains(filterLower)) ||
                (s.ProcurementActivityType != null && s.ProcurementActivityType.Name.ToLower().Contains(filterLower)) ||
                s.Venue.ToLower().Contains(filterLower) ||
                s.Status.ToLower().Contains(filterLower));
        }

        if (request.From.HasValue)
        {
            query = query.Where(s => s.EndDate >= request.From.Value);
        }

        if (request.To.HasValue)
        {
            query = query.Where(s => s.StartDate <= request.To.Value);
        }

        var events = await query
            .Select(s => new CalendarEventResponse
            {
                Id = s.Id,
                ProjectId = s.ProcurementProjectId,
                ProjectTitle = s.ProcurementProject != null ? s.ProcurementProject.Title : string.Empty,
                ProcurementActivityTypeId = s.ProcurementActivityTypeId,
                ProcurementActivityTypeName = s.ProcurementActivityType != null ? s.ProcurementActivityType.Name : string.Empty,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Venue = s.Venue,
                Status = s.Status,
                Remarks = s.Remarks
            })
            .ToListAsync(cancellationToken);


        return ApiResponse<List<CalendarEventResponse>>.Success(events);
    }
}
