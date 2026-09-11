using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordBidOpening;

public record RecordBidOpeningCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required RecordBidOpeningRequest Request { get; init; }
}
