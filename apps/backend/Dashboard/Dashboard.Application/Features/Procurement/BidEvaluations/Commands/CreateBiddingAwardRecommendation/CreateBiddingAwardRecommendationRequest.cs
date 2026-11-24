using System;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.CreateBiddingAwardRecommendation;

public class CreateBiddingAwardRecommendationRequest
{
    public Guid BiddingPostQualificationId { get; set; }
    public string? Remarks { get; set; }
}
