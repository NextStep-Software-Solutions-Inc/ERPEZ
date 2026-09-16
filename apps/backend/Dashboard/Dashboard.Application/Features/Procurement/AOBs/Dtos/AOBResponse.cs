using System.Text.Json.Serialization;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.AOBs.Dtos;

public record AOBResponse
{
    public Guid Id { get; init; }
    public string AOBNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public BidEvaluationCriteria AwardCriterion { get; init; } = BidEvaluationCriteria.LCRB;
    public DateOnly AOBDate { get; init; }
    public DateTime OpeningDate { get; init; }
    public StatusEnum Status { get; init; } = StatusEnum.Draft;
    public Guid? SubmittedBy { get; init; }
    public DateTime? SubmittedAt { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public string? SignedDocumentUrl { get; init; }
    public string? Remarks { get; init; }

    [JsonPropertyName("rfqIds")]
    public List<Guid> RFQIds { get; init; } = [];
    public List<AOBAwardedItemResponse> AwardedItems { get; init; } = [];
}

public record AOBDetailResponse
{
    public Guid Id { get; init; }
    public string AOBNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public BidEvaluationCriteria AwardCriterion { get; init; } = BidEvaluationCriteria.LCRB;
    public DateOnly AOBDate { get; init; }
    public DateTime OpeningDate { get; init; }
    public StatusEnum Status { get; init; } = StatusEnum.Draft;
    public Guid? SubmittedBy { get; init; }
    public DateTime? SubmittedAt { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public string? SignedDocumentUrl { get; init; }
    public string? Remarks { get; init; }

    [JsonPropertyName("rfqs")]
    public List<AOBRFQDetailResponse> RFQs { get; init; } = [];
    public List<AOBAwardedItemResponse> AwardedItems { get; init; } = [];
}

public record AOBRFQDetailResponse
{
    public Guid Id { get; init; }
    public string RFQNumber { get; init; } = string.Empty;
    public string TracingNumber { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public StatusEnum Status { get; init; }
    public DateOnly Date { get; init; }
    public DateOnly? Deadline { get; init; }
}

public record AOBAwardedItemResponse
{
    public Guid Id { get; init; }
    public Guid RFQItemId { get; init; }
    public string ItemName { get; init; } = string.Empty;
    public Guid WinningSupplierId { get; init; }
    public string WinningSupplierName { get; init; } = string.Empty;
    public decimal AwardedUnitPrice { get; init; }
    public int AwardedQuantity { get; init; }
    public decimal TotalAwardedAmount { get; init; }
    public decimal Score { get; init; }
    public string? AwardReason { get; init; }
    public Guid? PurchaseOrderId { get; init; }
}
