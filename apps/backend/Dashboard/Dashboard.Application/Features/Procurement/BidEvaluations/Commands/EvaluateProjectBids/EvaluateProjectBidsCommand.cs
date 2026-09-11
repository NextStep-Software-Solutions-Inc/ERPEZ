using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;

public record EvaluateProjectBidsCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required EvaluateProjectBidsRequest Request { get; init; }
}
