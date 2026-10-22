using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEvents;

public record GetCalendarEventsQuery : IRequest<ApiResponse<CalendarEventsWithSummaryResponse>>
{
    public string? Filter { get; init; }
    public string? Search { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
    public string? Office { get; init; }
    public string? Category { get; init; }
    public string? ScheduleStatus { get; init; }
    public string? MilestoneKey { get; init; }
    public int? FiscalYear { get; init; }
}

