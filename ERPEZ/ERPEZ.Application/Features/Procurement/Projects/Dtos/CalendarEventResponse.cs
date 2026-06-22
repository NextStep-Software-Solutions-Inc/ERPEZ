using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record CalendarEventResponse
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public string ActivityType { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Venue { get; init; } = string.Empty;
}
