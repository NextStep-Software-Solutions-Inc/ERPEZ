using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivitySchedule;

public record UpdateBiddingActivityScheduleCommand : IRequest<ApiResponse<Unit>>
{
    public Guid ProjectId { get; init; }
    public Guid ScheduleId { get; init; }
    public required UpdateBiddingActivityScheduleRequest ScheduleRequest { get; init; }
}
