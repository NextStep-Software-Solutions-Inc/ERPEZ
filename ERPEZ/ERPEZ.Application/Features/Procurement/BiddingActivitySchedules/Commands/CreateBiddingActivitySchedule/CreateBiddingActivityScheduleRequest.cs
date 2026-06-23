using System;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.CreateBiddingActivitySchedule;

public record CreateBiddingActivityScheduleRequest
{
    public required Guid ProcurementActivityTypeId { get; init; }
    public required DateTime StartDate { get; init; }
    public required DateTime EndDate { get; init; }
    public required string Venue { get; init; }
    public string Status { get; init; } = "Pending";
}
