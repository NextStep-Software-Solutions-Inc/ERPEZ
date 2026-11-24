using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivityScheduleStatus;

public record UpdateBiddingActivityScheduleStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid ProjectId { get; init; }
    public Guid ScheduleId { get; init; }
    public required UpdateBiddingActivityScheduleStatusRequest StatusRequest { get; init; }
}
