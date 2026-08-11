namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivityScheduleStatus;

public record UpdateBiddingActivityScheduleStatusRequest
{
    public required string Status { get; init; }
}
