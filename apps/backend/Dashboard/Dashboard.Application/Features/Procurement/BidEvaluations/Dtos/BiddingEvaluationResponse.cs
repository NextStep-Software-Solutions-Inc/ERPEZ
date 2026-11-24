using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Dtos;

public class BiddingSubmissionResponse
{
    public Guid Id { get; set; }
    public Guid ProcurementProjectId { get; set; }
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? TinNumber { get; set; }
    public Guid? PublicSupplierApplicationId { get; set; }
    public decimal? OriginalProposedAmount { get; set; }
    public bool IsFinancialOpened { get; set; }
    public string BidSecurityType { get; set; } = string.Empty;
    public decimal? BidSecurityAmount { get; set; }
    public string? BidSecurityNumber { get; set; }
    public int? BidSecurityValidityDays { get; set; }
    public string SubmissionType { get; set; } = "Electronic";
    public DateTime SubmittedAt { get; set; }
    public string? Remarks { get; set; }
    public BidOpeningRecordResponse? OpeningRecord { get; set; }
    public List<ApplicationDocumentDto> Documents { get; set; } = [];
    public List<BiddingSubmissionItemResponse>? Items { get; set; }
}

public class BiddingSubmissionItemResponse
{
    public Guid Id { get; set; }
    public Guid BiddingSubmissionId { get; set; }
    public Guid ProcurementProjectItemId { get; set; }
    public string? ItemName { get; set; }
    public string? Description { get; set; }
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = string.Empty;
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
}

public class BidOpeningRecordResponse
{
    public Guid Id { get; set; }
    public Guid BiddingSubmissionId { get; set; }
    public Guid BiddingActivityScheduleId { get; set; }
    public string Envelope1Result { get; set; } = string.Empty;
    public bool Envelope2Opened { get; set; }
    public decimal? AsReadBidAmount { get; set; }
    public string? DisqualificationReason { get; set; }
    public string? Remarks { get; set; }
    public Guid? OpenedById { get; set; }
    public string? OpenedByName { get; set; }
    public DateTime OpenedAt { get; set; }
}

public class BiddingEvaluatedBidResponse
{
    public Guid Id { get; set; }
    public Guid BiddingEvaluationId { get; set; }
    public Guid BidOpeningRecordId { get; set; }
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal OriginalProposedAmount { get; set; }
    public decimal? AsReadBidAmount { get; set; }
    public decimal EvaluatedBidPrice { get; set; }
    public decimal? TechnicalScore { get; set; }
    public decimal? NormalizedFinancialScore { get; set; }
    public decimal? TotalScore { get; set; }
    public int Rank { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsResponsive { get; set; }
    public string? NonResponsiveReason { get; set; }
    public BiddingPostQualificationResponse? PostQualification { get; set; }
    public List<ApplicationDocumentDto> Documents { get; set; } = [];
}

public class BiddingPostQualificationResponse
{
    public Guid Id { get; set; }
    public Guid BiddingEvaluatedBidId { get; set; }
    public DateTime? PostQualificationNoticeSentAt { get; set; }
    public DateTime? DocsReceivedDate { get; set; }
    public DateTime? TargetDeadlineDate { get; set; }
    public bool? Passed { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Findings { get; set; }
    public Guid? VerifiedById { get; set; }
    public string? VerifiedByName { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class BiddingEvaluationResponse
{
    public Guid Id { get; set; }
    public Guid ProcurementProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public decimal ABC { get; set; }
    public string AwardCriterion { get; set; } = string.Empty;
    public decimal? TechnicalWeight { get; set; }
    public decimal? FinancialWeight { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? EvaluatedById { get; set; }
    public string? EvaluatedByName { get; set; }
    public DateTime? EvaluatedAt { get; set; }
    public string? Remarks { get; set; }
    public List<BiddingEvaluatedBidResponse> EvaluatedBids { get; set; } = [];
    public BiddingAwardRecommendationResponse? AwardRecommendation { get; set; }
}

public class BiddingAwardRecommendationResponse
{
    public Guid Id { get; set; }
    public Guid ProcurementProjectId { get; set; }
    public Guid WinningSupplierId { get; set; }
    public string WinningSupplierName { get; set; } = string.Empty;
    public Guid BiddingPostQualificationId { get; set; }
    public decimal AwardedAmount { get; set; }
    public string AwardCriterion { get; set; } = "LCRB";
    public DateTime RecommendedAt { get; set; }
    public Guid? RecommendedById { get; set; }
    public string? RecommendedByName { get; set; }
    public string? Remarks { get; set; }
    public string? ResolutionNumber { get; set; }
}
