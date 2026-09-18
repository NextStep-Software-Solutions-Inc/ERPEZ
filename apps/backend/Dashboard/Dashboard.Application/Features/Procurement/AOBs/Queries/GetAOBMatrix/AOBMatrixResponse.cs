using System.Text.Json.Serialization;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBMatrix;

public class AOBMatrixResponse
{
    public Guid AOBId { get; set; }
    public string AOBNumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BidEvaluationCriteria AwardCriterion { get; set; } = BidEvaluationCriteria.LCRB;
    public StatusEnum Status { get; set; } = StatusEnum.Draft;
    public DateOnly AOBDate { get; set; }
    public DateTime OpeningDate { get; set; }
    public bool IsBidsOpened { get; set; }
    public bool HasMinimumCanvassWarning { get; set; }
    public string? Remarks { get; set; }
    public string? BacResolutionNumber { get; set; }
    public string? PRNumber { get; set; }
    public string? PAPCode { get; set; }
    public string? ApproverName { get; set; }
    public string? ApproverTitle { get; set; }

    [JsonPropertyName("linkedRFQs")]
    public List<AOBMatrixRFQDto> LinkedRFQs { get; set; } = [];
    public List<AOBMatrixSupplierDto> Suppliers { get; set; } = [];
    public List<AOBMatrixItemDto> Items { get; set; } = [];
    public List<AOBMatrixBidCellDto> Bids { get; set; } = [];
}

public class AOBMatrixRFQDto
{
    public Guid Id { get; set; }
    public string RFQNumber { get; set; } = string.Empty;
    public string TracingNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public StatusEnum Status { get; set; }
    public DateOnly Date { get; set; }
    public DateOnly? Deadline { get; set; }
}

public class AOBMatrixSupplierDto
{
    public Guid SupplierId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? SubmissionType { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public string? DeliveryPeriod { get; set; }
    public int? ValidityPeriodDays { get; set; }
}

public class AOBMatrixItemDto
{
    public Guid RFQItemId { get; set; }
    public Guid RFQId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? FundSource { get; set; }
    public decimal ABCUnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalABC { get; set; }
    public bool IsBrochureRequired { get; set; }
    public string? GreenSpecification { get; set; }
}

public class AOBMatrixBidCellDto
{
    public Guid? BidItemId { get; set; }
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public Guid RFQItemId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public Guid? BrochureFileId { get; set; }
    public string? BrochureFileUrl { get; set; }
    public bool IsResponsive { get; set; }
    public string? DisqualificationReason { get; set; }
    public bool IsOverABC { get; set; }
    public int Rank { get; set; }
    public decimal Score { get; set; }
    public decimal? QualityScore { get; set; }
}
