using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.CreateBiddingAwardRecommendation;

public record CreateBiddingAwardRecommendationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required CreateBiddingAwardRecommendationRequest Request { get; init; }
}
