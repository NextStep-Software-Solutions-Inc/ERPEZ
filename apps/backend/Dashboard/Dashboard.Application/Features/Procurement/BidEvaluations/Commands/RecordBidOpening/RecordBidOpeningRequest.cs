using System;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordBidOpening;

public class RecordBidOpeningRequest
{
    public Guid BiddingSubmissionId { get; set; }
    public Guid? BiddingActivityScheduleId { get; set; }
    public string Envelope1Result { get; set; } = "Passed"; // "Passed" | "Failed"
    public bool Envelope2Opened { get; set; } = true;
    public decimal? AsReadBidAmount { get; set; }
    public string? DisqualificationReason { get; set; }
    public string? Remarks { get; set; }
}
