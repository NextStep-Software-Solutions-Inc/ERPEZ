using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;

public class BidderEvaluationInput
{
    public Guid BidOpeningRecordId { get; set; }
    public decimal EvaluatedBidPrice { get; set; }
    public decimal? TechnicalScore { get; set; } // Out of 100 for MEARB
    public bool IsResponsive { get; set; } = true;
    public string? NonResponsiveReason { get; set; }
}

public class EvaluateProjectBidsRequest
{
    public string AwardCriterion { get; set; } = string.Empty;
    public decimal? TechnicalWeight { get; set; } // e.g. 70.00
    public decimal? FinancialWeight { get; set; } // e.g. 30.00
    public List<BidderEvaluationInput> Bidders { get; set; } = [];
    public string? Remarks { get; set; }
}
