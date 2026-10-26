using System;
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
    private static readonly string[] quorumMilestoneKeys =
    [
        "pre-bid-conference",
        "bid-submission-opening",
        "post-qualification",
        "bids-submission-and-opening",
        "pre-procurement-conference"
    ];

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
                s.Status.ToLower().Contains(searchLower) ||
                (s.MilestoneKey != null && s.MilestoneKey.ToLower().Contains(searchLower)));
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

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var catLower = request.Category.ToLower();
            query = query.Where(s => s.ProcurementCategory != null && s.ProcurementCategory.ToLower() == catLower);
        }

        if (!string.IsNullOrWhiteSpace(request.ScheduleStatus))
        {
            var statusLower = request.ScheduleStatus.ToLower();
            query = query.Where(s => s.ScheduleStatus != null && s.ScheduleStatus.ToLower() == statusLower);
        }

        if (!string.IsNullOrWhiteSpace(request.MilestoneKey))
        {
            query = query.Where(s => s.MilestoneKey == request.MilestoneKey);
        }

        if (request.FiscalYear.HasValue)
        {
            query = query.Where(s => (s.IbPostingDate.HasValue && s.IbPostingDate.Value.Year == request.FiscalYear.Value) || s.StartDate.Year == request.FiscalYear.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Office))
        {
            var officeLower = request.Office.ToLower();
            query = query.Where(s =>
                (s.ProcurementProject != null && s.ProcurementProject.EndUserRepresentative != null && s.ProcurementProject.EndUserRepresentative.Office != null && s.ProcurementProject.EndUserRepresentative.Office.Name.ToLower().Contains(officeLower)) ||
                (s.ProcurementProject != null && s.ProcurementProject.ConsolidatedPR != null && s.ProcurementProject.ConsolidatedPR.ConsolidatedPRItems.Any(i => i.PurchaseRequest != null && i.PurchaseRequest.Office != null && i.PurchaseRequest.Office.Name.ToLower().Contains(officeLower))) ||
                s.Venue.ToLower().Contains(officeLower));
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
                Remarks = s.Remarks,
                BacResolutionId = s.BACResolutionId,
                BacResolutionNumber = s.BACResolution != null ? s.BACResolution.ResolutionNumber : (s.ProcurementProject != null && s.ProcurementProject.BACResolutions.Any() ? s.ProcurementProject.BACResolutions.Select(r => r.ResolutionNumber).FirstOrDefault() : null),
                ScheduleStatus = s.ScheduleStatus ?? "draft",
                ProcurementCategory = s.ProcurementCategory ?? string.Empty,
                MilestoneKey = s.MilestoneKey,
                FiscalYear = s.IbPostingDate.HasValue ? s.IbPostingDate.Value.Year : s.StartDate.Year,
                OfficeLabel = s.ProcurementProject != null && s.ProcurementProject.EndUserRepresentative != null && s.ProcurementProject.EndUserRepresentative.Office != null
                    ? s.ProcurementProject.EndUserRepresentative.Office.Name
                    : (s.ProcurementProject != null && s.ProcurementProject.ConsolidatedPR != null && s.ProcurementProject.ConsolidatedPR.ConsolidatedPRItems.Any(i => i.PurchaseRequest != null && i.PurchaseRequest.Office != null)
                        ? s.ProcurementProject.ConsolidatedPR.ConsolidatedPRItems.Where(i => i.PurchaseRequest != null && i.PurchaseRequest.Office != null).Select(i => i.PurchaseRequest.Office!.Name).FirstOrDefault() ?? string.Empty
                        : (!string.IsNullOrEmpty(s.Venue) ? s.Venue : string.Empty))
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var activeEvents = events.Where(e => !e.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) && !e.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)).ToList();

        int activeSchedules = activeEvents.Select(e => e.ProjectId).Distinct().Count();
        int visibleMilestones = events.Count;

        // Clamp the date range for daily load calculation to prevent performance issues with long schedules
        var rangeStart = request.From?.Date ?? (activeEvents.Count > 0 ? activeEvents.Min(e => e.StartDate.Date) : now.AddMonths(-1).Date);
        var rangeEnd = request.To?.Date ?? (activeEvents.Count > 0 ? activeEvents.Max(e => e.EndDate.Date) : now.AddMonths(1).Date);

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

        // Calculate daily load and span-based conflict detection
        var dailyLoad = new Dictionary<DateTime, int>();
        var conflictDetails = new List<ConflictDetail>();
        var venueConflictDates = new HashSet<DateOnly>();
        var quorumConflictDates = new HashSet<DateOnly>();

        for (var day = rangeStart; day <= rangeEnd; day = day.AddDays(1))
        {
            var dayDate = DateOnly.FromDateTime(day);
            var dayActiveEvents = activeEvents
                .Where(e => e.StartDate.Date <= day && day <= e.EndDate.Date)
                .ToList();

            if (dayActiveEvents.Count > 0)
            {
                dailyLoad[day] = dayActiveEvents.Count;

                // 1. Venue Conflicts on this date
                var venueGroups = dayActiveEvents
                    .Where(e => !string.IsNullOrWhiteSpace(e.Venue))
                    .GroupBy(e => e.Venue.Trim(), StringComparer.OrdinalIgnoreCase)
                    .Where(g => g.Count() > 1);

                foreach (var vg in venueGroups)
                {
                    venueConflictDates.Add(dayDate);
                    conflictDetails.Add(new ConflictDetail
                    {
                        Date = dayDate,
                        ConflictType = "venue",
                        Venue = vg.Key,
                        EventIds = vg.Select(e => e.Id).ToList()
                    });
                }

                // 2. Quorum Conflicts on this date (multiple BAC committee milestones simultaneously)
                var quorumEvents = dayActiveEvents
                    .Where(e => !string.IsNullOrWhiteSpace(e.MilestoneKey) && quorumMilestoneKeys.Any(k => e.MilestoneKey.Equals(k, StringComparison.OrdinalIgnoreCase)))
                    .ToList();

                if (quorumEvents.Count > 1)
                {
                    quorumConflictDates.Add(dayDate);
                    conflictDetails.Add(new ConflictDetail
                    {
                        Date = dayDate,
                        ConflictType = "quorum",
                        Venue = "BAC Committee",
                        EventIds = quorumEvents.Select(e => e.Id).ToList()
                    });
                }
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
                Overdue = overdue,
                VenueConflicts = venueConflictDates.Count,
                QuorumConflicts = quorumConflictDates.Count,
                ConflictDetails = conflictDetails
            }
        };

        return ApiResponse<CalendarEventsWithSummaryResponse>.Success(result);
    }
}
