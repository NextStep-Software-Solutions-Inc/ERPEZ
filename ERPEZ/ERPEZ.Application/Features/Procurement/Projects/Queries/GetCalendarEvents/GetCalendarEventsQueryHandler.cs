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
    : IRequestHandler<GetCalendarEventsQuery, ApiResponse<CalendarEventsWithSummaryResponse>>
{
    public async Task<ApiResponse<CalendarEventsWithSummaryResponse>> Handle(GetCalendarEventsQuery request, CancellationToken cancellationToken)
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

        var now = DateTime.UtcNow;
        var activeEvents = events.Where(e => !e.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) && !e.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)).ToList();

        int activeSchedules = activeEvents.Count;
        int visibleMilestones = events.Count;

        // Clamp the date range for daily load calculation to prevent performance issues with long schedules
        var rangeStart = request.From?.Date ?? now.AddYears(-1).Date;
        var rangeEnd = request.To?.Date ?? now.AddYears(1).Date;

        if ((rangeEnd - rangeStart).TotalDays > 366)
        {
            if (request.From.HasValue)
            {
                rangeEnd = rangeStart.AddDays(366);
            }
            else if (request.To.HasValue)
            {
                rangeStart = rangeEnd.AddDays(-366);
            }
            else
            {
                rangeStart = now.AddDays(-180).Date;
                rangeEnd = now.AddDays(180).Date;
            }
        }

        // Calculate daily load for conflict and overloaded days
        var dailyLoad = new Dictionary<DateTime, int>();
        foreach (var ev in activeEvents)
        {
            var startDay = ev.StartDate.Date;
            if (startDay < rangeStart) startDay = rangeStart;

            var endDay = ev.EndDate.Date;
            if (endDay > rangeEnd) endDay = rangeEnd;

            for (var day = startDay; day <= endDay; day = day.AddDays(1))
            {
                dailyLoad[day] = dailyLoad.GetValueOrDefault(day) + 1;
            }
        }

        int conflictDays = dailyLoad.Values.Count(v => v > 1);
        int overloadedDays = dailyLoad.Values.Count(v => v > 2); // 3 or more concurrent activities

        int dueSoon = activeEvents.Count(e => e.EndDate > now && e.EndDate <= now.AddDays(3));
        int overdue = activeEvents.Count(e => e.EndDate < now);

        var result = new CalendarEventsWithSummaryResponse
        {
            Events = events,
            Summary = new CalendarSummaryResponse
            {
                ActiveSchedules = activeSchedules,
                VisibleMilestones = visibleMilestones,
                ConflictDays = conflictDays,
                OverloadedDays = overloadedDays,
                DueSoon = dueSoon,
                Overdue = overdue
            }
        };

        return ApiResponse<CalendarEventsWithSummaryResponse>.Success(result);
    }
}
