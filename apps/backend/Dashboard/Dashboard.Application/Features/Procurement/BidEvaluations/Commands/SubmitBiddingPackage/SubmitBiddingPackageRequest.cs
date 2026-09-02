using System;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SubmitBiddingPackage;

public class SubmitBiddingPackageRequest
{
    public Guid SupplierId { get; set; }
    public Guid? PublicSupplierApplicationId { get; set; }
    public decimal OriginalProposedAmount { get; set; }
    public string BidSecurityType { get; set; } = "Bid Securing Declaration";
    public decimal? BidSecurityAmount { get; set; }
    public string? BidSecurityNumber { get; set; }
    public int? BidSecurityValidityDays { get; set; }
    public string SubmissionType { get; set; } = "Electronic";
    public string? Remarks { get; set; }
}
