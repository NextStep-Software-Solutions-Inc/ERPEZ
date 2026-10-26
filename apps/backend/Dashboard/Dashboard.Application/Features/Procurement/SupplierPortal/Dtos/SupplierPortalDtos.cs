using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;

public record SupplierRFQDto
{
    public Guid Id { get; init; }
    public string RFQNumber { get; init; } = string.Empty;
    public string TracingNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Purpose { get; init; }
    public string? DeliveryPeriod { get; init; }
    public DateOnly Date { get; init; }
    public DateOnly? Deadline { get; init; }
    public decimal TotalAmount { get; init; }
    public StatusEnum Status { get; init; }
    public DateTime InvitedAt { get; init; }
    public bool HasSubmittedBid { get; init; }
    public string? BidStatus { get; init; }
    public List<SupplierRFQItemDto> Items { get; init; } = [];
}

public record SupplierRFQItemDto
{
    public Guid Id { get; init; }
    public Guid RFQId { get; init; }
    public string ItemName { get; init; } = string.Empty;
    public string? Category { get; init; }
    public string? Fund { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPriceSnapshot { get; init; }
    public decimal TotalABC { get; init; }
    public bool IsBrochureRequired { get; init; }
    public string? GreenSpecification { get; init; }
    public string? Month { get; init; }
    public List<MonthlyAllocationDto> MonthlyAllocations { get; init; } = [];
}

public record SupplierBidDetailDto
{
    public Guid Id { get; init; }
    public Guid RFQId { get; init; }
    public Guid SupplierId { get; init; }
    public string SubmissionType { get; init; } = "Electronic";
    public string Status { get; init; } = "DRAFT";
    public int? ValidityPeriodDays { get; init; }
    public string? DeliveryPeriod { get; init; }
    public string? PaymentTerms { get; init; }
    public string? WarrantyTerms { get; init; }
    public decimal TotalAmount { get; init; }
    public DateTime? SubmittedAt { get; init; }
    public string? Remarks { get; init; }
    public string? QuotationDocumentUrl { get; init; }
    public string? SignatureUrl { get; init; }
    public string? SignatoryName { get; init; }
    public DateTime? DateSigned { get; init; }
    public List<SupplierBidItemDetailDto> Items { get; init; } = [];
}

public record SupplierBidItemDetailDto
{
    public Guid Id { get; init; }
    public Guid RFQItemId { get; init; }
    public string ItemName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal TotalPrice { get; init; }
    public string? Brand { get; init; }
    public string? Model { get; init; }
    public string? Color { get; init; }
    public Guid? BrochureFileId { get; init; }
    public string? BrochureFileUrl { get; init; }
    public bool IsResponsive { get; init; }
    public string? DisqualificationReason { get; init; }
    public decimal? QualityScore { get; init; }
}