using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SubmitBiddingPackage;

public record SubmitBiddingPackageCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required SubmitBiddingPackageRequest Request { get; init; }
}
