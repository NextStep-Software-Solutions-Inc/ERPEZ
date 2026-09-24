using System;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public class NoticeOfAwardDataDto
{
    public Guid Id { get; set; }
    public string NoaNumber { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
    public DateTime? DateBid { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;

    // Supplier Information
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string SupplierAddress { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;

    // Project Information
    public Guid ProcurementProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public string PrNumber { get; set; } = string.Empty;
    public string BacResolutionNumber { get; set; } = string.Empty;
    public string AwardCriterion { get; set; } = "LCRB";

    // Financial Information
    public decimal TotalAmount { get; set; }
    public string AmountInWords { get; set; } = string.Empty;

    // Authority & Compliance
    public string ApprovedByName { get; set; } = "Head of the Procuring Entity";
    public string ApprovedByPosition { get; set; } = "Head of the Procuring Entity";
    public DateTime? ApprovedAt { get; set; }
    public DateTime? ReceivedAt { get; set; }
}
