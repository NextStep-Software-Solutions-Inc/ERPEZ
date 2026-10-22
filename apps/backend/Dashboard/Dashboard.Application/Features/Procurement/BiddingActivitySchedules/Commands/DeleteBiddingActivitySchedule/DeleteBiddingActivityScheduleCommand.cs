using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.DeleteBiddingActivitySchedule;

public record DeleteBiddingActivityScheduleCommand(Guid ProjectId, Guid ScheduleId) : IRequest<ApiResponse<Unit>>;
