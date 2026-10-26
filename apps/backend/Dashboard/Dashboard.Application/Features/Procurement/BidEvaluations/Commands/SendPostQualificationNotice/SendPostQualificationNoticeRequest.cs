using System;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SendPostQualificationNotice;

public class SendPostQualificationNoticeRequest
{
    public Guid BiddingEvaluatedBidId { get; set; }
    public DateTime? NoticeSentAt { get; set; }
    public int TargetDays { get; set; } = 5; // Default 5 calendar days
}
