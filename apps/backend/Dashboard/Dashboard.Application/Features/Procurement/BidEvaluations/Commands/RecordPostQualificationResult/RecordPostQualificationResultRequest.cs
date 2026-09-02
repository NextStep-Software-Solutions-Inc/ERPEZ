using System;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordPostQualificationResult;

public class RecordPostQualificationResultRequest
{
    public Guid BiddingEvaluatedBidId { get; set; }
    public bool Passed { get; set; }
    public string? Findings { get; set; }
}
