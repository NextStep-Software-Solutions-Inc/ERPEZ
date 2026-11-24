using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record CalendarEventResponse
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public Guid ProcurementActivityTypeId { get; init; }
    public string ProcurementActivityTypeName { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Venue { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public Guid? BacResolutionId { get; init; }
    public string? BacResolutionNumber { get; init; }
    public string ScheduleStatus { get; init; } = "draft"; // draft | confirmed | locked
    public string OfficeLabel { get; init; } = string.Empty;
    public string ProcurementCategory { get; init; } = string.Empty; // goods | infrastructure | consulting
    public string? MilestoneKey { get; init; }
    public int? FiscalYear { get; init; }
}
