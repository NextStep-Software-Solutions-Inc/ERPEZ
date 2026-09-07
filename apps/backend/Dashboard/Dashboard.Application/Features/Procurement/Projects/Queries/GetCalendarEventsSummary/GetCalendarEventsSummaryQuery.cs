using System;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEvents;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEventsSummary;

public record GetCalendarEventsSummaryQuery : IRequest<ApiResponse<CalendarSummaryResponse>>
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

public class GetCalendarEventsSummaryQueryHandler(ISender mediator)
    : IRequestHandler<GetCalendarEventsSummaryQuery, ApiResponse<CalendarSummaryResponse>>
{
    public async Task<ApiResponse<CalendarSummaryResponse>> Handle(GetCalendarEventsSummaryQuery request, System.Threading.CancellationToken cancellationToken)
    {
        var eventsResult = await mediator.Send(new GetCalendarEventsQuery
        {
            Filter = request.Filter,
            Search = request.Search,
            From = request.From,
            To = request.To,
            Office = request.Office,
            Category = request.Category,
            ScheduleStatus = request.ScheduleStatus,
            MilestoneKey = request.MilestoneKey,
            FiscalYear = request.FiscalYear
        }, cancellationToken);

        if (!eventsResult.Succeeded || eventsResult.Data == null)
        {
            return ApiResponse<CalendarSummaryResponse>.Fail(eventsResult.Message ?? "Failed to retrieve calendar summary.");
        }

        return ApiResponse<CalendarSummaryResponse>.Success(eventsResult.Data.Summary);
    }
}
