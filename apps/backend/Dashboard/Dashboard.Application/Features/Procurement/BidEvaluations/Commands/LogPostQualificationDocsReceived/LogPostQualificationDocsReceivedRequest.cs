using System;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.LogPostQualificationDocsReceived;

public class LogPostQualificationDocsReceivedRequest
{
    public Guid BiddingEvaluatedBidId { get; set; }
    public DateTime? DocsReceivedAt { get; set; }
    public int BacEvaluationDays { get; set; } = 12; // Default 12 calendar days
}
