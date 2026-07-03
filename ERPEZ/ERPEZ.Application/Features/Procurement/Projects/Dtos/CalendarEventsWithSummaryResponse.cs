using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record CalendarEventsWithSummaryResponse
{
    public List<CalendarEventResponse> Events { get; init; } = [];
    public CalendarSummaryResponse Summary { get; init; } = new();
}

public record CalendarSummaryResponse
{
    public int ActiveSchedules { get; init; }
    public int VisibleMilestones { get; init; }
    public int ConflictDays { get; init; }
    public int OverloadedDays { get; init; }
    public int DueSoon { get; init; }
    public int Overdue { get; init; }
}
