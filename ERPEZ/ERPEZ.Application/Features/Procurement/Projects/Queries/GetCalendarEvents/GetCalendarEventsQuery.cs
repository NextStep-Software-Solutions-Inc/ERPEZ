using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEvents;

public record GetCalendarEventsQuery : IRequest<ApiResponse<List<CalendarEventResponse>>>
{
    public string? Filter { get; init; }
    public string? Search { get; init; }
}
