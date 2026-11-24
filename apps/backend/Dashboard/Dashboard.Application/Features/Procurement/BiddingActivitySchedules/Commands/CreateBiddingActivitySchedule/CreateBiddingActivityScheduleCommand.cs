using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.CreateBiddingActivitySchedule;

public record CreateBiddingActivityScheduleCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required CreateBiddingActivityScheduleRequest ScheduleRequest { get; init; }
}
