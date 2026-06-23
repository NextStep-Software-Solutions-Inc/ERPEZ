using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record BiddingActivityScheduleResponse
{
    public Guid Id { get; init; }
    public Guid ProcurementProjectId { get; init; }
    public Guid ProcurementActivityTypeId { get; init; }
    public string ProcurementActivityTypeName { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Venue { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}
